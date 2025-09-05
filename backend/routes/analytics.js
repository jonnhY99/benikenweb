// backend/routes/analytics.js
import express from "express";
import Order from "../models/Order.js";
import Product from "../models/Product.js";

export default function analyticsRouterFactory(io) {
  const router = express.Router();

  // 📊 Dashboard analytics
  router.get("/dashboard", async (req, res) => {
    try {
      console.log("📊 Analytics dashboard endpoint called");
      console.log("Headers:", req.headers.authorization);
      console.log("User:", req.user); // Log the authenticated user
      const { from, to } = req.query;
      console.log("Date range:", { from, to });
      
      // Build date filter - if no dates provided, get all data
      let dateFilter = {};
      if (from || to) {
        dateFilter.createdAt = {};
        if (from) dateFilter.createdAt.$gte = new Date(from);
        if (to) {
          // Set end of day for 'to' date
          const toDate = new Date(to);
          toDate.setHours(23, 59, 59, 999);
          dateFilter.createdAt.$lte = toDate;
        }
      }
      
      console.log("Date filter:", dateFilter);

      // Get orders with date filter
      const orders = await Order.find(dateFilter).sort({ createdAt: -1 });
      const products = await Product.find();
      
      console.log(`Found ${orders.length} orders and ${products.length} products`);

      // Calculate metrics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.totalCLP || 0), 0);
      const paidOrders = orders.filter(order => order.paid === true);
      const totalPaidRevenue = paidOrders.reduce((sum, order) => sum + (order.totalCLP || 0), 0);
      const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
      
      console.log("📊 Calculated metrics:", {
        totalOrders,
        totalRevenue,
        paidOrdersCount: paidOrders.length,
        totalPaidRevenue,
        avgOrderValue
      });

      // Order status distribution
      const statusDistribution = orders.reduce((acc, order) => {
        const status = order.status || 'Pendiente';
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      // Payment method distribution - fix mapping for real data structure
      const paymentMethods = orders.reduce((acc, order) => {
        let method = 'No especificado';
        if (order.paymentMethod === 'online') {
          method = 'Transferencia';
        } else if (order.paymentMethod === 'local') {
          method = 'Efectivo';
        } else if (order.receiptData && order.receiptData.receiptPath) {
          method = 'Transferencia';
        }
        acc[method] = (acc[method] || 0) + 1;
        return acc;
      }, {});
      
      console.log("💳 Payment methods distribution:", paymentMethods);

      // Daily revenue (last 30 days)
      const dailyRevenue = [];
      const now = new Date();
      for (let i = 29; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        
        const dayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt);
          return orderDate >= date && orderDate < nextDate;
        });
        
        const dayRevenue = dayOrders.reduce((sum, order) => sum + (order.totalCLP || 0), 0);
        
        dailyRevenue.push({
          date: date.toISOString().split('T')[0],
          revenue: dayRevenue,
          orders: dayOrders.length
        });
      }

      // Top products by quantity sold - fix for real data structure
      const productSales = {};
      orders.forEach(order => {
        if (order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            const key = item.name || item.productId || 'Producto desconocido';
            if (!productSales[key]) {
              productSales[key] = { name: key, quantity: 0, revenue: 0 };
            }
            const quantity = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.price) || 0;
            productSales[key].quantity += quantity;
            productSales[key].revenue += quantity * price;
          });
        }
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);
        
      console.log("🏆 Top products:", topProducts);

      // Stock levels
      const stockLevels = products.map(product => ({
        name: product.name,
        stock: product.stock || 0,
        minStock: product.minStock || 0,
        isLowStock: (product.stock || 0) <= (product.minStock || 0)
      }));

      const lowStockProducts = stockLevels.filter(p => p.isLowStock);

      const responseData = {
        summary: {
          totalOrders,
          totalRevenue,
          totalPaidRevenue,
          avgOrderValue,
          pendingOrders: totalOrders - paidOrders.length,
          lowStockCount: lowStockProducts.length
        },
        charts: {
          statusDistribution,
          paymentMethods,
          dailyRevenue,
          topProducts,
          stockLevels: stockLevels.slice(0, 20) // Top 20 products by stock
        },
        alerts: {
          lowStockProducts
        }
      };
      
      console.log("📊 Sending analytics response:", JSON.stringify(responseData, null, 2));
      res.json(responseData);
    } catch (err) {
      console.error("❌ Error GET /analytics/dashboard:", err);
      res.status(500).json({ error: "Error al obtener analytics del dashboard" });
    }
  });

  // 📊 Sales report data
  router.get("/sales-report", async (req, res) => {
    try {
      const { from, to, groupBy = 'day' } = req.query;
      
      let dateFilter = {};
      if (from || to) {
        dateFilter.createdAt = {};
        if (from) dateFilter.createdAt.$gte = new Date(from);
        if (to) dateFilter.createdAt.$lte = new Date(to);
      }

      const orders = await Order.find(dateFilter).sort({ createdAt: -1 });

      // Group sales by specified period
      const salesData = {};
      orders.forEach(order => {
        const date = new Date(order.createdAt);
        let key;
        
        switch (groupBy) {
          case 'hour':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:00`;
            break;
          case 'day':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            break;
          case 'month':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            break;
          default:
            key = date.toISOString().split('T')[0];
        }

        if (!salesData[key]) {
          salesData[key] = { orders: 0, revenue: 0, items: [] };
        }
        
        salesData[key].orders += 1;
        salesData[key].revenue += order.totalCLP || 0;
        if (order.items) {
          salesData[key].items.push(...order.items);
        }
      });

      const reportData = Object.entries(salesData)
        .map(([period, data]) => ({ period, ...data }))
        .sort((a, b) => a.period.localeCompare(b.period));

      res.json({
        reportData,
        summary: {
          totalPeriods: reportData.length,
          totalOrders: orders.length,
          totalRevenue: orders.reduce((sum, order) => sum + (order.totalCLP || 0), 0),
          avgOrdersPerPeriod: reportData.length > 0 ? orders.length / reportData.length : 0
        }
      });
    } catch (err) {
      console.error("❌ Error GET /analytics/sales-report:", err);
      res.status(500).json({ error: "Error al obtener reporte de ventas" });
    }
  });

  // 📊 Products report data
  router.get("/products-report", async (req, res) => {
    try {
      const { from, to } = req.query;
      
      let dateFilter = {};
      if (from || to) {
        dateFilter.createdAt = {};
        if (from) dateFilter.createdAt.$gte = new Date(from);
        if (to) dateFilter.createdAt.$lte = new Date(to);
      }

      const orders = await Order.find(dateFilter);
      const products = await Product.find();

      // Calculate product performance
      const productPerformance = {};
      
      orders.forEach(order => {
        if (order.items) {
          order.items.forEach(item => {
            const productName = item.name || 'Producto desconocido';
            if (!productPerformance[productName]) {
              productPerformance[productName] = {
                name: productName,
                totalQuantity: 0,
                totalRevenue: 0,
                orderCount: 0,
                avgPrice: 0
              };
            }
            
            productPerformance[productName].totalQuantity += item.quantity || 0;
            productPerformance[productName].totalRevenue += (item.price || 0) * (item.quantity || 0);
            productPerformance[productName].orderCount += 1;
          });
        }
      });

      // Calculate average prices
      Object.values(productPerformance).forEach(product => {
        if (product.totalQuantity > 0) {
          product.avgPrice = product.totalRevenue / product.totalQuantity;
        }
      });

      // Add current stock information
      const productsWithStock = products.map(product => {
        const performance = productPerformance[product.name] || {
          totalQuantity: 0,
          totalRevenue: 0,
          orderCount: 0,
          avgPrice: product.pricePerKg || 0
        };
        
        return {
          ...performance,
          name: product.name,
          currentStock: product.stock || 0,
          minStock: product.minStock || 0,
          pricePerKg: product.pricePerKg || 0,
          isLowStock: (product.stock || 0) <= (product.minStock || 0),
          category: product.category || 'Sin categoría'
        };
      });

      res.json({
        products: productsWithStock,
        summary: {
          totalProducts: products.length,
          productsWithSales: Object.keys(productPerformance).length,
          lowStockProducts: productsWithStock.filter(p => p.isLowStock).length,
          totalStockValue: productsWithStock.reduce((sum, p) => sum + (p.currentStock * p.pricePerKg), 0)
        }
      });
    } catch (err) {
      console.error("❌ Error GET /analytics/products-report:", err);
      res.status(500).json({ error: "Error al obtener reporte de productos" });
    }
  });

  // 📊 Create sample data for testing (only in development)
  router.post("/sample-data", async (req, res) => {
    try {
      console.log("🧪 Creating sample data for analytics testing");
      
      // Create sample products if none exist
      const existingProducts = await Product.find();
      if (existingProducts.length === 0) {
        const sampleProducts = [
          { id: "1", name: "Tocino", description: "Tocino premium", price: 1698, unit: "kg", stock: 63, image: "/images/tocino.jpg", isActive: true },
          { id: "2", name: "Huesitos", description: "Huesitos de carne", price: 698, unit: "kg", stock: 100, image: "/images/huesitos.jpg", isActive: true },
          { id: "3", name: "Costillar de Cerdo", description: "Costillar fresco", price: 6298, unit: "kg", stock: 74, image: "/images/costillar.jpg", isActive: true }
        ];
        
        await Product.insertMany(sampleProducts);
        console.log("✅ Sample products created");
      }
      
      // Create sample orders if none exist
      const existingOrders = await Order.find();
      if (existingOrders.length === 0) {
        const sampleOrders = [
          {
            id: "ORD001",
            customerName: "Juan Pérez",
            customerPhone: "+56912345678",
            customerEmail: "juan@example.com",
            status: "Completado",
            paid: true,
            paymentMethod: "Transferencia",
            totalCLP: 5094,
            items: [
              { productId: "1", name: "Tocino", quantity: 3, price: 1698, unit: "kg" }
            ],
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
          },
          {
            id: "ORD002",
            customerName: "María González",
            customerPhone: "+56987654321",
            customerEmail: "maria@example.com",
            status: "Pendiente",
            paid: false,
            paymentMethod: "Efectivo",
            totalCLP: 1396,
            items: [
              { productId: "2", name: "Huesitos", quantity: 2, price: 698, unit: "kg" }
            ],
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
          },
          {
            id: "ORD003",
            customerName: "Carlos Silva",
            customerPhone: "+56911223344",
            customerEmail: "carlos@example.com",
            status: "Completado",
            paid: true,
            paymentMethod: "Tarjeta",
            totalCLP: 12596,
            items: [
              { productId: "3", name: "Costillar de Cerdo", quantity: 2, price: 6298, unit: "kg" }
            ],
            createdAt: new Date() // Today
          }
        ];
        
        await Order.insertMany(sampleOrders);
        console.log("✅ Sample orders created");
      }
      
      res.json({ 
        message: "Sample data created successfully",
        products: await Product.countDocuments(),
        orders: await Order.countDocuments()
      });
      
    } catch (err) {
      console.error("❌ Error creating sample data:", err);
      res.status(500).json({ error: "Error creating sample data" });
    }
  });

  // 📦 Stock inventory endpoint
  router.get("/stock-inventory", async (req, res) => {
    try {
      console.log("📦 Stock inventory endpoint called");
      
      const products = await Product.find().sort({ name: 1 });
      
      const inventory = products.map(product => ({
        id: product._id,
        name: product.name,
        description: product.description,
        currentStock: product.stock || 0,
        minStock: product.minStock || 0,
        unit: product.unit || 'kg',
        price: product.pricePerKg || product.price || 0,
        category: product.category || 'Sin categoría',
        isActive: product.isActive !== false,
        stockStatus: (product.stock || 0) <= (product.minStock || 0) ? 'low' : 
                    (product.stock || 0) <= (product.minStock || 0) * 2 ? 'medium' : 'high',
        lastUpdated: product.updatedAt || product.createdAt
      }));
      
      const summary = {
        totalProducts: inventory.length,
        activeProducts: inventory.filter(p => p.isActive).length,
        lowStockProducts: inventory.filter(p => p.stockStatus === 'low').length,
        mediumStockProducts: inventory.filter(p => p.stockStatus === 'medium').length,
        highStockProducts: inventory.filter(p => p.stockStatus === 'high').length,
        totalStockValue: inventory.reduce((sum, p) => sum + (p.currentStock * p.price), 0)
      };
      
      console.log(`📦 Found ${inventory.length} products in inventory`);
      
      res.json({
        inventory,
        summary
      });
      
    } catch (err) {
      console.error("❌ Error in stock inventory endpoint:", err);
      res.status(500).json({ error: "Error fetching stock inventory" });
    }
  });

  // 🧪 Test endpoint without authentication to verify data flow
  router.get("/test-data", async (req, res) => {
    try {
      console.log("🧪 Test endpoint called - no auth required");
      
      const orders = await Order.find().sort({ createdAt: -1 });
      const products = await Product.find();
      
      console.log(`📊 Found ${orders.length} orders and ${products.length} products`);
      
      // Sample first order and product for debugging
      if (orders.length > 0) {
        console.log("📝 Sample order:", JSON.stringify(orders[0], null, 2));
      }
      if (products.length > 0) {
        console.log("📝 Sample product:", JSON.stringify(products[0], null, 2));
      }
      
      res.json({
        ordersCount: orders.length,
        productsCount: products.length,
        sampleOrder: orders[0] || null,
        sampleProduct: products[0] || null
      });
      
    } catch (err) {
      console.error("❌ Error in test endpoint:", err);
      res.status(500).json({ error: "Error fetching test data" });
    }
  });

  return router;
}
