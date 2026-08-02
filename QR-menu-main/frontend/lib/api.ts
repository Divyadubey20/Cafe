import type { Restaurant, Category, MenuItem, Offer, Order, DashboardStats, CartItem, Table } from "@/types";
import offersData from "@/data/offers.json";

// Dynamic API host resolver supporting relative routing in production / local proxy
const getApiBaseUrl = () => {
  if (typeof window !== "undefined") {
    // Relative path routed by Vercel rewrites or Next.js dev proxy
    return "/api/backend";
  }
  // Server-side fallback (requires absolute host paths during SSR)
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return "http://127.0.0.1:8000";
};

// ==========================================
// Mappers: snake_case (Backend) <-> camelCase (Frontend)
// ==========================================

export function mapCategoryToFrontend(cat: any): Category {
  const slug = cat.name.toLowerCase().replace(/ & /g, "-").replace(/\s+/g, "-");
  return {
    id: cat.id,
    name: cat.name,
    slug,
    image: `/images/categories/${slug}.jpg`,
    displayOrder: cat.display_order,
    itemCount: 0
  };
}

export function mapMenuItemToFrontend(item: any): MenuItem {
  return {
    id: item.id,
    categoryId: item.category_id,
    categoryName: item.category_name || "Main Course",
    name: item.name,
    description: item.description || "",
    price: item.price,
    image: item.image_url || `https://placehold.co/300x200?text=${encodeURIComponent(item.name)}`,
    isAvailable: item.is_available,
    isBestSeller: item.is_best_seller,
    isChefSpecial: item.is_chef_special,
    isVeg: true, // This is a 100% vegetarian menu
    rating: 4.8,
    reviewCount: 45,
    prepTime: item.display_order % 2 === 0 ? "15 mins" : "12 mins",
    spiceLevel: "Medium",
    servesCount: 2,
    ingredients: ["Fresh Spices", "Herbs"],
    displayOrder: item.display_order
  };
}

function calculateOrderPrepTime(o: any): string {
  const totalQuantity = o.items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  const hasSpecialInstructions = o.items.some((item: any) => item.special_instruction?.trim()?.length > 0);
  const minutes = Math.max(12, 10 + totalQuantity * 5 + (hasSpecialInstructions ? 2 : 0));
  return String(minutes);
}

export function mapOrderToFrontend(o: any): Order {
  const items = o.items.map((i: any) => ({
    id: i.id,
    menuItemId: i.menu_item_id,
    menuItemName: i.menu_item_name || "Dish",
    menuItemImage: "",
    quantity: i.quantity,
    price: i.price,
    specialInstruction: i.special_instruction || ""
  }));

  const totalAmount = o.total_amount;
  const gst = totalAmount - (totalAmount / 1.05); // 5% GST back-calculation
  const deliveryFee = 0;
  const subtotal = totalAmount - gst - deliveryFee;

  return {
    id: o.id,
    orderNumber: `#SK-${1000 + o.id}`,
    tableNumber: o.table_number || 12,
    status: o.status,
    items,
    subtotal: Math.max(0, Math.round(subtotal * 100) / 100),
    deliveryFee,
    gst: Math.round(gst * 100) / 100,
    totalAmount,
    prepTime: o.prep_time ? String(o.prep_time) : calculateOrderPrepTime(o),
    createdAt: o.created_at
  };
}

// ==========================================
// Customer Facing GET Endpoints
// ==========================================

export async function getRestaurant(): Promise<Restaurant> {
  const res = await fetch(`${getApiBaseUrl()}/restaurant`);
  if (!res.ok) throw new Error("Failed to fetch restaurant settings");
  const data = await res.json();
  return {
    id: data.id,
    name: data.restaurant_name,
    tagline: "Delicious Food, Memorable Moments",
    address: data.address,
    phone: data.phone,
    openingTime: data.opening_time,
    closingTime: data.closing_time,
    logoUrl: data.logo_url || "/images/logo.png",
    heroImage: "/images/hero.jpg",
    rating: 4.8,
    reviewCount: "2k+",
    currency: data.currency,
    currencySymbol: data.currency === "INR" ? "₹" : "$",
    gstPercentage: data.gst_percentage,
    deliveryFee: 0
  };
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${getApiBaseUrl()}/categories`);
  if (!res.ok) return [];
  const list = await res.json();
  return list.map(mapCategoryToFrontend);
}

export async function getMenu(): Promise<MenuItem[]> {
  const res = await fetch(`${getApiBaseUrl()}/menu`);
  if (!res.ok) return [];
  const list = await res.json();
  
  // Resolve category name from list mapping if possible
  const categories = await getCategories();
  return list.map((item: any) => {
    const cat = categories.find((c) => c.id === item.category_id);
    return mapMenuItemToFrontend({
      ...item,
      category_name: cat ? cat.name : "Main Course"
    });
  });
}

export async function getMenuItem(id: number): Promise<MenuItem | undefined> {
  const res = await fetch(`${getApiBaseUrl()}/menu/${id}`);
  if (!res.ok) return undefined;
  const data = await res.json();
  return mapMenuItemToFrontend(data);
}

export async function getMenuByCategory(categorySlug: string): Promise<MenuItem[]> {
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === categorySlug);
  if (!cat) return [];
  const res = await fetch(`${getApiBaseUrl()}/menu?category=${encodeURIComponent(cat.name)}`);
  if (!res.ok) return [];
  const list = await res.json();
  return list.map((item: any) => mapMenuItemToFrontend({ ...item, category_name: cat.name }));
}

export async function getBestSellers(): Promise<MenuItem[]> {
  const menu = await getMenu();
  return menu.filter((item) => item.isBestSeller);
}

export async function getChefSpecials(): Promise<MenuItem[]> {
  const menu = await getMenu();
  return menu.filter((item) => item.isChefSpecial);
}

export async function getPopularDishes(): Promise<MenuItem[]> {
  const menu = await getMenu();
  return menu.slice(0, 8);
}

export async function searchMenu(query: string): Promise<MenuItem[]> {
  const res = await fetch(`${getApiBaseUrl()}/menu?search=${encodeURIComponent(query)}`);
  if (!res.ok) return [];
  const list = await res.json();
  return list.map(mapMenuItemToFrontend);
}

export function getOffers(): Offer[] {
  return offersData as Offer[];
}

// ==========================================
// Customer Order Placement
// ==========================================

export async function placeOrder(tableNumber: number, cartItems: CartItem[]): Promise<Order> {
  const payload = {
    table_number: tableNumber,
    items: cartItems.map((item) => ({
      menu_item_id: item.menuItem.id,
      quantity: item.quantity,
      special_instruction: item.specialInstruction
    }))
  };

  const res = await fetch(`${getApiBaseUrl()}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to place order");
  }

  const data = await res.json();
  return mapOrderToFrontend(data);
}

export async function getOrder(id: number): Promise<Order> {
  const res = await fetch(`${getApiBaseUrl()}/orders/${id}`);
  if (!res.ok) throw new Error("Order not found");
  const data = await res.json();
  return mapOrderToFrontend(data);
}

// ==========================================
// Manager Dashboard API Operations
// ==========================================

export async function getOrders(filters?: { status?: string; table?: number; today?: boolean }): Promise<Order[]> {
  let url = `${getApiBaseUrl()}/manager/orders?`;
  if (filters?.status) url += `status=${filters.status}&`;
  if (filters?.table) url += `table=${filters.table}&`;
  if (filters?.today !== undefined) url += `today=${filters.today}&`;

  const res = await fetch(url);
  if (!res.ok) return [];
  const list = await res.json();
  return list.map(mapOrderToFrontend);
}

export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await fetch(`${getApiBaseUrl()}/manager/dashboard`);
  if (!res.ok) throw new Error("Failed to fetch dashboard summary");
  const data = await res.json();

  return {
    ordersToday: data.orders_today,
    pending: data.pending,
    preparing: data.preparing,
    ready: data.ready,
    served: data.served,
    menuItems: data.menu_items,
    categories: data.categories,
    revenueToday: data.revenue_today,
    revenueMonth: data.revenue_month,
    totalTables: data.total_tables,
    activeTables: data.active_tables,
    availableMenuItems: data.available_menu_items,
    unavailableMenuItems: data.unavailable_menu_items,
    staffPresent: data.staff_present,
    staffAbsent: data.staff_absent,
  };
}

export async function updateOrderStatus(orderId: number, nextStatus: string): Promise<Order> {
  const res = await fetch(`${getApiBaseUrl()}/manager/orders/${orderId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: nextStatus })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to update order status");
  }

  const data = await res.json();
  return mapOrderToFrontend(data);
}

// Settings management updates
export async function updateSettings(settings: Partial<Restaurant>): Promise<Restaurant> {
  const payload: any = {};
  if (settings.name) payload.restaurant_name = settings.name;
  if (settings.address) payload.address = settings.address;
  if (settings.phone) payload.phone = settings.phone;
  if (settings.openingTime) payload.opening_time = settings.openingTime;
  if (settings.closingTime) payload.closing_time = settings.closingTime;
  if (settings.logoUrl) payload.logo_url = settings.logoUrl;
  if (settings.currency) payload.currency = settings.currency;
  if (settings.gstPercentage !== undefined) payload.gst_percentage = settings.gstPercentage;

  const res = await fetch(`${getApiBaseUrl()}/manager/settings`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Failed to update settings");
  const data = await res.json();
  return {
    ...settings,
    id: data.id,
    name: data.restaurant_name,
    address: data.address,
    phone: data.phone,
    openingTime: data.opening_time,
    closingTime: data.closing_time,
    logoUrl: data.logo_url,
    currency: data.currency,
    gstPercentage: data.gst_percentage
  } as Restaurant;
}

// Category CRUD
export async function createCategory(name: string, displayOrder: number): Promise<Category> {
  const res = await fetch(`${getApiBaseUrl()}/manager/categories`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, display_order: displayOrder })
  });

  if (!res.ok) throw new Error("Failed to create category");
  const data = await res.json();
  return mapCategoryToFrontend(data);
}

export async function updateCategory(id: number, name: string, displayOrder: number): Promise<Category> {
  const res = await fetch(`${getApiBaseUrl()}/manager/categories/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, display_order: displayOrder })
  });

  if (!res.ok) throw new Error("Failed to update category");
  const data = await res.json();
  return mapCategoryToFrontend(data);
}

export async function deleteCategory(id: number): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/manager/categories/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete category");
}

export async function getTables(): Promise<Table[]> {
  const res = await fetch(`${getApiBaseUrl()}/tables`);
  if (!res.ok) return [];
  return (await res.json()).map((table: any) => ({
    id: table.id,
    tableNumber: table.table_number,
    capacity: table.capacity,
    qrCode: table.qr_code,
    isActive: table.is_active,
    createdAt: table.created_at,
  }));
}

export async function createTable(table: Partial<Table>): Promise<Table> {
  const payload: any = {
    table_number: table.tableNumber,
    capacity: table.capacity,
    qr_code: table.qrCode,
    is_active: table.isActive !== undefined ? table.isActive : true,
  };

  const res = await fetch(`${getApiBaseUrl()}/tables`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to create table");
  }

  const data = await res.json();
  return {
    id: data.id,
    tableNumber: data.table_number,
    capacity: data.capacity,
    qrCode: data.qr_code,
    isActive: data.is_active,
    createdAt: data.created_at,
  };
}

export async function updateTable(id: number, table: Partial<Table>): Promise<Table> {
  const payload: any = {};
  if (table.tableNumber !== undefined) payload.table_number = table.tableNumber;
  if (table.capacity !== undefined) payload.capacity = table.capacity;
  if (table.qrCode !== undefined) payload.qr_code = table.qrCode;
  if (table.isActive !== undefined) payload.is_active = table.isActive;

  const res = await fetch(`${getApiBaseUrl()}/tables/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to update table");
  }

  const data = await res.json();
  return {
    id: data.id,
    tableNumber: data.table_number,
    capacity: data.capacity,
    qrCode: data.qr_code,
    isActive: data.is_active,
    createdAt: data.created_at,
  };
}

export async function deleteTable(id: number): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/tables/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to delete table");
  }
}

// Menu Items CRUD
export async function createMenuItem(item: Partial<MenuItem>): Promise<MenuItem> {
  const payload = {
    category_id: item.categoryId,
    name: item.name,
    description: item.description || "",
    price: item.price,
    image_url: item.image || "",
    is_available: item.isAvailable !== undefined ? item.isAvailable : true,
    is_best_seller: item.isBestSeller || false,
    is_chef_special: item.isChefSpecial || false,
    display_order: item.displayOrder || 0
  };

  const res = await fetch(`${getApiBaseUrl()}/manager/menu`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Failed to create menu item");
  const data = await res.json();
  return mapMenuItemToFrontend(data);
}

export async function updateMenuItem(id: number, item: Partial<MenuItem>): Promise<MenuItem> {
  const payload: any = {};
  if (item.categoryId !== undefined) payload.category_id = item.categoryId;
  if (item.name) payload.name = item.name;
  if (item.description !== undefined) payload.description = item.description;
  if (item.price !== undefined) payload.price = item.price;
  if (item.image) payload.image_url = item.image;
  if (item.isAvailable !== undefined) payload.is_available = item.isAvailable;
  if (item.isBestSeller !== undefined) payload.is_best_seller = item.isBestSeller;
  if (item.isChefSpecial !== undefined) payload.is_chef_special = item.isChefSpecial;
  if (item.displayOrder !== undefined) payload.display_order = item.displayOrder;

  const res = await fetch(`${getApiBaseUrl()}/manager/menu/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Failed to update menu item");
  const data = await res.json();
  return mapMenuItemToFrontend(data);
}

export async function deleteMenuItem(id: number): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/manager/menu/${id}`, {
    method: "DELETE"
  });
  if (!res.ok) throw new Error("Failed to delete menu item");
}
