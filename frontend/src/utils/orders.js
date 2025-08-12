export const orders = [
  {
    id: 'ORD001',
    customerName: 'Juan Pérez',
    customerPhone: '5512345678',
    pickupTime: '10:00 AM',
    status: 'Pendiente',
    items: [
      { productId: '1', name: 'Arrachera Marinada', quantity: 2, unit: 'kg', price: 180.00 },
      { productId: '2', name: 'Chorizo Argentino', quantity: 5, unit: 'pieza', price: 90.00 }
    ],
    total: 810.00,
  },
  {
    id: 'ORD002',
    customerName: 'María García',
    customerPhone: '5587654321',
    pickupTime: '02:00 PM',
    status: 'Completado',
    items: [
      { productId: '3', name: 'Costillas de Cerdo', quantity: 3, unit: 'kg', price: 6.298 }
    ],
    total: 360.00,
  }
];
