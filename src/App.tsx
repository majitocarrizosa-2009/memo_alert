/**
 * Memo Alert - Sistema de Gestión de Pedidos y Recordatorios de Memoria
 * Diseñado especialmente para personas mayores y pequeños negocios de comida.
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  loadProducts,
  saveProducts,
  loadOrders,
  saveOrders,
  loadBusinessConfig,
  saveBusinessConfig,
  loadPaymentConfigs,
  savePaymentConfigs,
  checkAndApply24HourReset,
  forceDailyReset,
  getTodayKey,
} from './utils/storage';
import { Product, Order, BusinessConfig, PaymentOptionConfig, OrderStatus } from './types';
import { soundAlert } from './utils/audioAlerts';

// Components
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { ClientOrderingView } from './components/ClientOrderingView';
import { CatalogManager } from './components/CatalogManager';
import { OrderHistory } from './components/OrderHistory';
import { EntrepreneurProfile } from './components/EntrepreneurProfile';
import { SettingsModal } from './components/SettingsModal';
import { BiometricLoginModal } from './components/BiometricLoginModal';
import { NewOrderModal } from './components/NewOrderModal';

export default function App() {
  // Main Data States
  const [products, setProducts] = useState<Product[]>(() => loadProducts());
  const [orders, setOrders] = useState<Order[]>(() => loadOrders());
  const [config, setConfig] = useState<BusinessConfig>(() => loadBusinessConfig());
  const [paymentConfigs, setPaymentConfigs] = useState<PaymentOptionConfig[]>(() => loadPaymentConfigs());

  // UI Flow States
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'catalog' | 'history' | 'profile' | 'client-view'>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // initially unlocked for instant preview
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
  const [resetBannerNotice, setResetBannerNotice] = useState<string>('');

  // 1. Initial 24-Hour Cycle Check & Auto-Replenishment of Stock to 100
  useEffect(() => {
    const result = checkAndApply24HourReset();
    if (result.didReset) {
      setProducts(loadProducts());
      setResetBannerNotice(result.message);
      soundAlert.playReadyChime();
      soundAlert.speakText('Ciclo de 24 horas reiniciado. Inventario listo a 100 unidades.');
    }
  }, []);

  // 2. Automatic Real-Time Monitor: Alerts instantly on new orders, uncooked reminders, cooking completion, and delivery arrival
  const alerted30MinIntervalsRef = useRef<{ [orderId: string]: number }>({});
  const alertedCookedOrdersRef = useRef<{ [orderId: string]: boolean }>({});
  const alertedDeliveredOrdersRef = useRef<{ [orderId: string]: boolean }>({});

  useEffect(() => {
    if (!config.audioAlertsEnabled) return;

    // Check automatically every 10 seconds in the background
    const intervalMinutes = config.alertIntervalMinutes || 30;
    const checkTimer = setInterval(() => {
      const now = Date.now();

      // Check un-cooked received orders
      const receivedOrders = orders.filter((o) => o.status === 'recibido');
      receivedOrders.forEach((order) => {
        const orderTime = new Date(order.createdAt).getTime();
        const elapsedMinutes = (now - orderTime) / (1000 * 60);
        const intervalSlot = Math.floor(elapsedMinutes / intervalMinutes);

        // If at least 30 minutes (intervalSlot >= 1) have passed and we haven't alerted for this 30-min block yet:
        const lastAlerted = alerted30MinIntervalsRef.current[order.id] || 0;
        if (intervalSlot >= 1 && intervalSlot > lastAlerted) {
          alerted30MinIntervalsRef.current[order.id] = intervalSlot;
          
          // Sound alarm bell automatically
          soundAlert.playReminderBell();

          // Announce with clear voice in Spanish automatically
          if (config.voiceReadoutEnabled) {
            const minutesRounded = Math.floor(elapsedMinutes);
            soundAlert.speakText(
              `¡Atención Don Memo! El pedido número ${order.orderNumber} para ${order.customer.name} lleva ${minutesRounded} minutos en espera y aún no ha sido mandado a cocinar. Por favor pásalo a la cocina.`
            );
          }
        }
      });

      // Check cooking completion for orders in 'pendiente' (summed preparation time elapsed)
      const cookingOrders = orders.filter((o) => o.status === 'pendiente');
      cookingOrders.forEach((order) => {
        const start = order.startedPrepAt ? new Date(order.startedPrepAt).getTime() : new Date(order.createdAt).getTime();
        const prepMin = order.totalPrepMinutes || 15;
        const requiredMs = prepMin * 60 * 1000;
        const isCooked = (now - start) >= requiredMs;

        if (isCooked && !alertedCookedOrdersRef.current[order.id]) {
          alertedCookedOrdersRef.current[order.id] = true;
          soundAlert.playReadyChime();
          if (config.voiceReadoutEnabled) {
            soundAlert.speakText(
              `¡Atención Don Memo! El pedido número ${order.orderNumber} para ${order.customer.name} ha terminado sus ${prepMin} minutos de cocción. ¡Ya está listo para empacar y enviar!`
            );
          }
        }
      });

      // Check delivery transit completion for orders in 'en_camino' (estimated delivery transit elapsed)
      const inTransitOrders = orders.filter((o) => o.status === 'en_camino');
      inTransitOrders.forEach((order) => {
        const dispatchTime = order.dispatchedAt ? new Date(order.dispatchedAt).getTime() : new Date(order.createdAt).getTime();
        const transitMin = order.estimatedDeliveryMinutes || 20;
        const requiredMs = transitMin * 60 * 1000;
        const hasArrived = (now - dispatchTime) >= requiredMs;

        if (hasArrived && !alertedDeliveredOrdersRef.current[order.id]) {
          alertedDeliveredOrdersRef.current[order.id] = true;
          soundAlert.playReadyChime();
          if (config.voiceReadoutEnabled) {
            soundAlert.speakText(
              `¡Atención Don Memo! El repartidor ya ha llegado a la casa de ${order.customer.name} con el pedido número ${order.orderNumber}. Ya puedes confirmar la entrega.`
            );
          }
        }
      });
    }, 10000); // Check every 10 seconds automatically without any button click

    return () => clearInterval(checkTimer);
  }, [orders, config.audioAlertsEnabled, config.voiceReadoutEnabled, config.alertIntervalMinutes]);

  const activeUnUnviewedCount = (arr: Order[]) => arr.length;

  // 3. Handle Order Creation & Stock Decrement (100 -> 99)
  const handleCreateOrder = useCallback(
    (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'dayKey' | 'viewedByOwner'>): Order => {
      const today = getTodayKey();
      const highestNum = orders.reduce((max, o) => (o.orderNumber > max ? o.orderNumber : max), 100);
      const nextOrderNumber = highestNum + 1;

      const newOrder: Order = {
        ...orderData,
        id: `ord-${Date.now()}`,
        orderNumber: nextOrderNumber,
        createdAt: new Date().toISOString(),
        dayKey: today,
        viewedByOwner: false,
      };

      // Decrement inventory stock in real-time
      const updatedProducts = products.map((prod) => {
        const itemInOrder = orderData.items.find((it) => it.productId === prod.id);
        if (itemInOrder) {
          return {
            ...prod,
            stock: Math.max(0, prod.stock - itemInOrder.quantity),
          };
        }
        return prod;
      });

      const updatedOrders = [newOrder, ...orders];

      setProducts(updatedProducts);
      saveProducts(updatedProducts);

      setOrders(updatedOrders);
      saveOrders(updatedOrders);

      // Play alert chime and voice in Spanish
      if (config.audioAlertsEnabled) {
        soundAlert.playNewOrderChime();
      }
      if (config.voiceReadoutEnabled) {
        soundAlert.speakText(
          `¡Nuevo pedido recibido! Pedido número ${nextOrderNumber} para ${newOrder.customer.name}. Total ${config.currency}${newOrder.totalAmount.toFixed(2)}.`
        );
      }

      return newOrder;
    },
    [orders, products, config.audioAlertsEnabled, config.voiceReadoutEnabled, config.currency]
  );

  // 4. Update Order Status across the 3 Bars (Recibido -> Pendiente -> En Camino -> Entregado)
  const handleUpdateOrderStatus = useCallback(
    (orderId: string, nextStatus: OrderStatus) => {
      const nowIso = new Date().toISOString();
      const updatedOrders = orders.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: nextStatus,
            viewedByOwner: true,
            startedPrepAt: nextStatus === 'pendiente' ? nowIso : o.startedPrepAt,
            dispatchedAt: nextStatus === 'en_camino' ? nowIso : o.dispatchedAt,
            deliveredAt: nextStatus === 'entregado' ? nowIso : o.deliveredAt,
          };
        }
        return o;
      });

      setOrders(updatedOrders);
      saveOrders(updatedOrders);
    },
    [orders]
  );

  // 5. Mark Order as Viewed
  const handleMarkAsViewed = useCallback(
    (orderId: string) => {
      const updatedOrders = orders.map((o) => (o.id === orderId ? { ...o, viewedByOwner: true } : o));
      setOrders(updatedOrders);
      saveOrders(updatedOrders);
    },
    [orders]
  );

  // 6. Products & Config Handlers
  const handleUpdateProducts = (updatedProducts: Product[]) => {
    setProducts(updatedProducts);
    saveProducts(updatedProducts);
  };

  const handleSaveConfig = (updatedConfig: BusinessConfig) => {
    setConfig(updatedConfig);
    saveBusinessConfig(updatedConfig);
  };

  const handleSavePaymentConfigs = (updatedPayments: PaymentOptionConfig[]) => {
    setPaymentConfigs(updatedPayments);
    savePaymentConfigs(updatedPayments);
  };

  // 7. Manual 24-Hour Cycle Reset
  const handleForceDailyReset = () => {
    forceDailyReset();
    const refreshed = loadProducts();
    setProducts(refreshed);
    setResetBannerNotice('¡Ciclo de 24 horas y stock de 100 unidades restablecido con éxito!');
    setTimeout(() => setResetBannerNotice(''), 6000);
  };

  // 8. Quick Simulation Order Generator for easy testing (Combines items to test preparation time summing, e.g. 20m + 15m = 35m)
  const handleSimulateQuickOrder = () => {
    const sampleNames = ['Don Fernando Castro', 'Sra. Beatriz Morales', 'Mariana Solís', 'Don Jorge Vargas', 'Elena Quesada'];
    const sampleAddresses = [
      'Barrio Los Álamos, Calle 4 casa 12 (portón café)',
      'Condominio San Ángel, Torre B Apto 204',
      'Frente a la farmacia central, local 2',
      'Av. 3 entre calles 8 y 10, casa de dos pisos',
    ];
    const randomName = sampleNames[Math.floor(Math.random() * sampleNames.length)];
    const randomAddress = sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];
    
    // Pick 2 items if available
    const prod1 = products[0] || { id: 'p1', name: 'Plato Principal', price: 12, preparationMinutes: 20 };
    const prod2 = products[1] || { id: 'p2', name: 'Acompañamiento Especial', price: 6, preparationMinutes: 15 };
    const totalPrepTime = (prod1.preparationMinutes || 20) + (prod2.preparationMinutes || 15);

    handleCreateOrder({
      customer: {
        name: randomName,
        phone: '8' + Math.floor(1000000 + Math.random() * 9000000),
        address: randomAddress,
        reference: 'Tocar timbre fuerte',
        notes: `Platos: ${prod1.name} (${prod1.preparationMinutes} min) + ${prod2.name} (${prod2.preparationMinutes} min)`,
      },
      items: [
        {
          productId: prod1.id,
          productName: prod1.name,
          quantity: 1,
          unitPrice: prod1.price,
          preparationMinutes: prod1.preparationMinutes,
          notes: `${prod1.preparationMinutes} min de cocción`,
        },
        {
          productId: prod2.id,
          productName: prod2.name,
          quantity: 1,
          unitPrice: prod2.price,
          preparationMinutes: prod2.preparationMinutes,
          notes: `${prod2.preparationMinutes} min de cocción`,
        },
      ],
      totalAmount: prod1.price + prod2.price,
      paymentMethod: 'efectivo',
      paymentDetails: 'Paga con monto exacto',
      status: 'recibido',
      totalPrepMinutes: totalPrepTime,
      estimatedDeliveryMinutes: 20,
    });
  };

  // Lock and Unlock Handlers
  const handleLockSession = () => {
    setIsAuthenticated(false);
    setIsLoginModalOpen(true);
    soundAlert.speakText('Panel bloqueado.');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    setIsLoginModalOpen(false);
  };

  const activeOrders = orders.filter((o) => ['recibido', 'pendiente', 'en_camino'].includes(o.status));

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-all ${
        config.fontSizePreference === 'extra-large'
          ? 'text-lg'
          : config.fontSizePreference === 'large'
          ? 'text-base'
          : 'text-sm'
      } bg-[#F4F7F9] text-gray-900`}
    >
      {/* Header */}
      <Header
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'client-view' || isAuthenticated) {
            setCurrentTab(tab);
          } else {
            setIsLoginModalOpen(true);
          }
        }}
        onLockSession={handleLockSession}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onSimulateOrder={handleSimulateQuickOrder}
        config={config}
        activeOrderCount={activeOrders.length}
      />

      {/* 24-Hour Reset Notification Banner */}
      {resetBannerNotice && (
        <div className="bg-emerald-600 text-white px-4 py-2.5 text-center font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm">
          <span>✨</span>
          <span>{resetBannerNotice}</span>
          <button
            type="button"
            onClick={() => setResetBannerNotice('')}
            className="ml-3 underline text-xs text-emerald-100 hover:text-white cursor-pointer"
          >
            Entendido
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {currentTab === 'dashboard' && (
          <Dashboard
            orders={orders}
            onUpdateStatus={handleUpdateOrderStatus}
            onMarkAsViewed={handleMarkAsViewed}
            onOpenNewOrderModal={() => setIsNewOrderModalOpen(true)}
            onForceDailyReset={handleForceDailyReset}
            config={config}
          />
        )}

        {currentTab === 'catalog' && (
          <CatalogManager
            products={products}
            onUpdateProducts={handleUpdateProducts}
            config={config}
          />
        )}

        {currentTab === 'history' && (
          <OrderHistory orders={orders} config={config} />
        )}

        {currentTab === 'profile' && (
          <EntrepreneurProfile
            config={config}
            onUpdateConfig={handleSaveConfig}
            orders={orders}
            products={products}
            onNavigateToClientView={() => setCurrentTab('client-view')}
          />
        )}

        {currentTab === 'client-view' && (
          <ClientOrderingView
            products={products}
            onPlaceOrder={handleCreateOrder}
            orders={orders}
            paymentConfigs={paymentConfigs}
            config={config}
            onReturnToAdmin={() => setCurrentTab('dashboard')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white text-gray-500 py-5 border-t border-gray-200 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-semibold text-gray-700">
            Memo Alert &copy; {new Date().getFullYear()} — Asistente Inteligente y Recordatorios para Pequeños Negocios de Comida.
          </p>
          <div className="flex items-center gap-4 text-indigo-700 font-semibold text-xs">
            <span>Acceso Seguro con Huella & PIN</span>
            <span>•</span>
            <span>Ciclo 24h & Stock Auto-Restablecido</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <BiometricLoginModal
        isOpen={isLoginModalOpen}
        onSuccess={handleLoginSuccess}
        onClose={isAuthenticated ? () => setIsLoginModalOpen(false) : undefined}
        savedPin={config.pinCode || '1234'}
        businessName={config.businessName}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={config}
        paymentConfigs={paymentConfigs}
        onSaveConfig={handleSaveConfig}
        onSavePaymentConfigs={handleSavePaymentConfigs}
      />

      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => setIsNewOrderModalOpen(false)}
        products={products}
        paymentConfigs={paymentConfigs}
        onAddOrder={handleCreateOrder}
        config={config}
      />
    </div>
  );
}
