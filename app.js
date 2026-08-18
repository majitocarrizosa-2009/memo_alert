/**
 * ==========================================================
 * MEMO ALERT - JAVASCRIPT PRINCIPAL (app.js)
 * Sistema de Gestión de Pedidos, Cocina & Perfil Emprendedor
 * ==========================================================
 */

// Estado global de la aplicación
const AppState = {
  config: {
    businessName: 'Memo Comidas Caseras',
    tagline: 'Comida con amor, entregada a tiempo sin olvidos',
    ownerName: 'Guillermo "Don Memo" Ramírez',
    ownerRole: 'Chef Fundador & Maestro Cocinero',
    ownerBio: 'Emprendedor gastronómico apasionado por la cocina tradicional casera desde hace más de 8 años. Preparamos cada platillo al momento con ingredientes frescos, recetas familiares y el compromiso de que ningún cliente sufra retrasos ni olvidos.',
    ownerAvatar: '👨‍🍳',
    experienceYears: 8,
    email: 'donmemo.pedidos@gmail.com',
    phone: '+506 8888-1234',
    address: 'Av. Central #45, Barrio El Carmen',
    currency: '$',
    socialInstagram: '@MemoComidasCaseras',
    socialFacebook: 'Memo Comidas Caseras Oficial',
    businessHours: 'Lunes a Sábado: 11:00 AM - 10:00 PM | Domingos: 11:30 AM - 8:00 PM',
    kitchenStatus: 'open',
    soundEnabled: true,
    voiceEnabled: true,
    audioVolume: 0.9,
    pinCode: '1234',
    biometricEnabled: true,
    whatsappGreeting: '¡Hola! Muchas gracias por preferir Memo Comidas Caseras. Hemos recibido tu pedido con éxito y ya está en cocina.',
    whatsappDispatch: '¡Buenas noticias! Tu pedido va en camino calientito con nuestro repartidor a tu dirección.',
    whatsappCompleted: '¡Tu pedido ha sido entregado! Esperamos que lo disfrutes muchísimo. ¡Buen provecho y gracias por apoyar nuestro emprendimiento!'
  },
  products: [
    { id: 1, name: 'Casado Tradicional con Carne Mechada', category: 'Platos Fuertes', price: 6.50, stock: 100, imageIcon: '🍛', description: 'Arroz, frijoles, plátano maduro, ensalada y carne en salsa.' },
    { id: 2, name: 'Arroz con Pollo a la Criolla', category: 'Platos Fuertes', price: 5.50, stock: 100, imageIcon: '🍗', description: 'Arroz desgranado con pechuga desmenuzada y vegetales.' },
    { id: 3, name: 'Sopa de Res con Verduras', category: 'Sopas & Caldos', price: 5.00, stock: 100, imageIcon: '🍲', description: 'Caldo sustancioso con costilla, yuca y plátano verde.' },
    { id: 4, name: 'Hamburguesa Casera Especial Don Memo', category: 'Comidas Rápidas', price: 4.75, stock: 100, imageIcon: '🍔', description: 'Carne 100% res con queso cheddar derretido y salsa secreta.' },
    { id: 5, name: 'Tacos Crujientes de Pollo (3 uds)', category: 'Antojos', price: 3.50, stock: 100, imageIcon: '🌮', description: 'Tortillas de maíz fritas con repollo fresco y salsa.' },
    { id: 6, name: 'Empanadas Caseras de Queso y Frijol', category: 'Antojos', price: 2.00, stock: 100, imageIcon: '🥟', description: 'Masa de maíz crujiente rellena de queso y frijoles.' },
    { id: 7, name: 'Fresco Natural de Frutas Mixtas (500ml)', category: 'Bebidas', price: 1.50, stock: 100, imageIcon: '🥤', description: 'Bebida natural de frutas de temporada bien fría.' },
    { id: 8, name: 'Café Chorreado Tradicional', category: 'Bebidas', price: 1.25, stock: 100, imageIcon: '☕', description: 'Café colado en bolsa tradicional.' }
  ],
  orders: [
    {
      id: 1,
      orderNumber: 101,
      customerName: 'Carlos Alvarado',
      customerPhone: '+506 7011-2233',
      customerAddress: 'Calle 4, Casa #12, Portón Negro',
      totalAmount: 13.00,
      paymentMethod: 'efectivo',
      status: 'recibido',
      createdAt: new Date(Date.now() - 3 * 60000).toISOString(),
      items: [{ productName: 'Casado Tradicional con Carne Mechada', quantity: 2, unitPrice: 6.50 }]
    },
    {
      id: 2,
      orderNumber: 102,
      customerName: 'María Fernández',
      customerPhone: '+506 8344-5566',
      customerAddress: 'Barrio San José, Condominio Los Laureles Casa 8',
      totalAmount: 10.25,
      paymentMethod: 'transferencia',
      status: 'pendiente',
      createdAt: new Date(Date.now() - 12 * 60000).toISOString(),
      items: [{ productName: 'Hamburguesa Casera Especial Don Memo', quantity: 1, unitPrice: 4.75 }, { productName: 'Arroz con Pollo a la Criolla', quantity: 1, unitPrice: 5.50 }]
    }
  ],
  cart: [],
  currentTab: 'dashboard',
  isLocked: false,
  pinEntered: ''
};

// ==========================================
// 1. SISTEMA DE AUDIO Y VOZ (SINTETIZADO)
// ==========================================
const AudioEngine = {
  playBellSound() {
    if (!AppState.config.soundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.15); // A6
      
      gain.gain.setValueAtTime(AppState.config.audioVolume || 0.8, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.warn('Audio Context no disponible aún:', e);
    }
  },

  speakAlert(text) {
    if (!AppState.config.voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      utterance.volume = AppState.config.audioVolume || 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
    }
  }
};

// ==========================================
// 2. INICIALIZACIÓN Y CARGA DE DATOS (API / LOCAL)
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  renderApp();
  setupEventListeners();

  // Reloj en tiempo real
  setInterval(updateClock, 1000);
  updateClock();

  // Alarma automática en segundo plano:
  // 1. Suena de inmediato cada vez que entra un pedido
  // 2. Si pasan 30 minutos sin mandarlo a cocinar, vuelve a sonar automáticamente sin tocar ningún botón
  const alerted30MinOrders = {};
  setInterval(() => {
    const now = Date.now();
    const recibidos = AppState.orders.filter(o => o.status === 'recibido');

    recibidos.forEach(order => {
      const orderTime = new Date(order.createdAt).getTime();
      const elapsedMinutes = (now - orderTime) / (1000 * 60);
      const intervalSlot = Math.floor(elapsedMinutes / 30);

      const lastAlerted = alerted30MinOrders[order.id] || 0;
      if (intervalSlot >= 1 && intervalSlot > lastAlerted) {
        alerted30MinOrders[order.id] = intervalSlot;
        AudioEngine.playBellSound();
        const mins = Math.floor(elapsedMinutes);
        AudioEngine.speakAlert(`¡Atención Don Memo! El pedido número ${order.orderNumber} para ${order.customerName} lleva ${mins} minutos en espera y aún no ha sido mandado a cocinar. Por favor pásalo a la cocina.`);
      }
    });
    // Si ya los mandaron a cocinar (están en 'pendiente', 'en_camino' o 'entregado'), NO vuelve a sonar.
  }, 15000); // Monitorea cada 15 segundos automáticamente
});

function loadData() {
  const savedConfig = localStorage.getItem('memo_config');
  if (savedConfig) {
    AppState.config = { ...AppState.config, ...JSON.parse(savedConfig) };
  }
  const savedProducts = localStorage.getItem('memo_products');
  if (savedProducts) {
    AppState.products = JSON.parse(savedProducts);
  }
  const savedOrders = localStorage.getItem('memo_orders');
  if (savedOrders) {
    AppState.orders = JSON.parse(savedOrders);
  }
}

function saveData() {
  localStorage.setItem('memo_config', JSON.stringify(AppState.config));
  localStorage.setItem('memo_products', JSON.stringify(AppState.products));
  localStorage.setItem('memo_orders', JSON.stringify(AppState.orders));
}

function updateClock() {
  const clockEl = document.getElementById('live-clock');
  if (clockEl) {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('es-CR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
}

// ==========================================
// 3. RENDERIZADO DE PANTALLAS
// ==========================================
function renderApp() {
  renderHeader();
  renderNavigation();

  const container = document.getElementById('tab-content');
  if (!container) return;

  switch (AppState.currentTab) {
    case 'dashboard':
      container.innerHTML = renderDashboardHTML();
      break;
    case 'catalog':
      container.innerHTML = renderCatalogHTML();
      break;
    case 'profile':
      container.innerHTML = renderProfileHTML();
      break;
    case 'history':
      container.innerHTML = renderHistoryHTML();
      break;
    case 'client-view':
      container.innerHTML = renderClientMenuHTML();
      break;
  }
}

function renderHeader() {
  const brandTitle = document.getElementById('header-brand-title');
  const brandTagline = document.getElementById('header-brand-tagline');
  const brandAvatar = document.getElementById('header-brand-avatar');

  if (brandTitle) brandTitle.textContent = AppState.config.businessName;
  if (brandTagline) brandTagline.textContent = AppState.config.tagline;
  if (brandAvatar) brandAvatar.textContent = AppState.config.ownerAvatar || '👨‍🍳';
}

function renderNavigation() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === AppState.currentTab);
  });
}

// ==========================================
// 4. VISTA: TABLERO KANBAN DE COCINA
// ==========================================
function renderDashboardHTML() {
  const recibidos = AppState.orders.filter(o => o.status === 'recibido');
  const pendientes = AppState.orders.filter(o => o.status === 'pendiente');
  const camino = AppState.orders.filter(o => o.status === 'en_camino');

  return `
    <div class="flex items-center justify-between">
      <div>
        <h2 style="font-size: 22px; font-weight: 800; color: #0f172a;">Control de Cocina & Pedidos</h2>
        <p style="font-size: 13px; color: #64748b;">Supervisa cada pedido en tiempo real sin olvidar nada.</p>
      </div>
      <button class="btn btn-primary" onclick="simulateNewOrder()">
        🔔 Simular Pedido Nuevo
      </button>
    </div>

    <div class="kanban-grid">
      <!-- 1. Recibidos -->
      <div class="kanban-col">
        <div class="kanban-col-header recibidos">
          <div class="flex items-center gap-2">
            <span style="font-size: 18px;">🔔</span>
            <strong style="font-size: 14px;">1. Nuevos Recibidos (${recibidos.length})</strong>
          </div>
          <span class="badge badge-danger">Alerta Activa</span>
        </div>
        <div class="kanban-col-body">
          ${recibidos.length === 0 ? '<p style="text-align:center; color:#94a3b8; padding:30px 0; font-size:13px;">No hay pedidos nuevos por aceptar</p>' : ''}
          ${recibidos.map(o => renderOrderCard(o, 'recibido')).join('')}
        </div>
      </div>

      <!-- 2. En Cocina -->
      <div class="kanban-col">
        <div class="kanban-col-header cocina">
          <div class="flex items-center gap-2">
            <span style="font-size: 18px;">👨‍🍳</span>
            <strong style="font-size: 14px;">2. En Cocina / Preparando (${pendientes.length})</strong>
          </div>
          <span class="badge badge-warning">En Proceso</span>
        </div>
        <div class="kanban-col-body">
          ${pendientes.length === 0 ? '<p style="text-align:center; color:#94a3b8; padding:30px 0; font-size:13px;">La cocina está al día</p>' : ''}
          ${pendientes.map(o => renderOrderCard(o, 'pendiente')).join('')}
        </div>
      </div>

      <!-- 3. En Camino -->
      <div class="kanban-col">
        <div class="kanban-col-header camino">
          <div class="flex items-center gap-2">
            <span style="font-size: 18px;">🛵</span>
            <strong style="font-size: 14px;">3. Con Repartidor (${camino.length})</strong>
          </div>
          <span class="badge badge-primary">En Ruta</span>
        </div>
        <div class="kanban-col-body">
          ${camino.length === 0 ? '<p style="text-align:center; color:#94a3b8; padding:30px 0; font-size:13px;">No hay pedidos en reparto</p>' : ''}
          ${camino.map(o => renderOrderCard(o, 'en_camino')).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderOrderCard(order, colType) {
  const isUrgent = colType === 'recibido';
  return `
    <div class="order-card ${isUrgent ? 'urgent' : ''}">
      <div class="order-card-top">
        <span class="order-number">#${order.orderNumber}</span>
        <span class="order-time">${new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <div class="customer-box">
        <div class="customer-name">${order.customerName}</div>
        <div class="customer-details">📞 ${order.customerPhone}</div>
        <div class="customer-details">📍 ${order.customerAddress}</div>
      </div>

      <ul class="order-items-list">
        ${order.items.map(it => `
          <li class="order-item-row">
            <span><span class="order-item-qty">${it.quantity}x</span> ${it.productName}</span>
            <span style="font-weight:700;">${AppState.config.currency}${(it.quantity * it.unitPrice).toFixed(2)}</span>
          </li>
        `).join('')}
      </ul>

      <div class="order-footer">
        <div>
          <span style="font-size:11px; color:#64748b; display:block;">Total a Cobrar</span>
          <span class="order-total">${AppState.config.currency}${order.totalAmount.toFixed(2)}</span>
        </div>

        <div class="flex gap-2">
          ${colType === 'recibido' ? `
            <button class="btn btn-success btn-sm" onclick="advanceOrderStatus(${order.id}, 'pendiente')">
              🍳 Aceptar en Cocina
            </button>
          ` : ''}

          ${colType === 'pendiente' ? (() => {
            const prepMin = order.totalPrepMinutes || 15;
            const started = new Date(order.startedPrepAt || order.createdAt).getTime();
            const elapsedSec = Math.max(0, Math.floor((Date.now() - started) / 1000));
            const remSec = Math.max(0, (prepMin * 60) - elapsedSec);
            const isCooked = remSec <= 0;
            if (isCooked) {
              return `
                <button class="btn btn-primary btn-sm" onclick="advanceOrderStatus(${order.id}, 'en_camino')">
                  🛵 ¡Listo! Despachar
                </button>
              `;
            } else {
              const remMins = Math.floor(remSec / 60);
              const remS = String(remSec % 60).padStart(2, '0');
              return `
                <button class="btn btn-sm" disabled style="background:#e2e8f0; color:#64748b; border:1px solid #cbd5e1; cursor:not-allowed;" title="Inhabilitado mientras se cocina">
                  🔒 En Cocción (${remMins}:${remS})
                </button>
              `;
            }
          })() : ''}

          ${colType === 'en_camino' ? (() => {
            const deliveryMin = order.estimatedDeliveryMinutes || 20;
            const dispatched = new Date(order.dispatchedAt || order.createdAt).getTime();
            const elapsedSec = Math.max(0, Math.floor((Date.now() - dispatched) / 1000));
            const remSec = Math.max(0, (deliveryMin * 60) - elapsedSec);
            const isArrived = remSec <= 0;
            if (isArrived) {
              return `
                <button class="btn btn-success btn-sm" onclick="advanceOrderStatus(${order.id}, 'entregado')">
                  ✅ ¡Llegó al Destino! Entregado
                </button>
              `;
            } else {
              const remMins = Math.floor(remSec / 60);
              const remS = String(remSec % 60).padStart(2, '0');
              return `
                <button class="btn btn-sm" disabled style="background:#e2e8f0; color:#64748b; border:1px solid #cbd5e1; cursor:not-allowed;" title="Inhabilitado mientras el repartidor viaja">
                  🔒 En Ruta (${remMins}:${remS})
                </button>
              `;
            }
          })() : ''}
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 5. VISTA: PERFIL DEL EMPRENDEDOR
// ==========================================
function renderProfileHTML() {
  const c = AppState.config;
  const totalVentas = AppState.orders.reduce((acc, o) => acc + (o.status !== 'cancelado' ? o.totalAmount : 0), 0);

  return `
    <div class="profile-hero">
      <div class="profile-header">
        <div class="profile-main-info">
          <div class="profile-avatar-lg">${c.ownerAvatar || '👨‍🍳'}</div>
          <div>
            <div class="flex items-center gap-2">
              <h2 style="font-size: 24px; font-weight: 800; color: #0f172a;">${c.ownerName}</h2>
              <span class="badge badge-success">🛡️ Emprendedor Verificado</span>
            </div>
            <p style="color: var(--primary); font-weight: 700; font-size: 14px;">${c.ownerRole} &bull; ${c.businessName}</p>
            <p style="color: #64748b; font-size: 13px; margin-top: 4px;">📍 ${c.address} | 📞 ${c.phone} | ⏱️ ${c.experienceYears} años de sazón</p>
          </div>
        </div>

        <button class="btn btn-primary" onclick="openProfileModal()">
          ✏️ Editar Perfil & Negocio
        </button>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-title">Total Pedidos</div>
          <div class="stat-value">${AppState.orders.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Ventas Registradas</div>
          <div class="stat-value">${c.currency}${totalVentas.toFixed(2)}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Platillos en Carta</div>
          <div class="stat-value">${AppState.products.length}</div>
        </div>
        <div class="stat-card">
          <div class="stat-title">Capacidad Diaria</div>
          <div class="stat-value">100 por plato</div>
        </div>
      </div>

      <div style="background: #f8fafc; padding: 20px; border-radius: 14px; border: 1px solid #e2e8f0; margin-top: 10px;">
        <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; margin-bottom: 8px;">Historia & Compromiso de Don Memo</h3>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">${c.ownerBio}</p>
      </div>

      <div style="background: #f0fdf4; padding: 20px; border-radius: 14px; border: 1px solid #bbf7d0; margin-top: 15px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px;">
        <div>
          <h4 style="font-size: 15px; font-weight: 800; color: #166534;">🔒 Seguridad & Credenciales del Emprendedor</h4>
          <p style="font-size: 13px; color: #15803d; margin-top: 2px;">
            PIN de acceso configurado: <strong>•••• (${c.pinCode ? c.pinCode.length : 4} dígitos)</strong> | 
            Huella Biométrica: <strong>${c.biometricsEnabled ? '✅ Activada' : '❌ Desactivada'}</strong>
          </p>
        </div>
        <button class="btn btn-primary btn-sm" onclick="openProfileModal()">
          🔑 Cambiar Clave / Huella
        </button>
      </div>
    </div>
  `;
}

// ==========================================
// 6. VISTA: CATÁLOGO Y STOCK DIARIO (100)
// ==========================================
function renderCatalogHTML() {
  return `
    <div class="flex items-center justify-between">
      <div>
        <h2 style="font-size: 22px; font-weight: 800; color: #0f172a;">Catálogo de Platillos & Inventario</h2>
        <p style="font-size: 13px; color: #64748b;">Control de raciones diarias (100 unidades iniciales por platillo).</p>
      </div>
      <button class="btn btn-outline" onclick="resetDailyStock()">
        🔄 Restablecer 100 Raciones Hoy
      </button>
    </div>

    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 20px;">
      ${AppState.products.map(p => `
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 18px;">
          <div class="flex justify-between items-start">
            <span style="font-size: 32px;">${p.imageIcon || '🍽️'}</span>
            <span class="badge ${p.stock > 20 ? 'badge-success' : 'badge-danger'}">Stock: ${p.stock} / 100</span>
          </div>
          <h3 style="font-size: 15px; font-weight: 800; color: #0f172a; margin-top: 10px;">${p.name}</h3>
          <p style="font-size: 12px; color: #64748b; min-height: 36px; margin-top: 4px;">${p.description}</p>
          <div class="flex justify-between items-center" style="margin-top: 14px; border-top: 1px solid #f1f5f9; padding-top: 10px;">
            <span style="font-size: 18px; font-weight: 800; color: var(--primary);">${AppState.config.currency}${p.price.toFixed(2)}</span>
            <span style="font-size: 12px; color: #94a3b8;">${p.category}</span>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

// ==========================================
// 7. VISTA: CARTA DIGITAL CLIENTES & CARRITO
// ==========================================
function renderClientMenuHTML() {
  return `
    <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 24px; text-align: center; margin-bottom: 20px;">
      <span style="font-size: 48px;">${AppState.config.ownerAvatar || '👨‍🍳'}</span>
      <h2 style="font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 6px;">${AppState.config.businessName}</h2>
      <p style="color: #64748b; font-size: 14px;">${AppState.config.tagline}</p>
    </div>

    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px;">
        ${AppState.products.map(p => `
          <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 32px; margin-bottom: 8px;">${p.imageIcon}</div>
              <h4 style="font-size: 15px; font-weight: 800; color: #0f172a;">${p.name}</h4>
              <p style="font-size: 12px; color: #64748b; margin-top: 4px;">${p.description}</p>
            </div>
            <div class="flex justify-between items-center" style="margin-top: 14px;">
              <strong style="font-size: 16px; color: var(--primary);">${AppState.config.currency}${p.price.toFixed(2)}</strong>
              <button class="btn btn-primary btn-sm" onclick="addToCart(${p.id})">
                + Agregar
              </button>
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Carrito -->
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 20px; padding: 20px; height: fit-content;">
        <h3 style="font-size: 16px; font-weight: 800; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 10px;">
          🛒 Tu Pedido Actual
        </h3>
        <div id="cart-items-container" style="margin: 14px 0;">
          ${AppState.cart.length === 0 ? '<p style="color: #94a3b8; font-size: 13px; text-align: center; padding: 20px 0;">El carrito está vacío</p>' : ''}
          ${AppState.cart.map(c => `
            <div class="flex justify-between items-center" style="margin-bottom: 8px; font-size: 13px;">
              <span>${c.quantity}x ${c.name}</span>
              <strong>${AppState.config.currency}${(c.quantity * c.price).toFixed(2)}</strong>
            </div>
          `).join('')}
        </div>
        ${AppState.cart.length > 0 ? `
          <button class="btn btn-success w-full mt-4" onclick="openCheckoutModal()">
            Confirmar Pedido & Enviar
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

// ==========================================
// 8. ACCIONES Y CONTROLADORES
// ==========================================
function switchTab(tab) {
  AppState.currentTab = tab;
  renderApp();
}

function addToCart(productId) {
  const p = AppState.products.find(x => x.id === productId);
  if (!p || p.stock <= 0) {
    alert('Platillo agotado por hoy');
    return;
  }
  const inCart = AppState.cart.find(x => x.id === productId);
  if (inCart) {
    inCart.quantity++;
  } else {
    AppState.cart.push({ id: p.id, name: p.name, price: p.price, quantity: 1 });
  }
  renderApp();
}

function advanceOrderStatus(orderId, newStatus) {
  const order = AppState.orders.find(o => o.id === orderId);
  if (!order) return;
  order.status = newStatus;
  if (newStatus === 'pendiente') {
    order.startedPrepAt = new Date().toISOString();
  } else if (newStatus === 'en_camino') {
    order.dispatchedAt = new Date().toISOString();
  }
  saveData();
  renderApp();

  if (newStatus === 'pendiente') {
    AudioEngine.speakAlert(`Pedido número ${order.orderNumber} aceptado en cocina.`);
  } else if (newStatus === 'en_camino') {
    AudioEngine.speakAlert(`Pedido ${order.orderNumber} despachado en camino.`);
  }
}

function simulateNewOrder() {
  const nextNum = AppState.orders.length ? Math.max(...AppState.orders.map(o => o.orderNumber)) + 1 : 101;
  const sampleProducts = [AppState.products[0], AppState.products[3]];
  
  const newOrder = {
    id: Date.now(),
    orderNumber: nextNum,
    customerName: 'Cliente ' + nextNum,
    customerPhone: '+506 8899-' + Math.floor(1000 + Math.random() * 9000),
    customerAddress: 'Avenida ' + Math.floor(1 + Math.random() * 15) + ', Casa ' + Math.floor(10 + Math.random() * 50),
    totalAmount: sampleProducts.reduce((acc, p) => acc + p.price, 0),
    paymentMethod: 'efectivo',
    status: 'recibido',
    createdAt: new Date().toISOString(),
    items: sampleProducts.map(p => ({ productName: p.name, quantity: 1, unitPrice: p.price }))
  };

  AppState.orders.unshift(newOrder);
  saveData();
  renderApp();

  AudioEngine.playBellSound();
  AudioEngine.speakAlert(`¡Atención cocina! Nuevo pedido número ${nextNum} recibido.`);
}

function resetDailyStock() {
  if (confirm('¿Restablecer el inventario a 100 raciones por cada platillo?')) {
    AppState.products.forEach(p => p.stock = 100);
    saveData();
    renderApp();
    alert('¡Inventario restablecido con éxito a 100 raciones!');
  }
}

function setupEventListeners() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', (e) => {
      switchTab(tab.dataset.tab);
    });
  });
}
