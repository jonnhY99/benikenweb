import Order from "../models/Order.js";
import { sendOrderConfirmation, sendOrderStatusUpdate, sendPaymentConfirmation } from "../services/emailService.js";

// 🔹 Normalizar el estado recibido según el nuevo flujo
function normalizeStatus(status) {
  if (!status) return "Pendiente";
  const s = status.toLowerCase();
  if (s.includes("pendiente pago")) return "Pendiente pago";
  if (s.includes("pendiente")) return "Pendiente";
  if (s.includes("preparacion")) return "En preparación";
  if (s.includes("listo")) return "Listo";
  if (s.includes("entregado")) return "Entregado";
  return "Pendiente";
}

// Crear nuevo pedido
export const createOrder = async (req, res) => {
  try {
    const newOrder = new Order({
      ...req.body,
      status: normalizeStatus(req.body.status || "Pendiente"),
      reviewed: false, // 🔹 al inicio no está revisado
    });
    await newOrder.save();

    // 📧 Enviar email de confirmación si hay email del cliente
    console.log(`\n🔍 ===== DEBUG EMAIL NOTIFICATION =====`);
    console.log(`🔍 req.body completo:`, JSON.stringify(req.body, null, 2));
    console.log(`🔍 req.body.customerEmail = "${req.body.customerEmail}"`);
    console.log(`🔍 newOrder.customerEmail = "${newOrder.customerEmail}"`);
    console.log(`🔍 Tipo de req.body.customerEmail:`, typeof req.body.customerEmail);
    console.log(`🔍 Tipo de newOrder.customerEmail:`, typeof newOrder.customerEmail);
    
    const customerEmailToUse = req.body.customerEmail || newOrder.customerEmail;
    console.log(`🔍 Email a usar:`, customerEmailToUse);
    console.log(`🔍 Tipo del email a usar:`, typeof customerEmailToUse);
    
    if (customerEmailToUse) {
      try {
        // 🔓 Desencriptar email si está encriptado
        let emailToSend = customerEmailToUse;
        
        console.log(`🔍 Email original:`, emailToSend);
        console.log(`🔍 Es objeto:`, typeof emailToSend === 'object');
        console.log(`🔍 Es string:`, typeof emailToSend === 'string');
        
        if (typeof emailToSend === 'string') {
          console.log(`🔍 String contiene @:`, emailToSend.includes('@'));
          console.log(`🔍 Longitud del string:`, emailToSend.length);
        }
        
        // Verificar si el email está encriptado (es un objeto con iv y data)
        if (typeof emailToSend === 'object' && emailToSend !== null) {
          console.log(`🔍 Propiedades del objeto:`, Object.keys(emailToSend));
          if (emailToSend.iv && emailToSend.data) {
            try {
              const { decrypt } = await import('../config/encryption.js');
              emailToSend = decrypt(emailToSend);
              console.log(`🔓 Email desencriptado exitosamente: ${emailToSend}`);
            } catch (decryptError) {
              console.error(`❌ Error desencriptando email objeto:`, decryptError);
              console.log(`⚠️ No se pudo desencriptar, saltando envío de email`);
              return;
            }
          } else {
            console.log(`⚠️ Objeto email sin estructura de encriptación esperada`);
            console.log(`⚠️ No se puede procesar, saltando envío de email`);
            return;
          }
        } else if (typeof emailToSend === 'string') {
          if (emailToSend.includes('@')) {
            console.log(`✅ Email en texto plano válido: ${emailToSend}`);
          } else {
            console.log(`⚠️ String sin @ - podría ser encriptado como string`);
            try {
              const { decrypt } = await import('../config/encryption.js');
              emailToSend = decrypt(emailToSend);
              console.log(`🔓 Email string desencriptado: ${emailToSend}`);
            } catch (decryptError) {
              console.error(`❌ No se pudo desencriptar string:`, decryptError);
              console.log(`⚠️ Usando como texto plano:`, emailToSend);
            }
          }
        }
        
        // Validar que el email final sea válido
        if (!emailToSend || typeof emailToSend !== 'string' || !emailToSend.includes('@')) {
          console.error(`❌ Email final inválido: "${emailToSend}"`);
          console.log(`⚠️ No se enviará notificación por email inválido`);
          return;
        }
        
        console.log(`📧 ENVIANDO email de confirmación a: ${emailToSend}`);
        console.log(`📧 Pedido ID: ${newOrder._id}`);
        console.log(`📧 Número de pedido: ${newOrder.orderNumber || 'N/A'}`);
        
        await sendOrderConfirmation(newOrder, emailToSend);
        console.log(`✅ Email de confirmación enviado exitosamente`);
        console.log(`🔍 ===== FIN DEBUG EMAIL =====\n`);
      } catch (emailError) {
        console.error(`❌ Error enviando email de confirmación:`, emailError);
        console.error(`❌ Error completo:`, emailError.response?.body || emailError.message);
        console.error(`❌ Stack trace:`, emailError.stack);
        console.log(`🔍 ===== FIN DEBUG EMAIL (CON ERROR) =====\n`);
        // No fallar la creación del pedido por error de email
      }
    } else {
      console.log(`⚠️ No se envió email: customerEmail no proporcionado`);
      console.log(`🔍 ===== FIN DEBUG EMAIL (SIN EMAIL) =====\n`);
    }

    res.status(201).json(newOrder);
  } catch (error) {
    res.status(500).json({ message: "Error al crear pedido", error });
  }
};

// Obtener todos los pedidos
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener pedidos", error });
  }
};

// Actualizar estado de un pedido
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, paymentMethod } = req.body;
    
    console.log(`\n🔄 ===== ACTUALIZANDO ESTADO DE PEDIDO =====`);
    console.log(`🔍 Pedido ID: ${id}`);
    console.log(`🔍 Nuevo estado: ${status}`);
    console.log(`🔍 Método de pago: ${paymentMethod || 'No especificado'}`);

    const updateData = { status: normalizeStatus(status) };
    
    // Si se especifica método de pago, agregarlo
    if (paymentMethod) {
      updateData.paymentMethod = paymentMethod;
      console.log(`💳 Método de pago actualizado: ${paymentMethod}`);
    }

    const order = await Order.findByIdAndUpdate(id, updateData, { new: true });

    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    console.log(`✅ Estado actualizado exitosamente`);

    // 📧 Enviar email de actualización según el nuevo estado
    if (order.customerEmail) {
      try {
        let emailToSend = order.customerEmail;
        
        // Desencriptar email si está encriptado
        if (typeof emailToSend === 'object' && emailToSend !== null && emailToSend.iv && emailToSend.data) {
          try {
            const { decrypt } = await import('../config/encryption.js');
            emailToSend = decrypt(emailToSend);
            console.log(`🔓 Email desencriptado para notificación: ${emailToSend}`);
          } catch (decryptError) {
            console.error(`❌ Error desencriptando email para actualización:`, decryptError);
            emailToSend = String(order.customerEmail);
          }
        }
        
        // Determinar qué tipo de notificación enviar según el estado
        const normalizedStatus = normalizeStatus(status);
        console.log(`📧 Enviando notificación para estado: ${normalizedStatus}`);
        
        switch (normalizedStatus) {
          case 'En preparación':
            await sendOrderStatusUpdate(order, emailToSend);
            console.log(`✅ Email de "En preparación" enviado`);
            break;
            
          case 'Listo':
            await sendOrderStatusUpdate(order, emailToSend);
            console.log(`✅ Email de "Listo para pago" enviado`);
            break;
            
          case 'Pendiente pago':
            await sendOrderStatusUpdate(order, emailToSend);
            console.log(`✅ Email de "Pendiente pago en local" enviado`);
            break;
            
          case 'Entregado':
            await sendOrderStatusUpdate(order, emailToSend);
            console.log(`✅ Email de "Entregado" enviado`);
            break;
            
          default:
            console.log(`ℹ️ No se envía email para estado: ${normalizedStatus}`);
        }
        
      } catch (emailError) {
        console.error(`❌ Error enviando email de actualización:`, emailError);
        console.error(`❌ Error completo:`, emailError.response?.body || emailError.message);
        // No fallar la actualización por error de email
      }
    } else {
      console.log(`⚠️ No se envió email: customerEmail no disponible`);
    }

    console.log(`🔍 ===== FIN ACTUALIZACIÓN DE ESTADO =====\n`);

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: "Error al actualizar estado", error });
  }
};

// Eliminar pedido
export const deleteOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await Order.findOneAndDelete({ id });
    if (!order) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }
    res.json({ message: "Pedido eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: "Error al eliminar pedido", error });
  }
};

