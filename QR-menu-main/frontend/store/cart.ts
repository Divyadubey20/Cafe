import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartState, CartItem, MenuItem } from "@/types";

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCart: (item: MenuItem, quantity = 1, instruction = "") => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (cartItem) => cartItem.menuItem.id === item.id
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...state.items];
            updatedItems[existingItemIndex].quantity += quantity;
            if (instruction) {
              updatedItems[existingItemIndex].specialInstruction = instruction;
            }
            return { items: updatedItems };
          }

          return {
            items: [
              ...state.items,
              { menuItem: item, quantity, specialInstruction: instruction }
            ]
          };
        });
      },

      removeFromCart: (menuItemId: number) => {
        set((state) => ({
          items: state.items.filter((item) => item.menuItem.id !== menuItemId)
        }));
      },

      updateQuantity: (menuItemId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeFromCart(menuItemId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.menuItem.id === menuItemId
              ? { ...item, quantity }
              : item
          )
        }));
      },

      updateInstruction: (menuItemId: number, instruction: string) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.menuItem.id === menuItemId
              ? { ...item, specialInstruction: instruction }
              : item
          )
        }));
      },

      clearCart: () => set({ items: [] }),

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getSubtotal: () => {
        return get().items.reduce(
          (total, item) => total + item.menuItem.price * item.quantity,
          0
        );
      },

      getGST: (gstPercentage: number) => {
        return (get().getSubtotal() * gstPercentage) / 100;
      },

      getDeliveryFee: () => {
        return 0;
      },

      getTotal: (gstPercentage: number) => {
        const subtotal = get().getSubtotal();
        if (subtotal === 0) return 0;
        return subtotal + get().getGST(gstPercentage) + get().getDeliveryFee();
      }
    }),
    {
      name: "qr-cart-storage" // Key for localStorage
    }
  )
);
