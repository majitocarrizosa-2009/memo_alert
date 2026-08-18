import React, { useState, useMemo } from 'react';
import {
  Utensils,
  Plus,
  Edit2,
  Trash2,
  Clock,
  RefreshCw,
  X,
  Search,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, BusinessConfig } from '../types';
import { soundAlert } from '../utils/audioAlerts';

interface CatalogManagerProps {
  products: Product[];
  onUpdateProducts: (updatedProducts: Product[]) => void;
  config: BusinessConfig;
}

const FOOD_ICONS = ['🍔', '🥟', '🍕', '🍲', '🌮', '🥤', '🍰', '☕', '🍗', '🥪', '🥗', '🍩', '🍨', '🍳', '🥞', '🍣', '🌭', '🍟', '🍱', '🍜'];

const CATEGORIES_LIST = [
  'Platos Fuertes & Casados',
  'Comidas Rápidas',
  'Pizzas',
  'Tacos & Antojos Latinos',
  'Sopas & Caldos',
  'Entradas & Bocadillos',
  'Bebidas Naturales',
  'Cafetería & Calientes',
  'Refrescos & Gaseosas',
  'Postres & Dulces',
  'Especiales',
];

export const CatalogManager: React.FC<CatalogManagerProps> = ({
  products,
  onUpdateProducts,
  config,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [macroTab, setMacroTab] = useState<'todos' | 'comidas' | 'bebidas' | 'postres'>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Comidas Rápidas');
  const [price, setPrice] = useState('5.00');
  const [prepMinutes, setPrepMinutes] = useState('15');
  const [stock, setStock] = useState('100');
  const [defaultStock, setDefaultStock] = useState('100');
  const [imageIcon, setImageIcon] = useState('🍔');
  const [imageUrl, setImageUrl] = useState('');

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

  const comidasCount = products.filter((p) => getProductMacro(p.category) === 'comidas').length;
  const bebidasCount = products.filter((p) => getProductMacro(p.category) === 'bebidas').length;
  const postresCount = products.filter((p) => getProductMacro(p.category) === 'postres').length;

  const availableCategories = useMemo(() => {
    const activeProducts = products.filter((p) => {
      if (macroTab !== 'todos' && getProductMacro(p.category) !== macroTab) return false;
      return true;
    });
    const uniqueCats = Array.from(new Set(activeProducts.map((p) => p.category)));
    return ['Todos', ...uniqueCats];
  }, [products, macroTab]);

  const filteredProducts = products.filter((p) => {
    if (macroTab !== 'todos' && getProductMacro(p.category) !== macroTab) return false;
    if (selectedCategory !== 'Todos' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const openNewProductModal = () => {
    setEditingProduct(null);
    setName('');
    setDescription('');
    setCategory('Comidas Rápidas');
    setPrice('5.00');
    setPrepMinutes('15');
    setStock(String(config.defaultDailyStock || 100));
    setDefaultStock(String(config.defaultDailyStock || 100));
    setImageIcon('🍔');
    setImageUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setName(prod.name);
    setDescription(prod.description);
    setCategory(prod.category);
    setPrice(String(prod.price));
    setPrepMinutes(String(prod.preparationMinutes));
    setStock(String(prod.stock));
    setDefaultStock(String(prod.defaultDailyStock || 100));
    setImageIcon(prod.imageIcon || '🍔');
    setImageUrl(prod.imageUrl || '');
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor ingresa el nombre del platillo.');
      return;
    }

    const priceNum = Math.max(0.1, parseFloat(price) || 1);
    const prepNum = Math.max(1, parseInt(prepMinutes, 10) || 10);
    const stockNum = Math.max(0, parseInt(stock, 10) || 0);
    const defStockNum = Math.max(1, parseInt(defaultStock, 10) || 100);

    if (editingProduct) {
      // Update existing
      const updated = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              name: name.trim(),
              description: description.trim(),
              category: category.trim(),
              price: priceNum,
              preparationMinutes: prepNum,
              stock: stockNum,
              defaultDailyStock: defStockNum,
              imageIcon,
              imageUrl: imageUrl.trim() || undefined,
            }
          : p
      );
      onUpdateProducts(updated);
      soundAlert.speakText(`Platillo ${name} actualizado correctamente.`);
    } else {
      // Create new
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: name.trim(),
        description: description.trim(),
        category: category.trim(),
        price: priceNum,
        preparationMinutes: prepNum,
        stock: stockNum,
        defaultDailyStock: defStockNum,
        imageIcon,
        imageUrl: imageUrl.trim() || undefined,
        isActive: true,
      };
      onUpdateProducts([...products, newProd]);
      soundAlert.speakText(`Nuevo platillo ${name} agregado al menú.`);
    }

    soundAlert.playReadyChime();
    setIsModalOpen(false);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`¿Estás seguro de eliminar el platillo "${productName}" del catálogo?`)) {
      const filtered = products.filter((p) => p.id !== productId);
      onUpdateProducts(filtered);
      soundAlert.speakText(`Platillo ${productName} eliminado.`);
    }
  };

  const handleRestockAllToDefault = () => {
    if (
      window.confirm(
        '¿Deseas restablecer el inventario de TODOS los productos a su valor diario (100 unidades)?'
      )
    ) {
      const restocked = products.map((p) => ({
        ...p,
        stock: p.defaultDailyStock || 100,
      }));
      onUpdateProducts(restocked);
      soundAlert.speakText('Todos los productos han sido reabastecidos al 100% de stock.');
    }
  };

  const handleRestockSingle = (productId: string) => {
    const updated = products.map((p) =>
      p.id === productId ? { ...p, stock: p.defaultDailyStock || 100 } : p
    );
    onUpdateProducts(updated);
    const item = products.find((p) => p.id === productId);
    soundAlert.speakText(`Stock de ${item?.name || 'producto'} restaurado.`);
  };

  return (
    <div className="space-y-6">
      {/* Header with quick stats and actions */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-indigo-100">
              Gestión de Menú & Inventario
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1">
            Catálogo & Stock Diario ({config.defaultDailyStock || 100} U.)
          </h2>
          <p className="text-gray-500 text-sm mt-0.5">
            Administra tus {products.length} platillos con fotos grandes, tiempos de cocina y stock renovable cada 24 horas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRestockAllToDefault}
            className="py-2.5 px-4 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl font-bold text-xs sm:text-sm border border-emerald-200 flex items-center gap-2 transition-all cursor-pointer"
            title="Llenar a 100 todas las existencias"
          >
            <RefreshCw className="w-4 h-4 text-emerald-600" />
            <span>Resurtir Todo a {config.defaultDailyStock || 100}</span>
          </button>

          <button
            type="button"
            onClick={openNewProductModal}
            className="py-2.5 px-5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-indigo-200 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Agregar Nuevo Platillo</span>
          </button>
        </div>
      </div>

      {/* 3 Main Category Bars: Comidas, Bebidas, Postres */}
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
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-inner shrink-0 ${
                macroTab === 'comidas' ? 'bg-white/20 text-white' : 'bg-orange-100 text-orange-700'
              }`}
            >
              🍔
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Comidas</h3>
                {macroTab === 'comidas' && (
                  <span className="bg-white text-orange-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                    Activo
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] font-medium mt-0.5 line-clamp-1 ${
                  macroTab === 'comidas' ? 'text-white/90' : 'text-gray-500'
                }`}
              >
                Platos, rápidas, pizzas, tacos y sopas
              </p>
            </div>
          </div>
          <div
            className={`text-xs font-black px-2.5 py-1 rounded-xl whitespace-nowrap ml-2 ${
              macroTab === 'comidas' ? 'bg-white/25 text-white' : 'bg-orange-50 text-orange-800 border border-orange-200/60'
            }`}
          >
            {comidasCount}
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
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-inner shrink-0 ${
                macroTab === 'bebidas' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-700'
              }`}
            >
              🥤
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Bebidas</h3>
                {macroTab === 'bebidas' && (
                  <span className="bg-white text-blue-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                    Activo
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] font-medium mt-0.5 line-clamp-1 ${
                  macroTab === 'bebidas' ? 'text-white/90' : 'text-gray-500'
                }`}
              >
                Jugos, café especial y refrescos
              </p>
            </div>
          </div>
          <div
            className={`text-xs font-black px-2.5 py-1 rounded-xl whitespace-nowrap ml-2 ${
              macroTab === 'bebidas' ? 'bg-white/25 text-white' : 'bg-blue-50 text-blue-800 border border-blue-200/60'
            }`}
          >
            {bebidasCount}
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
              className={`w-11 h-11 rounded-2xl flex items-center justify-center text-xl shadow-inner shrink-0 ${
                macroTab === 'postres' ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-700'
              }`}
            >
              🍰
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">Postres</h3>
                {macroTab === 'postres' && (
                  <span className="bg-white text-pink-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full uppercase">
                    Activo
                  </span>
                )}
              </div>
              <p
                className={`text-[11px] font-medium mt-0.5 line-clamp-1 ${
                  macroTab === 'postres' ? 'text-white/90' : 'text-gray-500'
                }`}
              >
                Tortas, helados, flanes y dulces
              </p>
            </div>
          </div>
          <div
            className={`text-xs font-black px-2.5 py-1 rounded-xl whitespace-nowrap ml-2 ${
              macroTab === 'postres' ? 'bg-white/25 text-white' : 'bg-pink-50 text-pink-800 border border-pink-200/60'
            }`}
          >
            {postresCount}
          </div>
        </button>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-xs space-y-3">
        <div className="relative">
          <Search className="w-5 h-5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Buscar platillo por nombre, ingrediente o categoría..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 hover:bg-gray-100/70 focus:bg-white text-gray-900 placeholder-gray-400 rounded-xl border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 text-sm transition-all outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {macroTab !== 'todos' && (
            <button
              type="button"
              onClick={() => {
                setMacroTab('todos');
                setSelectedCategory('Todos');
              }}
              className="py-1.5 px-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center gap-1.5 shrink-0"
              title="Mostrar todo el catálogo"
            >
              <span>✨ Ver Todo ({products.length})</span>
            </button>
          )}

          {availableCategories.map((cat) => {
            const count =
              cat === 'Todos'
                ? products.filter((p) => {
                    if (macroTab !== 'todos' && getProductMacro(p.category) !== macroTab) return false;
                    return true;
                  }).length
                : products.filter((p) => p.category === cat).length;

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
                className={`py-1.5 px-3 rounded-xl font-bold text-xs whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === cat ? 'bg-white/20 text-white' : 'bg-white text-gray-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Products Grid with Large Images */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className="group bg-white rounded-3xl overflow-hidden border border-gray-200 hover:border-indigo-300 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Product Image Header */}
              <div className="relative h-44 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {prod.imageUrl ? (
                  <img
                    src={prod.imageUrl}
                    alt={prod.name}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : null}

                {/* Fallback Icon */}
                <div className="absolute inset-0 -z-10 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-orange-50 text-5xl">
                  <span>{prod.imageIcon || '🍽️'}</span>
                </div>

                {/* Top Badges */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
                  <span className="backdrop-blur-md bg-black/60 text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs flex items-center gap-1">
                    <span>{prod.imageIcon || '🍽️'}</span>
                    <span className="truncate max-w-[130px]">{prod.category}</span>
                  </span>
                  <span
                    className={`backdrop-blur-md text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs ${
                      prod.stock <= 0
                        ? 'bg-rose-600 text-white'
                        : prod.stock < 15
                        ? 'bg-amber-500 text-white animate-pulse'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    Stock: {prod.stock} / {prod.defaultDailyStock || 100}
                  </span>
                </div>
              </div>

              {/* Product Body */}
              <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 leading-snug group-hover:text-indigo-600 transition-colors">
                  {prod.name}
                </h3>
                <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed min-h-[34px]">
                  {prod.description}
                </p>

                {/* Cooking time & Price */}
                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" />
                    <span>Cocina: ~{prod.preparationMinutes} min</span>
                  </div>
                  <span className="text-xl font-black text-indigo-900">
                    {config.currency}{prod.price.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions for product */}
            <div className="p-5 pt-0 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => handleRestockSingle(prod.id)}
                className="py-2 px-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Llenar stock a 100"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>+{prod.defaultDailyStock || 100}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => openEditModal(prod)}
                  className="py-2 px-3.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 rounded-xl text-xs font-bold flex items-center gap-1.5 border border-indigo-200/50 transition-colors cursor-pointer"
                  title="Editar platillo"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Editar</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProduct(prod.id, prod.name)}
                  className="p-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200/50 transition-colors cursor-pointer"
                  title="Eliminar platillo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-200 my-8">
            <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <Utensils className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  {editingProduct ? 'Editar Platillo' : 'Nuevo Platillo para el Menú'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-gray-400 hover:text-gray-700 rounded-full cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Nombre del Platillo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Hamburguesa Especial de la Casa"
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 font-semibold text-gray-900 text-sm outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  URL de Imagen Grande (Foto)
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/photo-..."
                    className="w-full p-2.5 pr-10 rounded-xl border border-gray-300 focus:border-indigo-500 font-medium text-gray-800 text-xs outline-none"
                  />
                  <ImageIcon className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                {imageUrl ? (
                  <div className="mt-2 h-24 w-full rounded-xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center">
                    <img
                      src={imageUrl}
                      alt="Vista previa"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  </div>
                ) : null}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                  Descripción o Ingredientes
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ej: Carne artesanal, queso, lechuga, tomate y salsa especial..."
                  className="w-full p-2.5 rounded-xl border border-gray-300 focus:border-indigo-500 text-gray-800 text-sm outline-none"
                />
              </div>

              {/* Category & Emoji Icon */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold text-gray-900 text-sm bg-white"
                  >
                    {CATEGORIES_LIST.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Icono / Emoji: {imageIcon}
                  </label>
                  <div className="flex items-center gap-1.5 overflow-x-auto p-1 bg-gray-100 rounded-xl">
                    {FOOD_ICONS.slice(0, 8).map((ico) => (
                      <button
                        key={ico}
                        type="button"
                        onClick={() => setImageIcon(ico)}
                        className={`w-8 h-8 rounded-lg text-base flex items-center justify-center transition-all ${
                          imageIcon === ico ? 'bg-indigo-600 text-white shadow-sm' : 'hover:bg-white'
                        }`}
                      >
                        {ico}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Price, Preparation Minutes & Stock */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Precio ({config.currency})
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0.1"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-bold text-indigo-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Min. Cocina
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="180"
                    required
                    value={prepMinutes}
                    onChange={(e) => setPrepMinutes(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold text-gray-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-700 mb-1">
                    Stock Diario
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="1000"
                    required
                    value={stock}
                    onChange={(e) => {
                      setStock(e.target.value);
                      setDefaultStock(e.target.value);
                    }}
                    className="w-full p-2.5 rounded-xl border border-gray-300 font-semibold text-gray-900 text-sm"
                  />
                </div>
              </div>

              <div className="p-3 bg-indigo-50/70 rounded-xl border border-indigo-100 text-xs text-indigo-900">
                Cada vez que un cliente pida este platillo, el stock bajará automáticamente y se reabastecerá a {defaultStock} en el ciclo diario de 24 horas.
              </div>

              <div className="pt-3 border-t border-gray-200 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-1/3 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl text-sm cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-200 cursor-pointer"
                >
                  Guardar Platillo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
