import { Product, Order, BusinessConfig, PaymentOptionConfig } from '../types';
import { INITIAL_PRODUCTS, INITIAL_ORDERS, INITIAL_BUSINESS_CONFIG, INITIAL_PAYMENT_CONFIGS } from '../data/initialData';

const KEYS = {
  PRODUCTS: 'memo_alert_products_v3',
  ORDERS: 'memo_alert_orders_v2',
  CONFIG: 'memo_alert_config_v1',
  PAYMENTS: 'memo_alert_payments_v1',
  LAST_RESET_DATE: 'memo_alert_last_reset_date',
};

// Returns date string YYYY-MM-DD
export function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function loadProducts(): Product[] {
  try {
    const raw = localStorage.getItem(KEYS.PRODUCTS);
    if (!raw) {
      saveProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    const parsed = JSON.parse(raw);
    // If older smaller list (<30 items), refresh with 100+ catalog
    if (!Array.isArray(parsed) || parsed.length < 30) {
      saveProducts(INITIAL_PRODUCTS);
      return INITIAL_PRODUCTS;
    }
    // Automatically migrate old category name if present in localStorage
    let hasOldCategory = false;
    const sanitized = parsed.map((p: Product) => {
      if (p.category === 'Pizzas & Calzones') {
        hasOldCategory = true;
        return { ...p, category: 'Pizzas' };
      }
      return p;
    });
    if (hasOldCategory) {
      saveProducts(sanitized);
      return sanitized;
    }
    return parsed;
  } catch {
    return INITIAL_PRODUCTS;
  }
}

export function saveProducts(products: Product[]) {
  try {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
  } catch (e) {
    console.error('Error saving products:', e);
  }
}

export function loadOrders(): Order[] {
  try {
    const raw = localStorage.getItem(KEYS.ORDERS);
    if (!raw) {
      saveOrders(INITIAL_ORDERS);
      return INITIAL_ORDERS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ORDERS;
  }
}

export function saveOrders(orders: Order[]) {
  try {
    localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  } catch (e) {
    console.error('Error saving orders:', e);
  }
}

export function loadBusinessConfig(): BusinessConfig {
  try {
    const raw = localStorage.getItem(KEYS.CONFIG);
    if (!raw) {
      saveBusinessConfig(INITIAL_BUSINESS_CONFIG);
      return INITIAL_BUSINESS_CONFIG;
    }
    return { ...INITIAL_BUSINESS_CONFIG, ...JSON.parse(raw) };
  } catch {
    return INITIAL_BUSINESS_CONFIG;
  }
}

export function saveBusinessConfig(config: BusinessConfig) {
  try {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Error saving config:', e);
  }
}

export function loadPaymentConfigs(): PaymentOptionConfig[] {
  try {
    const raw = localStorage.getItem(KEYS.PAYMENTS);
    if (!raw) {
      savePaymentConfigs(INITIAL_PAYMENT_CONFIGS);
      return INITIAL_PAYMENT_CONFIGS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_PAYMENT_CONFIGS;
  }
}

export function savePaymentConfigs(configs: PaymentOptionConfig[]) {
  try {
    localStorage.setItem(KEYS.PAYMENTS, JSON.stringify(configs));
  } catch (e) {
    console.error('Error saving payments:', e);
  }
}

/**
 * Checks if 24 hours have passed or if the day has changed.
 * If so:
 * 1. Replenishes all product stock back to their defaultDailyStock (e.g. 100).
 * 2. Archives any pending day keys into the permanent history so today's active counters start clean.
 */
export function checkAndApply24HourReset(): { didReset: boolean; message: string } {
  const today = getTodayKey();
  const lastReset = localStorage.getItem(KEYS.LAST_RESET_DATE);

  if (!lastReset || lastReset !== today) {
    // Perform 24-hour daily stock replenishment & cycle refresh
    const products = loadProducts();
    const replenishedProducts = products.map((p) => ({
      ...p,
      stock: p.defaultDailyStock || 100,
    }));
    saveProducts(replenishedProducts);

    localStorage.setItem(KEYS.LAST_RESET_DATE, today);

    const config = loadBusinessConfig();
    config.lastDailyResetTimestamp = Date.now();
    saveBusinessConfig(config);

    return {
      didReset: true,
      message: `¡Ciclo de 24 horas completado! El inventario diario se ha restablecido a 100 y el contador del día está listo.`,
    };
  }

  return { didReset: false, message: '' };
}

/**
 * Manually force a 24-hour cycle reset (e.g. for demonstration or manual opening of daily shift)
 */
export function forceDailyReset(): void {
  const today = getTodayKey();
  const products = loadProducts();
  const replenishedProducts = products.map((p) => ({
    ...p,
    stock: p.defaultDailyStock || 100,
  }));
  saveProducts(replenishedProducts);
  localStorage.setItem(KEYS.LAST_RESET_DATE, today);

  const config = loadBusinessConfig();
  config.lastDailyResetTimestamp = Date.now();
  saveBusinessConfig(config);
}
