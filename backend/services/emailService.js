import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();

// Configurar SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// URL base del cliente (frontend) - usar URL de producción o localhost
const CLIENT_URL = process.env.FRONTEND_URL || process.env.CLIENT_URL?.split(',')[0] || 'https://carnesbeniken.onrender.com';

/**
 * Genera el progreso visual del pedido para emails
 */
const generateOrderProgressHTML = (currentStatus, isPaid = false) => {
  const steps = [
    { key: 'Pendiente', label: 'Pedido Recibido', icon: '📋' },
    { key: 'En preparación', label: 'En Preparación', icon: '👨‍🍳' },
    { key: 'Listo', label: 'Listo para Retiro', icon: '✅' },
    { key: 'Pagado', label: 'Pagado', icon: '💳', condition: isPaid },
    { key: 'Entregado', label: 'Entregado', icon: '🎉' }
  ];

  const statusOrder = ['Pendiente', 'En preparación', 'Listo', 'Entregado'];
  const currentIndex = statusOrder.indexOf(currentStatus);

  const getStepStatus = (step) => {
    if (step.key === 'Pagado') {
      return isPaid ? 'completed' : currentStatus === 'Listo' ? 'current' : 'pending';
    }
    const stepIndex = statusOrder.indexOf(step.key);
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  const filteredSteps = steps.filter(step => !step.condition || step.condition);
  
  return `
    <div style="margin: 20px 0; padding: 20px; background-color: #F9FAFB; border-radius: 8px;">
      <h3 style="text-align: center; color: #374151; margin-bottom: 20px;">Estado del Pedido</h3>
      <div style="display: flex; justify-content: space-between; align-items: center; position: relative;">
        <!-- Línea de progreso -->
        <div style="position: absolute; top: 20px; left: 20px; right: 20px; height: 2px; background-color: #E5E7EB; z-index: 1;"></div>
        
        ${filteredSteps.map((step, index) => {
          const status = getStepStatus(step);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';
          
          return `
            <div style="display: flex; flex-direction: column; align-items: center; position: relative; z-index: 2;">
              <div style="
                width: 40px; 
                height: 40px; 
                border-radius: 50%; 
                display: flex; 
                align-items: center; 
                justify-content: center; 
                font-size: 16px; 
                font-weight: bold; 
                border: 2px solid;
                background-color: white;
                ${isCompleted ? 'border-color: #10B981; color: #10B981;' : 
                  isCurrent ? 'border-color: #3B82F6; color: #3B82F6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);' : 
                  'border-color: #D1D5DB; color: #9CA3AF;'}
              ">
                ${isCompleted ? '✓' : step.icon}
              </div>
              <div style="
                margin-top: 8px; 
                font-size: 12px; 
                font-weight: 500; 
                text-align: center; 
                max-width: 80px;
                ${isCompleted ? 'color: #059669;' : 
                  isCurrent ? 'color: #2563EB;' : 
                  'color: #6B7280;'}
              ">
                ${step.label}
                ${isCurrent ? '<br><span style="color: #3B82F6; font-size: 10px;">En proceso...</span>' : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
};

/**
 * Envía email de confirmación de pedido
 */
export const sendOrderConfirmation = async (order, customerEmail) => {
  try {
    const orderTrackingUrl = `${CLIENT_URL}/track/${order.orderNumber || order.id}`;
    const totalCLP = order.items?.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0) || 0;
    
    const msg = {
      to: customerEmail,
      from: process.env.MAIL_FROM || 'noreply@beniken.cl',
      subject: `📋 Pedido Confirmado #${order.orderNumber || order.id} - Beniken Carnes`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #10B981, #059669); border-radius: 12px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🥩 Beniken Carnes</h1>
            <h2 style="color: white; margin: 10px 0; font-size: 20px;">¡Pedido Confirmado!</h2>
          </div>
          
          <!-- Estado de confirmación -->
          <div style="background-color: #D1FAE5; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; border-left: 4px solid #10B981;">
            <p style="margin: 0; color: #065F46; font-weight: bold;">✅ Tu pedido ha sido recibido y está en preparación</p>
            <p style="margin: 5px 0 0 0; color: #047857; font-size: 14px;">La carnicería está ajustando los montos según el peso real, esto puede variar entre más o menos gramos.</p>
          </div>

          <!-- Progreso del pedido -->
          ${generateOrderProgressHTML(order.status || 'Pendiente', order.paid || false)}
          
          <!-- Detalles del pedido -->
          <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0; display: flex; align-items: center;">📋 Detalles del Pedido</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
              <p style="margin: 5px 0;"><strong>N° Pedido:</strong> ${order.orderNumber || order.id}</p>
              <p style="margin: 5px 0;"><strong>Cliente:</strong> ${order.customerName}</p>
              <p style="margin: 5px 0;"><strong>Teléfono:</strong> ${order.customerPhone || '-'}</p>
              <p style="margin: 5px 0;"><strong>Hora de retiro:</strong> ${order.pickupTime || 'Por coordinar'}</p>
            </div>
            ${order.note ? `<p style="margin: 10px 0; padding: 10px; background-color: #FEF3C7; border-radius: 4px;"><strong>Nota:</strong> ${order.note}</p>` : ''}
          </div>

          <!-- Items del pedido -->
          <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">🛒 Productos</h3>
            ${order.items?.map(item => `
              <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB;">
                <span>${item.name} — ${Number(item.quantity).toFixed(3)} ${item.unit || 'kg'}</span>
                <span style="font-weight: bold;">$${(Number(item.price) || 0).toLocaleString('es-CL')}</span>
              </div>
            `).join('') || '<p>No hay items disponibles</p>'}
            <div style="margin-top: 15px; padding-top: 15px; border-top: 2px solid #DC2626; display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #DC2626;">
              <span>Total:</span>
              <span>$${Math.round(totalCLP).toLocaleString('es-CL')}</span>
            </div>
          </div>

          <!-- Botón de seguimiento -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${orderTrackingUrl}" 
               style="background-color: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              📱 Ver Estado en Tiempo Real
            </a>
          </div>

          <!-- Información importante -->
          <div style="background-color: #EFF6FF; padding: 15px; border-radius: 6px; border-left: 4px solid #3B82F6;">
            <p style="margin: 0; color: #1E40AF; font-weight: bold;">💡 Información Importante:</p>
            <ul style="color: #1E40AF; margin: 10px 0; padding-left: 20px;">
              <li>Recibirás notificaciones por email cuando tu pedido cambie de estado</li>
              <li>Los precios pueden variar según el peso real de los productos</li>
              <li>Guarda este email para hacer seguimiento de tu pedido</li>
            </ul>
          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; text-align: center; color: #6B7280; font-size: 14px;">
            <p>Gracias por confiar en Beniken Carnes</p>
            <p>📞 Contacto: +56 9 1234 5678 | 📧 info@beniken.cl</p>
          </div>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log(`✅ Email de confirmación enviado a ${customerEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando email de confirmación:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envía email de actualización de estado del pedido
 */
export const sendOrderStatusUpdate = async (order, customerEmail, newStatus) => {
  try {
    const orderTrackingUrl = `${CLIENT_URL}/track/${order.orderNumber || order.id}`;
    const totalCLP = order.items?.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0) || 0;
    
    // Si no se pasa newStatus, usar el estado actual de la orden
    const currentStatus = newStatus || order.status;
    
    // Mensajes personalizados según el estado (coinciden con OrderStatusPage.js)
    const statusMessages = {
      'Pendiente': {
        title: '📋 Pedido Recibido',
        message: 'Tu pedido ha sido recibido y está en preparación. La carnicería está ajustando los montos según el peso real.',
        color: '#F59E0B',
        bgColor: '#FEF3C7'
      },
      'En preparación': {
        title: '👨‍🍳 Preparando tu Pedido',
        message: 'Nuestro equipo está preparando cuidadosamente tu pedido. Los precios pueden variar según el peso real de los productos.',
        color: '#F59E0B',
        bgColor: '#FEF3C7'
      },
      'Listo': {
        title: '✅ Pedido Listo para Retiro',
        message: order.paid ? 
          '¡Tu pedido está listo para retiro! Usa el código QR para retirar tu pedido.' :
          order.paymentMethod === 'local' ?
            '¡Tu pedido está listo para retiro! Recuerda llevar el dinero para pagar en la tienda.' :
            '¡Tu pedido está listo! Completa el pago para poder retirarlo.',
        color: '#10B981',
        bgColor: '#D1FAE5'
      },
      'Pendiente pago': {
        title: '💳 Pendiente de Pago',
        message: 'Tu pedido está listo pero requiere confirmación de pago. Completa el pago para poder retirarlo.',
        color: '#F59E0B',
        bgColor: '#FEF3C7'
      },
      'Entregado': {
        title: '🎉 Pedido Entregado',
        message: 'Pedido entregado. ¡Gracias por tu compra! Esperamos que disfrutes nuestros productos.',
        color: '#10B981',
        bgColor: '#D1FAE5'
      }
    };

    const statusInfo = statusMessages[currentStatus] || {
      title: '📋 Actualización de Pedido',
      message: `El estado de tu pedido ha cambiado a: ${currentStatus}`,
      color: '#6B7280',
      bgColor: '#F3F4F6'
    };

    const msg = {
      to: customerEmail,
      from: process.env.MAIL_FROM || 'noreply@beniken.cl',
      subject: `${statusInfo.title} #${order.orderNumber || order.id} - Beniken Carnes`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #10B981, #059669); border-radius: 12px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🥩 Beniken Carnes</h1>
            <h2 style="color: white; margin: 10px 0; font-size: 20px;">${statusInfo.title}</h2>
          </div>
          
          <!-- Estado actual -->
          <div style="background-color: ${statusInfo.bgColor}; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; border-left: 4px solid ${statusInfo.color};">
            <p style="margin: 0; color: #065F46; font-weight: bold; font-size: 16px;">${statusInfo.message}</p>
          </div>

          <!-- Progreso del pedido -->
          ${generateOrderProgressHTML(currentStatus, order.paid || false)}
          
          <!-- Detalles del pedido -->
          <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">📋 Detalles del Pedido</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <p style="margin: 5px 0;"><strong>N° Pedido:</strong> ${order.orderNumber || order.id}</p>
              <p style="margin: 5px 0;"><strong>Cliente:</strong> ${order.customerName}</p>
              <p style="margin: 5px 0;"><strong>Estado:</strong> <span style="color: ${statusInfo.color}; font-weight: bold;">${currentStatus}</span></p>
              <p style="margin: 5px 0;"><strong>Hora de retiro:</strong> ${order.pickupTime || 'Por coordinar'}</p>
            </div>
          </div>

          <!-- Estado de pago -->
          ${order.paid ? `
            <div style="background-color: #D1FAE5; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; border-left: 4px solid #10B981;">
              <p style="margin: 0; color: #065F46; font-weight: bold;">✅ Pago confirmado</p>
              <p style="margin: 5px 0 0 0; color: #047857; font-size: 14px;">Método: ${order.paymentMethod === 'local' ? 'Pago en tienda' : 'Pago online'}</p>
            </div>
          ` : (currentStatus === 'Listo' || currentStatus === 'Pendiente pago') ? `
            <div style="background-color: #FEF3C7; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; border-left: 4px solid #F59E0B;">
              <p style="margin: 0; color: #92400E; font-weight: bold;">⚠️ Pago pendiente</p>
              ${order.paymentMethod === 'local' ? 
                '<p style="margin: 5px 0 0 0; color: #B45309; font-size: 14px;">💳 Recuerda pagar al momento del retiro en la tienda</p>' :
                '<p style="margin: 5px 0 0 0; color: #B45309; font-size: 14px;">Completa el pago para poder retirar tu pedido</p>'
              }
            </div>
          ` : ''}

          <!-- Total actualizado -->
          <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <div style="display: flex; justify-content: space-between; font-size: 18px; font-weight: bold; color: #DC2626;">
              <span>Total:</span>
              <span>$${Math.round(totalCLP).toLocaleString('es-CL')}</span>
            </div>
          </div>

          <!-- Botón de seguimiento -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${orderTrackingUrl}" 
               style="background-color: #3B82F6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              📱 Ver Estado Actualizado
            </a>
          </div>

          <!-- Información adicional según el estado -->
          ${(currentStatus === 'Listo' || currentStatus === 'Pendiente pago') && !order.paid ? `
            <div style="background-color: #EFF6FF; padding: 15px; border-radius: 6px; border-left: 4px solid #3B82F6;">
              <p style="margin: 0; color: #1E40AF; font-weight: bold;">💡 Próximos pasos:</p>
              <ul style="color: #1E40AF; margin: 10px 0; padding-left: 20px;">
                ${order.paymentMethod === 'local' ? 
                  '<li>Dirígete a la tienda con el dinero para pagar</li><li>Presenta tu código QR o número de pedido</li>' :
                  '<li>Completa el pago online</li><li>Recibirás confirmación de pago</li><li>Usa el código QR para retirar</li>'
                }
              </ul>
            </div>
          ` : currentStatus === 'Entregado' ? `
            <div style="background-color: #D1FAE5; padding: 15px; border-radius: 6px; border-left: 4px solid #10B981;">
              <p style="margin: 0; color: #065F46; font-weight: bold;">🙏 ¡Gracias por tu compra!</p>
              <p style="color: #047857; margin: 10px 0 0 0;">Esperamos que hayas disfrutado nuestros productos. Tu opinión es muy importante para nosotros.</p>
            </div>
          ` : `
            <div style="background-color: #EFF6FF; padding: 15px; border-radius: 6px; border-left: 4px solid #3B82F6;">
              <p style="margin: 0; color: #1E40AF; font-weight: bold;">💡 Información:</p>
              <p style="color: #1E40AF; margin: 10px 0 0 0;">Te mantendremos informado sobre cualquier cambio en tu pedido.</p>
            </div>
          `}

          <!-- Footer -->
          <div style="margin-top: 30px; text-align: center; color: #6B7280; font-size: 14px;">
            <p>Gracias por confiar en Beniken Carnes</p>
            <p>📞 Contacto: +56 9 1234 5678 | 📧 info@beniken.cl</p>
          </div>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log(`✅ Email de actualización enviado a ${customerEmail} - Estado: ${currentStatus}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando email de actualización:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Envía email de confirmación de pago recibido
 */
export const sendPaymentConfirmation = async (order, customerEmail) => {
  try {
    const orderTrackingUrl = `${CLIENT_URL}/track/${order.orderNumber || order.id}`;
    const totalCLP = order.items?.reduce((acc, item) => acc + (Number(item.price) || 0) * item.quantity, 0) || 0;
    
    const msg = {
      to: customerEmail,
      from: process.env.MAIL_FROM || 'noreply@beniken.cl',
      subject: `💳 Pago Confirmado #${order.orderNumber || order.id} - Beniken Carnes`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #ffffff;">
          <!-- Header -->
          <div style="text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #10B981, #059669); border-radius: 12px;">
            <h1 style="color: white; margin: 0; font-size: 28px;">🥩 Beniken Carnes</h1>
            <h2 style="color: white; margin: 10px 0; font-size: 20px;">💳 Pago Confirmado</h2>
          </div>
          
          <!-- Confirmación de pago -->
          <div style="background-color: #D1FAE5; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; border-left: 4px solid #10B981;">
            <p style="margin: 0; color: #065F46; font-weight: bold; font-size: 16px;">✅ ¡Pago confirmado exitosamente!</p>
            <p style="margin: 5px 0 0 0; color: #047857; font-size: 14px;">Tu pedido ahora será procesado y estará listo para retiro.</p>
          </div>

          <!-- Progreso del pedido actualizado -->
          ${generateOrderProgressHTML(order.status || 'Listo', true)}
          
          <!-- Información del pago -->
          <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="color: #374151; margin-top: 0;">💳 Información del Pago</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <p style="margin: 5px 0;"><strong>N° Pedido:</strong> ${order.orderNumber || order.id}</p>
              <p style="margin: 5px 0;"><strong>Cliente:</strong> ${order.customerName}</p>
              <p style="margin: 5px 0;"><strong>Monto:</strong> $${Math.round(totalCLP).toLocaleString('es-CL')}</p>
              <p style="margin: 5px 0;"><strong>Método:</strong> ${order.paymentMethod === 'local' ? 'Pago en tienda' : order.paymentMethod === 'transfer' ? 'Transferencia' : 'Pago online'}</p>
            </div>
            <div style="margin-top: 15px; padding: 10px; background-color: #D1FAE5; border-radius: 4px; text-align: center;">
              <span style="color: #065F46; font-weight: bold; font-size: 16px;">✅ ESTADO: PAGADO</span>
            </div>
          </div>

          <!-- Botón de seguimiento -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${orderTrackingUrl}" 
               style="background-color: #10B981; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block; font-size: 16px;">
              📱 Ver Estado del Pedido
            </a>
          </div>

          <!-- Próximos pasos -->
          <div style="background-color: #EFF6FF; padding: 15px; border-radius: 6px; border-left: 4px solid #3B82F6;">
            <p style="margin: 0; color: #1E40AF; font-weight: bold;">💡 Próximos pasos:</p>
            <ul style="color: #1E40AF; margin: 10px 0; padding-left: 20px;">
              <li>Tu pedido está confirmado y será preparado</li>
              <li>Recibirás una notificación cuando esté listo para retiro</li>
              <li>Usa el código QR para retirar tu pedido en la tienda</li>
            </ul>
          </div>

          <!-- Footer -->
          <div style="margin-top: 30px; text-align: center; color: #6B7280; font-size: 14px;">
            <p>Gracias por confiar en Beniken Carnes</p>
            <p>📞 Contacto: +56 9 1234 5678 | 📧 info@beniken.cl</p>
          </div>
        </div>
      `
    };

    await sgMail.send(msg);
    console.log(`✅ Email de confirmación de pago enviado a ${customerEmail}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Error enviando email de confirmación de pago:', error);
    return { success: false, error: error.message };
  }
};

export default {
  sendOrderConfirmation,
  sendOrderStatusUpdate,
  sendPaymentConfirmation
};
