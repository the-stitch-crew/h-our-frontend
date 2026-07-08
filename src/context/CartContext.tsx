import { createContext, useContext, useMemo, useState } from "react";
import { Product } from "../data/products";

const CART_STORAGE_KEY = "hour.cart.items";

export type CartItem = {
  product: Product;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  addItem: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeItem: (productId: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

function readCart(): CartItem[] {
  const raw = localStorage.getItem(CART_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as CartItem[]) : [];
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => readCart());

  const commit = (nextItems: CartItem[]) => {
    setItems(nextItems);
    writeCart(nextItems);
  };

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotal: items.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
      addItem: (product, quantity = 1) => {
        const existing = items.find((item) => item.product.id === product.id);
        const nextItems = existing
          ? items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: Math.min(product.stock, item.quantity + quantity) }
                : item
            )
          : [...items, { product, quantity: Math.min(product.stock, quantity) }];
        commit(nextItems);
      },
      updateQuantity: (productId, quantity) => {
        const nextItems = items.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: Math.max(1, Math.min(item.product.stock, quantity)) }
            : item
        );
        commit(nextItems);
      },
      removeItem: (productId) => {
        commit(items.filter((item) => item.product.id !== productId));
      },
      clearCart: () => {
        commit([]);
      }
    }),
    [items]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
