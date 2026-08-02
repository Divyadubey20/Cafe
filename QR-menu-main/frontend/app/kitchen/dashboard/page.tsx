"use client";

import { useEffect, useState } from "react";
import { getOrders, updateOrderStatus } from "@/lib/api";
import type { Order, OrderStatus } from "@/types";
import { formatPrice } from "@/lib/utils";
import { CheckCircle2, Clock, ChefHat, AlertCircle, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function KitchenDashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const list = await getOrders();
      setOrders(list);
    } catch (err) {
      console.error("Failed to load kitchen orders", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (orderId: number, nextStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, nextStatus);
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || "Unable to update order status.");
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

  return (
    <div className="min-h-screen bg-[#F9F5EF] px-6 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-3 rounded-[32px] border border-[#E8DDD1] bg-white p-7 shadow-sm">
          <div className="flex items-center gap-3 text-[#2D1810]">
            <div className="rounded-3xl bg-[#D4880F] p-3 text-white shadow-sm">
              <ChefHat className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Kitchen Dashboard</h1>
              <p className="text-sm text-[#6B4F3A]">
                Live order tracking for the chef — view table orders, items, and special instructions.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-[#F0E6DC] bg-[#FFF5EB] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#7A3F15]">Kitchen ID</p>
              <p className="mt-2 text-xl font-bold text-[#2D1810]">chef001</p>
            </div>
            <div className="rounded-3xl border border-[#F0E6DC] bg-[#FFF5EB] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#7A3F15]">Password</p>
              <p className="mt-2 text-xl font-bold text-[#2D1810]">tandoor123</p>
            </div>
            <div className="rounded-3xl border border-[#F0E6DC] bg-[#FFF5EB] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-[#7A3F15]">Refresh</p>
              <p className="mt-2 text-xl font-bold text-[#2D1810]">Every 8s</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="rounded-3xl border border-[#E8DDD1] bg-white p-12 text-center text-sm text-[#6B4F3A]">
              Loading kitchen orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="rounded-3xl border border-[#E8DDD1] bg-white p-12 text-center text-sm text-[#6B4F3A]">
              No active kitchen orders yet.
            </div>
          ) : (
            orders
              .filter((order) => order.status !== "Served")
              .map((order) => (
                <div key={order.id} className="rounded-[32px] border border-[#E8DDD1] bg-white p-6 shadow-sm">
                  <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="rounded-3xl bg-[#F4E3D0] px-4 py-2 text-xs font-semibold text-[#7A3F15]">
                          {order.orderNumber}
                        </span>
                        <span className="rounded-3xl bg-[#EEF7F0] px-4 py-2 text-xs font-semibold text-[#2F5D3E]">
                          Table {order.tableNumber}
                        </span>
                        <span className={cn("rounded-3xl border px-4 py-2 text-xs font-semibold", getStatusColor(order.status))}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <p className="text-sm text-[#6B4F3A]">Placed at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-sm text-[#6B4F3A]">Prep time: {order.prepTime} mins</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-[#2D1810]">
                      <span>Total</span>
                      <span>{formatPrice(order.totalAmount)}</span>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl border border-[#F0E6DC] bg-[#FFFBF6] p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#7A3F15]">Items</p>
                      <div className="mt-3 space-y-2 text-sm text-[#4F3B2D]">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="rounded-3xl bg-white p-3 shadow-sm">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="font-semibold">{item.quantity} x {item.menuItemName}</p>
                                {item.specialInstruction && (
                                  <p className="mt-1 text-xs italic text-[#C14C3B]">
                                    Note: {item.specialInstruction}
                                  </p>
                                )}
                              </div>
                              <span className="text-sm font-bold text-[#2D1810]">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-[#F0E6DC] bg-[#F8F3EE] p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-[#7A3F15]">Chef Instructions</p>
                      <p className="mt-3 text-sm text-[#4F3B2D]">
                        {order.items.some((item) => item.specialInstruction)
                          ? "Special instructions shown per item below."
                          : "No special notes for this order."}
                      </p>
                      {order.items.some((item) => item.specialInstruction) && (
                        <div className="mt-4 space-y-2">
                          {order.items.filter((item) => item.specialInstruction).map((item, idx) => (
                            <div key={idx} className="rounded-3xl bg-white p-3 text-sm text-[#6B4F3A] shadow-sm">
                              <p className="font-semibold">{item.menuItemName}</p>
                              <p className="mt-1 text-xs italic text-[#C14C3B]">
                                {item.specialInstruction}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {order.status === "Pending" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "Preparing")}
                        className="inline-flex items-center gap-2 rounded-3xl bg-[#F6A142] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#d48721]"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Start Preparing
                      </button>
                    )}
                    {order.status === "Preparing" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "Ready")}
                        className="inline-flex items-center gap-2 rounded-3xl bg-[#3E86FF] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#336dd1]"
                      >
                        <Clock className="h-4 w-4" />
                        Mark Ready
                      </button>
                    )}
                    {order.status === "Ready" && (
                      <button
                        onClick={() => handleStatusChange(order.id, "Served")}
                        className="inline-flex items-center gap-2 rounded-3xl bg-[#1E9E5F] px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-[#178049]"
                      >
                        <ChevronRight className="h-4 w-4" />
                        Serve Now
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
