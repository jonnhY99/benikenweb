import React, { useState } from "react";

export default function OrderReviewModal({ order, onSave, onClose }) {
  const [items, setItems] = useState(order.items.map(item => ({
    ...item,
    exactWeight: item.quantity, // Initialize with original quantity
    exactPrice: (item.price || 0) * item.quantity, // Initialize with original price
    originalQuantity: item.quantity, // Keep track of original
    inputMode: 'weight' // 'weight' or 'price'
  })));

  const handleWeightChange = (index, exactWeight) => {
    const weight = Number(exactWeight) || 0;
    const price = weight * (items[index].price || 0);
    setItems((prev) =>
      prev.map((it, i) =>
        i === index ? { 
          ...it, 
          exactWeight: weight,
          exactPrice: price,
          quantity: weight // Update quantity to match exact weight
        } : it
      )
    );
  };

  const handlePriceChange = (index, exactPrice) => {
    const price = Number(exactPrice) || 0;
    const unitPrice = items[index].price || 0;
    const weight = unitPrice > 0 ? price / unitPrice : 0;
    setItems((prev) =>
      prev.map((it, i) =>
        i === index ? { 
          ...it, 
          exactPrice: price,
          exactWeight: weight,
          quantity: weight // Update quantity to match calculated weight
        } : it
      )
    );
  };

  const toggleInputMode = (index) => {
    setItems((prev) =>
      prev.map((it, i) =>
        i === index ? { 
          ...it, 
          inputMode: it.inputMode === 'weight' ? 'price' : 'weight'
        } : it
      )
    );
  };

  // Calculate price difference for each item
  const calculatePriceDifference = (item) => {
    const originalPrice = (item.price || 0) * (item.originalQuantity || 0);
    const newPrice = (item.price || 0) * (item.exactWeight || 0);
    return newPrice - originalPrice;
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
        <h2 className="text-xl font-bold mb-4">⚖️ Ajustar Peso Exacto de Balanza</h2>
        <div className="space-y-4">
          {items.map((it, idx) => {
            const priceDiff = calculatePriceDifference(it);
            const newItemPrice = (it.price || 0) * (it.exactWeight || 0);
            
            return (
              <div key={it.productId} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-800">{it.name}</h4>
                    <p className="text-sm text-gray-600">
                      Precio: ${(it.price || 0).toLocaleString('es-CL')}/{it.unit}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Cantidad Original:
                    </label>
                    <div className="text-lg font-semibold text-gray-600">
                      {it.originalQuantity} {it.unit}
                    </div>
                    <div className="text-sm text-gray-500">
                      Precio: ${((it.price || 0) * (it.originalQuantity || 0)).toLocaleString('es-CL')}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {it.inputMode === 'weight' ? '⚖️ Peso Exacto:' : '💰 Precio Exacto:'}
                      </label>
                      <button
                        type="button"
                        onClick={() => toggleInputMode(idx)}
                        className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded transition-colors"
                        title={`Cambiar a ${it.inputMode === 'weight' ? 'precio' : 'peso'}`}
                      >
                        {it.inputMode === 'weight' ? '💰' : '⚖️'}
                      </button>
                    </div>
                    
                    {it.inputMode === 'weight' ? (
                      <input
                        type="number"
                        value={it.exactWeight}
                        min="0.01"
                        step="0.01"
                        onChange={(e) => handleWeightChange(idx, e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Ej: 1.25"
                      />
                    ) : (
                      <input
                        type="number"
                        value={it.exactPrice}
                        min="1"
                        step="1"
                        onChange={(e) => handlePriceChange(idx, e.target.value)}
                        className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="Ej: 2120"
                      />
                    )}
                    
                    <div className="text-xs text-gray-500 mt-1">
                      {it.inputMode === 'weight' 
                        ? `Calculado: $${(it.exactWeight * (it.price || 0)).toLocaleString('es-CL')}`
                        : `Calculado: ${(it.exactPrice / (it.price || 1)).toFixed(3)} ${it.unit}`
                      }
                    </div>
                  </div>
                </div>
                
                <div className="bg-white rounded p-3 border">
                  <div className="grid grid-cols-2 gap-4 mb-3">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Peso Original:</div>
                      <div className="font-medium">{it.originalQuantity} {it.unit}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Peso Final:</div>
                      <div className="font-bold text-blue-600">{it.exactWeight.toFixed(3)} {it.unit}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Precio Original:</span>
                    <span className="font-medium">
                      ${((it.price || 0) * (it.originalQuantity || 0)).toLocaleString('es-CL')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Precio Final:</span>
                    <span className="font-bold text-blue-600">
                      ${newItemPrice.toLocaleString('es-CL')}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm font-medium">Diferencia:</span>
                    <span className={`font-bold ${
                      priceDiff > 0 ? 'text-red-600' : priceDiff < 0 ? 'text-green-600' : 'text-gray-600'
                    }`}>
                      {priceDiff > 0 ? '+' : ''}${priceDiff.toLocaleString('es-CL')}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-medium text-gray-700">Total Original:</span>
            <span className="text-lg font-semibold">
              ${items.reduce((sum, it) => sum + (it.price || 0) * (it.originalQuantity || 0), 0).toLocaleString("es-CL")}
            </span>
          </div>
          
          <div className="flex justify-between items-center mb-2">
            <span className="text-xl font-bold text-blue-700">Nuevo Total:</span>
            <span className="text-xl font-bold text-blue-700">
              ${total.toLocaleString("es-CL")}
            </span>
          </div>
          
          <div className="flex justify-between items-center border-t border-blue-300 pt-2">
            <span className="text-lg font-medium">Diferencia Total:</span>
            <span className={`text-lg font-bold ${
              (total - items.reduce((sum, it) => sum + (it.price || 0) * (it.originalQuantity || 0), 0)) > 0 
                ? 'text-red-600' 
                : 'text-green-600'
            }`}>
              {(total - items.reduce((sum, it) => sum + (it.price || 0) * (it.originalQuantity || 0), 0)) > 0 ? '+' : ''}
              ${(total - items.reduce((sum, it) => sum + (it.price || 0) * (it.originalQuantity || 0), 0)).toLocaleString("es-CL")}
            </span>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold"
            onClick={handleSave}
          >
            ✅ Confirmar Pesos y Marcar LISTO
          </button>
        </div>
      </div>
    </div>
  );
}
