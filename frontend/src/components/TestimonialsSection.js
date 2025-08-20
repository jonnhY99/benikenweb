import React from 'react';

const TestimonialsSection = () => {
  const testimonials = [
    {
      id: 1,
      quote: "A revolucioando la forma de comprar. Ahora podemos realizar las compras desde el hogar o desde cualquier lugar con acceso a internet.",
      author: "Denisse Ponce",
      role: "Socio Mayorista"
    },
    {
      id: 2,
      quote: "El uso de la plataforma es sencilla y super rapido para realizar las compras con resultados inmediatos.",
      author: "Axel Maldonado",
      role: "Cliente Frecuente"
    },
    {
      id: 3,
      quote: "Por fin una carniceria que se expande y es accesible para compras online.",
      author: "Oscar Bustamante",
      role: "Cliente Regular"
    }
  ];

  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="lg:text-center">
          <h2 className="text-base text-blue-600 font-semibold tracking-wide uppercase">Testimonios</h2>
          <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            Lo que dicen nuestros clientes
          </p>
        </div>

        <div className="mt-10">
          <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-3 md:gap-x-8 md:gap-y-10">
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className="relative bg-gray-50 p-6 rounded-lg">
                <div className="absolute -top-5 left-5">
                  <svg className="h-10 w-10 text-blue-500" fill="currentColor" viewBox="0 0 32 32">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                </div>
                <p className="text-gray-600 mt-6 mb-3">{testimonial.quote}</p>
                <p className="text-gray-900 font-semibold">{testimonial.author}</p>
                <p className="text-gray-500 text-sm">{testimonial.role}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialsSection;