// src/components/payweb.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchOrderById } from "../api/orders";

const PayWeb = () => {
  const [order, setOrder] = useState(null);
  const [receiptFile, setReceiptFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const navigate = useNavigate();

  // Cargar datos del pedido
  useEffect(() => {
    const loadOrder = async () => {
      const orderId = localStorage.getItem("trackingOrderId");
      if (orderId) {
        try {
          const orderData = await fetchOrderById(orderId);
          setOrder(orderData);
        } catch (err) {
          console.error("Error cargando pedido:", err);
        }
      }
    };
    loadOrder();
  }, []);

  // Manejar selección de archivo
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validar que sea una imagen
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona una imagen válida');
        return;
      }
      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('El archivo es muy grande. Máximo 5MB.');
        return;
      }
      setReceiptFile(file);
    }
  };

  // Subir comprobante de transferencia
  const handleUploadReceipt = async () => {
    if (!receiptFile) {
      alert("Por favor selecciona un comprobante de transferencia.");
      return;
    }

    if (!order) {
      alert("No se encontró información del pedido.");
      return;
    }

    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);
      formData.append('orderId', order.id);
      formData.append('customerName', order.customerName);
      formData.append('totalAmount', Math.round(order.totalCLP));

      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/orders/${order.id}/upload-receipt`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir el comprobante');
      }

      setUploaded(true);
      alert('¡Comprobante subido exitosamente! Tu pago está en revisión.');
      
      // Redirigir al estado del pedido después de 2 segundos
      setTimeout(() => {
        navigate("/order-status");
      }, 2000);
      
    } catch (err) {
      console.error("❌ Error subiendo comprobante:", err);
      alert("No se pudo subir el comprobante. Intenta nuevamente.");
    } finally {
      setUploading(false);
    }
  };

  if (!order) {
    return (
      <main className="bg-gray-50 flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600">Cargando información del pedido...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-gray-50 flex justify-center items-start min-h-screen py-10 font-sans">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full p-8 mx-4">
        {/* Encabezado */}
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Pago por Transferencia</h1>
          <p className="text-gray-600">Sube tu comprobante de transferencia</p>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Columna izquierda - Información del pedido */}
          <section>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Detalles del Pedido</h2>
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="space-y-3">
                <div>
                  <span className="font-semibold text-gray-700">Pedido:</span>
                  <span className="ml-2 text-lg font-bold text-blue-600">#{order.id}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Cliente:</span>
                  <span className="ml-2">{order.customerName}</span>
                </div>
                <div>
                  <span className="font-semibold text-gray-700">Monto a pagar:</span>
                  <span className="ml-2 text-2xl font-bold text-red-700">
                    ${Math.round(order.totalCLP || 0).toLocaleString('es-CL')}
                  </span>
                </div>
              </div>
            </div>

            {/* Instrucciones de transferencia */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="font-semibold text-blue-800 mb-3">📋 Instrucciones de Transferencia</h3>
              <div className="space-y-2 text-sm text-blue-700">
                <p><strong>Banco:</strong> Banco Estado</p>
                <p><strong>Tipo de cuenta:</strong> Cuenta Corriente</p>
                <p><strong>Número:</strong> 12345678-9</p>
                <p><strong>RUT:</strong> 12.345.678-9</p>
                <p><strong>Titular:</strong> Carnicería Beniken</p>
                <p><strong>Email:</strong> pagos@beniken.cl</p>
              </div>
              <div className="mt-4 p-3 bg-yellow-100 rounded border-l-4 border-yellow-500">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Importante:</strong> En el mensaje de la transferencia, 
                  incluye tu número de pedido: <strong>#{order.id}</strong>
                </p>
              </div>
            </div>
          </section>

          {/* Columna derecha - Subir comprobante */}
          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Subir Comprobante</h3>
            
            {!uploaded ? (
              <div className="space-y-6">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="receipt-upload"
                  />
                  <label
                    htmlFor="receipt-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <div className="text-4xl mb-4">📄</div>
                    <p className="text-gray-600 mb-2">
                      {receiptFile ? receiptFile.name : 'Selecciona tu comprobante'}
                    </p>
                    <p className="text-sm text-gray-500">
                      Formatos: JPG, PNG, PDF (máx. 5MB)
                    </p>
                  </label>
                </div>

                {receiptFile && (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-green-800 text-sm">
                      ✅ Archivo seleccionado: {receiptFile.name}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleUploadReceipt}
                  disabled={!receiptFile || uploading}
                  className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-md font-semibold transition-colors"
                >
                  {uploading ? 'Subiendo...' : '📤 Subir Comprobante'}
                </button>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-6xl mb-4">✅</div>
                <h3 className="text-xl font-semibold text-green-800 mb-2">
                  ¡Comprobante subido exitosamente!
                </h3>
                <p className="text-gray-600 mb-4">
                  Tu pago está en revisión. Te notificaremos cuando sea validado.
                </p>
                <button
                  onClick={() => navigate('/order-status')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Ver estado del pedido
                </button>
              </div>
            )}
          </section>
        </section>

        {/* Botón volver */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
          >
            ← Volver
          </button>
        </div>
      </div>
    </main>
  );
};

export default PayWeb;
