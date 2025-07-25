import React, { useState, useEffect } from 'react';
import LayoutHeader from './components/HeaderLayout.js';
import ProductList from './components/ProductList.js';
import CartItem from './components/CartItem.js';
import OrderSummary from './components/OrderSummary.js';
import CustomerForm from './components/CustomerForm.js';
// Cambiamos AdminOrderCard por AdminOrderItem (nombre real del archivo)
import AdminOrderCard from './components/AdminOrderItem.js';
// Usamos utils para datos mock
import { products } from './utils/products.js';
import { orders as initialOrders } from './utils/orders.js';
import { createStorage, getStorage, setStorage } from './utils/storage.js';


const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [cart, setCart] = useState(() => createStorage('cart', []));
  const [allOrders, setAllOrders] = useState(() => createStorage('orders', initialOrders));

  useEffect(() => {
    setStorage('cart', cart);
  }, [cart]);

  useEffect(() => {
    setStorage('orders', allOrders);
  }, [allOrders]);

  const handleAddToCart = (product, quantity) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.productId === product.id);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          alert(`Solo quedan ${product.stock} unidades de ${product.name}.`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.productId === product.id ? { ...item, quantity: newQuantity } : item
        );
      } else {
        if (quantity > product.stock) {
          alert(`Solo quedan ${product.stock} unidades de ${product.name}.`);
          return prevCart;
        }
        return [...prevCart, {
          productId: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          image: product.image,
          quantity,
        }];
      }
    });
  };

  const handleUpdateCartQuantity = (productId, newQuantity) => {
    setCart((prevCart) => {
      const productInStock = products.find(p => p.id === productId);
      if (productInStock && newQuantity > productInStock.stock) {
        alert(`Solo quedan ${productInStock.stock} unidades de ${productInStock.name}.`);
        return prevCart;
      }
      return prevCart.map((item) =>
        item.productId === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((item) => item.productId !== productId));
  };

  const handlePlaceOrder = (customerInfo) => {
    if (cart.length === 0) {
      alert('El carrito está vacío. Agrega productos antes de confirmar el pedido.');
      return;
    }

    const newOrderId = `ORD${String(allOrders.length + 1).padStart(3, '0')}`;
    const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const newOrder = {
      id: newOrderId,
      customerName: customerInfo.name,
      customerPhone: customerInfo.phone,
      pickupTime: customerInfo.pickupTime,
      status: 'Pendiente',
      items: cart,
      total,
    };

    setAllOrders((prevOrders) => [...prevOrders, newOrder]);
    setCart([]); // Clear cart after placing order
    setCurrentPage('home'); // Navigate back to home or a confirmation page
    alert(`¡Pedido #${newOrderId} realizado con éxito! Total: $${total.toFixed(2)}. Lo esperamos a las ${customerInfo.pickupTime}.`);
  };

  const handleUpdateOrderStatus = (orderId, newStatus) => {
    setAllOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  const calculateCartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-100">
      <LayoutHeader onNavigate={setCurrentPage} currentPage={currentPage} />

      <main className="container mx-auto p-6">
        {currentPage === 'home' && (
          <section>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
              Nuestro Menú Fresco
            </h2>
            <ProductList products={products} onAddToCart={handleAddToCart} />
          </section>
        )}

        {currentPage === 'cart' && (
          <section>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
              Tu Carrito de Compras
            </h2>
            {cart.length === 0 ? (
              <p className="text-center text-gray-600 text-xl">Tu carrito está vacío. ¡Agrega algo de carnita!</p>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                  {cart.map((item) => (
                    <CartItem
                      key={item.productId}
                      item={item}
                      onUpdateQuantity={handleUpdateCartQuantity}
                      onRemoveItem={handleRemoveFromCart}
                    />
                  ))}
                </div>
                <div className="lg:col-span-1">
                  <OrderSummary cartItems={cart} total={calculateCartTotal} />
                  <div className="mt-6">
                    <CustomerForm onSubmit={handlePlaceOrder} />
                  </div>
                </div>
              </div>
            )}
          </section>
        )}

        {currentPage === 'admin' && (
          <section>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
              Panel de Administración de Pedidos
            </h2>
            {allOrders.length === 0 ? (
              <p className="text-center text-gray-600 text-xl">No hay pedidos registrados aún.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allOrders.map((order) => (
                  <AdminOrderCard
                    key={order.id}
                    order={order}
                    onUpdateStatus={handleUpdateOrderStatus}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
};

export default App;