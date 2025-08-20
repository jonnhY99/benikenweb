// src/components/payweb.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { payOrder } from "../api/orders"; // ✅ Importamos la API

const PayWeb = () => {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const navigate = useNavigate();

  // 👉 Formatear número de tarjeta (XXXX XXXX XXXX XXXX)
  const handleCardNumber = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 16);
    let formatted = value.replace(/(.{4})/g, "$1 ").trim();
    setCardNumber(formatted);
  };

  // 👉 Formatear fecha MM/YY
  const handleExpiryDate = (e) => {
    let value = e.target.value.replace(/\D/g, "").substring(0, 4);
    if (value.length > 2) {
      value = value.substring(0, 2) + "/" + value.substring(2);
    }
    setExpiryDate(value);
  };

  // 👉 Simulación de pago
  const handleContinue = async () => {
    if (!cardNumber || !expiryDate) {
      alert("Por favor ingresa los datos de la tarjeta.");
      return;
    }

    try {
      const orderId = localStorage.getItem("trackingOrderId");
      if (!orderId) {
        alert("No se encontró un pedido activo.");
        return;
      }

      // ✅ Marcar el pedido como pagado en la base de datos
      await payOrder(orderId);

      // ✅ Guardamos el estado de éxito para mostrarlo en OrderStatusPage
      localStorage.setItem("paymentSuccess", "true");

      // Redirigir al estado del pedido
      navigate("/order-status");
    } catch (err) {
      console.error("❌ Error procesando el pago:", err);
      alert("No se pudo procesar el pago. Intenta nuevamente.");
    }
  };

  return (
    <main className="bg-gray-50 flex justify-center items-start min-h-screen py-10 font-sans">
      <div className="bg-white rounded-xl shadow-lg max-w-4xl w-full p-8 mx-4">
        {/* Encabezado */}
        <header className="mb-8 flex items-center gap-2">
          <img
            src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/f12c976b-deb3-4c07-882d-bcb99d827f86.png"
            alt="Logo simulado de Webpay"
            className="h-10 w-auto"
          />
          <span className="text-purple-800 font-semibold text-lg">transbank</span>
        </header>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Columna izquierda */}
          <section>
            <h2 className="text-gray-700 font-semibold mb-6">Estás pagando en:</h2>
            <div className="mb-6">
              <img
                src="https://storage.googleapis.com/workspace-0f70711f-8b4e-4d94-86f1-2a93ccde5887/image/fb21fb69-a29e-41f8-b26f-fa8ed6eaebd2.png"
                alt="Logo Unired"
                className="h-10 w-auto mb-4"
              />
              <p className="text-2xl font-semibold text-gray-900 mb-1">Monto a pagar:</p>
              <p className="text-3xl font-bold text-gray-900">
                ${localStorage.getItem("paymentTotal") || "0"}
              </p>
            </div>
          </section>

          {/* Columna derecha */}
          <section>
            <h3 className="text-gray-700 font-semibold mb-6">Ingresa los datos de tu tarjeta:</h3>
            <div className="bg-gray-100 rounded-md p-6 mb-6">
              <div className="relative max-w-xs mx-auto">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={handleCardNumber}
                  maxLength="19"
                  placeholder="XXXX XXXX XXXX XXXX"
                  className="w-full rounded-md border border-gray-300 bg-gray-100 text-gray-700 py-3 px-3 focus:border-purple-700 focus:ring focus:ring-purple-300"
                />
              </div>
              <div className="relative max-w-xs mx-auto mt-4">
                <input
                  type="text"
                  value={expiryDate}
                  onChange={handleExpiryDate}
                  maxLength="5"
                  placeholder="MM/YY"
                  className="w-20 rounded-md border border-gray-300 bg-gray-100 text-gray-700 py-3 px-3 focus:border-purple-700 focus:ring focus:ring-purple-300"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="w-full bg-purple-700 hover:bg-purple-800 text-white py-3 rounded-md font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              Continuar
            </button>
          </section>
        </section>
      </div>
    </main>
  );
};

export default PayWeb;
