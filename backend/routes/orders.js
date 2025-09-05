// backend/routes/orders.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { sendOrderConfirmation, sendOrderStatusUpdate, sendPaymentConfirmation } from "../services/emailService.js";
import { sendOrderConfirmationPush, sendOrderStatusUpdatePush, sendPaymentConfirmationPush } from "../services/pushNotificationService.js";
import { decrypt } from "../config/encryption.js";

export default function ordersRouterFactory(io) {
  const router = express.Router();

  // Configurar multer para subida de archivos
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = 'uploads/receipts';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, `receipt-${req.params.id}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
  });

  const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('image/')) {
        cb(null, true);
      } else {
        cb(new Error('Solo se permiten archivos de imagen'));
      }
    }
  });

  // ─── Función para enviar emails de forma segura
  async function sendEmailSafely(emailFunction, order, emailAddress, context = '') {
    if (!emailAddress) {
      console.log(`⚠️ No se envió email ${context}: email no disponible`);
      return;
    }

    try {
      let emailToSend = emailAddress;
      
      // Desencriptar si es necesario
      if (typeof emailToSend === 'object' && emailToSend !== null && emailToSend.iv && emailToSend.data) {
        try {
          emailToSend = decrypt(emailToSend);
          console.log(`🔓 Email desencriptado para ${context}: ${emailToSend}`);
        } catch (decryptError) {
          console.error(`❌ Error desencriptando email para ${context}:`, decryptError);
          return;
        }
      }
      
      // Validar email final
      if (!emailToSend || typeof emailToSend !== 'string' || !emailToSend.includes('@')) {
        console.error(`❌ Email inválido para ${context}: "${emailToSend}"`);
        return;
      }
      
      console.log(`📧 Enviando email ${context} a: ${emailToSend}`);
      await emailFunction(order, emailToSend);
      console.log(`✅ Email ${context} enviado exitosamente`);
      
    } catch (emailError) {
      console.error(`❌ Error enviando email ${context}:`, emailError);
      console.error(`❌ Error completo:`, emailError.response?.body || emailError.message);
    }
  }

  // ─── Generar el próximo id de pedido (ORD001, ORD002, etc.)
  async function getNextOrderId() {
    const last = await Order.find().sort({ createdAt: -1 }).limit(1);
    let next = 1;
    if (last[0]?.id) {
      const n = parseInt(String(last[0].id).replace(/\D/g, ""), 10);
      if (!isNaN(n)) next = n + 1;
    }
    return `ORD${String(next).padStart(3, "0")}`;
  }

  // ─── Normalizador de estados
  function normalizeStatus(status) {
    if (!status) return "En preparación";
    const s = status.toLowerCase();
    if (s.includes("prep")) return "En preparación";
    if (s.includes("listo")) return "Listo";
    if (s.includes("entreg")) return "Entregado";
    return status; // fallback
  }

  // 📌 GET todos (carnicería / admin)
  router.get("/", async (_req, res) => {
    try {
      const orders = await Order.find().sort({ createdAt: -1 });
      res.json(orders);
    } catch (err) {
      console.error("❌ Error GET /orders:", err);
      res.status(500).json({ error: "Error al obtener pedidos" });
    }
  });

  // 📌 GET por id (público para tracking)
  router.get("/:id", async (req, res) => {
    try {
      const q = req.params.id;
      let order = await Order.findOne({ id: q });
      if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findById(q);
      }
      if (!order) return res.status(404).json({ error: "Pedido no encontrado" });
      res.json(order);
    } catch (err) {
      console.error("❌ Error GET /orders/:id:", err);
      res.status(500).json({ error: "Error consultando pedido" });
    }
  });

  // 📌 Crear pedido
  router.post("/", async (req, res) => {
    try {
      const {
        customerName,
        customerPhone,
        customerEmail,
        note = "",
        pickupTime,
        status = "En preparación",
        totalCLP,
        items,
      } = req.body;

      if (!items?.length) {
        return res.status(400).json({ error: "El pedido no contiene ítems" });
      }

      const id = req.body.id || (await getNextOrderId());

      // Descontar stock
      const ops = items.map((it) => ({
        updateOne: {
          filter: { id: it.productId, stock: { $gte: it.quantity } },
          update: { $inc: { stock: -it.quantity } },
        },
      }));

      const bulk = await Product.bulkWrite(ops, { ordered: true });
      const modified = bulk.modifiedCount ?? bulk.nModified ?? 0;
      if (modified !== items.length) {
        return res
          .status(409)
          .json({ error: "Stock insuficiente en uno o más productos" });
      }

      // Crear pedido
      const order = await Order.create({
        id,
        customerName,
        customerPhone,
        customerEmail,
        note,
        pickupTime,
        status: normalizeStatus(status),
        totalCLP,
        items,
        paid: false, // 👈 inicializa en no pagado
        paymentDate: null,
      });

      // 📧 Enviar email de confirmación
      console.log(`\n🔍 ===== ENVIANDO EMAIL DE CONFIRMACIÓN =====`);
      console.log(`🔍 Pedido creado: ${order.id}`);
      console.log(`🔍 Email del cliente: ${customerEmail}`);
      
      await sendEmailSafely(sendOrderConfirmation, order, customerEmail, 'de confirmación');
      console.log(`🔍 ===== FIN EMAIL DE CONFIRMACIÓN =====\n`);

      // 📱 Enviar notificación push de confirmación
      console.log(`\n🔔 ===== ENVIANDO PUSH NOTIFICATION DE CONFIRMACIÓN =====`);
      try {
        const pushResult = await sendOrderConfirmationPush(order);
        console.log(`🔔 Push notifications enviadas: ${pushResult.sent}, fallidas: ${pushResult.failed}`);
      } catch (pushError) {
        console.error('❌ Error enviando push notification de confirmación:', pushError);
      }
      console.log(`🔔 ===== FIN PUSH NOTIFICATION DE CONFIRMACIÓN =====\n`);

      // Emitir eventos
      const ids = items.map((i) => i.productId);
      const updatedProducts = await Product.find({ id: { $in: ids } });
      io.emit("products:updated", updatedProducts);
      io.emit("orders:created", order);

      res.status(201).json(order);
    } catch (err) {
      console.error("❌ Error POST /orders:", err);
      res.status(400).json({ error: "No se pudo crear el pedido" });
    }
  });
  // 📌 Revisar/Ajustar pedido
router.patch("/:id/review", async (req, res) => {
  try {
    const q = req.params.id;
    const updatedItems = req.body.items;

    if (!Array.isArray(updatedItems) || !updatedItems.length) {
      return res.status(400).json({ error: "Items inválidos" });
    }

    // recalcular total
    const newTotal = updatedItems.reduce(
      (sum, it) => sum + (it.price || 0) * (it.quantity || 0),
      0
    );

    let order = await Order.findOneAndUpdate(
      { id: q },
      { items: updatedItems, totalCLP: newTotal, reviewed: true },
      { new: true }
    );
    if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findByIdAndUpdate(
        q,
        { items: updatedItems, totalCLP: newTotal, reviewed: true },
        { new: true }
      );
    }

    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    io.emit("orders:updated", order);
    res.json(order);
  } catch (err) {
    console.error("❌ Error PATCH /orders/:id/review:", err);
    res.status(400).json({ error: "No se pudo ajustar el pedido" });
  }
});

  // 📌 Confirmar pesos exactos del carnicero y marcar como listo
  router.patch("/:id/confirm-weights", async (req, res) => {
    try {
      const q = req.params.id;
      const updatedItems = req.body.items;

      if (!Array.isArray(updatedItems) || !updatedItems.length) {
        return res.status(400).json({ error: "Items inválidos" });
      }

      // recalcular total con pesos exactos
      const newTotal = updatedItems.reduce(
        (sum, it) => sum + (it.price || 0) * (it.quantity || 0),
        0
      );

      let order = await Order.findOneAndUpdate(
        { id: q },
        { 
          items: updatedItems, 
          totalCLP: newTotal, 
          reviewed: true,
          status: "Listo" // Marcar automáticamente como listo
        },
        { new: true }
      );
      if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findByIdAndUpdate(
          q,
          { 
            items: updatedItems, 
            totalCLP: newTotal, 
            reviewed: true,
            status: "Listo"
          },
          { new: true }
        );
      }

      if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

      // 📧 Enviar email de estado "Listo"
      console.log(`\n🔍 ===== ENVIANDO EMAIL DE ESTADO LISTO =====`);
      console.log(`🔍 Pedido: ${order.id} marcado como Listo`);
      
      await sendEmailSafely(sendOrderStatusUpdate, order, order.customerEmail, 'de estado "Listo"');
      console.log(`🔍 ===== FIN EMAIL DE ESTADO LISTO =====\n`);

      // 📱 Enviar notificación push de estado "Listo"
      console.log(`\n🔔 ===== ENVIANDO PUSH NOTIFICATION DE ESTADO LISTO =====`);
      try {
        const pushResult = await sendOrderStatusUpdatePush(order, "Listo");
        console.log(`🔔 Push notifications enviadas: ${pushResult.sent}, fallidas: ${pushResult.failed}`);
      } catch (pushError) {
        console.error('❌ Error enviando push notification de estado:', pushError);
      }
      console.log(`🔔 ===== FIN PUSH NOTIFICATION DE ESTADO LISTO =====\n`);

      // Emitir eventos específicos para actualizaciones del carnicero
      io.emit("orders:updated", order);
      io.emit("butcher:order:updated", {
        orderId: order.id,
        items: updatedItems,
        newTotal: newTotal,
        status: "Listo"
      });

      res.json(order);
    } catch (err) {
      console.error("❌ Error PATCH /orders/:id/confirm-weights:", err);
      res.status(400).json({ error: "No se pudo confirmar los pesos" });
    }
  });

  // 📌 Actualizar estado
  router.patch("/:id/status", async (req, res) => {
    try {
      const q = req.params.id;
      const status = normalizeStatus(req.body.status);

      let order = await Order.findOneAndUpdate(
        { id: q },
        { status },
        { new: true }
      );
      if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findByIdAndUpdate(q, { status }, { new: true });
      }

      if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

      // 📧 Enviar email de actualización de estado
      console.log(`\n🔍 ===== ENVIANDO EMAIL DE CAMBIO DE ESTADO =====`);
      console.log(`🔍 Pedido: ${order.id}`);
      console.log(`🔍 Nuevo estado: ${status}`);
      
      // Solo enviar emails para ciertos estados
      const emailStates = ['En preparación', 'Listo', 'Entregado'];
      if (emailStates.includes(status)) {
        await sendEmailSafely(sendOrderStatusUpdate, order, order.customerEmail, `de estado "${status}"`);
      } else {
        console.log(`ℹ️ No se envía email para estado: ${status}`);
      }
      console.log(`🔍 ===== FIN EMAIL DE CAMBIO DE ESTADO =====\n`);

      // 📱 Enviar notificación push de cambio de estado
      console.log(`\n🔔 ===== ENVIANDO PUSH NOTIFICATION DE CAMBIO DE ESTADO =====`);
      try {
        if (emailStates.includes(status)) {
          const pushResult = await sendOrderStatusUpdatePush(order, status);
          console.log(`🔔 Push notifications enviadas: ${pushResult.sent}, fallidas: ${pushResult.failed}`);
        } else {
          console.log(`ℹ️ No se envía push notification para estado: ${status}`);
        }
      } catch (pushError) {
        console.error('❌ Error enviando push notification de estado:', pushError);
      }
      console.log(`🔔 ===== FIN PUSH NOTIFICATION DE CAMBIO DE ESTADO =====\n`);

      io.emit("orders:updated", order);
      res.json(order);
    } catch (err) {
      console.error("❌ Error PATCH /orders/:id/status:", err);
      res.status(400).json({ error: "No se pudo actualizar el estado" });
    }
  });

// 📌 Marcar pedido como pagado
router.patch("/:id/pay", async (req, res) => {
  try {
    const q = req.params.id;
    const { paymentMethod = 'local' } = req.body;
    const update = { 
      paid: true, 
      paymentMethod,
      paymentDate: new Date() 
    };

    let order = await Order.findOneAndUpdate({ id: q }, update, { new: true });
    if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findByIdAndUpdate(q, update, { new: true });
    }

    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    io.emit("orders:updated", order);
    res.json(order);
  } catch (err) {
    console.error("❌ Error PATCH /orders/:id/pay:", err);
    res.status(400).json({ error: "No se pudo marcar el pedido como pagado" });
  }
});

// 📌 Establecer método de pago sin marcar como pagado (para pago en tienda)
router.patch("/:id/payment-method", async (req, res) => {
  try {
    const q = req.params.id;
    const { paymentMethod } = req.body;
    const update = { paymentMethod };

    let order = await Order.findOneAndUpdate({ id: q }, update, { new: true });
    if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findByIdAndUpdate(q, update, { new: true });
    }

    if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

    io.emit("orders:updated", order);
    res.json(order);
  } catch (err) {
    console.error("❌ Error PATCH /orders/:id/payment-method:", err);
    res.status(400).json({ error: "No se pudo establecer el método de pago" });
  }
});


  // 📌 Eliminar pedido (repone stock)
  router.delete("/:id", async (req, res) => {
    try {
      const q = req.params.id;
      let order = await Order.findOneAndDelete({ id: q });
      if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
        order = await Order.findByIdAndDelete(q);
      }

      if (!order) return res.status(404).json({ error: "Pedido no encontrado" });

      // Reponer stock
      if (order.items?.length) {
        const ops = order.items.map((it) => ({
          updateOne: {
            filter: { id: it.productId },
            update: { $inc: { stock: it.quantity } },
          },
        }));
        await Product.bulkWrite(ops, { ordered: true });

        const ids = order.items.map((i) => i.productId);
        const updatedProducts = await Product.find({ id: { $in: ids } });
        io.emit("products:updated", updatedProducts);
      }

      io.emit("orders:deleted", { id: q });
      res.sendStatus(204);
    } catch (err) {
      console.error("❌ Error DELETE /orders/:id:", err);
      res.status(400).json({ error: "No se pudo eliminar el pedido" });
    }
  });

// 📌 Subir comprobante de transferencia
router.post("/:id/upload-receipt", upload.single('receipt'), async (req, res) => {
  try {
    const q = req.params.id;
    const { customerName, totalAmount } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: "No se subió ningún archivo" });
    }

    // Buscar el pedido
    let order = await Order.findOne({ id: q });
    if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(q);
    }

    if (!order) {
      // Eliminar archivo si no se encuentra el pedido
      fs.unlinkSync(req.file.path);
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    // Validaciones básicas
    const expectedAmount = order.totalCLP;
    const uploadedAmount = parseFloat(totalAmount);
    
    // Actualizar pedido con información del comprobante
    const receiptData = {
      receiptPath: req.file.path,
      receiptFilename: req.file.filename,
      uploadedAt: new Date(),
      customerName: customerName,
      reportedAmount: uploadedAmount,
      validationStatus: 'pending', // pending, approved, rejected
      paymentMethod: 'online'
    };

    order = await Order.findOneAndUpdate(
      { id: q },
      { 
        receiptData,
        paymentMethod: 'online'
      },
      { new: true }
    );

    if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findByIdAndUpdate(
        q,
        { 
          receiptData,
          paymentMethod: 'online'
        },
        { new: true }
      );
    }

    // Emitir evento para notificar al carnicero
    io.emit("receipt:uploaded", {
      orderId: order.id,
      customerName: order.customerName,
      amount: expectedAmount,
      reportedAmount: uploadedAmount,
      receiptFilename: req.file.filename
    });

    io.emit("orders:updated", order);

    res.json({ 
      message: "Comprobante subido exitosamente",
      order: order
    });
  } catch (err) {
    console.error("❌ Error POST /orders/:id/upload-receipt:", err);
    // Eliminar archivo en caso de error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error("Error eliminando archivo:", unlinkErr);
      }
    }
    res.status(400).json({ error: "No se pudo subir el comprobante" });
  }
});

// 📌 Validar comprobante de transferencia (carnicero)
router.patch("/:id/validate-receipt", async (req, res) => {
  try {
    const q = req.params.id;
    const { approved, notes } = req.body;
    
    let order = await Order.findOne({ id: q });
    if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(q);
    }

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    if (!order.receiptData) {
      return res.status(400).json({ error: "No hay comprobante para validar" });
    }

    const update = {
      'receiptData.validationStatus': approved ? 'approved' : 'rejected',
      'receiptData.validatedAt': new Date(),
      'receiptData.validationNotes': notes || ''
    };

    // Si se aprueba, marcar como pagado
    if (approved) {
      update.paid = true;
      update.paymentDate = new Date();
    }

    order = await Order.findOneAndUpdate(
      { id: q },
      update,
      { new: true }
    );

    if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findByIdAndUpdate(
        q,
        update,
        { new: true }
      );
    }

    // 📧 Enviar email de confirmación de pago si se aprueba
    if (approved) {
      console.log(`\n🔍 ===== ENVIANDO EMAIL DE PAGO CONFIRMADO =====`);
      console.log(`🔍 Pedido: ${order.id}`);
      console.log(`🔍 Comprobante aprobado`);
      
      await sendEmailSafely(sendPaymentConfirmation, order, order.customerEmail, 'de pago confirmado');
      console.log(`🔍 ===== FIN EMAIL DE PAGO CONFIRMADO =====\n`);

      // 📱 Enviar notificación push de pago confirmado
      console.log(`\n🔔 ===== ENVIANDO PUSH NOTIFICATION DE PAGO CONFIRMADO =====`);
      try {
        const pushResult = await sendPaymentConfirmationPush(order);
        console.log(`🔔 Push notifications enviadas: ${pushResult.sent}, fallidas: ${pushResult.failed}`);
      } catch (pushError) {
        console.error('❌ Error enviando push notification de pago:', pushError);
      }
      console.log(`🔔 ===== FIN PUSH NOTIFICATION DE PAGO CONFIRMADO =====\n`);
    }

    // Emitir eventos
    io.emit("receipt:validated", {
      orderId: order.id,
      approved: approved,
      customerName: order.customerName
    });

    io.emit("orders:updated", order);

    res.json(order);
  } catch (err) {
    console.error("❌ Error PATCH /orders/:id/validate-receipt:", err);
    res.status(400).json({ error: "No se pudo validar el comprobante" });
  }
});

// 📌 Ver comprobante de transferencia (carnicero)
router.get("/:id/receipt", async (req, res) => {
  try {
    const q = req.params.id;
    
    let order = await Order.findOne({ id: q });
    if (!order && q.match(/^[0-9a-fA-F]{24}$/)) {
      order = await Order.findById(q);
    }

    if (!order) {
      return res.status(404).json({ error: "Pedido no encontrado" });
    }

    if (!order.receiptData || !order.receiptData.receiptPath) {
      return res.status(404).json({ error: "No hay comprobante disponible" });
    }

    const receiptPath = order.receiptData.receiptPath;
    
    // Verificar que el archivo existe
    if (!fs.existsSync(receiptPath)) {
      return res.status(404).json({ error: "Archivo de comprobante no encontrado" });
    }

    // Enviar el archivo
    res.sendFile(path.resolve(receiptPath));
  } catch (err) {
    console.error("❌ Error GET /orders/:id/receipt:", err);
    res.status(500).json({ error: "Error al obtener el comprobante" });
  }
});

  return router;
}
