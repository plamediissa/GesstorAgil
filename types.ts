
export interface ShopConfig {
  name: string;
  phone: string;
  address: string;
  nif: string;
  currency: string;
}

export interface AuthSession {
  companyName: string;
  lastLogin: string;
  token: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  manageStock: boolean;
  image?: string;
  category: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalSpent: number;
  lastVisit?: string;
}

export interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

export type PaymentMethod = 'Dinheiro' | 'TPA' | 'Transferência' | 'Multicaixa Express';

export interface Sale {
  id: string;
  date: string;
  customerId?: string;
  items: SaleItem[];
  total: number;
  paymentMethod: PaymentMethod;
  status: 'completed' | 'pending' | 'refunded';
  refundedAt?: string;
  refundReason?: string;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

export type AppView = 'dashboard' | 'sales' | 'inventory' | 'crm' | 'finances' | 'settings';
