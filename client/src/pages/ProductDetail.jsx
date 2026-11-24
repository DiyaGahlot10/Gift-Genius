import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ChevronRight, PackageX, ShoppingBag, Sparkles, Truck } from 'lucide-react';
import api from '../services/api.js';
import SafeImage from '../components/SafeImage.jsx';
import Rating from '../components/Rating.jsx';
import QuantitySelector from '../components/QuantitySelector.jsx';
import WishlistButton from '../components/WishlistButton.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { EmptyState, ErrorState, Skeleton } from '../components/Feedback.jsx';
import { useCart } from '../context/CartContext.jsx';
import { discountPercent, formatPrice } from '../utils/format.js';
import { MAX_QTY_PER_ITEM } from '../utils/pricing.js';
import usePageTitle from '../hooks/usePageTitle.js';

function Chips({ title, items }) {
  if (!items?.length) return null;
  return (
    <div>
      <h3 className="mb-2 font-sans text-sm font-semibold uppercase tracking-wide text-plum-700">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => (
          <span key={i} className="rounded-full bg-lavender-100 px-3 py-1 text-sm text-plum-700">
            {i}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [status, setStatus] = useState(200);
  const [qty, setQty] = useState(1);

  const load = useCallback(() => {
    setState('loading');
    setQty(1);
    api
      .get(`/products/${id}`)
      .then((res) => {
        setData(res.data.data);
        setState('ready');
      })
      .catch((err) => {
        setError(err.message);
        setStatus(err.status || 500);
        setState('error');
      });
  }, [id]);

  useEffect(load, [load]);
  usePageTitle(data?.product?.name || 'Gift details');

  if (state === 'loading') {
    return (
      <div className="container-page grid gap-10 py-10 md:grid-cols-2">
        <Skeleton className="aspect-square rounded-3xl" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-10 w-4/5" />
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full rounded-full" />
        </div>
      </div>
    );
  }

  if (state === 'error') {
    return status === 404 || status === 400 ? (
      <EmptyState icon={PackageX} title="Gift not found" text="This product may have been removed." actionLabel="Browse gifts" actionTo="/shop" />
    ) : (
      <ErrorState message={error} onRetry={load} />
    );
  }

  const { product, related } = data;
  const off = discountPercent(product.price, product.originalPrice);
  const soldOut = product.stock < 1;
  const maxQty = Math.min(MAX_QTY_PER_ITEM, product.stock);
  const specs = Object.entries(product.specifications || {});

  return (
    <div className="container-page py-8">
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-ink/60" aria-label="Breadcrumb">
        <Link to="/" className="hover:text-plum-600">Home</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to="/shop" className="hover:text-plum-600">Shop</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`} className="hover:text-plum-600">
          {product.category}
        </Link>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <div className="card overflow-hidden">
          <SafeImage src={product.image} alt={product.name} className="aspect-square w-full" />
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-lavender-600">{product.category}</p>
          <h1 className="mt-2 text-3xl sm:text-4xl">{product.name}</h1>
          <Rating value={product.rating} count={product.numReviews} className="mt-3" />

          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-plum-700">{formatPrice(product.price)}</span>
            {off > 0 && (
              <>
                <span className="text-lg text-ink/40 line-through">{formatPrice(product.originalPrice)}</span>
                <span className="rounded-full bg-blush-100 px-3 py-1 text-sm font-semibold text-plum-700">{off}% off</span>
              </>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-ink/80">{product.description}</p>

          <p className={`mt-4 text-sm font-medium ${soldOut ? 'text-rose-600' : product.stock <= 5 ? 'text-amber-600' : 'text-emerald-600'}`}>
            {soldOut ? 'Out of stock' : product.stock <= 5 ? `Only ${product.stock} left` : 'In stock'}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4">
            {!soldOut && <QuantitySelector value={qty} onChange={setQty} max={maxQty} />}
            <button onClick={() => addItem(product, qty)} disabled={soldOut} className="btn-primary !px-8 !py-3.5">
              <ShoppingBag className="h-4 w-4" /> {soldOut ? 'Out of stock' : 'Add to cart'}
            </button>
            <WishlistButton
              productId={product._id}
              label
              className="rounded-full border border-plum-600/15 bg-white px-5 py-3 hover:bg-lavender-50"
            />
          </div>

          <div className="mt-6 flex items-start gap-3 rounded-2xl bg-lavender-50 p-4 text-sm">
            <Truck className="mt-0.5 h-5 w-5 shrink-0 text-plum-600" />
            <p className="text-ink/80">
              Delivered in 3 to 6 days. Free delivery on orders of ₹999 or more, otherwise ₹49. Pay by cash on delivery.
            </p>
          </div>

          {product.whyGreatGift && (
            <div className="mt-6 rounded-3xl bg-gradient-to-br from-lavender-100 to-blush-100 p-6">
              <h2 className="flex items-center gap-2 font-sans text-lg font-semibold">
                <Sparkles className="h-5 w-5 text-lavender-600" /> Why this makes a great gift
              </h2>
              <p className="mt-2 text-ink/80">{product.whyGreatGift}</p>
            </div>
          )}

          <div className="mt-8 space-y-5">
            <Chips title="Suitable occasions" items={product.occasions} />
            <Chips title="Suits these personalities" items={product.personalities} />
          </div>

          {specs.length > 0 && (
            <div className="mt-8">
              <h2 className="mb-3 font-sans text-lg font-semibold">Product details</h2>
              <dl className="divide-y divide-plum-600/10 overflow-hidden rounded-2xl bg-white shadow-soft">
                {specs.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[9rem_1fr] gap-3 px-4 py-3 text-sm">
                    <dt className="font-medium text-plum-700">{k}</dt>
                    <dd className="text-ink/80">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-20">
          <h2 className="mb-6 text-3xl">You might also like</h2>
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
