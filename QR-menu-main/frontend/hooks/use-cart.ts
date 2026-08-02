import { useEffect, useState } from "react";
import { useCartStore } from "@/store/cart";

export function useCart() {
  const [mounted, setMounted] = useState(false);
  const store = useCartStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // Return default values during server rendering, and actual store values on mount
  return {
    items: mounted ? store.items : [],
    addToCart: store.addToCart,
    removeFromCart: store.removeFromCart,
    updateQuantity: store.updateQuantity,
    updateInstruction: store.updateInstruction,
    clearCart: store.clearCart,
    getItemCount: mounted ? store.getItemCount : () => 0,
    getSubtotal: mounted ? store.getSubtotal : () => 0,
    getGST: mounted ? store.getGST : () => 0,
    getDeliveryFee: mounted ? store.getDeliveryFee : () => 0,
    getTotal: mounted ? store.getTotal : () => 0,
    mounted
  };
}
