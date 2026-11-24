export const formatPrice = (n) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(n ?? 0);

export const discountPercent = (price, original) =>
  original && original > price ? Math.round((1 - price / original) * 100) : 0;

export const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

export const formatDateTime = (value) =>
  new Date(value).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

// Safe sessionStorage / localStorage helpers (storage can be blocked or full).
export const storage = {
  get(store, key, fallback) {
    try {
      const raw = store.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(store, key, value) {
    try {
      store.setItem(key, JSON.stringify(value));
    } catch {
      /* ignore */
    }
  },
  remove(store, key) {
    try {
      store.removeItem(key);
    } catch {
      /* ignore */
    }
  },
};
