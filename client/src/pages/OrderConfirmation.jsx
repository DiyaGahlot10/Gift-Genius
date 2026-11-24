import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, CheckCircle2, MapPin, PackageX } from 'lucide-react';
import api from '../services/api.js';
import SafeImage from '../components/SafeImage.jsx';
import { EmptyState, ErrorState, PageLoader } from '../components/Feedback.jsx';
import { PAYMENT_LABELS, PAYMENT_STATUS_LABELS } from '../utils/constants.js';
import { formatDate, formatPrice } from '../utils/format.js';
import usePageTitle from '../hooks/usePageTitle.js';

export default function OrderConfirmation() {
  usePageTitle('Order confirmed');
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [status, setStatus] = useState(0);

  const load = useCallback(() => {
    setState('loading');
    api
      .get(`/orders/${id}`)
      .then((res) => {
        setOrder(res.data.data.order);
        setState('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus(err.status || 0);
        setState('error');
      });
  }, [id]);

  useEffect(load, [load]);

  if (state === 'loading') return <PageLoader label="Loading your order..." />;
  if (state === 'error') {
    return status === 404 ? (
      <EmptyState icon={PackageX} title="Order not found" text="We couldn't find that order on your account." actionLabel="View my orders" actionTo="/my-orders" />
    ) : (
      <ErrorState message={error} onRetry={load} />
    );
  }

  const a = order.shippingAddress;
  return (
    <div className="container-page max-w-3xl py-12">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircle2 className="h-10 w-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl">Thank you! Your order is placed.</h1>
        <p className="mt-3 text-ink/70">
          Order ID <strong className="font-mono text-plum-700">{order.orderId}</strong>
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <div className="card p-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-plum-700">
            <CalendarDays className="h-4 w-4" /> Estimated delivery
          </p>
          <p className="text-lg font-semibold">
            {formatDate(order.estimatedDelivery.from)} – {formatDate(order.estimatedDelivery.to)}
          </p>
        </div>
        <div className="card p-5">
          <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-plum-700">
            <MapPin className="h-4 w-4" /> Delivering to
          </p>
          <p className="text-sm leading-relaxed text-ink/80">
            <strong>{a.name}</strong> · {a.phone}
            <br />
            {a.address}, {a.city}, {a.state} {a.pincode}
          </p>
        </div>
      </div>

      <div className="card mt-4 p-6">
        <h2 className="mb-4 font-sans text-lg font-semibold">Your gifts</h2>
        <ul className="divide-y divide-plum-600/10">
          {order.items.map((i) => (
            <li key={i.product} className="flex items-center gap-4 py-3">
              <SafeImage src={i.image} alt={i.name} className="h-16 w-16 shrink-0 rounded-xl" />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 font-medium">{i.name}</p>
                <p className="text-sm text-ink/60">
                  {formatPrice(i.priceAtPurchase)} × {i.quantity}
                </p>
              </div>
              <p className="font-semibold">{formatPrice(i.priceAtPurchase * i.quantity)}</p>
            </li>
          ))}
        </ul>

        {order.giftMessage && (
          <div className="mt-4 rounded-2xl bg-lavender-50 p-4 text-sm">
            <p className="mb-1 font-semibold text-plum-700">Gift message</p>
            <p className="italic text-ink/80">&ldquo;{order.giftMessage}&rdquo;</p>
          </div>
        )}

        <dl className="mt-5 space-y-2 border-t border-plum-600/10 pt-4 text-sm">
          <div className="flex justify-between"><dt className="text-ink/70">Subtotal</dt><dd>{formatPrice(order.subtotal)}</dd></div>
          <div className="flex justify-between"><dt className="text-ink/70">Delivery</dt><dd>{order.deliveryCharge === 0 ? 'Free' : formatPrice(order.deliveryCharge)}</dd></div>
          <div className="flex justify-between text-base font-bold text-plum-700"><dt>Total</dt><dd>{formatPrice(order.total)}</dd></div>
          <div className="flex justify-between pt-2"><dt className="text-ink/70">Payment</dt><dd>{PAYMENT_LABELS[order.paymentMethod]} · {PAYMENT_STATUS_LABELS[order.paymentStatus]}</dd></div>
        </dl>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/my-orders" className="btn-primary">View my orders</Link>
        <Link to="/shop" className="btn-secondary">Keep shopping</Link>
      </div>
    </div>
  );
}
