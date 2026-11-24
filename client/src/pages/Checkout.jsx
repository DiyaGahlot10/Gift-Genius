import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Banknote, CreditCard, Loader2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api.js';
import SafeImage from '../components/SafeImage.jsx';
import { PageLoader } from '../components/Feedback.jsx';
import { OrderSummary } from './Cart.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { INDIAN_STATES } from '../utils/constants.js';
import { formatPrice } from '../utils/format.js';
import usePageTitle from '../hooks/usePageTitle.js';

const validate = (f) => {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Please enter the recipient or customer name';
  if (!/^[6-9]\d{9}$/.test(f.phone.trim())) e.phone = 'Enter a valid 10-digit mobile number';
  if (f.address.trim().length < 5) e.address = 'Please enter the full delivery address';
  if (f.city.trim().length < 2) e.city = 'Please enter the city';
  if (!f.state) e.state = 'Please choose a state';
  if (!/^[1-9]\d{5}$/.test(f.pincode.trim())) e.pincode = 'Enter a valid 6-digit PIN code';
  if (f.giftMessage.length > 300) e.giftMessage = 'Gift message can be at most 300 characters';
  return e;
};

function Field({ label, error, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-plum-700">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-ink/50">{hint}</span>}
      {error && (
        <span role="alert" className="mt-1 block text-xs font-medium text-rose-600">
          {error}
        </span>
      )}
    </label>
  );
}

export default function Checkout() {
  usePageTitle('Checkout');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { cart, syncing, refresh } = useCart();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    giftMessage: '',
    paymentMethod: 'cod',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(false);

  // Make sure the cart (prices and stock) is fresh when checkout opens.
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((er) => ({ ...er, [key]: undefined }));
  };

  if (syncing && cart.items.length === 0) return <PageLoader label="Loading your cart..." />;
  if (cart.items.length === 0 && !placed) return <Navigate to="/cart" replace />;

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) {
      toast.error('Please fix the highlighted fields');
      return;
    }
    if (cart.items.some((i) => !i.available)) {
      toast.error('Some items have limited stock. Please update your cart.');
      navigate('/cart');
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/orders', {
        shippingAddress: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          state: form.state,
          pincode: form.pincode.trim(),
        },
        giftMessage: form.giftMessage.trim(),
        paymentMethod: form.paymentMethod,
      });
      setPlaced(true);
      await refresh();
      toast.success('Order placed! Thank you.');
      navigate(`/order-confirmation/${res.data.data.order.orderId}`, { replace: true });
    } catch (err) {
      toast.error(err.message);
      if (err.status === 409) {
        await refresh(); // stock changed, show the latest cart
        navigate('/cart');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = (key) => `input ${errors[key] ? '!border-rose-400 !ring-rose-200' : ''}`;

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-3xl sm:text-4xl">Checkout</h1>

      <form onSubmit={submit} noValidate className="grid gap-8 lg:grid-cols-[1fr_24rem]">
        <div className="space-y-8">
          {/* Delivery */}
          <section className="card p-6 sm:p-8">
            <h2 className="mb-5 font-sans text-xl font-semibold">Delivery details</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Full name" error={errors.name}>
                <input value={form.name} onChange={set('name')} autoComplete="name" className={inputClass('name')} />
              </Field>
              <Field label="Phone number" error={errors.phone} hint="10-digit mobile number">
                <input value={form.phone} onChange={set('phone')} inputMode="numeric" maxLength={10} autoComplete="tel-national" className={inputClass('phone')} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Delivery address" error={errors.address}>
                  <textarea value={form.address} onChange={set('address')} rows={3} autoComplete="street-address" className={inputClass('address')} />
                </Field>
              </div>
              <Field label="City" error={errors.city}>
                <input value={form.city} onChange={set('city')} autoComplete="address-level2" className={inputClass('city')} />
              </Field>
              <Field label="State" error={errors.state}>
                <select value={form.state} onChange={set('state')} autoComplete="address-level1" className={inputClass('state')}>
                  <option value="">Select state</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="PIN code" error={errors.pincode}>
                <input value={form.pincode} onChange={set('pincode')} inputMode="numeric" maxLength={6} autoComplete="postal-code" className={inputClass('pincode')} />
              </Field>
            </div>
          </section>

          {/* Gift message */}
          <section className="card p-6 sm:p-8">
            <h2 className="mb-1 font-sans text-xl font-semibold">Gift message <span className="text-sm font-normal text-ink/50">(optional)</span></h2>
            <p className="mb-4 text-sm text-ink/60">We&apos;ll include a note with the gift.</p>
            <Field error={errors.giftMessage} label="Your message">
              <textarea
                value={form.giftMessage}
                onChange={set('giftMessage')}
                rows={3}
                maxLength={300}
                placeholder="Happy birthday! I hope this makes you smile..."
                className={inputClass('giftMessage')}
              />
            </Field>
            <p className="mt-1 text-right text-xs text-ink/50">{form.giftMessage.length}/300</p>
          </section>

          {/* Payment */}
          <section className="card p-6 sm:p-8">
            <h2 className="mb-5 font-sans text-xl font-semibold">Payment method</h2>
            <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Payment method">
              {[
                { value: 'cod', icon: Banknote, title: 'Cash on Delivery', text: 'Pay when your gift arrives.' },
                { value: 'demo-online', icon: CreditCard, title: 'Online payment (demo)', text: 'Simulated for this project. No real money is charged.' },
              ].map((m) => (
                <label
                  key={m.value}
                  className={`flex cursor-pointer gap-3 rounded-2xl border-2 p-4 transition ${
                    form.paymentMethod === m.value ? 'border-plum-600 bg-lavender-50' : 'border-plum-600/10 hover:border-lavender-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value={m.value}
                    checked={form.paymentMethod === m.value}
                    onChange={set('paymentMethod')}
                    className="mt-1 accent-plum-600"
                  />
                  <span>
                    <span className="flex items-center gap-2 font-semibold">
                      <m.icon className="h-4 w-4 text-plum-600" /> {m.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-ink/60">{m.text}</span>
                  </span>
                </label>
              ))}
            </div>
          </section>
        </div>

        {/* Summary */}
        <aside>
          <div className="lg:sticky lg:top-24">
            <OrderSummary cart={cart}>
              <ul className="mt-5 max-h-60 space-y-3 overflow-auto border-t border-plum-600/10 pt-4">
                {cart.items.map((i) => (
                  <li key={i.product._id} className="flex items-center gap-3 text-sm">
                    <SafeImage src={i.product.image} alt={i.product.name} className="h-12 w-12 shrink-0 rounded-xl" />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-1 font-medium">{i.product.name}</span>
                      <span className="text-ink/60">Qty {i.quantity}</span>
                    </span>
                    <span className="font-semibold">{formatPrice(i.lineTotal)}</span>
                  </li>
                ))}
              </ul>
              <button type="submit" disabled={submitting} className="btn-primary mt-6 w-full !py-3.5">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                {submitting ? 'Placing order...' : `Place order · ${formatPrice(cart.total)}`}
              </button>
              <Link to="/cart" className="mt-3 block text-center text-sm font-medium text-plum-600 hover:text-plum-800">
                Back to cart
              </Link>
            </OrderSummary>
          </div>
        </aside>
      </form>
    </div>
  );
}
