import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../lib/api.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext(null);
const STORAGE_KEY = 'techhaven.wishlist.v1';

function readStored() {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter(Number.isFinite) : [];
  } catch {
    return [];
  }
}

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [ids, setIds] = useState(readStored);
  const hydrated = useRef(!user);
  const latest = useRef(ids);
  latest.current = ids;

  // On sign-in, merge whatever is saved on the device with the saved wishlist.
  useEffect(() => {
    if (!user) {
      hydrated.current = true;
      return undefined;
    }
    let cancelled = false;
    hydrated.current = false;
    api.wishlist
      .get()
      .then(({ productIds }) => {
        if (cancelled) return null;
        const merged = [...new Set([...(productIds ?? []), ...latest.current])];
        setIds(merged);
        return api.wishlist.put(merged);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) hydrated.current = true;
      });
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    } catch {
      /* ignore unavailable storage */
    }
    if (user && hydrated.current) {
      api.wishlist.put(ids).catch(() => {});
    }
  }, [ids, user?.id]);

  const toggle = useCallback((productId) => {
    setIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
    );
  }, []);

  const has = useCallback((productId) => ids.includes(productId), [ids]);

  const value = useMemo(
    () => ({ ids, count: ids.length, toggle, has, clear: () => setIds([]) }),
    [ids, toggle, has],
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used inside WishlistProvider');
  return context;
}
