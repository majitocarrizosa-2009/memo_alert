import React, { useState, useEffect, useRef } from 'react';
import {
  Bell,
  Clock,
  ShieldCheck,
  Lock,
  Settings,
  ShoppingBag,
  ChefHat,
  History,
  Utensils,
  Volume2,
  VolumeX,
  PlusCircle,
  Eye,
  Sparkles,
  Zap,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { BusinessConfig } from '../types';
import { soundAlert } from '../utils/audioAlerts';

interface HeaderProps {
  currentTab: 'dashboard' | 'catalog' | 'history' | 'profile' | 'client-view';
  onTabChange: (tab: 'dashboard' | 'catalog' | 'history' | 'profile' | 'client-view') => void;
  onLockSession: () => void;
  onOpenSettings: () => void;
  onSimulateOrder: () => void;
  config: BusinessConfig;
  activeOrderCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  onLockSession,
  onOpenSettings,
  onSimulateOrder,
  config,
  activeOrderCount,
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const navScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const checkScroll = () => {
    if (navScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = navScrollRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 4);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scrollNav = (direction: 'left' | 'right') => {
    if (navScrollRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      navScrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 300);
    }
  };

  const timeFormatted = currentTime.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

  const dateFormatted = currentTime.toLocaleDateString('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      {/* Top Notification & Simulation Ribbon */}
      <div className="bg-indigo-900 text-white py-1.5 px-4 sm:px-8 text-xs font-semibold flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
          <span className="text-indigo-200 text-[11px] uppercase tracking-wider font-bold">
            Memo Alert Activo
          </span>
          <span className="hidden sm:inline text-indigo-100 font-medium">
            &bull; Alertas sonoras y recordatorios por voz para evitar olvidos en cocina
          </span>
        </div>

        <button
          type="button"
          onClick={onSimulateOrder}
          className="bg-indigo-700 hover:bg-indigo-600 active:bg-indigo-800 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border border-indigo-500/50 hover:scale-105"
          title="Crear un pedido automático de prueba para ver cómo suena y aparece en las barras"
        >
          <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
          <span>Simular Pedido de Prueba</span>
        </button>
      </div>

      {/* Main Header Container: Row 1 - Brand, Live Clock & Fast Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-3 pb-2.5 flex flex-wrap items-center justify-between gap-3 border-b border-gray-100">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 shrink-0">
            <Bell className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-indigo-900">
                Memo <span className="text-indigo-600">Alert</span>
              </h1>
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-0.5 bg-indigo-50 rounded-full border border-indigo-100">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Sincronizado
                </span>
              </div>
            </div>
            <p className="text-xs text-gray-500 font-medium truncate max-w-[240px]">
              {config.businessName || 'Comidas Caseras'}
            </p>
          </div>
        </div>

        {/* Live Clock & Right Tools */}
        <div className="flex items-center gap-3 ml-auto">
          {/* Accessible Live Clock */}
          <div className="flex items-center gap-2.5 px-3.5 py-1.5 bg-gray-50 rounded-2xl border border-gray-200/90 shadow-inner text-right shrink-0">
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
            <div>
              <span className="text-sm font-bold text-gray-900 font-mono block leading-tight">
                {timeFormatted}
              </span>
              <span className="text-[10px] font-semibold text-gray-500 capitalize block leading-tight">
                {dateFormatted}
              </span>
            </div>
          </div>

          {/* Settings & Lock Session */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="py-2 px-3 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-700 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors border border-gray-200 shadow-xs cursor-pointer"
            title="Configuración de negocio, pagos y voz"
          >
            <Settings className="w-4 h-4 text-indigo-600" />
            <span className="hidden sm:inline">Configuración</span>
          </button>

          <button
            type="button"
            onClick={onLockSession}
            className="py-2 px-3 bg-rose-50 hover:bg-rose-100 active:bg-rose-200 text-rose-700 border border-rose-200 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            title="Bloquear panel con Huella Digital o Clave PIN"
          >
            <Lock className="w-4 h-4 text-rose-600" />
            <span className="hidden sm:inline">Bloquear</span>
          </button>
        </div>
      </div>

      {/* Row 2: Extended Navigation & Smooth Side-to-Side Displacement Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-2 relative flex items-center gap-1.5">
        {/* Left Scroll Button */}
        <button
          type="button"
          onClick={() => scrollNav('left')}
          className={`p-1.5 bg-white hover:bg-indigo-50 border border-gray-200 rounded-xl text-gray-600 shadow-xs transition-all shrink-0 cursor-pointer ${
            canScrollLeft ? 'opacity-100' : 'opacity-40 pointer-events-none'
          }`}
          title="Desplazar a la izquierda"
          aria-label="Desplazar a la izquierda"
        >
          <ChevronLeft className="w-4 h-4 text-indigo-700" />
        </button>

        {/* Scrollable Nav Container */}
        <nav
          ref={navScrollRef}
          onScroll={checkScroll}
          className="flex-1 flex items-center gap-1.5 p-1 bg-gray-100/90 rounded-2xl border border-gray-200/90 overflow-x-auto scroll-smooth scrollbar-thin scrollbar-thumb-indigo-200"
          style={{ scrollbarWidth: 'thin' }}
        >
          <button
            type="button"
            onClick={() => onTabChange('dashboard')}
            className={`py-2 px-3.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.02]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
            }`}
          >
            <ChefHat className="w-4 h-4" />
            <span>3 Barras Pedidos</span>
            {activeOrderCount > 0 && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-black ${
                  currentTab === 'dashboard' ? 'bg-white text-indigo-900' : 'bg-indigo-600 text-white'
                }`}
              >
                {activeOrderCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => onTabChange('catalog')}
            className={`py-2 px-3.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentTab === 'catalog'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.02]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Catálogo & Stock (100)</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('history')}
            className={`py-2 px-3.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentTab === 'history'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.02]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Historial Clientes</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('profile')}
            className={`py-2 px-3.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentTab === 'profile'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-[1.02]'
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Perfil Emprendedor</span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange('client-view')}
            className={`py-2 px-3.5 sm:px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all whitespace-nowrap shrink-0 cursor-pointer ${
              currentTab === 'client-view'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200 scale-[1.02]'
                : 'text-emerald-700 hover:bg-emerald-50'
            }`}
            title="Ver cómo ve el cliente la tienda y pedir comida"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Vista Cliente</span>
          </button>
        </nav>

        {/* Right Scroll Button */}
        <button
          type="button"
          onClick={() => scrollNav('right')}
          className={`p-1.5 bg-white hover:bg-indigo-50 border border-gray-200 rounded-xl text-gray-600 shadow-xs transition-all shrink-0 cursor-pointer ${
            canScrollRight ? 'opacity-100' : 'opacity-40 pointer-events-none'
          }`}
          title="Desplazar a la derecha"
          aria-label="Desplazar a la derecha"
        >
          <ChevronRight className="w-4 h-4 text-indigo-700" />
        </button>
      </div>
    </header>
  );
};
