import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import { useAuth } from './AuthContext.jsx';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [ids, setIds] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      setProducts([]);
      setIds([]);
      return;
    }
    setLoading(true);
    api
      .get('/wishlist')
      .then((res) => {
        setProducts(res.data.data.products);
        setIds(res.data.data.ids);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, [user]);

  const has = useCallback((id) => ids.includes(String(id)), [ids]);

  const toggle = useCallback(
    async (productId) => {
      if (!user) {
        toast('Please log in to save gifts to your wishlist');
        navigate('/login', { state: { from: location.pathname + location.search } });
        return;
      }
      const saved = ids.includes(String(productId));
      try {
        const res = saved
          ? await api.delete(`/wishlist/${productId}`)
          : await api.post('/wishlist', { productId });
        setProducts(res.data.data.products);
        setIds(res.data.data.ids);
        toast.success(saved ? 'Removed from your wishlist' : 'Saved to your wishlist');
      } catch (err) {
        toast.error(err.message);
      }
    },
    [user, ids, navigate, location]
  );

  const value = useMemo(() => ({ products, ids, loading, has, toggle }), [products, ids, loading, has, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used inside WishlistProvider');
  return ctx;
};
