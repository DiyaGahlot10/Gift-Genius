import { Link, useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowRight, ShoppingBag, Trash2, Truck } from 'lucide-react';
import SafeImage from '../components/SafeImage.jsx';
import QuantitySelector from '../components/QuantitySelector.jsx';
import { EmptyState, PageLoader } from '../components/Feedback.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatPrice } from '../utils/format.js';
import { MAX_QTY_PER_ITEM } from '../utils/pricing.js';
import usePageTitle from '../hooks/usePageTitle.js';

export function OrderSummary({ cart, children }) {
  const progress = Math.min(100, (cart.subtotal / cart.freeDeliveryThreshold) * 100);
  return (
    <div className="card p-6">
      <h2 className="font-sans text-lg font-semibold">Order summary</h2>
      <dl className="mt-4 space-y-3 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink/70">Subtotal ({cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'})</dt>
          <dd className="font-medium">{formatPrice(cart.subtotal)}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink/70">Delivery</dt>
          <dd className="font-medium">{cart.deliveryCharge === 0 ? <span className="text-emerald-600">Free</span> : formatPrice(cart.deliveryCharge)}</dd>
        </div>
        <div className="flex justify-between border-t border-plum-600/10 pt-3 text-base">
          <dt className="font-semibold">Total</dt>
          <dd className="font-bold text-plum-700">{formatPrice(cart.total)}</dd>
        </div>
      </dl>

      {cart.amountToFreeDelivery > 0 ? (
        <div className="mt-5 rounded-2xl bg-lavender-50 p-4 text-sm">
          <p className="flex items-center gap-2 text-ink/80">
            <Truck className="h-4 w-4 text-plum-600" /> Add <strong>{formatPrice(cart.amountToFreeDelivery)}</strong> more for free delivery
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white">
            <div className="h-full rounded-full bg-lavender-400 transition-all" style={{ width: `${progress}%` }} />
          </div>
        </div>
      ) : (
        cart.itemCount > 0 && (
          <p className="mt-5 flex items-center gap-2 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-700">
            <Truck className="h-4 w-4" /> You&apos;ve unlocked free delivery
          </p>
        )
      )}
      {children}
    </div>
  );
}

export default function Cart() {
  usePageTitle('Your cart');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, syncing, setQuantity, removeItem } = useCart();

  if (syncing && cart.items.length === 0) return <PageLoader label="Loading your cart..." />;

  if (cart.items.length === 0) {
    return (
      <EmptyState
        icon={ShoppingBag}
        title="Your cart is empty"
        text="Let's find something thoughtful to put in it."
        actionLabel="Find the perfect gift"
        actionTo="/find-a-gift"
      />
    );
  }

  const hasUnavailable = cart.items.some((i) => !i.available);

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-3xl sm:text-4xl">Your cart</h1>

      {hasUnavailable && (
        <div role="alert" className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>Some items have limited stock. Please lower their quantity before checking out.</p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
        <ul className="space-y-4">
          {cart.items.map((item) => {
            const p = item.product;
            const max = Math.min(MAX_QTY_PER_ITEM, p.stock);
            return (
              <li key={p._id} className="card flex gap-4 p-4 sm:gap-6 sm:p-5">
                <Link to={`/product/${p._id}`} className="shrink-0">
                  <SafeImage src={p.image} alt={p.name} className="h-24 w-24 rounded-2xl sm:h-28 sm:w-28" />
                </Link>
                <div className="flex min-w-0 flex-1 flex-col justify-between gap-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link to={`/product/${p._id}`} className="line-clamp-2 font-semibold hover:text-plum-600">
                        {p.name}
                      </Link>
                      <p className="mt-0.5 text-sm text-ink/60">{formatPrice(p.price)} each</p>
                      {!item.available && <p className="mt-1 text-xs font-medium text-amber-700">Only {p.stock} in stock</p>}
                    </div>
                    <button
                      onClick={() => removeItem(p._id)}
                      aria-label={`Remove ${p.name}`}
                      className="rounded-full p-2 text-ink/40 transition hover:bg-rose-50 hover:text-rose-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <QuantitySelector size="sm" value={item.quantity} max={max} onChange={(q) => setQuantity(p._id, q)} />
                    <span className="text-lg font-bold text-plum-700">{formatPrice(item.lineTotal)}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <aside>
          <div className="lg:sticky lg:top-24">
            <OrderSummary cart={cart}>
              <button
                onClick={() => navigate('/checkout')}
                disabled={hasUnavailable}
                className="btn-primary mt-6 w-full !py-3.5"
              >
                {user ? 'Proceed to checkout' : 'Log in to checkout'} <ArrowRight className="h-4 w-4" />
              </button>
              <Link to="/shop" className="mt-3 block text-center text-sm font-medium text-plum-600 hover:text-plum-800">
                Continue shopping
              </Link>
            </OrderSummary>
          </div>
        </aside>
      </div>
    </div>
  );
}
