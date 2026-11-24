import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';
import { calculateTotals, MAX_QTY_PER_ITEM } from '../utils/pricing.js';
import { storage } from '../utils/format.js';

const CartContext = createContext(null);
const GUEST_KEY = 'gg_guest_cart';

// Guest cart items look like { product: {_id, name, slug, image, price, originalPrice, stock}, quantity }
const readGuest = () => storage.get(window.localStorage, GUEST_KEY, []);
const writeGuest = (items) => storage.set(window.localStorage, GUEST_KEY, items);

const buildGuestCart = (items) => {
  const lines = items.map((i) => ({
    product: i.product,
    quantity: i.quantity,
    lineTotal: i.product.price * i.quantity,
    available: true,
  }));
  return { items: lines, ...calculateTotals(lines.map((l) => ({ price: l.product.price, quantity: l.quantity }))) };
};

const slimProduct = (p) => ({
  _id: p._id,
  name: p.name,
  slug: p.slug,
  image: p.image,
  price: p.price,
  originalPrice: p.originalPrice,
  stock: p.stock,
});

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState(() => buildGuestCart(readGuest()));
  const [syncing, setSyncing] = useState(false);
  const syncedFor = useRef(null); // guards against double-merging (React StrictMode runs effects twice)

  // Whenever the login state changes: logged in -> merge the guest cart and load the saved cart;
  // logged out -> show the (empty) guest cart.
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      syncedFor.current = null;
      setCart(buildGuestCart(readGuest()));
      return;
    }
    if (syncedFor.current === user.id) return;
    syncedFor.current = user.id;

    (async () => {
      setSyncing(true);
      try {
        const guest = readGuest();
        let res;
        if (guest.length) {
          res = await api.post('/cart/merge', {
            items: guest.map((g) => ({ productId: g.product._id, quantity: g.quantity })),
          });
          writeGuest([]);
          (res.data.data.notes || []).forEach((n) => toast(n));
        } else {
          res = await api.get('/cart');
        }
        setCart(res.data.data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setSyncing(false);
      }
    })();
  }, [user, authLoading]);

  const refresh = useCallback(async () => {
    if (!user) return setCart(buildGuestCart(readGuest()));
    try {
      const res = await api.get('/cart');
      setCart(res.data.data);
    } catch (err) {
      toast.error(err.message);
    }
  }, [user]);

  const addItem = useCallback(
    async (product, quantity = 1) => {
      if (user) {
        try {
          const res = await api.post('/cart', { productId: product._id, quantity });
          setCart(res.data.data);
          toast.success(`${product.name} added to your cart`);
          return true;
        } catch (err) {
          toast.error(err.message);
          return false;
        }
      }
      // Guest cart (localStorage)
      if (product.stock < 1) {
        toast.error(`${product.name} is out of stock`);
        return false;
      }
      const items = readGuest();
      const existing = items.find((i) => i.product._id === product._id);
      const newQty = (existing ? existing.quantity : 0) + quantity;
      if (newQty > MAX_QTY_PER_ITEM) {
        toast.error(`You can add at most ${MAX_QTY_PER_ITEM} of one item`);
        return false;
      }
      if (newQty > product.stock) {
        toast.error(`Only ${product.stock} of ${product.name} left in stock`);
        return false;
      }
      const next = existing
        ? items.map((i) => (i.product._id === product._id ? { ...i, quantity: newQty } : i))
        : [...items, { product: slimProduct(product), quantity }];
      writeGuest(next);
      setCart(buildGuestCart(next));
      toast.success(`${product.name} added to your cart`);
      return true;
    },
    [user]
  );

  const setQuantity = useCallback(
    async (productId, quantity) => {
      if (user) {
        try {
          const res = await api.put(`/cart/${productId}`, { quantity });
          setCart(res.data.data);
        } catch (err) {
          toast.error(err.message);
        }
        return;
      }
      const items = readGuest();
      const item = items.find((i) => i.product._id === productId);
      if (!item) return;
      if (quantity > Math.min(MAX_QTY_PER_ITEM, item.product.stock)) {
        toast.error(`You can add at most ${Math.min(MAX_QTY_PER_ITEM, item.product.stock)} of this item`);
        return;
      }
      const next = items.map((i) => (i.product._id === productId ? { ...i, quantity } : i));
      writeGuest(next);
      setCart(buildGuestCart(next));
    },
    [user]
  );

  const removeItem = useCallback(
    async (productId) => {
      if (user) {
        try {
          const res = await api.delete(`/cart/${productId}`);
          setCart(res.data.data);
        } catch (err) {
          toast.error(err.message);
        }
        return;
      }
      const next = readGuest().filter((i) => i.product._id !== productId);
      writeGuest(next);
      setCart(buildGuestCart(next));
    },
    [user]
  );

  const value = useMemo(
    () => ({ cart, syncing, addItem, setQuantity, removeItem, refresh }),
    [cart, syncing, addItem, setQuantity, removeItem, refresh]
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};
