import React, { useState } from 'react';
import {
  Bell,
  Clock,
  ChefHat,
  Truck,
  Inbox,
  Volume2,
  RefreshCw,
  PlusCircle,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';
import { Order, OrderStatus, BusinessConfig } from '../types';
import { OrderCard } from './OrderCard';
import { soundAlert } from '../utils/audioAlerts';

interface DashboardProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onMarkAsViewed: (orderId: string) => void;
  onOpenNewOrderModal: () => void;
  onForceDailyReset: () => void;
  config: BusinessConfig;
}

export const Dashboard: React.FC<DashboardProps> = ({
  orders,
  onUpdateStatus,
  onMarkAsViewed,
  onOpenNewOrderModal,
  onForceDailyReset,
  config,
}) => {
  const [filterActiveOnly, setFilterActiveOnly] = useState(true);

  // Filter orders by their 3 active stages
  const receivedOrders = orders.filter((o) => o.status === 'recibido');
  const pendingOrders = orders.filter((o) => o.status === 'pendiente');
  const inTransitOrders = orders.filter((o) => o.status === 'en_camino');

  const totalActive = receivedOrders.length + pendingOrders.length + inTransitOrders.length;
  const totalToday = orders.length;
  const unviewedCount = orders.filter((o) => !o.viewedByOwner && o.status !== 'entregado').length;

  const handleReadSummaryAloud = () => {
    let summary = `Resumen actual de Memo Alert: Tienes ${totalActive} pedidos activos en total. `;
    if (receivedOrders.length > 0) {
      summary += `${receivedOrders.length} pedidos nuevos recibidos por atender. `;
    } else {
      summary += `No hay pedidos nuevos sin atender. `;
    }
    if (pendingOrders.length > 0) {
      summary += `${pendingOrders.length} pedidos en preparación en cocina. `;
    }
    if (inTransitOrders.length > 0) {
      summary += `${inTransitOrders.length} pedidos en camino de entrega. `;
    }
    soundAlert.speakText(summary);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Header Summary & Quick Actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200/90 shadow-sm">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-indigo-50 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
                Panel de Control & Memoria Activa
              </span>
              {unviewedCount > 0 && (
                <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5 animate-pulse">
                  <Bell className="w-3.5 h-3.5" />
                  {unviewedCount} por revisar
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {config.businessName || 'Memo Comidas Caseras'}
            </h1>
            <p className="text-gray-500 text-sm sm:text-base font-normal mt-1">
              {config.tagline || 'Control de pedidos claros, tiempos de cocina y entregas sin olvidos.'}
            </p>
          </div>

          {/* Action buttons on banner */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
            <button
              type="button"
              onClick={handleReadSummaryAloud}
              className="py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 active:bg-indigo-200 text-indigo-900 rounded-xl font-bold text-xs sm:text-sm border border-indigo-200 flex items-center gap-2 transition-all shadow-sm"
              title="Escuchar resumen de pedidos en voz alta"
            >
              <Volume2 className="w-4 h-4 text-indigo-700" />
              <span>Escuchar Resumen</span>
            </button>

            <button
              type="button"
              onClick={onOpenNewOrderModal}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 flex items-center gap-2 transition-all active:scale-95"
              title="Tomar pedido manual por teléfono o mostrador"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Nuevo Pedido Manual</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('¿Deseas reiniciar el ciclo de 24 horas y reponer el stock a 100?')) {
                  onForceDailyReset();
                  soundAlert.playReadyChime();
                  soundAlert.speakText('Inventario y ciclo de 24 horas restablecido a 100');
                }
              }}
              className="py-2.5 px-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-colors"
              title="Reiniciar ciclo diario de 24h y reponer inventario a 100"
            >
              <RefreshCw className="w-4 h-4 text-indigo-600" />
              <span>Ciclo 24h / Stock 100</span>
            </button>
          </div>
        </div>

        {/* Automatic 30-Minute Alarm Status Bar */}
        <div className={`mt-4 p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          receivedOrders.length > 0
            ? 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-xs'
            : 'bg-emerald-50/90 border-emerald-200 text-emerald-950 shadow-xs'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold shrink-0 ${
              receivedOrders.length > 0 ? 'bg-amber-500 text-white animate-pulse' : 'bg-emerald-600 text-white'
            }`}>
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold">
                {receivedOrders.length > 0 ? (
                  <>⏰ Alarma Automática: <span className="text-amber-900 font-extrabold">{receivedOrders.length} pedido(s) en espera</span> (Suena al llegar y cada 30 min si no se manda a cocinar)</>
                ) : (
                  <>⏰ Alarma Automática: <span className="text-emerald-900 font-extrabold">Al día</span> (Suena de inmediato al llegar un nuevo pedido)</>
                )}
              </p>
              <p className="text-[11px] text-gray-600 font-normal mt-0.5">
                {receivedOrders.length > 0
                  ? 'Suena automáticamente sin tocar nada. Si un pedido cumple 30 minutos sin mandarlo a cocinar, la alarma vuelve a sonar sola. Al presionar "Empezar a Cocinar", se silencia.'
                  : 'El sistema vigila en segundo plano: sonará de inmediato con cada nuevo pedido y a los 30 minutos si queda en espera.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 3 Prominent Status Metric Cards (from Professional Polish design: 12px left borders) */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Pedidos Recibidos */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border-l-[12px] border-blue-500 border border-gray-200/70 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Pedidos Recibidos
              </p>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                1ª Barra
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-blue-600 mt-2">
              {String(receivedOrders.length).padStart(2, '0')}
            </h2>
          </div>
          <div className="mt-4">
            <div className="h-1.5 w-full bg-blue-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded-full transition-all"
                style={{
                  width: `${totalActive > 0 ? (receivedOrders.length / totalActive) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <span className="text-[11px] text-gray-400 font-medium mt-1 block">
              {receivedOrders.length} pedido(s) listos para entrar a cocina
            </span>
          </div>
        </div>

        {/* Pedidos Pendientes */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border-l-[12px] border-amber-500 border border-gray-200/70 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Pedidos Pendientes
              </p>
              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                2ª Barra
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-amber-600 mt-2">
              {String(pendingOrders.length).padStart(2, '0')}
            </h2>
          </div>
          <div className="mt-4">
            <div className="h-1.5 w-full bg-amber-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-amber-500 rounded-full transition-all"
                style={{
                  width: `${totalActive > 0 ? (pendingOrders.length / totalActive) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <span className="text-[11px] text-gray-400 font-medium mt-1 block">
              {pendingOrders.length} plato(s) en preparación en la cocina
            </span>
          </div>
        </div>

        {/* Pedidos Enviados */}
        <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow border-l-[12px] border-emerald-500 border border-gray-200/70 flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Pedidos Enviados
              </p>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                3ª Barra
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-emerald-600 mt-2">
              {String(inTransitOrders.length).padStart(2, '0')}
            </h2>
          </div>
          <div className="mt-4">
            <div className="h-1.5 w-full bg-emerald-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all"
                style={{
                  width: `${totalActive > 0 ? (inTransitOrders.length / totalActive) * 100 : 0}%`,
                }}
              ></div>
            </div>
            <span className="text-[11px] text-gray-400 font-medium mt-1 block">
              {inTransitOrders.length} pedido(s) en camino a entrega
            </span>
          </div>
        </div>
      </section>

      {/* THREE BIG STATUS BARS / COLUMNS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ========================================================
            BARRA 1: PEDIDOS RECIBIDOS (Nuevos por atender)
           ======================================================== */}
        <div className="flex flex-col bg-white rounded-3xl p-5 border border-blue-100 shadow-sm">
          {/* Column Header Bar */}
          <div className="bg-blue-600 text-white rounded-2xl p-4 mb-4 shadow-md shadow-blue-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center font-bold">
                <Inbox className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
                  Primera Barra
                </span>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                  Pedidos Recibidos
                </h3>
              </div>
            </div>
            <span className="bg-white text-blue-900 font-bold text-lg px-3 py-1 rounded-xl shadow-sm">
              {receivedOrders.length}
            </span>
          </div>

          <p className="text-xs text-gray-500 font-medium mb-3 px-1">
            Nuevos pedidos entrantes. Presiona &quot;Empezar a Cocinar&quot; para moverlos a la cocina.
          </p>

          {/* List of received orders */}
          <div className="space-y-4 flex-1">
            {receivedOrders.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200 text-gray-400 my-auto">
                <CheckCircle2 className="w-10 h-10 text-blue-400 mx-auto mb-2 opacity-70" />
                <p className="font-bold text-gray-800 text-sm">¡Sin pedidos nuevos pendientes!</p>
                <p className="text-xs text-gray-500 mt-1">
                  Los nuevos pedidos que hagan los clientes aparecerán aquí con alerta de sonido.
                </p>
              </div>
            ) : (
              receivedOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={onUpdateStatus}
                  onMarkAsViewed={onMarkAsViewed}
                  currency={config.currency}
                  fontSizePreference={config.fontSizePreference}
                />
              ))
            )}
          </div>
        </div>

        {/* ========================================================
            BARRA 2: PEDIDOS PENDIENTES (En preparación / Cocina)
           ======================================================== */}
        <div className="flex flex-col bg-white rounded-3xl p-5 border border-amber-100 shadow-sm">
          {/* Column Header Bar */}
          <div className="bg-amber-500 text-white rounded-2xl p-4 mb-4 shadow-md shadow-amber-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center font-bold">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-100 block">
                  Segunda Barra
                </span>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                  Pedidos Pendientes
                </h3>
              </div>
            </div>
            <span className="bg-white text-amber-900 font-bold text-lg px-3 py-1 rounded-xl shadow-sm">
              {pendingOrders.length}
            </span>
          </div>

          <p className="text-xs text-gray-500 font-medium mb-3 px-1">
            En preparación en cocina. Al terminar de cocinar, presiona &quot;Listo! Enviar Pedido&quot;.
          </p>

          {/* List of pending orders */}
          <div className="space-y-4 flex-1">
            {pendingOrders.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200 text-gray-400 my-auto">
                <ChefHat className="w-10 h-10 text-amber-400 mx-auto mb-2 opacity-70" />
                <p className="font-bold text-gray-800 text-sm">La cocina está al día</p>
                <p className="text-xs text-gray-500 mt-1">
                  Aquí verás los pedidos que se están cocinando y su tiempo estimado.
                </p>
              </div>
            ) : (
              pendingOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={onUpdateStatus}
                  onMarkAsViewed={onMarkAsViewed}
                  currency={config.currency}
                  fontSizePreference={config.fontSizePreference}
                />
              ))
            )}
          </div>
        </div>

        {/* ========================================================
            BARRA 3: PEDIDOS ENVIADOS O EN CAMINO
           ======================================================== */}
        <div className="flex flex-col bg-white rounded-3xl p-5 border border-emerald-100 shadow-sm">
          {/* Column Header Bar */}
          <div className="bg-emerald-600 text-white rounded-2xl p-4 mb-4 shadow-md shadow-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-white/20 text-white rounded-xl flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-100 block">
                  Tercera Barra
                </span>
                <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                  Pedidos Enviados
                </h3>
              </div>
            </div>
            <span className="bg-white text-emerald-950 font-bold text-lg px-3 py-1 rounded-xl shadow-sm">
              {inTransitOrders.length}
            </span>
          </div>

          <p className="text-xs text-gray-500 font-medium mb-3 px-1">
            En camino con repartidor. Presiona &quot;Confirmar Entregado&quot; al finalizar.
          </p>

          {/* List of in-transit orders */}
          <div className="space-y-4 flex-1">
            {inTransitOrders.length === 0 ? (
              <div className="bg-gray-50 rounded-2xl p-8 text-center border-2 border-dashed border-gray-200 text-gray-400 my-auto">
                <Truck className="w-10 h-10 text-emerald-400 mx-auto mb-2 opacity-70" />
                <p className="font-bold text-gray-800 text-sm">Sin pedidos en camino</p>
                <p className="text-xs text-gray-500 mt-1">
                  Aquí verás los pedidos despachados con la dirección y teléfono del cliente para entrega.
                </p>
              </div>
            ) : (
              inTransitOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onUpdateStatus={onUpdateStatus}
                  onMarkAsViewed={onMarkAsViewed}
                  currency={config.currency}
                  fontSizePreference={config.fontSizePreference}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
