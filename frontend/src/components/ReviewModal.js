import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

const ReviewModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    comment: '',
    rating: 5,
    gender: 'hombre',
    customerSince: new Date().getFullYear()
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRatingChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      rating
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.comment.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    setIsSubmitting(true);
    try {
      console.log('Modal submitting data:', formData);
      await onSubmit(formData);
      setFormData({ name: '', comment: '', rating: 5, gender: 'hombre', customerSince: new Date().getFullYear() });
      onClose();
    } catch (error) {
      console.error('Error al enviar reseña:', error);
      alert(`Error al enviar la reseña: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">Deja tu Reseña</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Name Input */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-semibold text-gray-900 mb-2">
              Tu Nombre
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Ingresa tu nombre"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
              required
            />
          </div>

          {/* Rating */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Calificación
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRatingChange(star)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-8 h-8 ${
                      star <= formData.rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-gray-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Gender Selection */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Género
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="hombre"
                  checked={formData.gender === 'hombre'}
                  onChange={handleInputChange}
                  className="mr-2 text-red-600 focus:ring-red-500"
                />
                <span className="text-gray-700">👨 Hombre</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="mujer"
                  checked={formData.gender === 'mujer'}
                  onChange={handleInputChange}
                  className="mr-2 text-red-600 focus:ring-red-500"
                />
                <span className="text-gray-700">👩 Mujer</span>
              </label>
            </div>
          </div>

          {/* Customer Since */}
          <div className="mb-6">
            <label htmlFor="customerSince" className="block text-sm font-semibold text-gray-900 mb-2">
              Cliente desde
            </label>
            <select
              id="customerSince"
              name="customerSince"
              value={formData.customerSince}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors"
            >
              <option value={new Date().getFullYear()}>Nuevo cliente ({new Date().getFullYear()})</option>
              {Array.from({ length: 20 }, (_, i) => {
                const year = new Date().getFullYear() - i - 1;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Comment */}
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-semibold text-gray-900 mb-2">
              Tu Reseña
            </label>
            <textarea
              id="comment"
              name="comment"
              value={formData.comment}
              onChange={handleInputChange}
              placeholder="Cuéntanos sobre tu experiencia en Carnes Beniken..."
              rows="4"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors resize-none"
              required
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Enviando...' : 'Guardar Reseña'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
