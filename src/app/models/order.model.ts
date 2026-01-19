// models/order.model.ts - UPDATED VERSION
export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  cuisine?: string;
  ingredients?: string[];
  dietaryTags?: string[];
  spiceLevel?: string;
  calories?: number;
  imageUrl?: string;
  isAvailable?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface BasketItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export enum OrderStatus {
  PENDING = 'Pending',
  PREPARING = 'Preparing',
  READY = 'Ready',
  DELIVERING = 'Delivering',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

export interface Order {
  id: string;                    // Can be numeric ID or order number
  orderNumber?: string;          // ORD-xxxxx format
  tableNumber: string;
  items: BasketItem[];
  totalAmount: number;           // Total including service charge
  serviceCharge?: number;        // Optional: separate service charge
  status: OrderStatus | string;  // Allow both enum and string
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  customerName?: string;
  language?: string;
  notes?: string;
  createdBy?: {
    id: number;
    username: string;
    fullName: string;
    role: string;
  };
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'zh', name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' }
];

// Helper function to convert string status to enum
export function parseOrderStatus(status: string): OrderStatus {
  const statusMap: Record<string, OrderStatus> = {
    'Pending': OrderStatus.PENDING,
    'Preparing': OrderStatus.PREPARING,
    'Ready': OrderStatus.READY,
    'Delivering': OrderStatus.DELIVERING,
    'Completed': OrderStatus.COMPLETED,
    'Cancelled': OrderStatus.CANCELLED
  };
  return statusMap[status] || OrderStatus.PENDING;
}

// Helper function to get status display name
export function getStatusDisplayName(status: OrderStatus | string): string {
  if (typeof status === 'string') {
    return status;
  }
  return status;
}