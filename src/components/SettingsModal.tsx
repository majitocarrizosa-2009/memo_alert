import React, { useState } from 'react';
import {
  Settings,
  X,
  Lock,
  DollarSign,
  User,
  Volume2,
  Fingerprint,
  CheckCircle2,
  ShieldCheck,
  Type,
  Store,
  CreditCard,
  Bell,
  Sparkles,
} from 'lucide-react';
import { BusinessConfig, PaymentOptionConfig } from '../types';
import { soundAlert } from '../utils/audioAlerts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BusinessConfig;
  paymentConfigs: PaymentOptionConfig[];
  onSaveConfig: (updatedConfig: BusinessConfig) => void;
  onSavePaymentConfigs: (updatedPaymentConfigs: PaymentOptionConfig[]) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  paymentConfigs,
  onSaveConfig,
  onSavePaymentConfigs,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'payments' | 'security' | 'accessibility'>(
    'profile'
  );

  // Profile Form States
  const [businessName, setBusinessName] = useState(config.businessName);
  const [tagline, setTagline] = useState(config.tagline);
  const [ownerName, setOwnerName] = useState(config.ownerName);
  const [phone, setPhone] = useState(config.phone);
  const [address, setAddress] = useState(config.address);
  const [currency, setCurrency] = useState(config.currency);

  // Security Form States
  const [pinCode, setPinCode] = useState(config.pinCode || '1234');
  const [biometricsEnabled, setBiometricsEnabled] = useState(config.biometricsEnabled);

  // Accessibility & Audio
  const [audioAlertsEnabled, setAudioAlertsEnabled] = useState(config.audioAlertsEnabled);
  const [voiceReadoutEnabled, setVoiceReadoutEnabled] = useState(config.voiceReadoutEnabled);
  const [alertIntervalMinutes, setAlertIntervalMinutes] = useState(config.alertIntervalMinutes || 5);
  const [fontSizePreference, setFontSizePreference] = useState(config.fontSizePreference || 'large');
  const [defaultDailyStock, setDefaultDailyStock] = useState(config.defaultDailyStock || 100);

  // Payment Options Copy
  const [localPayments, setLocalPayments] = useState<PaymentOptionConfig[]>(paymentConfigs);

  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePaymentToggle = (id: string, enabled: boolean) => {
    setLocalPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled } : p))
    );
  };

  const handlePaymentInstructionChange = (id: string, instructions: string) => {
    setLocalPayments((prev) =>
      prev.map((p) => (p.id === id ? { ...p, instructions } : p))
    );
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedConfig: BusinessConfig = {
      ...config,
      businessName: businessName.trim(),
      tagline: tagline.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      currency: currency.trim() || '$',
      pinCode: pinCode.trim() || '1234',
      biometricsEnabled,
      audioAlertsEnabled,
      voiceReadoutEnabled,
      alertIntervalMinutes: Number(alertIntervalMinutes) || 5,
      fontSizePreference,
      defaultDailyStock: Number(defaultDailyStock) || 100,
    };

    onSaveConfig(updatedConfig);
    onSavePaymentConfigs(localPayments);

    setSavedSuccess(true);
    soundAlert.playReadyChime();
    soundAlert.speakText('Configuración guardada correctamente.');

    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-gray-200 my-8">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Configuración de Memo Alert</h2>
              <p className="text-xs text-gray-500 font-normal">Ajustes del negocio, pagos y seguridad</p>
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

        {/* Tab Navigation */}
        <div className="flex items-center gap-1.5 p-1 bg-gray-100 rounded-xl mb-6 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-3.5 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Perfil del Negocio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('payments')}
            className={`py-2 px-3.5 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'payments'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Formas de Pago</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`py-2 px-3.5 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'security'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Clave & Huella</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('accessibility')}
            className={`py-2 px-3.5 rounded-lg font-bold text-xs sm:text-sm flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'accessibility'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>Voz & Letra</span>
          </button>
        </div>

        <form onSubmit={handleSaveAll} className="space-y-4">
          {/* TAB 1: BUSINESS PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-3.5 animate-fade-in">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Nombre del Emprendimiento / Restaurante
                </label>
                <input
                  type="text"
                  required
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold text-gray-900 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Lema / Slogan
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-gray-800 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Nombre del Dueño
                  </label>
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-gray-800 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Teléfono del Negocio
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-gray-800 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Dirección del Local
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 font-medium text-gray-800 text-sm outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Símbolo de Moneda
                  </label>
                  <input
                    type="text"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-bold text-indigo-900 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Stock Diario Predeterminado (24h)
                  </label>
                  <input
                    type="number"
                    value={defaultDailyStock}
                    onChange={(e) => setDefaultDailyStock(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold text-gray-900 text-sm outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: PAYMENT METHODS */}
          {activeTab === 'payments' && (
            <div className="space-y-3.5 animate-fade-in">
              <p className="text-xs font-medium text-gray-600">
                Selecciona los métodos de pago que aceptas y escribe las instrucciones para tus clientes:
              </p>

              {localPayments.map((payment) => (
                <div
                  key={payment.id}
                  className={`p-3.5 rounded-2xl border transition-all ${
                    payment.enabled
                      ? 'border-indigo-200 bg-indigo-50/40'
                      : 'border-gray-200 bg-gray-50 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="flex items-center gap-2 cursor-pointer font-bold text-gray-900 text-sm">
                      <input
                        type="checkbox"
                        checked={payment.enabled}
                        onChange={(e) => handlePaymentToggle(payment.id, e.target.checked)}
                        className="w-4 h-4 accent-indigo-600 rounded"
                      />
                      <span>{payment.name}</span>
                    </label>
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        payment.enabled
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-gray-200 text-gray-600'
                      }`}
                    >
                      {payment.enabled ? 'Activo' : 'Inactivo'}
                    </span>
                  </div>

                  {payment.enabled && (
                    <div>
                      <label className="block text-[11px] font-semibold text-gray-500 uppercase mb-1">
                        Instrucciones que verá el cliente (ej: número de cuenta, sinpe, etc):
                      </label>
                      <textarea
                        rows={2}
                        value={payment.instructions}
                        onChange={(e) =>
                          handlePaymentInstructionChange(payment.id, e.target.value)
                        }
                        className="w-full p-2 bg-white rounded-xl border border-gray-300 text-xs font-medium text-gray-800 outline-none focus:border-indigo-500"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: SECURITY & BIOMETRICS */}
          {activeTab === 'security' && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-indigo-50/60 p-4 rounded-2xl border border-indigo-100">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldCheck className="w-5 h-5 text-indigo-600" />
                  <h4 className="font-bold text-gray-900 text-sm">
                    Clave de Acceso para el Emprendedor
                  </h4>
                </div>
                <p className="text-xs text-gray-600 font-normal mb-3">
                  Solo tú podrás entrar a ver las alertas de pedidos y gestionar los precios.
                </p>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Código PIN Numérico (4 o 6 dígitos):
                  </label>
                  <input
                    type="password"
                    maxLength={6}
                    required
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-bold text-xl tracking-widest text-gray-900 outline-none bg-white text-center focus:border-indigo-500"
                  />
                  <span className="text-[11px] text-gray-500 font-medium block mt-1">
                    (Clave por defecto: 1234)
                  </span>
                </div>
              </div>

              {/* Biometrics Toggle */}
              <div className="p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Fingerprint className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-sm">
                      Acceso con Huella Digital
                    </h4>
                    <p className="text-xs text-gray-500 font-normal">
                      Permite iniciar sesión tocando el lector biométrico.
                    </p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={biometricsEnabled}
                  onChange={(e) => setBiometricsEnabled(e.target.checked)}
                  className="w-5 h-5 accent-indigo-600 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 4: ACCESSIBILITY & AUDIO ALERTS */}
          {activeTab === 'accessibility' && (
            <div className="space-y-4 animate-fade-in">
              {/* Text Size Accessibility */}
              <div className="p-4 rounded-2xl border border-gray-200">
                <label className="block text-xs font-bold uppercase text-gray-700 mb-2">
                  Tamaño de Letra para Mayor Visibilidad:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['normal', 'large', 'extra-large'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setFontSizePreference(size)}
                      className={`p-2.5 rounded-xl border font-bold text-center capitalize transition-all cursor-pointer ${
                        fontSizePreference === size
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-xs'
                          : 'border-gray-200 bg-gray-50 text-gray-600'
                      }`}
                    >
                      {size === 'normal' && 'Normal (A)'}
                      {size === 'large' && 'Grande (A+)'}
                      {size === 'extra-large' && 'Extra (A++)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sound and Speech Alerts */}
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Campanas de Alerta Sonora</h4>
                      <p className="text-xs text-gray-500">Toca un tono alegre al recibir pedidos</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={audioAlertsEnabled}
                    onChange={(e) => setAudioAlertsEnabled(e.target.checked)}
                    className="w-5 h-5 accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-2xl border border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Volume2 className="w-5 h-5 text-indigo-600" />
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">Lectura por Voz en Español</h4>
                      <p className="text-xs text-gray-500">
                        Lee en voz alta quién pidió y qué platos cocinar
                      </p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={voiceReadoutEnabled}
                    onChange={(e) => setVoiceReadoutEnabled(e.target.checked)}
                    className="w-5 h-5 accent-indigo-600 cursor-pointer"
                  />
                </div>

                <div className="p-3.5 rounded-2xl border border-gray-200 bg-amber-50/30">
                  <label className="block text-xs font-bold text-gray-800 mb-1">
                    Repetir alarma si hay pedidos recibidos sin mandar a cocinar:
                  </label>
                  <p className="text-[11px] text-gray-500 mb-2">
                    Si mandas el pedido a cocinar, la alarma se silencia automáticamente.
                  </p>
                  <select
                    value={alertIntervalMinutes}
                    onChange={(e) => setAlertIntervalMinutes(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold text-sm bg-white"
                  >
                    <option value={30}>Cada 30 minutos (Predeterminado - Memoria Don Memo)</option>
                    <option value={15}>Cada 15 minutos</option>
                    <option value={10}>Cada 10 minutos</option>
                    <option value={5}>Cada 5 minutos</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm"
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
  );
};
