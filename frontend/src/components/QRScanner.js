// src/components/QRScanner.js
import React, { useState, useRef, useEffect } from 'react';
import { payOrder } from '../api/orders';

const QRScanner = ({ onClose, onOrderFound }) => {
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const [stream, setStream] = useState(null);
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Función para procesar el contenido del QR
  const processQRData = (qrContent) => {
    try {
      const orderInfo = JSON.parse(qrContent);
      if (orderInfo.id && orderInfo.customerName) {
        setOrderData(orderInfo);
        setError('');
        if (onOrderFound) {
          onOrderFound(orderInfo);
        }
      } else {
        setError('QR no válido: no contiene información de pedido');
      }
    } catch (err) {
      setError('QR no válido: formato incorrecto');
    }
  };

  // Función para iniciar la cámara
  const startCamera = async () => {
    try {
      setError('');
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Cámara trasera en móviles
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setStream(mediaStream);
      setCameraMode(true);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setError('No se pudo acceder a la cámara. Verifica los permisos.');
    }
  };

  // Función para detener la cámara
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraMode(false);
  };

  // Función para capturar y procesar frame de video
  const captureFrame = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Aquí normalmente usarías una librería como jsQR para decodificar
    // Por ahora, simulamos la detección
    setError('Enfoca el QR hacia la cámara y presiona "Escanear" cuando esté visible');
  };

  // Función para leer archivo de imagen con QR
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // Aquí normalmente usarías una librería como jsQR para decodificar
        // Por simplicidad, mostraremos un input manual
        setError('Por favor, ingresa manualmente el código del pedido o usa la cámara');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Limpiar stream al cerrar
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Función para marcar como pagado
  const handleMarkAsPaid = async () => {
    if (!orderData?.id) return;
    
    setProcessing(true);
    try {
      await payOrder(orderData.id, orderData.paymentMethod || 'local');
      setOrderData(prev => ({ ...prev, paid: true, paymentDate: new Date() }));
      alert('¡Pedido marcado como PAGADO!');
    } catch (err) {
      alert('Error al marcar como pagado: ' + err.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">Lector QR - Pedidos</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl"
            >
              ×
            </button>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Scanner Options */}
          <div className="space-y-4 mb-6">
            <div className="text-center">
              <p className="text-gray-600 mb-4">Selecciona una opción para escanear:</p>
              
              {!cameraMode ? (
                <>
                  {/* Camera Option */}
                  <div className="space-y-2">
                    <button
                      onClick={startCamera}
                      className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      📹 Usar Cámara
                    </button>
                  </div>

                  {/* File Upload Option */}
                  <div className="space-y-2 mt-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      📷 Subir imagen con QR
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Manual Input */}
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="O ingresa el código del pedido manualmente (ej: ORD001)"
                      className="w-full px-3 py-2 border rounded-lg"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          const orderId = e.target.value.trim();
                          if (orderId) {
                            // Simular datos del pedido para demo
                            processQRData(JSON.stringify({
                              id: orderId,
                              customerName: 'Cliente de prueba',
                              customerPhone: '123456789',
                              pickupTime: '14:00',
                              totalCLP: 15000,
                              items: [{ name: 'Producto de prueba', quantity: 1, unit: 'kg', price: 15000 }],
                              paid: false,
                              paymentMethod: 'local',
                              status: 'Listo'
                            }));
                          }
                        }
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Presiona Enter después de escribir</p>
                  </div>
                </>
              ) : (
                /* Camera View */
                <div className="space-y-4">
                  <div className="relative bg-black rounded-lg overflow-hidden">
                    <video
                      ref={videoRef}
                      className="w-full h-64 object-cover"
                      autoPlay
                      playsInline
                      muted
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* QR Frame Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-48 h-48 border-2 border-white border-dashed rounded-lg opacity-70"></div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={captureFrame}
                      className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      📱 Escanear QR
                    </button>
                    <button
                      onClick={stopCamera}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      ❌ Cerrar Cámara
                    </button>
                  </div>
                  
                  <p className="text-xs text-gray-500">
                    Enfoca el código QR dentro del marco y presiona "Escanear QR"
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Order Details */}
          {orderData && (
            <div className="border rounded-lg p-4 mb-4">
              <h3 className="font-bold text-lg mb-3 text-center">📋 Detalles del Pedido</h3>
              
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="font-semibold">Pedido:</span>
                    <div className="text-lg font-bold text-blue-600">#{orderData.id}</div>
                  </div>
                  <div>
                    <span className="font-semibold">Estado:</span>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      orderData.paid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {orderData.paid ? 'PAGADO' : 'NO PAGADO'}
                    </div>
                  </div>
                </div>

                <div>
                  <span className="font-semibold">Cliente:</span>
                  <div>{orderData.customerName}</div>
                </div>

                <div>
                  <span className="font-semibold">Teléfono:</span>
                  <div>{orderData.customerPhone}</div>
                </div>

                <div>
                  <span className="font-semibold">Hora de retiro:</span>
                  <div>{orderData.pickupTime}</div>
                </div>

                <div>
                  <span className="font-semibold">Productos:</span>
                  <ul className="mt-1 space-y-1">
                    {orderData.items?.map((item, idx) => (
                      <li key={idx} className="flex justify-between bg-gray-50 p-2 rounded">
                        <span>{item.name} - {Number(item.quantity).toFixed(3)} {item.unit || 'kg'}</span>
                        <span className="font-medium">${(Number(item.price) || 0).toLocaleString('es-CL')}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t pt-2 mt-2">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total:</span>
                    <span className="text-red-700">${(orderData.totalCLP || 0).toLocaleString('es-CL')}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-4 space-y-2">
                {!orderData.paid && (
                  <button
                    onClick={handleMarkAsPaid}
                    disabled={processing}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                  >
                    {processing ? 'Procesando...' : '💰 Marcar como PAGADO'}
                  </button>
                )}
                
                {orderData.paid && (
                  <div className="text-center text-green-600 font-semibold">
                    ✅ Este pedido ya está pagado
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Close Button */}
          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRScanner;
