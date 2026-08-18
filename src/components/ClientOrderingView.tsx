import React, { useState, useMemo } from 'react';
import {
  ShoppingBag,
  Clock,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  Phone,
  MapPin,
  FileText,
  CreditCard,
  ChefHat,
  Truck,
  Sparkles,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  HelpCircle,
  Search,
  X,
  UtensilsCrossed,
  LayoutDashboard,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Product, Order, PaymentOptionConfig, BusinessConfig, PaymentType } from '../types';
import { soundAlert } from '../utils/audioAlerts';

interface ClientOrderingViewProps {
  products: Product[];
  onPlaceOrder: (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'dayKey' | 'viewedByOwner'>) => Order;
  orders: Order[];
  paymentConfigs: PaymentOptionConfig[];
  config: BusinessConfig;
  onReturnToAdmin?: () => void;
}

interface CartItem {
  quantity: number;
  notes: string;
}

export const ClientOrderingView: React.FC<ClientOrderingViewProps> = ({
  products,
  onPlaceOrder,
  orders,
  paymentConfigs,
  config,
  onReturnToAdmin,
}) => {
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [macroTab, setMacroTab] = useState<'todos' | 'comidas' | 'bebidas' | 'postres'>('todos');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);

  // Form fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [customerReference, setCustomerReference] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentType>('efectivo');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [formError, setFormError] = useState('');

  const getProductMacro = (catName: string): 'comidas' | 'bebidas' | 'postres' => {
    const cat = (catName || '').toLowerCase();
    if (
      cat.includes('bebida') ||
      cat.includes('cafetería') ||
      cat.includes('café') ||
      cat.includes('refresco') ||
      cat.includes('gaseosa') ||
      cat.includes('jugo') ||
      cat.includes('caliente')
    ) {
      return 'bebidas';
    }
    if (
      cat.includes('postre') ||
      cat.includes('dulce') ||
      cat.includes('repostería') ||
      cat.includes('helado') ||
      cat.includes('torta') ||
      cat.includes('pastel')
    ) {
      return 'postres';
    }
    return 'comidas';
  };

  const comidasCount = products.filter((p) => p.isActive && getProductMacro(p.category) === 'comidas').length;
  const bebidasCount = products.filter((p) => p.isActive && getProductMacro(p.category) === 'bebidas').length;
  const postresCount = products.filter((p) => p.isActive && getProductMacro(p.category) === 'postres').length;

  // Subcategories belonging to the active macro tab
  const availableCategories = useMemo(() => {
    const activeProducts = products.filter((p) => {
      if (!p.isActive) return false;
      if (macroTab !== 'todos' && getProductMacro(p.category) !== macroTab) return false;
      return true;
    });
    const uniqueCats = Array.from(new Set(activeProducts.map((p) => p.category)));
    return ['Todos', ...uniqueCats];
  }, [products, macroTab]);

  const filteredProducts = products.filter((p) => {
    if (!p.isActive) return false;
    if (macroTab !== 'todos' && getProductMacro(p.category) !== macroTab) return false;
    if (selectedCategory !== 'Todos' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      return matchName || matchDesc || matchCat;
    }
    return true;
  });

  const getCartTotal = () => {
    return (Object.entries(cart) as [string, CartItem][]).reduce((total, [prodId, item]) => {
      const prod = products.find((p) => p.id === prodId);
      if (!prod) return total;
      return total + prod.price * item.quantity;
    }, 0);
  };

  const getCartItemCount = () => {
    return (Object.values(cart) as CartItem[]).reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalPrepTime = () => {
    let total = 0;
    (Object.entries(cart) as [string, CartItem][]).forEach(([prodId, item]) => {
      if (item.quantity > 0) {
        const prod = products.find((p) => p.id === prodId);
        if (prod) {
          total += (prod.preparationMinutes || 15);
        }
      }
    });
    return total > 0 ? total : 15;
  };

  const addToCart = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod || prod.stock <= 0) {
      alert('Lo sentimos, este producto está agotado por hoy.');
      return;
    }

    setCart((prev) => {
      const current = prev[productId]?.quantity || 0;
      if (current >= prod.stock) {
        alert(`Solo quedan ${prod.stock} unidades disponibles.`);
        return prev;
      }
      return {
        ...prev,
        [productId]: {
          quantity: current + 1,
          notes: prev[productId]?.notes || '',
        },
      };
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
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

  const updateItemNote = (productId: string, notes: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        notes,
      },
    }));
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!customerName.trim()) {
      setFormError('Por favor escribe tu nombre completo.');
      return;
    }
    if (!customerPhone.trim()) {
      setFormError('Por favor ingresa un número de teléfono de contacto.');
      return;
    }
    if (!customerAddress.trim()) {
      setFormError('Por favor escribe tu dirección exacta de entrega.');
      return;
    }

    const items = (Object.entries(cart) as [string, CartItem][]).map(([prodId, item]) => {
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
      setFormError('Tu canasta de compras está vacía.');
      return;
    }

    const newOrder = onPlaceOrder({
      customer: {
        name: customerName,
        phone: customerPhone,
        address: customerAddress,
        reference: customerReference,
        notes: customerNotes,
      },
      items,
      totalAmount: getCartTotal(),
      paymentMethod: selectedPayment,
      paymentDetails: paymentDetails || undefined,
      status: 'recibido',
      totalPrepMinutes: getTotalPrepTime(),
      estimatedDeliveryMinutes: 20,
    });

    // Success fireworks & sound
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {
      // Ignore
    }
    soundAlert.playNewOrderChime();
    soundAlert.speakText(`¡Gracias ${customerName}! Tu pedido número ${newOrder.orderNumber} fue recibido y enviado a la cocina.`);

    // Reset and open live tracker
    setCart({});
    setIsCheckoutOpen(false);
    setActiveTrackingOrderId(newOrder.id);
  };

  // Find active tracking order if selected
  const activeOrder = activeTrackingOrderId
    ? orders.find((o) => o.id === activeTrackingOrderId)
    : null;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Client Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 text-gray-900 shadow-sm border border-gray-200 relative">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
              Carta Digital & Pedidos en Línea
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-2">
              {config.businessName || 'Memo Comidas Caseras'}
            </h1>
            <p className="text-gray-600 font-normal text-sm sm:text-base mt-1">
              {config.tagline || 'Pide aquí tu comida favorita recién hecha y calientita.'}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-gray-600 mt-3">
              <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <MapPin className="w-4 h-4 text-indigo-600" />
                {config.address}
              </span>
              <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                <Phone className="w-4 h-4 text-indigo-600" />
                {config.phone}
              </span>
            </div>

            {/* Chef / Entrepreneur Mini Badge */}
            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-lg shrink-0 border border-indigo-100">
                {config.ownerAvatar || '👨‍🍳'}
              </div>
              <p className="text-xs text-gray-600">
                <strong className="text-gray-900">{config.ownerName || 'Don Memo'}</strong> ({config.ownerRole || 'Chef Fundador'}):{' '}
                <span className="italic text-gray-500">
                  {config.ownerBio ? config.ownerBio.slice(0, 100) + '...' : 'Recetas caseras hechas con amor al momento.'}
                </span>
              </p>
            </div>
          </div>

          {/* Action buttons (Dashboard & Cart) */}
          <div className="flex flex-wrap items-center gap-3">
            {onReturnToAdmin && (
              <button
                type="button"
                onClick={onReturnToAdmin}
                className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-slate-900/20 flex items-center gap-2 transition-all cursor-pointer ring-1 ring-amber-400/40 hover:scale-[1.02]"
                title="Entrar al Dashboard de Cocina y Pedidos"
              >
                <LayoutDashboard className="w-4 h-4 text-amber-400" />
                <span>Entrar al Dashboard</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCheckoutOpen(true)}
              className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs sm:text-sm shadow-md shadow-indigo-200 flex items-center gap-2.5 transition-transform active:scale-95 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4 text-white" />
              <span>Ver Canasta ({getCartItemCount()})</span>
              <span className="bg-indigo-800 text-white px-2 py-0.5 rounded-md text-xs font-bold">
                {config.currency}{getCartTotal().toFixed(2)}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Order Tracker Banner (If customer has a placed order) */}
      {activeOrder && (
        <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm animate-fade-in">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                Estado en tiempo real de tu pedido
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900">
                Pedido #{activeOrder.orderNumber} - {activeOrder.customer.name}
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setActiveTrackingOrderId(null)}
              className="text-xs text-gray-500 hover:text-gray-800 font-semibold underline cursor-pointer"
            >
              Cerrar seguimiento
            </button>
          </div>

          {/* 4 Interactive Progress Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
            <div
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                activeOrder.status === 'recibido'
                  ? 'bg-blue-50/70 border-blue-300 text-blue-900'
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold mx-auto mb-1 text-xs">
                1
              </div>
              <p className="font-bold text-sm text-gray-900">1. Recibido</p>
              <p className="text-[11px] font-normal text-gray-500">En espera de cocina</p>
            </div>

            <div
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                activeOrder.status === 'pendiente'
                  ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                  : ['en_camino', 'entregado'].includes(activeOrder.status)
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold mx-auto mb-1">
                <ChefHat className="w-4 h-4" />
              </div>
              <p className="font-bold text-sm text-gray-900">2. En Cocina</p>
              <p className="text-[11px] font-normal text-gray-500">Preparando con amor</p>
            </div>

            <div
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                activeOrder.status === 'en_camino'
                  ? 'bg-indigo-50/70 border-indigo-300 text-indigo-900'
                  : activeOrder.status === 'entregado'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold mx-auto mb-1">
                <Truck className="w-4 h-4" />
              </div>
              <p className="font-bold text-sm text-gray-900">3. En Camino</p>
              <p className="text-[11px] font-normal text-gray-500">Repartidor en ruta</p>
            </div>

            <div
              className={`p-3.5 rounded-2xl border text-center transition-all ${
                activeOrder.status === 'entregado'
                  ? 'bg-emerald-600 border-emerald-400 text-white'
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold mx-auto mb-1">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <p className={`font-bold text-sm ${activeOrder.status === 'entregado' ? 'text-white' : 'text-gray-900'}`}>
                4. ¡Entregado!
              </p>
              <p className={`text-[11px] font-normal ${activeOrder.status === 'entregado' ? 'text-emerald-100' : 'text-gray-500'}`}>
                ¡Buen provecho!
              </p>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs sm:text-sm text-gray-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <p className="font-bold text-gray-900">Dirección de entrega:</p>
              <p className="text-gray-600">{activeOrder.customer.address}</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-gray-900">Total a pagar:</p>
              <p className="text-lg font-black text-indigo-900">
                {config.currency}{activeOrder.totalAmount.toFixed(2)} ({activeOrder.paymentMethod})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search Bar & Total Counter */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Buscar entre platillos, pizzas, bebidas o postres..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-gray-900 placeholder-gray-400 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm transition-all outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              title="Limpiar búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <div className="flex items-center justify-between sm:justify-end gap-2 text-xs font-semibold text-gray-500 px-1">
          <span className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-lg border border-indigo-100/80">
            🍽️ {filteredProducts.length} de {products.length} platillos
          </span>
        </div>
      </div>

      {/* 3 Main Category Bars: Comidas, Bebidas, Postres */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* BAR 1: COMIDAS */}
          <button
            type="button"
            onClick={() => {
              setMacroTab(macroTab === 'comidas' ? 'todos' : 'comidas');
              setSelectedCategory('Todos');
            }}
            className={`relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between shadow-xs ${
              macroTab === 'comidas'
                ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-orange-600 text-white border-transparent shadow-lg shadow-orange-500/20 ring-2 ring-orange-300'
                : 'bg-white hover:bg-orange-50/60 text-gray-800 border-gray-200/90 hover:border-orange-300'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 ${
                  macroTab === 'comidas' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'
                }`}
              >
                🍔
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight">Comidas</h3>
                  {macroTab === 'comidas' && (
                    <span className="bg-white text-orange-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Seleccionado
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs font-medium mt-0.5 line-clamp-1 ${
                    macroTab === 'comidas' ? 'text-white/90' : 'text-gray-500'
                  }`}
                >
                  Platos fuertes, rápidas, pizzas, tacos y sopas
                </p>
              </div>
            </div>
            <div
              className={`text-xs font-black px-3 py-1.5 rounded-xl whitespace-nowrap ml-2 ${
                macroTab === 'comidas' ? 'bg-white/25 text-white' : 'bg-orange-50 text-orange-800 border border-orange-200/60'
              }`}
            >
              {comidasCount} platillos
            </div>
          </button>

          {/* BAR 2: BEBIDAS */}
          <button
            type="button"
            onClick={() => {
              setMacroTab(macroTab === 'bebidas' ? 'todos' : 'bebidas');
              setSelectedCategory('Todos');
            }}
            className={`relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between shadow-xs ${
              macroTab === 'bebidas'
                ? 'bg-gradient-to-br from-blue-600 via-indigo-600 to-indigo-700 text-white border-transparent shadow-lg shadow-indigo-500/20 ring-2 ring-blue-300'
                : 'bg-white hover:bg-blue-50/60 text-gray-800 border-gray-200/90 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 ${
                  macroTab === 'bebidas' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
                }`}
              >
                🥤
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight">Bebidas</h3>
                  {macroTab === 'bebidas' && (
                    <span className="bg-white text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Seleccionado
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs font-medium mt-0.5 line-clamp-1 ${
                    macroTab === 'bebidas' ? 'text-white/90' : 'text-gray-500'
                  }`}
                >
                  Jugos naturales, café de especialidad y gaseosas
                </p>
              </div>
            </div>
            <div
              className={`text-xs font-black px-3 py-1.5 rounded-xl whitespace-nowrap ml-2 ${
                macroTab === 'bebidas' ? 'bg-white/25 text-white' : 'bg-blue-50 text-blue-800 border border-blue-200/60'
              }`}
            >
              {bebidasCount} bebidas
            </div>
          </button>

          {/* BAR 3: POSTRES */}
          <button
            type="button"
            onClick={() => {
              setMacroTab(macroTab === 'postres' ? 'todos' : 'postres');
              setSelectedCategory('Todos');
            }}
            className={`relative p-4 sm:p-5 rounded-2xl sm:rounded-3xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between shadow-xs ${
              macroTab === 'postres'
                ? 'bg-gradient-to-br from-pink-500 via-rose-500 to-rose-600 text-white border-transparent shadow-lg shadow-pink-500/20 ring-2 ring-pink-300'
                : 'bg-white hover:bg-pink-50/60 text-gray-800 border-gray-200/90 hover:border-pink-300'
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0 ${
                  macroTab === 'postres' ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-700'
                }`}
              >
                🍰
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight">Postres</h3>
                  {macroTab === 'postres' && (
                    <span className="bg-white text-pink-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      Seleccionado
                    </span>
                  )}
                </div>
                <p
                  className={`text-xs font-medium mt-0.5 line-clamp-1 ${
                    macroTab === 'postres' ? 'text-white/90' : 'text-gray-500'
                  }`}
                >
                  Tortas, helados, tres leches, flanes y dulces
                </p>
              </div>
            </div>
            <div
              className={`text-xs font-black px-3 py-1.5 rounded-xl whitespace-nowrap ml-2 ${
                macroTab === 'postres' ? 'bg-white/25 text-white' : 'bg-pink-50 text-pink-800 border border-pink-200/60'
              }`}
            >
              {postresCount} postres
            </div>
          </button>
        </div>

        {/* Subcategory Filter Pills corresponding to active macro tab */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-1">
          {macroTab !== 'todos' && (
            <button
              type="button"
              onClick={() => {
                setMacroTab('todos');
                setSelectedCategory('Todos');
              }}
              className="py-2 px-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1.5 shrink-0"
              title="Mostrar todo el menú"
            >
              <span>✨ Ver Todo ({products.length})</span>
            </button>
          )}

          {availableCategories.map((cat) => {
            const count =
              cat === 'Todos'
                ? products.filter((p) => {
                    if (!p.isActive) return false;
                    if (macroTab !== 'todos' && getProductMacro(p.category) !== macroTab) return false;
                    return true;
                  }).length
                : products.filter((p) => p.isActive && p.category === cat).length;

            const label =
              cat === 'Todos'
                ? macroTab === 'comidas'
                  ? 'Todas las Comidas'
                  : macroTab === 'bebidas'
                  ? 'Todas las Bebidas'
                  : macroTab === 'postres'
                  ? 'Todos los Postres'
                  : 'Todo el Menú'
                : cat;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`py-2 px-3.5 rounded-xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    selectedCategory === cat
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State if filter yields no items */}
      {filteredProducts.length === 0 && (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-3 text-3xl">
            🔍
          </div>
          <h3 className="text-lg font-bold text-gray-900">No encontramos platillos con esa búsqueda</h3>
          <p className="text-sm text-gray-500 mt-1 max-w-md mx-auto">
            Prueba buscando con otro término (por ejemplo: "hamburguesa", "pizza", "jugo", "chocolate" o "casado").
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('Todos');
            }}
            className="mt-4 px-4 py-2 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            Ver toda la carta ({products.length} platillos)
          </button>
        </div>
      )}

      {/* Products Catalog Grid with Large Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => {
          const inCartCount = cart[prod.id]?.quantity || 0;
          const isOutOfStock = prod.stock <= 0;

          return (
            <div
              key={prod.id}
              className={`group bg-white rounded-3xl overflow-hidden border shadow-xs hover:shadow-lg transition-all flex flex-col justify-between ${
                isOutOfStock
                  ? 'border-gray-200 opacity-65 bg-gray-50'
                  : inCartCount > 0
                  ? 'border-indigo-400 ring-2 ring-indigo-200'
                  : 'border-gray-200/90 hover:border-indigo-300'
              }`}
            >
              <div>
                {/* Large Product Image Header */}
                <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        // Fallback to emoji display if image link fails
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : null}

                  {/* Fallback Emoji/Icon if image absent or loading */}
                  <div className="absolute inset-0 -z-10 flex items-center justify-center bg-gradient-to-br from-indigo-50 via-amber-50/40 to-orange-50 text-6xl">
                    <span>{prod.imageIcon || '🍽️'}</span>
                  </div>

                  {/* Top Floating Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    {/* Category Pill with Icon */}
                    <span className="backdrop-blur-md bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1.5">
                      <span className="text-xs">{prod.imageIcon || '🍽️'}</span>
                      <span className="truncate max-w-[140px]">{prod.category}</span>
                    </span>

                    {/* Stock Status Badge */}
                    <span
                      className={`backdrop-blur-md text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs ${
                        isOutOfStock
                          ? 'bg-rose-600/90 text-white'
                          : prod.stock < 10
                          ? 'bg-amber-500/90 text-white animate-pulse'
                          : 'bg-emerald-600/90 text-white'
                      }`}
                    >
                      {isOutOfStock ? 'Agotado' : `Stock: ${prod.stock}`}
                    </span>
                  </div>

                  {/* Prep Time Floating Tag at Bottom-Right of Image */}
                  <div className="absolute bottom-2.5 right-3">
                    <span className="backdrop-blur-md bg-black/65 text-white text-[11px] font-semibold px-2.5 py-0.5 rounded-lg flex items-center gap-1 shadow-xs">
                      <Clock className="w-3 h-3 text-amber-300" />
                      <span>~{prod.preparationMinutes} min</span>
                    </span>
                  </div>
                </div>

                {/* Product Content Body */}
                <div className="p-5">
                  <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors">
                    {prod.name}
                  </h3>
                  <p className="text-gray-500 text-xs sm:text-sm mt-1.5 line-clamp-2 leading-relaxed min-h-[38px]">
                    {prod.description}
                  </p>

                  {/* Price Row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                      Precio
                    </span>
                    <span className="text-2xl font-black text-indigo-900">
                      {config.currency}{prod.price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quantity Controls / Add to Order Button */}
              <div className="p-5 pt-0">
                {isOutOfStock ? (
                  <button
                    disabled
                    className="w-full py-3 bg-gray-100 text-gray-400 font-semibold rounded-2xl text-xs sm:text-sm cursor-not-allowed"
                  >
                    Agotado por hoy
                  </button>
                ) : inCartCount === 0 ? (
                  <button
                    type="button"
                    onClick={() => addToCart(prod.id)}
                    className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-2xl text-sm shadow-md shadow-indigo-200 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Agregar al Pedido</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-between bg-indigo-50 p-1.5 rounded-2xl border border-indigo-200">
                    <button
                      type="button"
                      onClick={() => removeFromCart(prod.id)}
                      className="w-9 h-9 bg-white hover:bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs border border-gray-200 transition-colors cursor-pointer"
                      title="Quitar uno"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-extrabold text-base text-indigo-950 px-3">
                      {inCartCount} en carrito
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(prod.id)}
                      disabled={inCartCount >= prod.stock}
                      className="w-9 h-9 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl flex items-center justify-center font-bold text-sm shadow-xs disabled:opacity-50 transition-colors cursor-pointer"
                      title="Agregar otro"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Checkout Drawer / Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 my-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-indigo-600" />
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Finalizar Pedido</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="text-gray-400 hover:text-gray-700 p-2 rounded-full font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {getCartItemCount() === 0 ? (
              <div className="text-center py-8">
                <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-base font-bold text-gray-700">Tu canasta está vacía</p>
                <p className="text-xs text-gray-500 mt-1">
                  Agrega algunos deliciosos platillos antes de continuar.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCheckoutOpen(false)}
                  className="mt-4 py-2 px-4 bg-indigo-600 text-white font-bold rounded-xl text-xs sm:text-sm cursor-pointer"
                >
                  Ver Menú
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Items in Cart Summary */}
                <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200 max-h-48 overflow-y-auto space-y-2.5">
                  <span className="text-xs font-bold uppercase text-gray-600 tracking-wider block mb-1">
                    Tus Platillos Seleccionados:
                  </span>
                  {(Object.entries(cart) as [string, CartItem][]).map(([prodId, item]) => {
                    const prod = products.find((p) => p.id === prodId);
                    if (!prod) return null;
                    return (
                      <div
                        key={prodId}
                        className="bg-white p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm"
                      >
                        <div className="flex items-center justify-between font-bold text-gray-900">
                          <span>
                            {item.quantity}x {prod.name}
                          </span>
                          <span className="text-indigo-900">
                            {config.currency}{(prod.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        {/* Custom food note for kitchen */}
                        <input
                          type="text"
                          value={item.notes}
                          onChange={(e) => updateItemNote(prodId, e.target.value)}
                          placeholder="Nota para la cocina (ej: sin cebolla, salsa aparte...)"
                          className="w-full mt-1.5 p-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 placeholder-gray-400 font-normal outline-none focus:border-indigo-500"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Total and estimated prep time */}
                <div className="flex items-center justify-between bg-gray-900 text-white rounded-2xl p-3.5">
                  <div className="text-xs text-gray-300">
                    <span>Tiempo estimado de cocina:</span>
                    <p className="text-amber-300 font-bold text-xs sm:text-sm">⏱️ ~{getTotalPrepTime()} minutos (suma de platos)</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] text-gray-400 uppercase font-semibold block">Total a Pagar:</span>
                    <span className="text-xl sm:text-2xl font-black text-amber-300">
                      {config.currency}{getCartTotal().toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Customer Information Fields */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Nombre Completo <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ej: Rosa Méndez"
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 text-xs sm:text-sm font-semibold text-gray-900 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Teléfono / WhatsApp <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Ej: 8888-9999"
                        className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 text-xs sm:text-sm font-semibold text-gray-900 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                        Forma de Pago <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={selectedPayment}
                        onChange={(e) => setSelectedPayment(e.target.value as PaymentType)}
                        className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 text-xs sm:text-sm font-semibold text-gray-900 outline-none bg-white"
                      >
                        {paymentConfigs
                          .filter((p) => p.enabled)
                          .map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {/* Payment instruction helper */}
                  {selectedPayment === 'transferencia' && (
                    <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-900">
                      <p className="font-bold mb-1">Datos para la transferencia:</p>
                      <p className="text-gray-700">
                        {paymentConfigs.find((p) => p.id === 'transferencia')?.instructions}
                      </p>
                      <input
                        type="text"
                        value={paymentDetails}
                        onChange={(e) => setPaymentDetails(e.target.value)}
                        placeholder="# de Comprobante o Referencia de pago"
                        className="w-full mt-2 p-2 bg-white border border-indigo-300 rounded-lg text-xs font-medium outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  {selectedPayment === 'efectivo' && (
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        ¿Con cuánto billete pagas? (Para llevarte vuelto):
                      </label>
                      <input
                        type="text"
                        value={paymentDetails}
                        onChange={(e) => setPaymentDetails(e.target.value)}
                        placeholder="Ej: Pago con $20 (llevar vuelto)"
                        className="w-full p-2.5 rounded-xl border border-gray-300 text-xs font-medium outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                      Dirección Exacta de Entrega <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Ej: Calle 5, Casa #14 con portón blanco"
                      className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 text-xs sm:text-sm font-semibold text-gray-900 outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Punto de Referencia / Detalles de entrega:
                    </label>
                    <input
                      type="text"
                      value={customerReference}
                      onChange={(e) => setCustomerReference(e.target.value)}
                      placeholder="Ej: Frente al parque infantil / Apto 3B"
                      className="w-full p-2 rounded-xl border border-gray-300 text-xs font-medium outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">
                      Instrucción Especial o Alergias:
                    </label>
                    <input
                      type="text"
                      value={customerNotes}
                      onChange={(e) => setCustomerNotes(e.target.value)}
                      placeholder="Ej: Alérgico al maní / Tocar timbre fuerte"
                      className="w-full p-2 rounded-xl border border-gray-300 text-xs font-medium outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-gray-200 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-xs sm:text-sm cursor-pointer"
                  >
                    Seguir Pidiendo
                  </button>
                  <button
                    type="submit"
                    className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md shadow-indigo-200 transition-all cursor-pointer"
                  >
                    Enviar Pedido a Cocina
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
