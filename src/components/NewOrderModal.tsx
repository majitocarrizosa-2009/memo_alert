import React, { useState } from 'react';
import {
  PlusCircle,
  X,
  Phone,
  User,
  MapPin,
  Clock,
  DollarSign,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Product, Order, PaymentOptionConfig, PaymentType, BusinessConfig } from '../types';
import { soundAlert } from '../utils/audioAlerts';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  paymentConfigs: PaymentOptionConfig[];
  onAddOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'dayKey' | 'viewedByOwner'>) => Order;
  config: BusinessConfig;
}

interface SelectedItem {
  quantity: number;
  notes: string;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  products,
  paymentConfigs,
  onAddOrder,
  config,
}) => {
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerReference, setCustomerReference] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentType>('efectivo');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [selectedItems, setSelectedItems] = useState<Record<string, SelectedItem>>({});
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const handleAddItem = (productId: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [productId]: {
        quantity: (prev[productId]?.quantity || 0) + 1,
        notes: prev[productId]?.notes || '',
      },
    }));
  };

  const handleRemoveItem = (productId: string) => {
    setSelectedItems((prev) => {
      const current = prev[productId]?.quantity || 0;
      if (current <= 1) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return {
        ...prev,
        [productId]: {
          ...prev[productId],
          quantity: current - 1,
        },
      };
    });
  };

  const handleUpdateItemNote = (productId: string, notes: string) => {
    setSelectedItems((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        notes,
      },
    }));
  };

  const getOrderTotal = () => {
    return (Object.entries(selectedItems) as [string, SelectedItem][]).reduce((sum, [prodId, item]) => {
      const prod = products.find((p) => p.id === prodId);
      if (!prod) return sum;
      return sum + prod.price * item.quantity;
    }, 0);
  };

  const getTotalPrepTime = () => {
    let total = 0;
    (Object.entries(selectedItems) as [string, SelectedItem][]).forEach(([prodId, item]) => {
      if (item.quantity > 0) {
        const prod = products.find((p) => p.id === prodId);
        if (prod) {
          total += (prod.preparationMinutes || 15);
        }
      }
    });
    return total > 0 ? total : 15;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Por favor escribe el nombre del cliente.');
      return;
    }
    if (!customerAddress.trim()) {
      setFormError('Por favor escribe la dirección de entrega.');
      return;
    }

    const items = (Object.entries(selectedItems) as [string, SelectedItem][]).map(([prodId, item]) => {
      const prod = products.find((p) => p.id === prodId)!;
      return {
        productId: prod.id,
        productName: prod.name,
        quantity: item.quantity,
        unitPrice: prod.price,
        preparationMinutes: prod.preparationMinutes,
        notes: item.notes,
      };
    });

    if (items.length === 0) {
      setFormError('Por favor selecciona al menos 1 platillo del menú.');
      return;
    }

    const newOrder = onAddOrder({
      customer: {
        name: customerName.trim(),
        phone: customerPhone.trim() || 'Sin registrar',
        address: customerAddress.trim(),
        reference: customerReference.trim() || undefined,
        notes: customerNotes.trim() || undefined,
      },
      items,
      totalAmount: getOrderTotal(),
      paymentMethod: selectedPayment,
      paymentDetails: paymentDetails.trim() || undefined,
      status: 'recibido',
      totalPrepMinutes: getTotalPrepTime(),
      estimatedDeliveryMinutes: 20,
    });

    soundAlert.playNewOrderChime();
    soundAlert.speakText(`Pedido manual #${newOrder.orderNumber} registrado exitosamente.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 my-8">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Tomar Pedido Manual</h2>
              <p className="text-xs text-gray-500 font-normal">Para pedidos por llamada, WhatsApp o mostrador</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 rounded-full font-bold"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Customer Details */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-3">
            <span className="text-xs font-bold uppercase text-gray-700 block">
              1. Datos del Cliente:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Nombre del Cliente <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Ej: Roberto Sánchez"
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold text-gray-900 text-sm outline-none focus:border-indigo-500 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Teléfono / WhatsApp:
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Ej: 8765-4321"
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold text-gray-900 text-sm outline-none focus:border-indigo-500 bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Dirección de Entrega <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="Ej: Calle 3, Barrio Las Palmas, casa azul esquinera"
                className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold text-gray-900 text-sm outline-none focus:border-indigo-500 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Forma de Pago:
                </label>
                <select
                  value={selectedPayment}
                  onChange={(e) => setSelectedPayment(e.target.value as PaymentType)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold text-gray-900 text-sm bg-white"
                >
                  {paymentConfigs.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Detalles de pago / Cambio:
                </label>
                <input
                  type="text"
                  value={paymentDetails}
                  onChange={(e) => setPaymentDetails(e.target.value)}
                  placeholder="Ej: Paga con $50 / Llevar vuelto"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-medium bg-white outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Product Selector */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase text-gray-700 block">
              2. Seleccionar Platillos del Menú:
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1.5 bg-gray-100 rounded-2xl">
              {products.map((prod) => {
                const count = selectedItems[prod.id]?.quantity || 0;
                return (
                  <div
                    key={prod.id}
                    className={`p-2 rounded-xl border flex items-center justify-between transition-all ${
                      count > 0 ? 'bg-indigo-50 border-indigo-300 font-bold' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate pr-2">
                      <span className="text-lg">{prod.imageIcon || '🍽️'}</span>
                      <div className="truncate">
                        <p className="text-xs font-bold text-gray-900 truncate">{prod.name}</p>
                        <span className="text-[11px] text-indigo-900 font-black">
                          {config.currency}{prod.price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      {count > 0 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(prod.id)}
                          className="w-7 h-7 bg-white text-rose-600 rounded-lg flex items-center justify-center font-bold text-xs shadow-xs border border-gray-200"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {count > 0 && (
                        <span className="w-5 text-center text-xs font-bold text-gray-900">
                          {count}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleAddItem(prod.id)}
                        className="w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center justify-center font-bold text-xs shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Total Row */}
          <div className="flex items-center justify-between bg-gray-900 text-white p-3.5 rounded-2xl shadow-sm">
            <span className="text-xs font-bold uppercase text-gray-300">Total del Pedido:</span>
            <span className="text-2xl font-black text-amber-300">
              {config.currency}{getOrderTotal().toFixed(2)}
            </span>
          </div>

          <div className="pt-2 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm sm:text-base shadow-md shadow-indigo-200 transition-all cursor-pointer"
            >
              + Agregar a Pedidos Recibidos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
