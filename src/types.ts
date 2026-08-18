export type OrderStatus = 'recibido' | 'pendiente' | 'en_camino' | 'entregado' | 'cancelado';

export type PaymentType = 'efectivo' | 'transferencia' | 'tarjeta' | 'contra_entrega';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  preparationMinutes: number;
  notes?: string;
}

export interface CustomerInfo {
  name: string;
  phone: string;
  address: string;
  reference?: string;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  customer: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: PaymentType;
  paymentDetails?: string;
  status: OrderStatus;
  createdAt: string; // ISO string
  startedPrepAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  totalPrepMinutes: number;
  estimatedDeliveryMinutes?: number;
  isUrgent?: boolean;
  viewedByOwner: boolean;
  dayKey: string; // YYYY-MM-DD for daily aggregation & 24h reset
}

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  preparationMinutes: number;
  stock: number;
  defaultDailyStock: number;
  imageIcon: string; // Lucide icon or food emoji
  imageUrl?: string; // High-resolution photo URL
  isActive: boolean;
}

export interface PaymentOptionConfig {
  id: PaymentType;
  name: string;
  enabled: boolean;
  instructions: string; // e.g. "Transferir a cuenta IBAN / Sinpe / Zelle"
}

export interface BusinessConfig {
  businessName: string;
  tagline: string;
  ownerName: string;
  ownerRole?: string;
  ownerBio?: string;
  ownerAvatar?: string;
  experienceYears?: number;
  email?: string;
  socialInstagram?: string;
  socialFacebook?: string;
  businessHours?: string;
  kitchenStatus?: 'open' | 'busy' | 'closed';
  whatsappGreeting?: string;
  whatsappDispatch?: string;
  whatsappCompleted?: string;
  phone: string;
  address: string;
  currency: string;
  pinCode: string; // Default '1234'
  biometricsEnabled: boolean;
  audioAlertsEnabled: boolean;
  voiceReadoutEnabled: boolean;
  alertIntervalMinutes: number; // e.g. every 5 minutes repeat alert for unhandled orders
  defaultDailyStock: number; // e.g. 100
  lastDailyResetTimestamp: number;
  fontSizePreference: 'normal' | 'large' | 'extra-large';
  highContrast: boolean;
}
