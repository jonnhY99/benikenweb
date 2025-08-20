import React, { useState } from "react";

export default function OrderReviewModal({ order, onSave, onClose }) {
  const [items, setItems] = useState(order.items);

  const handleChange = (index, newQty) => {
    setItems((prev) =>
      prev.map((it, i) =>
        i === index ? { ...it, quantity: Number(newQty) } : it
      )
    );
  };

  const total = items.reduce(
    (sum, it) => sum + (it.price || 0) * (it.quantity || 0),
    0
  );

  const handleSave = () => {
    onSave(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Ajustar Pedido</h2>
        <ul className="space-y-3">
          {items.map((it, idx) => (
            <li key={it.productId} className="flex justify-between items-center">
              <span>
                {it.name} ({it.unit})
              </span>
              <input
                type="number"
                value={it.quantity}
                min="0.1"
                step="0.1"
                onChange={(e) => handleChange(idx, e.target.value)}
                className="w-20 border rounded px-2 py-1"
              />
            </li>
          ))}
        </ul>

        <div className="mt-4 text-right font-bold">
          Nuevo Total: ${total.toLocaleString("es-CL")}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded"
            onClick={handleSave}
          >
            Guardar cambios
          </button>
        </div>
      </div>
    </div>
  );
}
