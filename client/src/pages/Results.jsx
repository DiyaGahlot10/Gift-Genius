import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, ChevronDown, Crown, Info, Pencil, RotateCcw, ShoppingBag, Sparkles } from 'lucide-react';
import api from '../services/api.js';
import SafeImage from '../components/SafeImage.jsx';
import Rating from '../components/Rating.jsx';
import WishlistButton from '../components/WishlistButton.jsx';
import { EmptyState, ErrorState, Skeleton } from '../components/Feedback.jsx';
import { useCart } from '../context/CartContext.jsx';
import { budgetLabel, clearFinder, isComplete, loadFinder } from '../utils/giftFinder.js';
import { discountPercent, formatPrice } from '../utils/format.js';
import usePageTitle from '../hooks/usePageTitle.js';

const FACTOR_LABELS = {
  interest: 'Interests',
  personality: 'Personality',
  budget: 'Budget fit',
  occasion: 'Occasion',
  style: 'Gift style',
};

// Circular match gauge. The number is the engine's real score, never a placeholder.
function MatchRing({ percent, size = 88 }) {
  const stroke = 8;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-label={`${percent} percent match`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-lavender-100" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - percent / 100)}
          className="stroke-plum-600 transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center leading-none">
        <span className="font-display text-xl font-bold text-plum-700">{percent}%</span>
        <span className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-ink/50">match</span>
      </div>
    </div>
  );
}

function Breakdown({ breakdown }) {
  const [open, setOpen] = useState(false);
  const rows = Object.entries(breakdown).filter(([, v]) => v !== null);
  return (
    <div className="mt-4">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-plum-600 hover:text-plum-800"
      >
        <Info className="h-4 w-4" /> How we scored this
        <ChevronDown className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="mt-3 space-y-2 rounded-2xl bg-lavender-50 p-4">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[6.5rem_1fr_2.5rem] items-center gap-3 text-sm">
              <span className="text-ink/70">{FACTOR_LABELS[k]}</span>
              <span className="h-2 overflow-hidden rounded-full bg-white">
                <span className="block h-full rounded-full bg-lavender-400" style={{ width: `${Math.min(100, v * 100 * 2.5)}%` }} />
              </span>
              <span className="text-right font-semibold tabular-nums text-plum-700">{Math.round(v * 100)}</span>
            </div>
          ))}
          <p className="pt-1 text-xs text-ink/50">
            Points are each factor&apos;s weighted share of the final score. Small adjustments for relationship fit and
            budget can also apply.
          </p>
        </div>
      )}
    </div>
  );
}

function ResultCard({ result, featured = false }) {
  const { addItem } = useCart();
  const { product } = result;
  const off = discountPercent(product.price, product.originalPrice);
  const soldOut = product.stock < 1;

  return (
    <article
      className={`card overflow-hidden ${featured ? 'grid md:grid-cols-[minmax(0,2fr)_3fr]' : 'flex flex-col'} ${
        featured ? 'ring-2 ring-lavender-300' : ''
      }`}
    >
      <div className="relative">
        <Link to={`/product/${product._id}`} className="block">
          <SafeImage src={product.image} alt={product.name} className={featured ? 'aspect-square h-full w-full md:aspect-auto md:min-h-full' : 'aspect-[4/3] w-full'} />
        </Link>
        {off > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-plum-600 px-2.5 py-1 text-xs font-semibold text-white">{off}% off</span>
        )}
        <WishlistButton productId={product._id} className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/90 shadow-soft hover:scale-110" />
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            {featured && (
              <p className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-blush-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-plum-700">
                <Crown className="h-3.5 w-3.5" /> Best match
              </p>
            )}
            <h3 className={`font-sans font-semibold leading-snug text-ink ${featured ? 'text-2xl' : 'text-lg'}`}>
              <Link to={`/product/${product._id}`} className="hover:text-plum-600">
                {product.name}
              </Link>
            </h3>
            <Rating value={product.rating} count={product.numReviews} className="mt-1" />
          </div>
          <MatchRing percent={result.matchPercent} size={featured ? 96 : 72} />
        </div>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-xl font-bold text-plum-700">{formatPrice(product.price)}</span>
          {off > 0 && <span className="text-sm text-ink/40 line-through">{formatPrice(product.originalPrice)}</span>}
        </div>

        <div className="mt-4 rounded-2xl bg-lavender-50 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-lavender-600">
            <Sparkles className="h-3.5 w-3.5" /> Why we picked this
          </p>
          <p className="text-sm leading-relaxed text-ink/80">{result.explanation}</p>
          {result.isCloseMatch && (
            <p className="mt-2 text-xs font-medium text-amber-700">Closest available match for your answers.</p>
          )}
        </div>

        <Breakdown breakdown={result.breakdown} />

        <div className="mt-5 flex flex-wrap gap-3 pt-1">
          <Link to={`/product/${product._id}`} className="btn-secondary !px-5 !py-2.5">
            View details
          </Link>
          <button onClick={() => addItem(product)} disabled={soldOut} className="btn-primary !px-5 !py-2.5">
            <ShoppingBag className="h-4 w-4" /> {soldOut ? 'Out of stock' : 'Add to cart'}
          </button>
        </div>
      </div>
    </article>
  );
}

function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-72 w-full rounded-3xl" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-96 rounded-3xl" />
        <Skeleton className="h-96 rounded-3xl" />
      </div>
    </div>
  );
}

export default function Results() {
  usePageTitle('Your gift recommendations');
  const navigate = useNavigate();
  const [answers] = useState(() => loadFinder().answers);
  const [data, setData] = useState(null);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setState('loading');
    api
      .post('/recommendations', answers)
      .then((res) => {
        setData(res.data.data);
        setState('ready');
      })
      .catch((err) => {
        setError(err.message);
        setState('error');
      });
  }, [answers]);

  useEffect(() => {
    if (!isComplete(answers)) {
      setState('incomplete');
      return;
    }
    load();
  }, [answers, load]);

  const startOver = () => {
    clearFinder();
    navigate('/find-a-gift');
  };

  if (state === 'incomplete') {
    return (
      <EmptyState
        icon={Sparkles}
        title="Tell us about your person first"
        text="Answer a few quick questions and we will find gifts they'll love."
        actionLabel="Start the Gift Finder"
        actionTo="/find-a-gift"
      />
    );
  }

  const criteria = data?.criteria;
  const [best, ...others] = data?.results || [];

  return (
    <div className="container-page max-w-6xl py-10 sm:py-14">
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-5xl">We found some gifts they&apos;ll absolutely love!</h1>
        <p className="mx-auto mt-3 max-w-2xl text-ink/70">
          Ranked by how closely each gift matches your answers. Open &quot;How we scored this&quot; on any gift to see exactly why.
        </p>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {[
            criteria?.relationship || answers.relationship,
            criteria?.occasion || answers.occasion,
            ...(criteria?.personalities || answers.personalities),
            ...(criteria?.interests || answers.interests),
            budgetLabel(criteria?.budget?.id || answers.budget),
            criteria?.giftStyle || answers.giftStyle,
          ].map((chip, i) => (
            <span key={`${chip}-${i}`} className="rounded-full bg-white px-3.5 py-1.5 text-sm font-medium text-plum-700 shadow-soft">
              {chip}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <Link to="/find-a-gift" className="btn-secondary !px-5 !py-2.5">
            <Pencil className="h-4 w-4" /> Edit answers
          </Link>
          <button onClick={startOver} className="btn-secondary !px-5 !py-2.5">
            <RotateCcw className="h-4 w-4" /> Start over
          </button>
        </div>
      </div>

      {state === 'loading' && <ResultsSkeleton />}
      {state === 'error' && <ErrorState message={error} onRetry={load} />}

      {state === 'ready' && data.results.length === 0 && (
        <EmptyState
          icon={Sparkles}
          title="No gifts available right now"
          text="Please check back soon, or browse the full shop."
          actionLabel="Browse the shop"
          actionTo="/shop"
        />
      )}

      {state === 'ready' && best && (
        <>
          {data.closestMatch && (
            <div role="status" className="mb-6 flex items-start gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-900">
              <Info className="mt-0.5 h-5 w-5 shrink-0" />
              <p>
                <strong>Closest matches for your answers.</strong> We don&apos;t have many gifts that fit every detail, so
                these are the nearest options. Try a different budget or fewer filters for more exact matches.
              </p>
            </div>
          )}

          <ResultCard result={best} featured />

          {others.length > 0 && (
            <section className="mt-14">
              <h2 className="mb-6 text-2xl sm:text-3xl">More gifts they&apos;d love</h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {others.map((r) => (
                  <ResultCard key={r.product._id} result={r} />
                ))}
              </div>
            </section>
          )}

          <div className="mt-14 rounded-3xl bg-white p-8 text-center shadow-soft">
            <h2 className="text-2xl">Want to see more?</h2>
            <p className="mt-2 text-ink/70">Browse the full collection, or try the Gift Finder again for someone else.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link to="/shop" className="btn-primary">
                Browse all gifts <ArrowRight className="h-4 w-4" />
              </Link>
              <button onClick={startOver} className="btn-secondary">
                Find a gift for someone else
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
