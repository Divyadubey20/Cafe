"use client";

import { useEffect, useState } from "react";
import { getOrders, getDashboardStats, updateOrderStatus } from "@/lib/api";
import type { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { 
  ClipboardList, Clock, CheckCircle2, TrendingUp, 
  ChefHat, Layers, AlertCircle, ShoppingBag, QrCode
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ManagerDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    ordersToday: 0,
    pending: 0,
    preparing: 0,
    ready: 0,
    served: 0,
    menuItems: 0,
    categories: 0,
    revenueToday: 0,
    revenueMonth: 0,
    totalTables: 0,
    activeTables: 0,
    availableMenuItems: 0,
    unavailableMenuItems: 0,
    staffPresent: 0,
    staffAbsent: 0
  });

  const fetchDashboardData = async () => {
    try {
      const activeOrders = await getOrders();
      setOrders(activeOrders);
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusChange = async (orderId: number, nextStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
      await fetchDashboardData();
    } catch (err: any) {
      alert(err.message || "Failed to update order status.");
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    return {
      Pending: "bg-red-50 text-red-600 border-red-100",
      Preparing: "bg-orange-50 text-orange-600 border-orange-100",
      Ready: "bg-blue-50 text-blue-600 border-blue-100",
      Served: "bg-emerald-50 text-emerald-600 border-emerald-100"
    }[status];
  };

  const statCards = [
    { label: "Pending", value: stats.pending, icon: AlertCircle, color: "text-red-500 bg-red-50" },
    { label: "Preparing", value: stats.preparing, icon: ChefHat, color: "text-orange-500 bg-orange-50" },
    { label: "Ready", value: stats.ready, valueSuffix: "", icon: CheckCircle2, color: "text-blue-500 bg-blue-50" },
    { label: "Served Today", value: stats.served, icon: ClipboardList, color: "text-emerald-500 bg-emerald-50" },
    { label: "Today's Orders", value: stats.ordersToday, icon: ShoppingBag, color: "text-[#D4880F] bg-[#FFF5EB]" },
    { label: "Revenue Today", value: formatPrice(stats.revenueToday), icon: TrendingUp, color: "text-purple-500 bg-purple-50" },
    { label: "Revenue Month", value: formatPrice(stats.revenueMonth), icon: Layers, color: "text-sky-500 bg-sky-50" },
    { label: "Active Tables", value: stats.activeTables, icon: QrCode, color: "text-emerald-500 bg-emerald-50" },
    { label: "Staff Present", value: stats.staffPresent, icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50" },
    { label: "Staff Absent", value: stats.staffAbsent, icon: AlertCircle, color: "text-red-500 bg-red-50" },
    { label: "Available Items", value: stats.availableMenuItems, icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50" },
    { label: "Unavailable Items", value: stats.unavailableMenuItems, icon: AlertCircle, color: "text-red-500 bg-red-50" }
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#2D1810]">
          Dashboard Summary
        </h1>
        <p className="text-sm font-semibold text-slate-400">
          Live statistics and active restaurant orders.
        </p>
      </div>

      {/* Grid Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                <div className={cn("p-1.5 rounded-lg", stat.color)}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <span className="text-2xl font-extrabold text-slate-800 tracking-tight">
                {stat.value}
              </span>
            </div>
          );
        })}
      </div>

      {/* Main content grid: Active Orders Queue */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="font-serif text-xl font-bold text-[#2D1810] mb-4">
          Live Order Queue
        </h3>
        
        <div className="flex flex-col gap-4">
          {orders.filter(o => o.status !== "Served").length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400">
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mb-2" />
              <p className="font-bold text-slate-600">All caught up!</p>
              <p className="text-xs max-w-[200px]">No active orders require preparation at the moment.</p>
            </div>
          ) : (
            orders
              .filter(o => o.status !== "Served")
              .map((order) => (
                <div 
                  key={order.id} 
                  className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
                >
                  {/* Left: Info */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-extrabold text-slate-800">
                        {order.orderNumber}
                      </span>
                      <span className="rounded-full bg-slate-200 py-0.5 px-3.5 text-xs font-bold text-slate-600">
                        Table {order.tableNumber}
                      </span>
                      <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-bold", getStatusColor(order.status))}>
                        {order.status}
                      </span>
                    </div>

                    {/* Ordered Items List */}
                    <div className="text-xs font-semibold text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                      {order.items.map((item, idx) => (
                        <span key={idx}>
                          {item.quantity} x {item.menuItemName}
                          {item.specialInstruction && (
                            <span className="text-red-500 font-bold ml-1">({item.specialInstruction})</span>
                          )}
                        </span>
                      ))}
                    </div>
                    
                    <span className="text-xs font-bold text-slate-400">
                      Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-4 justify-between md:justify-end shrink-0">
                    <span className="text-lg font-extrabold text-[#7A3F15] md:mr-4">
                      {formatPrice(order.totalAmount)}
                    </span>

                    {/* Workflow status transition actions */}
                    {order.status === "Pending" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "Preparing")}
                        className="rounded-xl bg-orange-500 hover:bg-orange-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm"
                      >
                        Start Preparing
                      </button>
                    )}
                    {order.status === "Preparing" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "Ready")}
                        className="rounded-xl bg-blue-500 hover:bg-blue-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm"
                      >
                        Mark Ready
                      </button>
                    )}
                    {order.status === "Ready" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "Served")}
                        className="rounded-xl bg-emerald-500 hover:bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm"
                      >
                        Mark Served
                      </button>
                    )}
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
