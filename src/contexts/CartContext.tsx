import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';

type CartItem = {
  productId: string;
  name: string;
  originalPrice: number;
  salePrice: number;
  quantity: number;
  imageUrl?: string | null;
  stock: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (product: {
    id: string;
    name: string;
    originalPrice: number;
    salePrice: number;
    stock: number;
    imageUrl?: string;
  }, quantity?: number) => void;
  removeItem: (productId: string) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
};

const CART_STORAGE_KEY = 'doodle_room_cart';

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable — silently ignore
  }
}

export const CartContext = createContext<CartContextValue | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [hydrated, setHydrated] = useState(false);

  // On mount, re-read from localStorage to fix SSR/hydration mismatch
  useEffect(() => {
    setItems(loadCart());
    setHydrated(true);
  }, []);

  // Persist to localStorage on every change
  useEffect(() => {
    if (hydrated) {
      saveCart(items);
    }
  }, [items, hydrated]);

  const addItem = useCallback((product: {
    id: string;
    name: string;
    originalPrice: number;
    salePrice: number;
    stock: number;
    imageUrl?: string;
  }, qty: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: Math.min(item.quantity + qty, product.stock) }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          originalPrice: product.originalPrice,
          salePrice: product.salePrice,
          quantity: Math.min(qty, product.stock),
          imageUrl: product.imageUrl,
          stock: product.stock,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  const increaseQuantity = useCallback((productId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(item.quantity + 1, item.stock) }
          : item
      )
    );
  }, []);

  const decreaseQuantity = useCallback((productId: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.max(item.quantity - 1, 1) }
          : item
      )
    );
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const cartTotal = useMemo(() => items.reduce(
    (total, item) => total + (item.salePrice || item.originalPrice) * item.quantity,
    0
  ), [items]);

  const cartCount = useMemo(() => items.reduce((count, item) => count + item.quantity, 0), [items]);

  const value = useMemo(() => ({
    items, addItem, removeItem, increaseQuantity, decreaseQuantity, clearCart, cartTotal, cartCount,
  }), [items, addItem, removeItem, increaseQuantity, decreaseQuantity, clearCart, cartTotal, cartCount]);

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
