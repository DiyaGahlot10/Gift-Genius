import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Check, PackageOpen, RefreshCw } from 'lucide-react';
import api from '../services/api.js';
import SafeImage from '../components/SafeImage.jsx';
import { EmptyState, ErrorState, Skeleton } from '../components/Feedback.jsx';
import { ORDER_STATUSES, PAYMENT_LABELS, PAYMENT_STATUS_LABELS } from '../utils/constants.js';
import { formatDateTime, formatPrice } from '../utils/format.js';
import usePageTitle from '../hooks/usePageTitle.js';

function StatusTracker({ status }) {
  const current = ORDER_STATUSES.indexOf(status);
  return (
    <ol className="flex items-center" aria-label={`Order status: ${status}`}>
      {ORDER_STATUSES.map((s, i) => {
        const done = i <= current;
        return (
          <li key={s} className={`flex items-center ${i < ORDER_STATUSES.length - 1 ? 'flex-1' : ''}`}>
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                  done ? 'bg-plum-600 text-white' : 'bg-lavender-100 text-plum-400'
                }`}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : i + 1}
              </span>
              <span className={`text-center text-[11px] leading-tight sm:text-xs ${i === current ? 'font-bold text-plum-700' : 'text-ink/50'}`}>
                {s}
              </span>
            </div>
            {i < ORDER_STATUSES.length - 1 && (
              <span className={`mx-1 mb-5 h-0.5 flex-1 rounded-full ${i < current ? 'bg-plum-600' : 'bg-lavender-100'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default function MyOrders() {
  usePageTitle('My orders');
  const [orders, setOrders] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setState('loading');
    api
      .get('/orders/my-orders')
      .then((res) => {
        setOrders(res.data.data.orders);
        setState('ready');
      })
      .catch((err) => {
        setError(err.message);
        setState('error');
      });
  }, []);

  useEffect(load, [load]);

  return (
    <div className="container-page max-w-4xl py-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl sm:text-4xl">My orders</h1>
        <button onClick={load} className="btn-secondary !px-4 !py-2" aria-label="Refresh orders">
          <RefreshCw className="h-4 w-4" /> Refresh
        </button>
      </div>

      {state === 'loading' && (
        <div className="space-y-4">
          <Skeleton className="h-56 rounded-3xl" />
          <Skeleton className="h-56 rounded-3xl" />
        </div>
      )}
      {state === 'error' && <ErrorState message={error} onRetry={load} />}
      {state === 'ready' && orders.length === 0 && (
        <EmptyState
          icon={PackageOpen}
          title="No orders yet"
          text="When you place an order, it will show up here."
          actionLabel="Find a gift"
          actionTo="/find-a-gift"
        />
      )}

      {state === 'ready' && orders.length > 0 && (
        <ul className="space-y-5">
          {orders.map((o) => (
            <li key={o._id} className="card p-5 sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <Link to={`/order-confirmation/${o.orderId}`} className="font-mono text-base font-semibold text-plum-700 hover:underline">
                    {o.orderId}
                  </Link>
                  <p className="text-sm text-ink/60">Placed {formatDateTime(o.createdAt)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-plum-700">{formatPrice(o.total)}</p>
                  <p className="text-sm text-ink/60">
                    {PAYMENT_LABELS[o.paymentMethod]} · {PAYMENT_STATUS_LABELS[o.paymentStatus]}
                  </p>
                </div>
              </div>

              <div className="my-6">
                <StatusTracker status={o.orderStatus} />
              </div>

              <ul className="divide-y divide-plum-600/10 rounded-2xl bg-lavender-50/60 px-4">
                {o.items.map((i) => (
                  <li key={i.product} className="flex items-center gap-3 py-3">
                    <SafeImage src={i.image} alt={i.name} className="h-14 w-14 shrink-0 rounded-xl" />
                    <div className="min-w-0 flex-1">
                      <Link to={`/product/${i.product}`} className="line-clamp-1 text-sm font-medium hover:text-plum-600">
                        {i.name}
                      </Link>
                      <p className="text-xs text-ink/60">
                        Qty {i.quantity} · {formatPrice(i.priceAtPurchase)} each
                      </p>
                    </div>
                    <p className="text-sm font-semibold">{formatPrice(i.priceAtPurchase * i.quantity)}</p>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
