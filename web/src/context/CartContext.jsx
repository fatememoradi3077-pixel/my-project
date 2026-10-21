import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { BRAND } from '../lib/content.js';

const CartContext = createContext(null);
const STORAGE_KEY = 'techhaven.cart.v1';

function readStoredCart() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((line) => line?.product?.id && line?.quantity > 0)
      .map((line) => ({
        product: line.product,
        quantity: Math.min(Math.max(Number(line.quantity) || 1, 1), 99),
      }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readStoredCart);
  const [isOpen, setOpen] = useState(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable — the cart stays in memory for this session */
    }
  }, [items]);

  const add = useCallback((product, quantity = 1) => {
    setItems((current) => {
      const limit = product.stock > 0 ? product.stock : 99;
      const index = current.findIndex((line) => line.product.id === product.id);
      if (index === -1) {
        return [...current, { product, quantity: Math.min(quantity, limit) }];
      }
      const next = [...current];
      next[index] = {
        ...next[index],
        product,
        quantity: Math.min(next[index].quantity + quantity, limit),
      };
      return next;
    });
  }, []);

  const remove = useCallback((productId) => {
    setItems((current) => current.filter((line) => line.product.id !== productId));
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    setItems((current) =>
      current
        .map((line) =>
          line.product.id === productId
            ? { ...line, quantity: Math.min(Math.max(quantity, 0), Math.max(line.product.stock, 1)) }
            : line,
        )
        .filter((line) => line.quantity > 0),
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(() => {
    const count = items.reduce((sum, line) => sum + line.quantity, 0);
    const subtotal = items.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
    return {
      items,
      count,
      subtotal: Math.round(subtotal * 100) / 100,
      remainingForFreeShipping: Math.max(
        Math.round((BRAND.freeShippingThreshold - subtotal) * 100) / 100,
        0,
      ),
      qualifiesForFreeShipping: subtotal >= BRAND.freeShippingThreshold,
      isOpen,
      open: () => setOpen(true),
      close: () => setOpen(false),
      toggle: () => setOpen((current) => !current),
      add,
      remove,
      setQuantity,
      clear,
    };
  }, [items, isOpen, add, remove, setQuantity, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
}
