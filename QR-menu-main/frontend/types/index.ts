// ==========================================
// Restaurant
// ==========================================
export interface Restaurant {
  id: number;
  name: string;
  tagline: string;
  address: string;
  phone: string;
  openingTime: string;
  closingTime: string;
  logoUrl: string;
  heroImage: string;
  rating: number;
  reviewCount: string;
  currency: string;
  currencySymbol: string;
  gstPercentage: number;
  deliveryFee: number;
}

// ==========================================
// Category
// ==========================================
export interface Category {
  id: number;
  name: string;
  slug: string;
  image: string;
  displayOrder: number;
  itemCount: number;
}

// ==========================================
// Menu Item
// ==========================================
export interface MenuItem {
  id: number;
  categoryId: number;
  categoryName: string;
  name: string;
  description: string;
  price: number;
  image: string;
  isAvailable: boolean;
  isBestSeller: boolean;
  isChefSpecial: boolean;
  isVeg: boolean;
  rating: number;
  reviewCount: number;
  prepTime: string;
  spiceLevel: "Mild" | "Medium" | "Hot" | "Extra Hot";
  servesCount: number;
  ingredients: string[];
  displayOrder: number;
}

// ==========================================
// Cart
// ==========================================
export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstruction: string;
}

export interface Table {
  id: number;
  tableNumber: number;
  capacity: number;
  qrCode: string;
  isActive: boolean;
  createdAt: string;
}

export interface CartState {
  items: CartItem[];
  addToCart: (item: MenuItem, quantity?: number, instruction?: string) => void;
  removeFromCart: (menuItemId: number) => void;
  updateQuantity: (menuItemId: number, quantity: number) => void;
  updateInstruction: (menuItemId: number, instruction: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  getSubtotal: () => number;
  getGST: (gstPercentage: number) => number;
  getDeliveryFee: () => number;
  getTotal: (gstPercentage: number) => number;
}

// ==========================================
// Order
// ==========================================
export type OrderStatus = "Pending" | "Preparing" | "Ready" | "Served";

export interface OrderItem {
  id: number;
  menuItemId: number;
  menuItemName: string;
  menuItemImage: string;
  quantity: number;
  price: number;
  specialInstruction: string;
}

export interface Order {
  id: number;
  orderNumber: string;
  tableNumber: number;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  gst: number;
  totalAmount: number;
  prepTime: string;
  createdAt: string;
}

// ==========================================
// Offer
// ==========================================
export interface Offer {
  id: number;
  title: string;
  description: string;
  image: string;
  discount: string;
  bgColor: string;
}

// ==========================================
// Dashboard Stats
// ==========================================
export interface DashboardStats {
  ordersToday: number;
  pending: number;
  preparing: number;
  ready: number;
  served: number;
  menuItems: number;
  categories: number;
  revenueToday: number;
  revenueMonth: number;
  totalTables: number;
  activeTables: number;
  availableMenuItems: number;
  unavailableMenuItems: number;
  staffPresent: number;
  staffAbsent: number;
}
