// src/App.js
import React, { useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';

import LayoutHeader from './components/HeaderLayout.js';
import ProductList from './components/ProductList.js';
import CartItem from './components/CartItem.js';
import OrderSummary from './components/OrderSummary.js';
import CustomerForm from './components/CustomerForm.js';
import LoginForm from './components/LoginForm.js';
import AdminOrderCard from './components/AdminOrderItem.js';
import AdminLoginLogs from './components/AdminLoginLogs.js';
import AdminReports from './components/AdminReports';
import ButcherOrdersBoard from './components/ButcherOrdersBoard';

// YA NO importamos utils/products.js
import { createStorage, setStorage } from './utils/storage.js';

import {
  fetchOrders,
  createOrder,
  updateOrderStatus,
  deleteOrder,
} from './api/orders';

import { fetchProducts } from './api/products';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');

  // Productos desde API
  const [products, setProducts] = useState([]);

  // Carrito (local)
  const [cart, setCart] = useState(() => createStorage('cart', []));

  // Pedidos desde API
  const [allOrders, setAllOrders] = useState([]);

  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => setStorage('cart', cart), [cart]);

  const socketRef = useRef(null);

  // Carga inicial + sockets
  useEffect(() => {
    // Productos
    fetchProducts()
      .then((list) => setProducts(list))
      .catch((e) => console.error('fetchProducts error:', e));

    // Pedidos
    fetchOrders()
      .then((orders) => setAllOrders(orders))
      .catch((e) => console.error('fetchOrders error:', e));

    const url = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    socketRef.current = io(url);

    // Pedidos en tiempo real
    socketRef.current.on('orders:created', (order) => {
      setAllOrders((prev) => (prev.some((o) => o.id === order.id) ? prev : [order, ...prev]));
    });
    socketRef.current.on('orders:updated', (order) => {
      setAllOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    });
    socketRef.current.on('orders:deleted', ({ id }) => {
      setAllOrders((prev) => prev.filter((o) => o.id !== id));
    });

    // Productos en tiempo real (stock, etc.)
    socketRef.current.on('products:updated', (updatedList) => {
      setProducts((prev) => {
        const map = new Map(prev.map((p) => [p.id, p]));
        updatedList.forEach((u) => {
          const prevP = map.get(u.id) || {};
          map.set(u.id, { ...prevP, ...u });
        });
        return Array.from(map.values()).sort((a, b) => (a.id > b.id ? 1 : -1));
      });
    });

    return () => socketRef.current?.disconnect();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('home');
  };

  // ---- Carrito ----
  const handleAddToCart = (product, quantity) => {
    setCart((prevCart) => {
      const existing = prevCart.find((i) => i.productId === product.id);
      const newQty = (existing?.quantity || 0) + quantity;

      if (newQty > product.stock) {
        alert(`Solo quedan ${product.stock} unidades de ${product.name}.`);
        return prevCart;
      }

      if (existing) {
        return prevCart.map((i) =>
          i.productId === product.id ? { ...i, quantity: newQty } : i
        );
      }
      return [
        ...prevCart,
        {
          productId: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit || 'kg',
          image: product.image,
          quantity,
        },
      ];
    });
  };

  const handleUpdateCartQuantity = (productId, newQuantity) => {
    const p = products.find((x) => x.id === productId);
    if (p && newQuantity > p.stock) {
      alert(`Solo quedan ${p.stock} unidades de ${p.name}.`);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((i) => (i.productId === productId ? { ...i, quantity: newQuantity } : i))
    );
  };

  const handleRemoveFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter((i) => i.productId !== productId));
  };

  // Confirmar pedido: el backend valida stock y descuenta (bulkWrite)
  const handlePlaceOrder = async (customerInfo) => {
    if (!cart.length) {
      alert('El carrito está vacío. Agrega productos antes de confirmar el pedido.');
      return;
    }
    try {
      const totalCLP = cart.reduce((s, i) => s + i.price * i.quantity, 0);
      const payload = {
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        pickupTime: customerInfo.pickupTime,
        status: 'Pendiente',
        totalCLP,
        items: cart.map((i) => ({
          productId: i.productId,
          name: i.name,
          quantity: i.quantity,
          unit: i.unit || 'kg',
          price: i.price,
        })),
      };
      const created = await createOrder(payload);
      alert(
        `¡Pedido ${created.id} creado! Lo esperamos a las ${created.pickupTime}.`
      );
      setCart([]);
      setCurrentPage('home');
      // OJO: el stock se actualizará por socket 'products:updated'
    } catch (err) {
      console.error(err);
      alert('No se pudo crear el pedido (¿stock insuficiente?).');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (err) {
      console.error(err);
      alert('Error al actualizar el estado del pedido');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    const ok = window.confirm(`¿Eliminar el pedido ${orderId}? Esta acción no se puede deshacer.`);
    if (!ok) return;
    try {
      await deleteOrder(orderId);
      // El stock se repone por socket 'products:updated'
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el pedido');
    }
  };

  const calculateCartTotal = cart.reduce((s, i) => s + i.price * i.quantity, 0);

  const isAdmin = user?.role === 'admin';
  const isButcher = user?.role === 'carniceria';

  return (
    <div className="min-h-screen bg-gray-100">
      <LayoutHeader
        onNavigate={setCurrentPage}
        currentPage={currentPage}
        user={user}
        onLogout={handleLogout}
      />

      <main className="container mx-auto p-6">
        {currentPage === 'home' && (
          <section>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
              Nuestro Menú Fresco
            </h2>
            <ProductList products={products} onAddToCart={handleAddToCart} />
          </section>
        )}

        {currentPage === 'login' && (
          <section>
            <LoginForm
              onLoginSuccess={(u) => {
                setUser(u);
                setCurrentPage('home');
              }}
            />
          </section>
        )}

        {currentPage === 'cart' && (
          <section>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-8 text-center">
              Tu Carrito de Compras
            </h2>
            {cart.length === 0 ? (
              <p className="text-center text-gray-600 text-xl">
                Tu carrito está vacío. ¡Agrega algo de carnita!
              </p>
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

        {/* Panel Carnicería + Admin */}
        {currentPage === 'carniceria' && (isButcher || isAdmin) && (
          <ButcherOrdersBoard
            orders={allOrders}
            onUpdateStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            isAdmin={isAdmin}
          />
        )}
        {currentPage === 'carniceria' && !(isButcher || isAdmin) && (
          <p className="text-center text-red-600">No tienes permisos para ver esta sección.</p>
        )}

        {/* Panel Admin (cards) */}
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

        {currentPage === 'logs' && isAdmin && <AdminLoginLogs />}
        {currentPage === 'reportes' && isAdmin && <AdminReports />}

        {(['logs', 'reportes'].includes(currentPage)) && !isAdmin && (
          <p className="text-center text-red-600">No tienes permisos para ver esta sección.</p>
        )}
      </main>
    </div>
  );
};

export default App;
