import { Star, Quote } from 'lucide-react';
import { useState, useEffect } from 'react';
import ReviewModal from './ReviewModal';

const TestimonialsSection = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [testimonials, setTestimonials] = useState([
    {
      name: 'María González',
      role: 'Cliente desde 2018',
      image: '/image/default_user2.png',
      content: 'La carne siempre está fresca y los precios son muy buenos. Ulises siempre me recomienda llevar algo para compartir con la familia.',
      rating: 5
    },
    {
      name: 'Roberto Silva',
      role: 'Cliente desde 2015',
      image: '/image/default_user1.png',
      content: 'Llevo años comprando aquí y nunca me han fallado. La calidad es excelente y el trato es de confianza.',
      rating: 5
    },
    {
      name: 'Ana López',
      role: 'Cliente desde 2020',
      image: '/image/default_user2.png',
      content: 'Encontré Beniken por su cuenta de TikTok y ahora es mi carnicería de confianza, Siempre tienen buenas ofertas.',
      rating: 5
    }
  ]);

  // Fetch reviews from database on component mount
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reviews`);
        if (response.ok) {
          const data = await response.json();
          if (data.reviews && data.reviews.length > 0) {
            // Use database reviews, but keep some default ones if needed
            setTestimonials(data.reviews.slice(0, 6)); // Show max 6 reviews
          }
        }
      } catch (error) {
        console.error('Error fetching reviews:', error);
        // Keep default testimonials if fetch fails
      }
    };

    fetchReviews();
  }, []);

  const handleSubmitReview = async (reviewData) => {
    try {
      console.log('Sending review data:', reviewData);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reviewData),
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Error al enviar la reseña');
      }

      const result = await response.json();
      console.log('Success response:', result);
      
      // Add new review to the beginning of the list
      setTestimonials(prev => [result.review, ...prev.slice(0, 5)]); // Keep max 6 reviews
      
      alert('¡Gracias por tu reseña! Se ha enviado correctamente.');
    } catch (error) {
      console.error('Error submitting review:', error);
      throw error;
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Lo Que Dicen Nuestros <span className="text-red-700">Clientes</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            La satisfacción de nuestros clientes es nuestro mayor orgullo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-gray-50 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 h-full flex flex-col">
              {/* Quote Icon */}
              <div className="mb-6">
                <Quote className="w-10 h-10 text-red-700" />
              </div>

              {/* Stars - More prominent */}
              <div className="flex gap-1 mb-6 justify-center">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-7 h-7 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
                ))}
              </div>

              {/* Content */}
              <p className="text-gray-700 leading-relaxed mb-8 flex-grow text-center italic text-lg">
                "{testimonial.comment || testimonial.content}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-4 justify-center">
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-md"
                />
                <div className="text-center">
                  <div className="font-bold text-gray-900 text-lg">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-red-700 font-medium">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Overall Rating */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-red-700 to-red-800 rounded-2xl p-10 shadow-2xl max-w-lg mx-auto text-white">
            <div className="text-5xl font-bold mb-4">4.9/5</div>
            <div className="flex justify-center gap-2 mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-8 h-8 fill-yellow-400 text-yellow-400 drop-shadow-lg" />
              ))}
            </div>
            <p className="text-white/90 text-lg">
              Basado en más de 150 reseñas de clientes satisfechos
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center bg-gray-50 rounded-2xl p-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-4">
            ¿Quieres ser nuestro próximo cliente satisfecho?
          </h3>
          <p className="text-gray-600 mb-8 text-lg max-w-2xl mx-auto">
            Visítanos en el Mercado Franklin y descubre por qué somos la carnicería de confianza de Santiago
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="https://maps.app.goo.gl/fGamyMkHH6SGE7C19" 
              target="_blank" 
              rel="noopener noreferrer"
              className="bg-gray-800 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-300 shadow-lg text-center no-underline"
            >
              📍 Cómo Llegar
            </a>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-red-600 hover:bg-green-700 text-white px-8 py-4 rounded-lg font-semibold transition-colors duration-300 shadow-lg"
            >
              💬 Dejar una reseña
            </button>
          </div>
        </div>

        {/* Review Modal */}
        <ReviewModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleSubmitReview}
        />
      </div>
    </section>
  );
};

export default TestimonialsSection;
