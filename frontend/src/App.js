// src/App.js
import React, { useEffect, useState } from 'react';

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
import OrderStatusPage from './components/OrderStatusPage.js';

import { createStorage, setStorage } from './utils/storage.js';
import { initSocket, getSocket, disconnectSocket } from './utils/socket';

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

  // Usuario autenticado (si aplica)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  // Tracking del pedido (persistido)
  const [trackingOrderId, setTrackingOrderId] = useState(
    () => localStorage.getItem('trackingOrderId') || ''
  );
  useEffect(() => {
    if (trackingOrderId) {
      localStorage.setItem('trackingOrderId', trackingOrderId);
    } else {
      localStorage.removeItem('trackingOrderId');
    }
  }, [trackingOrderId]);

  useEffect(() => setStorage('cart', cart), [cart]);

  // Carga inicial de datos
  useEffect(() => {
    fetchProducts().then(setProducts).catch((e) => console.error('fetchProducts error:', e));
    fetchOrders().then(setAllOrders).catch((e) => console.error('fetchOrders error:', e));
  }, []);

  // Socket: (re)conecta cuando cambia el usuario (para entrar a su "room")
  useEffect(() => {
    const userId = user?.id || null;
    const s = initSocket(userId);

    // Suscripciones a eventos de negocio
    const onOrderCreated = (order) =>
      setAllOrders((prev) => (prev.some((o) => o.id === order.id) ? prev : [order, ...prev]));
    const onOrderUpdated = (order) =>
      setAllOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    const onOrderDeleted = ({ id }) =>
      setAllOrders((prev) => prev.filter((o) => o.id !== id));

    const onProductsUpdated = (updatedList) => {
      setProducts((prev) => {
        const map = new Map(prev.map((p) => [p.id, p]));
        updatedList.forEach((u) => {
          const prevP = map.get(u.id) || {};
          map.set(u.id, { ...prevP, ...u });
        });
        return Array.from(map.values()).sort((a, b) => (a.id > b.id ? 1 : -1));
      });
    };

    // Registrar listeners
    s?.on('orders:created', onOrderCreated);
    s?.on('orders:updated', onOrderUpdated);
    s?.on('orders:deleted', onOrderDeleted);
    s?.on('products:updated', onProductsUpdated);

    // Cleanup al desmontar o cambiar de usuario
    return () => {
      const sock = getSocket();
      sock?.off('orders:created', onOrderCreated);
      sock?.off('orders:updated', onOrderUpdated);
      sock?.off('orders:deleted', onOrderDeleted);
      sock?.off('products:updated', onProductsUpdated);
    };
  }, [user?.id]);

  const handleLogout = () => {
    localStorage.removeItem('token');     // clave estándar
    localStorage.removeItem('authToken'); // legacy
    localStorage.removeItem('user');
    setUser(null);
    setCurrentPage('home');
    setTrackingOrderId('');
    disconnectSocket();
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

  // Confirmar pedido: el backend valida stock y descuenta (bulkWrite) y luego redirigimos a seguimiento
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

      // Guardar id para seguimiento y navegar a la vista de estado
      setTrackingOrderId(created.id);
      localStorage.setItem('trackingOrderId', created.id);
      setCart([]);
      setCurrentPage('orderStatus');
      // El stock se actualizará por socket 'products:updated'
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
      // Si eliminan justo el pedido en seguimiento, limpiamos y volvemos a home
      if (orderId === trackingOrderId) {
        setTrackingOrderId('');
        setCurrentPage('home');
      }
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
        trackingOrderId={trackingOrderId} // <-- para mostrar botón/aviso de seguimiento
      />

      <main className="container mx-auto p-6">
        {/* --- Seguimiento del pedido --- */}
        {currentPage === 'orderStatus' && (
          <OrderStatusPage
            orderId={trackingOrderId}
            onGoHome={() => setCurrentPage('home')}
          />
        )}

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
