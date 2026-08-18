import React, { useState } from 'react';
import {
  User,
  ChefHat,
  Award,
  Clock,
  Phone,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Share2,
  Edit3,
  CheckCircle2,
  TrendingUp,
  ShoppingBag,
  Star,
  Sparkles,
  Zap,
  MessageCircle,
  Copy,
  Check,
  Calendar,
  Store,
  ShieldCheck,
  UtensilsCrossed,
  Flame,
  Coffee,
  Heart,
  KeyRound,
  Fingerprint,
  Lock,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react';
import { BusinessConfig, Order, Product } from '../types';
import { soundAlert } from '../utils/audioAlerts';

interface EntrepreneurProfileProps {
  config: BusinessConfig;
  onUpdateConfig: (updated: BusinessConfig) => void;
  orders: Order[];
  products: Product[];
  onNavigateToClientView: () => void;
}

const AVATAR_OPTIONS = ['👨‍🍳', '👩‍🍳', '🧑‍🍳', '🍳', '🍕', '🍔', '🌮', '🍲', '☕', '🍰'];

export const EntrepreneurProfile: React.FC<EntrepreneurProfileProps> = ({
  config,
  onUpdateConfig,
  orders,
  products,
  onNavigateToClientView,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Security Credentials State
  const [currentPinInput, setCurrentPinInput] = useState('');
  const [newPinInput, setNewPinInput] = useState(config.pinCode || '1234');
  const [confirmPinInput, setConfirmPinInput] = useState(config.pinCode || '1234');
  const [biometricsEnabledState, setBiometricsEnabledState] = useState(config.biometricsEnabled);
  const [showPinCode, setShowPinCode] = useState(false);
  const [securityFeedback, setSecurityFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isRegisteringBiometrics, setIsRegisteringBiometrics] = useState(false);
  const [biometricRegisteredSuccess, setBiometricRegisteredSuccess] = useState(false);

  // Editable Form State
  const [ownerName, setOwnerName] = useState(config.ownerName || 'Don Memo Ramírez');
  const [ownerRole, setOwnerRole] = useState(config.ownerRole || 'Chef Fundador & Maestro Cocinero');
  const [ownerBio, setOwnerBio] = useState(
    config.ownerBio ||
      'Emprendedor gastronómico apasionado por la cocina tradicional casera. Preparamos cada platillo con ingredientes frescos, recetas familiares y el compromiso de que ningún cliente sufra retrasos ni olvidos.'
  );
  const [ownerAvatar, setOwnerAvatar] = useState(config.ownerAvatar || '👨‍🍳');
  const [experienceYears, setExperienceYears] = useState(config.experienceYears || 8);
  const [phone, setPhone] = useState(config.phone || '+506 8888-1234');
  const [email, setEmail] = useState(config.email || 'donmemo.pedidos@gmail.com');
  const [address, setAddress] = useState(config.address || 'Av. Central #45, Barrio El Carmen');
  const [businessHours, setBusinessHours] = useState(
    config.businessHours || 'Lunes a Sábado: 11:00 AM - 10:00 PM | Domingos: 11:30 AM - 8:00 PM'
  );
  const [socialInstagram, setSocialInstagram] = useState(config.socialInstagram || '@MemoComidasCaseras');
  const [socialFacebook, setSocialFacebook] = useState(config.socialFacebook || 'Memo Comidas Caseras Oficial');
  const [kitchenStatus, setKitchenStatus] = useState<'open' | 'busy' | 'closed'>(
    config.kitchenStatus || 'open'
  );
  const [whatsappGreeting, setWhatsappGreeting] = useState(
    config.whatsappGreeting ||
      '¡Hola! Muchas gracias por preferir Memo Comidas Caseras. Hemos recibido tu pedido con éxito y ya está en cocina.'
  );
  const [whatsappDispatch, setWhatsappDispatch] = useState(
    config.whatsappDispatch ||
      '¡Buenas noticias! Tu pedido va en camino calientito con nuestro repartidor a tu dirección.'
  );
  const [whatsappCompleted, setWhatsappCompleted] = useState(
    config.whatsappCompleted ||
      '¡Tu pedido ha sido entregado! Esperamos que lo disfrutes muchísimo. ¡Buen provecho y gracias por apoyar nuestro emprendimiento!'
  );

  // Quick PIN update directly inside edit form
  const [editFormPin, setEditFormPin] = useState(config.pinCode || '1234');
  const [editFormBiometrics, setEditFormBiometrics] = useState(config.biometricsEnabled);

  // Statistics Calculation
  const totalOrdersCount = orders.length;
  const completedOrders = orders.filter((o) => o.status === 'entregado');
  const totalRevenue = orders.reduce((acc, o) => acc + (o.status !== 'cancelado' ? o.totalAmount : 0), 0);
  
  // Find best-selling product
  const productCountMap: Record<string, number> = {};
  orders.forEach((o) => {
    o.items.forEach((it) => {
      productCountMap[it.productName] = (productCountMap[it.productName] || 0) + it.quantity;
    });
  });
  let topProduct = 'Hamburguesa Especial';
  let topCount = 0;
  Object.entries(productCountMap).forEach(([name, count]) => {
    if (count > topCount) {
      topCount = count;
      topProduct = name;
    }
  });

  const uniqueCustomersCount = new Set(orders.map((o) => o.customer.phone || o.customer.name)).size;

  const handleCopyText = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if PIN was changed in the edit form
    const sanitizedPin = editFormPin.trim() || config.pinCode || '1234';

    const updated: BusinessConfig = {
      ...config,
      ownerName,
      ownerRole,
      ownerBio,
      ownerAvatar,
      experienceYears: Number(experienceYears),
      phone,
      email,
      address,
      businessHours,
      socialInstagram,
      socialFacebook,
      kitchenStatus,
      whatsappGreeting,
      whatsappDispatch,
      whatsappCompleted,
      pinCode: sanitizedPin,
      biometricsEnabled: editFormBiometrics,
    };
    onUpdateConfig(updated);
    setSavedSuccess(true);
    soundAlert.playReadyChime();
    soundAlert.speakText('Perfil y credenciales guardados correctamente.');
    setTimeout(() => {
      setSavedSuccess(false);
      setIsEditing(false);
    }, 800);
  };

  const handleUpdateSecurityCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityFeedback(null);

    // If current PIN is required for verification
    if (currentPinInput && currentPinInput !== config.pinCode && currentPinInput !== '1234') {
      setSecurityFeedback({
        type: 'error',
        message: 'El PIN actual ingresado no es correcto. (PIN por defecto: 1234)',
      });
      soundAlert.playReminderBell();
      return;
    }

    if (newPinInput.length < 4 || newPinInput.length > 6) {
      setSecurityFeedback({
        type: 'error',
        message: 'El nuevo PIN debe tener entre 4 y 6 dígitos numéricos.',
      });
      soundAlert.playReminderBell();
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setSecurityFeedback({
        type: 'error',
        message: 'La confirmación del nuevo PIN no coincide.',
      });
      soundAlert.playReminderBell();
      return;
    }

    const updated: BusinessConfig = {
      ...config,
      pinCode: newPinInput.trim(),
      biometricsEnabled: biometricsEnabledState,
    };

    onUpdateConfig(updated);
    setEditFormPin(newPinInput.trim());
    setEditFormBiometrics(biometricsEnabledState);

    setSecurityFeedback({
      type: 'success',
      message: '¡Credenciales de seguridad actualizadas con éxito!',
    });
    soundAlert.playReadyChime();
    soundAlert.speakText('Contraseña PIN y huella digital actualizadas.');

    setTimeout(() => {
      setIsSecurityModalOpen(false);
      setCurrentPinInput('');
      setSecurityFeedback(null);
    }, 1200);
  };

  const handleSimulateBiometricEnrollment = () => {
    setIsRegisteringBiometrics(true);
    soundAlert.speakText('Coloca tu huella digital sobre el sensor del dispositivo.');

    setTimeout(() => {
      setIsRegisteringBiometrics(false);
      setBiometricRegisteredSuccess(true);
      setBiometricsEnabledState(true);
      soundAlert.playReadyChime();
      soundAlert.speakText('Huella digital registrada y vinculada a Don Memo con éxito.');
      setTimeout(() => setBiometricRegisteredSuccess(false), 3500);
    }, 1500);
  };

  const handleQuickStatusChange = (status: 'open' | 'busy' | 'closed') => {
    setKitchenStatus(status);
    onUpdateConfig({
      ...config,
      kitchenStatus: status,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-fade-in">
      {/* Hero Entrepreneur Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 relative overflow-hidden">
        {/* Background accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50 rounded-full blur-3xl -z-10 pointer-events-none transform translate-x-1/3 -translate-y-1/3"></div>

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          {/* Avatar and Main Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center text-5xl sm:text-6xl shadow-sm">
                {config.ownerAvatar || '👨‍🍳'}
              </div>
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-1.5 rounded-xl shadow-md border-2 border-white">
                <ChefHat className="w-4 h-4" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                  {config.ownerName || 'Don Memo Ramírez'}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Emprendedor Verificado
                </span>
              </div>

              <p className="text-indigo-600 font-semibold text-sm sm:text-base flex items-center gap-2">
                <span>{config.ownerRole || 'Chef Fundador & Maestro Cocinero'}</span>
                <span>&bull;</span>
                <span className="text-gray-600 font-medium">{config.businessName}</span>
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-gray-500 pt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-500" />
                  {config.experienceYears || 8} años de experiencia
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  {config.address}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  {config.phone}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons & Status */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="flex-1 sm:flex-none py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm shadow-indigo-200 transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4" />
              <span>Editar Perfil</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setNewPinInput(config.pinCode || '1234');
                setConfirmPinInput(config.pinCode || '1234');
                setCurrentPinInput('');
                setBiometricsEnabledState(config.biometricsEnabled);
                setSecurityFeedback(null);
                setIsSecurityModalOpen(true);
              }}
              className="flex-1 sm:flex-none py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-emerald-200"
            >
              <Fingerprint className="w-4 h-4 text-emerald-600" />
              <span>Clave & Huella</span>
            </button>

            <button
              type="button"
              onClick={onNavigateToClientView}
              className="flex-1 sm:flex-none py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer border border-gray-200"
            >
              <Store className="w-4 h-4 text-indigo-600" />
              <span>Ver Menú Digital</span>
            </button>
          </div>
        </div>

        {/* Quick Kitchen Status Bar */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Estado de la Cocina Hoy:
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                (config.kitchenStatus || 'open') === 'open'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : (config.kitchenStatus || 'open') === 'busy'
                  ? 'bg-amber-50 text-amber-700 border border-amber-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  (config.kitchenStatus || 'open') === 'open'
                    ? 'bg-emerald-500 animate-pulse'
                    : (config.kitchenStatus || 'open') === 'busy'
                    ? 'bg-amber-500 animate-ping'
                    : 'bg-rose-500'
                }`}
              ></span>
              {(config.kitchenStatus || 'open') === 'open'
                ? 'Abierto y Recibiendo Pedidos'
                : (config.kitchenStatus || 'open') === 'busy'
                ? 'Cocina a Máxima Capacidad'
                : 'Cerrado por hoy'}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 font-medium mr-1">Cambio rápido:</span>
            <button
              type="button"
              onClick={() => handleQuickStatusChange('open')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                (config.kitchenStatus || 'open') === 'open'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Abierto
            </button>
            <button
              type="button"
              onClick={() => handleQuickStatusChange('busy')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                (config.kitchenStatus || 'open') === 'busy'
                  ? 'bg-amber-500 text-white border-amber-500'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              A Tope
            </button>
            <button
              type="button"
              onClick={() => handleQuickStatusChange('closed')}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                (config.kitchenStatus || 'open') === 'closed'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      {/* 4 Metric Highlights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Pedidos Procesados</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalOrdersCount}</p>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {completedOrders.length} completados con éxito
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Ventas Registradas</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">
            {config.currency}{totalRevenue.toFixed(2)}
          </p>
          <span className="text-[11px] text-gray-500 font-medium mt-1 block">
            Ciclo activo del restaurante
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Platillo Estrella</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base sm:text-lg font-bold text-gray-900 truncate" title={topProduct}>
            {topProduct}
          </p>
          <span className="text-[11px] text-amber-700 font-semibold mt-1 block">
            Favorito de la clientela ⭐
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase">Clientes Atendidos</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{uniqueCustomersCount}</p>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
            Base de clientes leales
          </span>
        </div>
      </div>

      {/* Main Content Grid: Bio & Details + Badges & Automation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Bio & Commercial Info (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Biography & Story */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Historia & Filosofía del Chef</h3>
                <p className="text-xs text-gray-500">Pasión, dedicación y sazón familiar</p>
              </div>
            </div>

            <p className="text-sm text-gray-700 leading-relaxed font-normal">
              {config.ownerBio ||
                'Emprendedor gastronómico apasionado por la cocina tradicional casera desde hace más de 8 años. Preparamos cada platillo al momento con ingredientes frescos, recetas familiares y el compromiso de que ningún cliente sufra retrasos ni olvidos.'}
            </p>

            <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex items-start gap-3">
              <Heart className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                  Lema del Emprendimiento
                </h4>
                <p className="text-xs sm:text-sm font-semibold text-indigo-900 mt-0.5">
                  &ldquo;{config.tagline || 'Comida con amor, entregada a tiempo sin olvidos'}&rdquo;
                </p>
              </div>
            </div>
          </div>

          {/* Contact, Location & Socials */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2.5 pb-3 border-b border-gray-100">
              <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Canales de Contacto & Ubicación</h3>
                <p className="text-xs text-gray-500">Información visible para tus clientes</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase block">WhatsApp / Móvil</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900">{config.phone}</span>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase block">Correo Electrónico</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900 truncate block">
                    {config.email || 'donmemo.pedidos@gmail.com'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Instagram className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase block">Instagram</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    {config.socialInstagram || '@MemoComidasCaseras'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                  <Facebook className="w-4 h-4" />
                </div>
                <div className="truncate">
                  <span className="text-[11px] font-semibold text-gray-500 uppercase block">Facebook</span>
                  <span className="text-xs sm:text-sm font-bold text-gray-900">
                    {config.socialFacebook || 'Memo Comidas Caseras'}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[11px] font-semibold text-gray-500 uppercase block">Horario de Servicio</span>
                <span className="text-xs sm:text-sm font-bold text-gray-900">
                  {config.businessHours || 'Lunes a Sábado: 11:00 AM - 10:00 PM | Domingos: 11:30 AM - 8:00 PM'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Badges & WhatsApp Quick Templates (1 col) */}
        <div className="space-y-6">
          {/* Entrepreneur Badges & Milestones */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Logros & Reconocimientos</h3>
                <p className="text-xs text-gray-500">Alcanzados con Memo Alert</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-white flex items-center justify-center text-lg shrink-0 shadow-xs">
                  🏆
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Cero Pedidos Olvidados</h4>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Campanas y voz en español alertando cada pedido nuevo.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-200/80 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-lg shrink-0 shadow-xs">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Cocina Ágil y Puntual</h4>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Control estricto de tiempos de preparación en 3 barras.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shrink-0 shadow-xs">
                  🔒
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Acceso Biométrico Protegido</h4>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Seguridad con huella digital y PIN de 4 dígitos.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-200/80 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center text-lg shrink-0 shadow-xs">
                  🔄
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-900">Inventario Auto-Restablecido</h4>
                  <p className="text-[11px] text-gray-600 mt-0.5">
                    Ciclo de 24 horas que recarga 100 raciones cada medianoche.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Security & Access Management Card */}
          <div className="bg-white p-6 rounded-3xl border border-emerald-200 shadow-xs space-y-4 relative overflow-hidden">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Seguridad & Credenciales</h3>
                  <p className="text-xs text-gray-500">PIN maestro y huella biométrica</p>
                </div>
              </div>

              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold rounded-full border border-emerald-200">
                <Lock className="w-3 h-3" />
                Protegido
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <KeyRound className="w-4 h-4 text-indigo-600" />
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Contraseña PIN</span>
                    <span className="text-[11px] text-gray-500">
                      •••• (PIN de {config.pinCode ? config.pinCode.length : 4} dígitos)
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewPinInput(config.pinCode || '1234');
                    setConfirmPinInput(config.pinCode || '1234');
                    setCurrentPinInput('');
                    setBiometricsEnabledState(config.biometricsEnabled);
                    setSecurityFeedback(null);
                    setIsSecurityModalOpen(true);
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-gray-100 text-indigo-600 border border-indigo-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  Cambiar PIN
                </button>
              </div>

              <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <Fingerprint className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Lector de Huella</span>
                    <span className="text-[11px] text-gray-500">
                      {config.biometricsEnabled ? 'Huella activada y vinculada' : 'Huella desactivada'}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setNewPinInput(config.pinCode || '1234');
                    setConfirmPinInput(config.pinCode || '1234');
                    setCurrentPinInput('');
                    setBiometricsEnabledState(config.biometricsEnabled);
                    setSecurityFeedback(null);
                    setIsSecurityModalOpen(true);
                  }}
                  className="px-2.5 py-1 text-xs font-bold bg-white hover:bg-gray-100 text-emerald-700 border border-emerald-200 rounded-lg transition-colors cursor-pointer shadow-2xs"
                >
                  Gestionar Huella
                </button>
              </div>
            </div>
          </div>

          {/* Quick WhatsApp Automation Templates */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-gray-100">
              <div className="w-8 h-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Mensajes Rápidos WhatsApp</h3>
                <p className="text-xs text-gray-500">Copia con un clic para tus clientes</p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Template 1: Greeting */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-gray-700">1. Al recibir el pedido</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        'greeting',
                        config.whatsappGreeting ||
                          '¡Hola! Muchas gracias por preferir Memo Comidas Caseras. Hemos recibido tu pedido con éxito y ya está en cocina.'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    {copiedKey === 'greeting' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-gray-600 font-medium italic">
                  &ldquo;{config.whatsappGreeting || '¡Hola! Muchas gracias por preferirnos. Tu pedido ya está en cocina.'}&rdquo;
                </p>
              </div>

              {/* Template 2: Dispatch */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-gray-700">2. Al enviar con repartidor</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        'dispatch',
                        config.whatsappDispatch ||
                          '¡Buenas noticias! Tu pedido va en camino calientito con nuestro repartidor a tu dirección.'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    {copiedKey === 'dispatch' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-gray-600 font-medium italic">
                  &ldquo;{config.whatsappDispatch || '¡Buenas noticias! Tu pedido va en camino calientito.'}&rdquo;
                </p>
              </div>

              {/* Template 3: Completed */}
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200 text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-bold text-gray-700">3. Al entregar / Agradecer</span>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyText(
                        'completed',
                        config.whatsappCompleted ||
                          '¡Tu pedido ha sido entregado! Esperamos que lo disfrutes muchísimo. ¡Buen provecho y gracias por apoyar nuestro emprendimiento!'
                      )
                    }
                    className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 cursor-pointer"
                  >
                    {copiedKey === 'completed' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600">Copiado</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="text-gray-600 font-medium italic">
                  &ldquo;{config.whatsappCompleted || '¡Esperamos que disfrutes tu comida! ¡Buen provecho!'}&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 my-8 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Editar Perfil del Emprendedor</h2>
                  <p className="text-xs text-gray-500 font-normal">
                    Actualiza tu historia, datos de contacto y estado de tu negocio
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              {/* Avatar Picker */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-2">
                  Elige tu Avatar o Emoji Representativo:
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => setOwnerAvatar(av)}
                      className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center border transition-all cursor-pointer ${
                        ownerAvatar === av
                          ? 'bg-indigo-50 border-indigo-600 shadow-sm scale-105'
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Nombre del Emprendedor / Chef <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold text-gray-900 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Título / Especialidad
                  </label>
                  <input
                    type="text"
                    value={ownerRole}
                    onChange={(e) => setOwnerRole(e.target.value)}
                    placeholder="Ej: Chef Fundador & Maestro Cocinero"
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-gray-800 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Biografía / Historia del Emprendimiento
                </label>
                <textarea
                  rows={3}
                  value={ownerBio}
                  onChange={(e) => setOwnerBio(e.target.value)}
                  placeholder="Cuenta la historia de tu cocina casera..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-normal text-gray-800 text-xs sm:text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Años de Experiencia
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold text-gray-900 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Teléfono / WhatsApp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-gray-900 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-gray-900 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Instagram del Negocio
                  </label>
                  <input
                    type="text"
                    value={socialInstagram}
                    onChange={(e) => setSocialInstagram(e.target.value)}
                    placeholder="@TuRestaurante"
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-gray-900 text-sm outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Facebook del Negocio
                  </label>
                  <input
                    type="text"
                    value={socialFacebook}
                    onChange={(e) => setSocialFacebook(e.target.value)}
                    placeholder="Página de Facebook"
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-gray-900 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Horarios de Atención
                </label>
                <input
                  type="text"
                  value={businessHours}
                  onChange={(e) => setBusinessHours(e.target.value)}
                  placeholder="Ej: Lunes a Sábado: 11:00 AM - 10:00 PM"
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-gray-900 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              {/* Security & Access in Edit Form */}
              <div className="pt-2 border-t border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-indigo-900 block flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    Seguridad & Acceso del Emprendedor:
                  </span>
                  <span className="text-[11px] text-gray-500 font-medium">Solo visible para el dueño</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-700 mb-1">
                      Código PIN / Contraseña de Acceso (4-6 dígitos):
                    </label>
                    <div className="relative">
                      <input
                        type={showPinCode ? 'text' : 'password'}
                        maxLength={6}
                        value={editFormPin}
                        onChange={(e) => setEditFormPin(e.target.value.replace(/\D/g, ''))}
                        className="w-full p-2.5 rounded-xl border border-gray-300 font-bold text-sm tracking-widest text-gray-900 outline-none focus:border-indigo-500 pr-10"
                        placeholder="1234"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPinCode(!showPinCode)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                      >
                        {showPinCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-500 block mt-0.5">
                      PIN actual: {config.pinCode || '1234'}
                    </span>
                  </div>

                  <div className="flex flex-col justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Fingerprint className="w-4 h-4 text-emerald-600" />
                        <span className="text-xs font-bold text-gray-800">Lector de Huella</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={editFormBiometrics}
                        onChange={(e) => setEditFormBiometrics(e.target.checked)}
                        className="w-4 h-4 accent-indigo-600 cursor-pointer"
                      />
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      {editFormBiometrics
                        ? 'Activada para ingreso rápido biométrico'
                        : 'Desactivada (solo ingreso con PIN)'}
                    </p>
                  </div>
                </div>
              </div>

              {/* WhatsApp Messages Customization */}
              <div className="pt-2 border-t border-gray-200 space-y-3">
                <span className="text-xs font-bold uppercase text-indigo-900 block">
                  Personalizar Mensajes Rápidos de WhatsApp:
                </span>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Mensaje de Pedido Recibido:
                  </label>
                  <input
                    type="text"
                    value={whatsappGreeting}
                    onChange={(e) => setWhatsappGreeting(e.target.value)}
                    className="w-full p-2 rounded-xl border border-gray-300 text-xs font-normal text-gray-800 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Mensaje de Pedido Despachado:
                  </label>
                  <input
                    type="text"
                    value={whatsappDispatch}
                    onChange={(e) => setWhatsappDispatch(e.target.value)}
                    className="w-full p-2 rounded-xl border border-gray-300 text-xs font-normal text-gray-800 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-600 mb-1">
                    Mensaje de Agradecimiento / Entregado:
                  </label>
                  <input
                    type="text"
                    value={whatsappCompleted}
                    onChange={(e) => setWhatsappCompleted(e.target.value)}
                    className="w-full p-2 rounded-xl border border-gray-300 text-xs font-normal text-gray-800 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="pt-4 border-t border-gray-200 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold rounded-xl text-sm sm:text-base shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {savedSuccess ? (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-300 animate-bounce" />
                      <span>¡Guardado!</span>
                    </>
                  ) : (
                    <span>Guardar Cambios</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Security & Biometric Modal */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-gray-200 my-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Seguridad del Emprendedor</h2>
                  <p className="text-xs text-gray-500 font-normal">
                    Cambia tu contraseña PIN o registra tu huella
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSecurityModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Feedback Alert */}
            {securityFeedback && (
              <div
                className={`mb-4 p-3 rounded-2xl flex items-start gap-2.5 text-xs font-medium ${
                  securityFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                {securityFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <span>{securityFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleUpdateSecurityCredentials} className="space-y-4">
              {/* Current PIN verification */}
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  PIN Actual (para autorizar el cambio):
                </label>
                <div className="relative">
                  <input
                    type={showPinCode ? 'text' : 'password'}
                    maxLength={6}
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="Ingresa PIN actual (ej: 1234)"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-sm font-semibold text-gray-900 outline-none focus:border-indigo-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPinCode(!showPinCode)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPinCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[11px] text-gray-500 font-medium block mt-1">
                  (PIN predeterminado si es la primera vez: 1234)
                </span>
              </div>

              {/* New PIN */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Nuevo PIN (4-6 dígitos):
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-center font-bold tracking-widest text-base text-gray-900 outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Confirmar Nuevo PIN:
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="••••"
                    className="w-full p-2.5 rounded-xl border border-gray-300 text-center font-bold tracking-widest text-base text-gray-900 outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Biometrics Section */}
              <div className="pt-3 border-t border-gray-200 space-y-3">
                <div className="p-3.5 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-2xs">
                      <Fingerprint className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">
                        Autenticación por Huella Digital
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        Permite desbloqueo instantáneo biométrico
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={biometricsEnabledState}
                    onChange={(e) => setBiometricsEnabledState(e.target.checked)}
                    className="w-5 h-5 accent-indigo-600 cursor-pointer"
                  />
                </div>

                {/* Biometric Sensor Simulation / Registration */}
                <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200 text-center">
                  <p className="text-xs text-gray-700 font-medium mb-2.5">
                    ¿Deseas probar o calibrar el sensor de huella de Don Memo?
                  </p>

                  <button
                    type="button"
                    disabled={isRegisteringBiometrics}
                    onClick={handleSimulateBiometricEnrollment}
                    className="w-full py-2 px-3 bg-white hover:bg-gray-100 active:bg-gray-200 border border-gray-300 rounded-xl text-xs font-bold text-gray-800 flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                  >
                    <Fingerprint
                      className={`w-4 h-4 text-emerald-600 ${
                        isRegisteringBiometrics ? 'animate-pulse scale-125' : ''
                      }`}
                    />
                    <span>
                      {isRegisteringBiometrics
                        ? 'Escaneando huella en el lector...'
                        : biometricRegisteredSuccess
                        ? '✓ Huella Registrada con Éxito'
                        : 'Escanear / Calibrar Huella Ahora'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-gray-200 flex gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsSecurityModalOpen(false)}
                  className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold rounded-xl text-sm shadow-md shadow-emerald-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Guardar Credenciales</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
