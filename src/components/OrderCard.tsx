import React, { useState, useEffect } from 'react';
import {
  Clock,
  Phone,
  MapPin,
  Volume2,
  CheckCircle2,
  ChefHat,
  Truck,
  MessageCircle,
  AlertTriangle,
  FileText,
  DollarSign,
  ChevronRight,
  Eye,
  Check,
  Lock,
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { soundAlert } from '../utils/audioAlerts';

interface OrderCardProps {
  order: Order;
  onUpdateStatus: (orderId: string, nextStatus: OrderStatus) => void;
  onMarkAsViewed: (orderId: string) => void;
  currency: string;
  fontSizePreference: 'normal' | 'large' | 'extra-large';
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onUpdateStatus,
  onMarkAsViewed,
  currency,
  fontSizePreference,
}) => {
  const [elapsedMinutes, setElapsedMinutes] = useState(0);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    const calculateElapsed = () => {
      const created = new Date(order.createdAt).getTime();
      const diffMin = Math.max(0, Math.floor((Date.now() - created) / 60000));
      setElapsedMinutes(diffMin);
      setCurrentTime(Date.now());
    };

    calculateElapsed();
    const interval = setInterval(calculateElapsed, 1000); // 1-second refresh for accurate cooking countdown
    return () => clearInterval(interval);
  }, [order.createdAt]);

  const prepMinutes = order.totalPrepMinutes || 15;
  const startPrepTime = order.startedPrepAt ? new Date(order.startedPrepAt).getTime() : new Date(order.createdAt).getTime();
  const cookingElapsedSec = Math.max(0, Math.floor((currentTime - startPrepTime) / 1000));
  const totalRequiredSec = prepMinutes * 60;
  const remainingCookingSec = Math.max(0, totalRequiredSec - cookingElapsedSec);
  const isCooked = order.status === 'pendiente' ? remainingCookingSec <= 0 : false;
  const cookingProgressPercent = Math.min(100, Math.floor((cookingElapsedSec / totalRequiredSec) * 100));

  const deliveryMinutes = order.estimatedDeliveryMinutes || 20;
  const startTransitTime = order.dispatchedAt ? new Date(order.dispatchedAt).getTime() : new Date(order.createdAt).getTime();
  const transitElapsedSec = Math.max(0, Math.floor((currentTime - startTransitTime) / 1000));
  const totalTransitRequiredSec = deliveryMinutes * 60;
  const remainingTransitSec = Math.max(0, totalTransitRequiredSec - transitElapsedSec);
  const isArrived = order.status === 'en_camino' ? remainingTransitSec <= 0 : false;
  const transitProgressPercent = Math.min(100, Math.floor((transitElapsedSec / totalTransitRequiredSec) * 100));

  const handleSpeakOrder = () => {
    setIsSpeaking(true);
    const itemsList = order.items.map((it) => `${it.quantity} ${it.productName}`).join(', ');
    const noteText = order.customer.notes ? `Nota importante del cliente: ${order.customer.notes}.` : '';
    const speechText = `Pedido número ${order.orderNumber} de ${order.customer.name}. Contiene: ${itemsList}. Tiempo de preparación sumado: ${prepMinutes} minutos. Tiempo estimado de entrega: ${deliveryMinutes} minutos. Total ${currency}${order.totalAmount.toFixed(2)}. Dirección: ${order.customer.address}. ${noteText}`;
    
    soundAlert.speakText(speechText);
    setTimeout(() => setIsSpeaking(false), 4000);
  };

  const handleWhatsAppCustomer = () => {
    const cleanPhone = order.customer.phone.replace(/[^0-9]/g, '');
    let statusText = '';
    if (order.status === 'recibido') statusText = 'estamos preparando tu delicioso pedido';
    else if (order.status === 'pendiente') {
      statusText = isCooked ? 'tu pedido ya terminó de cocinarse y se está empacando' : `tu pedido se está cocinando (tiempo estimado: ${prepMinutes} minutos)`;
    } else if (order.status === 'en_camino') {
      statusText = isArrived ? 'el repartidor ha llegado a tu casa' : `tu pedido va en camino a tu domicilio (tiempo estimado de llegada: ${deliveryMinutes} minutos)`;
    }

    const message = encodeURIComponent(
      `¡Hola ${order.customer.name}! Te escribimos de Memo Comidas sobre tu pedido #${order.orderNumber}. Te confirmamos que ${statusText}. Dirección de entrega: ${order.customer.address}. Total: ${currency}${order.totalAmount.toFixed(2)}.`
    );
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const isOldWaiting = order.status === 'recibido' && elapsedMinutes >= 8;

  const getStatusBorderColor = () => {
    if (order.status === 'recibido') {
      return isOldWaiting
        ? 'border-amber-400 bg-amber-50/30 ring-2 ring-amber-400/30'
        : 'border-blue-200 bg-white';
    }
    if (order.status === 'pendiente') {
      return isCooked
        ? 'border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-400/40 shadow-md'
        : 'border-amber-300 bg-amber-50/20';
    }
    if (order.status === 'en_camino') {
      return isArrived
        ? 'border-emerald-400 bg-emerald-50/30 ring-2 ring-emerald-400/40 shadow-md'
        : 'border-blue-300 bg-blue-50/20';
    }
    return 'border-gray-200 bg-gray-50';
  };

  const textScale = {
    'normal': { title: 'text-base', body: 'text-xs sm:text-sm', header: 'text-sm', client: 'text-base' },
    'large': { title: 'text-lg', body: 'text-sm sm:text-base', header: 'text-base', client: 'text-lg' },
    'extra-large': { title: 'text-xl', body: 'text-base sm:text-lg', header: 'text-lg', client: 'text-xl' },
  }[fontSizePreference];

  return (
    <div
      id={`order-card-${order.id}`}
      className={`rounded-2xl border shadow-sm hover:shadow-md transition-all p-4 sm:p-5 flex flex-col justify-between ${getStatusBorderColor()} ${
        !order.viewedByOwner ? 'ring-2 ring-indigo-400' : ''
      }`}
    >
      {/* Top Bar: Order Number, Time elapsed & Speech Button */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-900 text-white font-bold px-3 py-1 rounded-xl text-sm shadow-sm">
              #{order.orderNumber}
            </span>
            <div className="flex items-center gap-1 text-gray-500 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5 text-gray-400" />
              <span>Hace {elapsedMinutes} min</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Readout Button */}
            <button
              type="button"
              onClick={handleSpeakOrder}
              title="Escuchar pedido en voz alta"
              className={`p-2 rounded-xl flex items-center gap-1 font-bold text-xs transition-all ${
                isSpeaking
                  ? 'bg-indigo-600 text-white scale-105 shadow-md'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200/70'
              }`}
            >
              <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">Escuchar</span>
            </button>

            {!order.viewedByOwner && (
              <button
                type="button"
                onClick={() => onMarkAsViewed(order.id)}
                title="Marcar como visto"
                className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Visto</span>
              </button>
            )}
          </div>
        </div>

        {/* Urgent Warning if order is taking too long in received queue */}
        {isOldWaiting && (
          <div className="mb-3 p-2.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Atención: Este pedido lleva {elapsedMinutes} min sin iniciar cocina.</span>
          </div>
        )}

        {/* Dynamic Real-Time Cooking Status in Barra 2 (Pendientes / Cocina) */}
        {order.status === 'pendiente' && (
          <div className={`mb-3 p-3.5 rounded-2xl border transition-all ${
            isCooked
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
              : 'bg-amber-50/90 border-amber-300 text-amber-950 shadow-xs'
          }`}>
            {isCooked ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white text-emerald-700 rounded-xl flex items-center justify-center font-bold shrink-0">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm tracking-tight">¡Cocción Completa! ({prepMinutes} min cumplidos)</p>
                    <p className="text-[11px] text-emerald-100 font-normal">
                      Listo en cocina. Ya puedes empacar y despachar al repartidor.
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-800/80 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shrink-0">
                  100% Cocinado
                </span>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-amber-500 text-white rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <ChefHat className="w-4 h-4 animate-pulse" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-black text-amber-950">
                        Cocinándose en los Fogones
                      </p>
                      <p className="text-[11px] text-amber-800 font-semibold">
                        Tiempo total sumado: {prepMinutes} min
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base sm:text-lg font-black text-amber-950 font-mono tracking-tight">
                      {Math.floor(remainingCookingSec / 60)}:{String(remainingCookingSec % 60).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-amber-700 block -mt-0.5">restantes</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full bg-amber-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                    style={{ width: `${cookingProgressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-amber-200/60 text-[11px]">
                  <span className="text-amber-900 font-semibold flex items-center gap-1">
                    <span>🔒 Botón de entrega bloqueado:</span>
                    <span className="font-normal text-amber-800">se habilitará al completar el tiempo</span>
                  </span>
                  <span className="text-amber-800 font-bold bg-amber-100/80 px-2 py-0.5 rounded">
                    {cookingProgressPercent}% completado
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Real-Time Delivery Transit Status in Barra 3 (En Camino / Repartidor) */}
        {order.status === 'en_camino' && (
          <div className={`mb-3 p-3.5 rounded-2xl border transition-all ${
            isArrived
              ? 'bg-emerald-600 text-white border-emerald-500 shadow-md'
              : 'bg-blue-50/90 border-blue-300 text-blue-950 shadow-xs'
          }`}>
            {isArrived ? (
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-white text-emerald-700 rounded-xl flex items-center justify-center font-bold shrink-0">
                    <Check className="w-5 h-5 stroke-[3]" />
                  </div>
                  <div>
                    <p className="font-extrabold text-sm tracking-tight">¡Repartidor Llegó al Destino! ({deliveryMinutes} min)</p>
                    <p className="text-[11px] text-emerald-100 font-normal">
                      El pedido ha llegado a la casa del cliente. Ya puedes confirmar la entrega.
                    </p>
                  </div>
                </div>
                <span className="bg-emerald-800/80 text-white text-[11px] font-black px-2.5 py-1 rounded-lg shrink-0">
                  100% En Casa
                </span>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center font-bold shrink-0 shadow-xs">
                      <Truck className="w-4 h-4 animate-bounce" />
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-black text-blue-950">
                        Repartidor en Ruta hacia el Cliente
                      </p>
                      <p className="text-[11px] text-blue-800 font-semibold">
                        Tiempo estimado de viaje: {deliveryMinutes} min
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-base sm:text-lg font-black text-blue-950 font-mono tracking-tight">
                      {Math.floor(remainingTransitSec / 60)}:{String(remainingTransitSec % 60).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-bold text-blue-700 block -mt-0.5">para llegar</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full bg-blue-200/80 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                    style={{ width: `${transitProgressPercent}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-blue-200/60 text-[11px]">
                  <span className="text-blue-900 font-semibold flex items-center gap-1">
                    <span>🔒 Botón de entregado bloqueado:</span>
                    <span className="font-normal text-blue-800">se habilitará al llegar</span>
                  </span>
                  <span className="text-blue-800 font-bold bg-blue-100/80 px-2 py-0.5 rounded">
                    {transitProgressPercent}% recorrido
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Customer Information */}
        <div className="bg-gray-50 rounded-xl p-3 border border-gray-200/70 mb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Cliente:</p>
              <h4 className={`font-bold text-gray-900 ${textScale.client}`}>
                {order.customer.name}
              </h4>
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleWhatsAppCustomer}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-transform active:scale-95 flex items-center gap-1 text-xs font-bold"
                title="Escribir al WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">WhatsApp</span>
              </button>
              <a
                href={`tel:${order.customer.phone}`}
                className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-sm transition-transform active:scale-95 flex items-center gap-1 text-xs font-bold"
                title="Llamar al cliente"
              >
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Llamar</span>
              </a>
            </div>
          </div>

          {/* Delivery Address & Reference */}
          <div className="mt-2 text-gray-700 text-xs sm:text-sm flex items-start gap-1.5">
            <MapPin className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">{order.customer.address}</p>
              {order.customer.reference && (
                <p className="text-gray-500 italic text-xs mt-0.5">
                  Ref: {order.customer.reference}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Order Items List with individual prep times */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Platos a Preparar:
            </p>
            <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
              ⏱️ Tiempo total sumado: {prepMinutes} min
            </span>
          </div>
          <div className="space-y-1.5">
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex items-start justify-between gap-2 p-2 bg-white rounded-xl border border-gray-200/80 text-gray-800"
              >
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 bg-indigo-100 text-indigo-800 font-bold rounded-lg flex items-center justify-center text-xs shrink-0 mt-0.5">
                    {item.quantity}x
                  </span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <p className={`font-bold text-gray-900 ${textScale.body}`}>{item.productName}</p>
                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                        {item.preparationMinutes || 15} min
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded mt-0.5 inline-block">
                        Nota: {item.notes}
                      </p>
                    )}
                  </div>
                </div>
                <span className="font-bold text-gray-700 text-xs sm:text-sm shrink-0">
                  {currency}{(item.unitPrice * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Special Delivery Notes Alert Box */}
        {order.customer.notes && (
          <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs">
            <div className="flex items-center gap-1 font-bold mb-0.5">
              <FileText className="w-3.5 h-3.5 text-amber-600" />
              <span>Instrucción Especial:</span>
            </div>
            <p className="font-medium text-gray-800">{order.customer.notes}</p>
          </div>
        )}

        {/* Payment and Total Row */}
        <div className="flex items-center justify-between bg-gray-900 text-white rounded-xl p-2.5 sm:p-3 mb-4 shadow-sm">
          <div>
            <span className="text-[10px] text-gray-400 font-bold uppercase block">
              Forma de Pago:
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-indigo-200">
              <DollarSign className="w-3.5 h-3.5 text-indigo-400" />
              <span className="capitalize">{order.paymentMethod.replace('_', ' ')}</span>
            </div>
            {order.paymentDetails && (
              <p className="text-[11px] text-gray-300 truncate max-w-[180px] sm:max-w-xs">
                {order.paymentDetails}
              </p>
            )}
          </div>
          <div className="text-right">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">
              Total a Cobrar:
            </span>
            <span className="text-lg sm:text-xl font-black text-amber-300">
              {currency}{order.totalAmount.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons: Moving Order through 3 Bars (Recibido -> Pendiente -> Enviado -> Entregado) */}
      <div className="pt-2 border-t border-gray-100">
        {order.status === 'recibido' && (
          <button
            type="button"
            onClick={() => {
              soundAlert.playReadyChime();
              soundAlert.speakText(`Iniciando preparación del pedido ${order.orderNumber}`);
              onUpdateStatus(order.id, 'pendiente');
            }}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <ChefHat className="w-4 h-4" />
            <span>Empezar a Cocinar (Mover a Pendientes)</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {order.status === 'pendiente' && (
          isCooked ? (
            <button
              type="button"
              onClick={() => {
                soundAlert.playReadyChime();
                soundAlert.speakText(`Pedido ${order.orderNumber} listo para enviar a ${order.customer.name}`);
                onUpdateStatus(order.id, 'en_camino');
              }}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer ring-2 ring-emerald-400 animate-pulse"
            >
              <Truck className="w-5 h-5" />
              <span>¡Cocción Lista! Enviar Pedido (Mover a En Camino)</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-3.5 px-4 bg-gray-200 border-2 border-gray-300 text-gray-500 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed select-none opacity-80 shadow-inner"
              title={`Botón inhabilitado: Este pedido aún se está cocinando. Se habilitará automáticamente al completar los ${prepMinutes} minutos.`}
            >
              <Lock className="w-4 h-4 text-gray-500" />
              <span>
                🔒 Inhabilitado: Cocinándose ({Math.floor(remainingCookingSec / 60)}:{String(remainingCookingSec % 60).padStart(2, '0')} restantes)
              </span>
            </button>
          )
        )}

        {order.status === 'en_camino' && (
          isArrived ? (
            <button
              type="button"
              onClick={() => {
                soundAlert.playReadyChime();
                soundAlert.speakText(`Pedido ${order.orderNumber} entregado con éxito a ${order.customer.name}.`);
                onUpdateStatus(order.id, 'entregado');
              }}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold rounded-xl text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer ring-2 ring-emerald-400 animate-pulse"
            >
              <CheckCircle2 className="w-5 h-5" />
              <span>¡Llegó al Destino! Confirmar Entregado (Guardar en Historial)</span>
            </button>
          ) : (
            <button
              type="button"
              disabled
              className="w-full py-3.5 px-4 bg-gray-200 border-2 border-gray-300 text-gray-500 font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 cursor-not-allowed select-none opacity-80 shadow-inner"
              title={`Botón inhabilitado: El repartidor está en ruta hacia ${order.customer.address}. Se habilitará automáticamente al completar los ${deliveryMinutes} minutos de viaje.`}
            >
              <Lock className="w-4 h-4 text-gray-500" />
              <span>
                🔒 Inhabilitado: En Ruta ({Math.floor(remainingTransitSec / 60)}:{String(remainingTransitSec % 60).padStart(2, '0')} restantes)
              </span>
            </button>
          )
        )}
      </div>
    </div>
  );
};
