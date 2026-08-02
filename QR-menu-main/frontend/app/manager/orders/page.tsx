"use client";

import { useEffect, useState, useMemo } from "react";
import { getOrders, updateOrderStatus } from "@/lib/api";
import type { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Compass, Search, Filter, Clock, CheckCircle2, ChevronRight, AlertCircle, ChefHat, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"All" | OrderStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchOrdersData = async () => {
    try {
      const activeOrders = await getOrders();
      setOrders(activeOrders);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrdersData();
  }, []);

  const handleStatusChange = async (orderId: number, nextStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
      await fetchOrdersData();
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

  // Filter orders based on active tab and search query
  const filteredOrders = useMemo(() => {
    let result = [...orders];

    // 1. Status Filter
    if (activeTab !== "All") {
      result = result.filter((o) => o.status === activeTab);
    }

    // 2. Search Query Filter (order number or table)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.tableNumber.toString().includes(q)
      );
    }

    return result;
  }, [orders, activeTab, searchQuery]);

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold text-[#2D1810]">Order Management</h1>
        <p className="text-sm font-semibold text-slate-400">Track table order queue status, total billing, and preparation.</p>
      </div>

      {/* Tabs & Search controls */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-2 md:flex-row md:items-center justify-between">
        {/* Status Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(["All", "Pending", "Preparing", "Ready", "Served"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "rounded-xl py-2 px-4 text-xs font-bold transition-all border",
                activeTab === tab
                  ? "bg-[#D4880F] border-[#D4880F] text-white shadow-sm"
                  : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm w-full md:max-w-[260px]">
          <Search className="h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Order # or Table..."
            className="w-full bg-transparent text-xs font-medium text-slate-700 outline-none placeholder-slate-400"
          />
        </div>
      </div>

      {/* Orders Grid/List */}
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length > 0 ? (
          filteredOrders.map((order) => (
            <div
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col gap-4 hover:border-slate-300 transition-all"
            >
              {/* Top row Info */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="text-base font-extrabold text-slate-800">
                    {order.orderNumber}
                  </span>
                  <span className="rounded-full bg-slate-100 py-0.5 px-3 text-xs font-bold text-slate-600">
                    Table {order.tableNumber}
                  </span>
                  <span className={cn("rounded-full border px-2.5 py-0.5 text-xs font-bold", getStatusColor(order.status))}>
                    {order.status}
                  </span>
                </div>
                
                <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  Placed at {new Date(order.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                </span>
              </div>

              {/* Items Summary Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Items List */}
                <div className="flex flex-col gap-2">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ordered Items</h4>
                  <div className="flex flex-col gap-2">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs font-semibold text-slate-700">
                        <div className="flex items-center gap-2">
                          <span className="h-5 w-5 bg-slate-100 rounded flex items-center justify-center text-[10px] font-bold text-slate-600 shrink-0">
                            {item.quantity}
                          </span>
                          <span>{item.menuItemName}</span>
                          {item.specialInstruction && (
                            <span className="text-[10px] italic text-red-500 font-bold bg-red-50 rounded px-1.5 py-0.5">
                              "{item.specialInstruction}"
                            </span>
                          )}
                        </div>
                        <span className="text-slate-400">{formatPrice(item.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Billing Summary */}
                <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100 self-start md:w-3/4">
                  <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Billing Summary</h4>
                  <div className="flex flex-col gap-1.5 text-xs font-semibold text-slate-500">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(order.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>GST (5%)</span>
                      <span>{formatPrice(order.gst)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Service / Delivery</span>
                      <span>{formatPrice(order.deliveryFee)}</span>
                    </div>
                    <div className="flex justify-between border-t border-slate-200 pt-2 mt-1 text-sm font-extrabold text-slate-800">
                      <span>Grand Total</span>
                      <span className="text-[#7A3F15]">{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="flex gap-2 justify-end border-t border-slate-100 pt-4 mt-2">
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
                {order.status === "Served" && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5 flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    Completed & Served
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400 bg-white border border-slate-200 rounded-2xl">
            <ClipboardList className="h-12 w-12 text-slate-300 mb-2" />
            <p className="font-bold text-slate-600">No orders found</p>
            <p className="text-xs max-w-[200px]">No orders match your filter criteria or search queries.</p>
          </div>
        )}
      </div>
    </div>
  );
}
