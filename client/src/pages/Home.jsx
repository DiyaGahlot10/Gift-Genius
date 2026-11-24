import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Gift, HeartHandshake, MessageCircle, Sparkles, SlidersHorizontal, ShieldCheck, Truck } from 'lucide-react';
import api from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { ErrorState, ProductGridSkeleton } from '../components/Feedback.jsx';
import { CATEGORIES, OCCASIONS } from '../utils/constants.js';
import usePageTitle from '../hooks/usePageTitle.js';

const steps = [
  {
    icon: HeartHandshake,
    title: 'Tell us about your person',
    text: 'Share who they are, the occasion, their personality, interests and your budget.',
  },
  {
    icon: Sparkles,
    title: 'Get personalised recommendations',
    text: 'Our scoring engine ranks every gift against your answers and explains each pick.',
  },
  {
    icon: Gift,
    title: 'Make their day special',
    text: 'Add it to your cart, include a gift message and we will deliver it with care.',
  },
];

const reasons = [
  {
    icon: SlidersHorizontal,
    title: 'Matched, not guessed',
    text: 'Every match percentage is calculated from real product data, never random.',
  },
  {
    icon: MessageCircle,
    title: 'We tell you why',
    text: 'Each recommendation comes with a plain-English reason it suits your person.',
  },
  {
    icon: Truck,
    title: 'Free delivery over ₹999',
    text: 'Gift-ready packaging and a personal message on every order.',
  },
  {
    icon: ShieldCheck,
    title: 'Curated and trusted',
    text: 'A hand-picked catalogue across seven categories, with honest ratings.',
  },
];

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blush-200/50 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 top-40 h-80 w-80 rounded-full bg-lavender-200/60 blur-3xl" />

      <div className="container-page relative grid items-center gap-12 py-14 lg:grid-cols-2 lg:py-24">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-plum-600 shadow-soft">
            <Sparkles className="h-4 w-4 text-lavender-500" /> Gifting that starts with the person
          </p>
          <h1 className="text-4xl leading-[1.1] sm:text-5xl lg:text-6xl">
            Finding the perfect gift <span className="italic text-lavender-500">shouldn&apos;t</span> be difficult.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-ink/70">
            Tell us about someone special, and we&apos;ll help you discover a gift they&apos;ll truly love.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/find-a-gift" className="btn-primary !px-7 !py-3.5 text-base">
              Find the Perfect Gift <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/shop" className="btn-secondary !px-7 !py-3.5 text-base">
              Explore Gifts
            </Link>
          </div>
          <p className="mt-6 text-sm text-ink/60">Because every person deserves a thoughtful gift.</p>
        </div>

        {/* Decorative composition: no data, just brand illustration */}
        <div className="relative mx-auto aspect-square w-full max-w-md" aria-hidden="true">
          <div className="absolute inset-6 rounded-[3rem] bg-gradient-to-br from-lavender-300 via-lavender-200 to-blush-200" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="floaty flex h-44 w-44 items-center justify-center rounded-[2.5rem] bg-plum-600 text-white shadow-lift">
              <Gift className="h-20 w-20" strokeWidth={1.4} />
            </div>
          </div>
          <span className="floaty absolute left-0 top-12 rounded-full bg-white px-4 py-2 text-sm font-semibold text-plum-700 shadow-lift [animation-delay:-2s]">
            Best friend
          </span>
          <span className="floaty absolute right-0 top-24 rounded-full bg-white px-4 py-2 text-sm font-semibold text-plum-700 shadow-lift [animation-delay:-4s]">
            Loves painting
          </span>
          <span className="floaty absolute bottom-24 left-4 rounded-full bg-blush-100 px-4 py-2 text-sm font-semibold text-plum-700 shadow-lift [animation-delay:-1s]">
            ₹500 – ₹1,000
          </span>
          <span className="floaty absolute bottom-10 right-6 rounded-full bg-white px-4 py-2 text-sm font-semibold text-plum-700 shadow-lift [animation-delay:-3s]">
            Birthday
          </span>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  usePageTitle('');
  const [featured, setFeatured] = useState([]);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');

  const load = useCallback(() => {
    setState('loading');
    api
      .get('/products', { params: { featured: true, limit: 8, sort: 'popularity' } })
      .then((res) => {
        setFeatured(res.data.data.products);
        setState('ready');
      })
      .catch((err) => {
        setError(err.message);
        setState('error');
      });
  }, []);

  useEffect(load, [load]);

  return (
    <>
      <Hero />

      {/* How it works */}
      <section className="container-page py-16">
        <SectionHeading
          center
          eyebrow="How GiftGenius works"
          title="Three steps to a gift they'll love"
          subtitle="No more endless scrolling. Start with the person and we'll do the searching."
        />
        <div className="grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="card relative p-8">
              <span className="absolute right-6 top-5 font-display text-5xl font-bold text-lavender-100">{i + 1}</span>
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-lavender-100 text-lavender-600">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="text-xl">{s.title}</h3>
              <p className="mt-2 text-ink/70">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by occasion */}
      <section className="container-page py-12">
        <SectionHeading
          eyebrow="Shop by occasion"
          title="What are you celebrating?"
          linkTo="/occasions"
          linkLabel="All occasions"
        />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {OCCASIONS.filter((o) => o.featured).map((o) => (
            <Link
              key={o.value}
              to={`/shop?occasion=${encodeURIComponent(o.value)}`}
              className="card group flex flex-col items-center gap-3 p-6 text-center transition hover:-translate-y-1 hover:shadow-lift"
            >
              <span className={`flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-110 ${o.tint}`}>
                <o.icon className="h-6 w-6" />
              </span>
              <span className="font-semibold text-plum-700">{o.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="container-page py-12">
        <SectionHeading
          eyebrow="Popular categories"
          title="Browse by gift type"
          linkTo="/shop"
          linkLabel="View all gifts"
        />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((c) => (
            <Link
              key={c.value}
              to={`/shop?category=${encodeURIComponent(c.value)}`}
              className="card group flex items-center gap-4 p-5 transition hover:-translate-y-1 hover:shadow-lift"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blush-100 text-blush-400 transition group-hover:bg-plum-600 group-hover:text-white">
                <c.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-plum-700">{c.value}</span>
                <span className="block text-sm text-ink/60">{c.blurb}</span>
              </span>
            </Link>
          ))}
          <Link
            to="/find-a-gift"
            className="group flex items-center gap-4 rounded-3xl bg-plum-600 p-5 text-white shadow-soft transition hover:-translate-y-1 hover:bg-plum-700"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/15">
              <Sparkles className="h-5 w-5" />
            </span>
            <span>
              <span className="block font-semibold">Not sure? Let us pick</span>
              <span className="block text-sm text-white/70">Try the Gift Finder</span>
            </span>
          </Link>
        </div>
      </section>

      {/* Featured */}
      <section className="container-page py-12">
        <SectionHeading
          eyebrow="Featured gifts"
          title="Loved by gift-givers"
          subtitle="A few favourites to start with."
          linkTo="/shop"
          linkLabel="Shop all"
        />
        {state === 'loading' && <ProductGridSkeleton count={8} />}
        {state === 'error' && <ErrorState message={error} onRetry={load} />}
        {state === 'ready' && (
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {featured.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* Why choose us */}
      <section className="container-page py-16">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-lavender-100 via-cream-dark to-blush-100 px-6 py-14 sm:px-12">
          <SectionHeading center eyebrow="Why GiftGenius" title="A smarter way to give" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {reasons.map((r) => (
              <div key={r.title} className="rounded-3xl bg-white/80 p-6">
                <r.icon className="mb-4 h-7 w-7 text-plum-600" />
                <h3 className="font-sans text-lg font-semibold">{r.title}</h3>
                <p className="mt-2 text-sm text-ink/70">{r.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/find-a-gift" className="btn-primary !px-8 !py-3.5 text-base">
              Start the Gift Finder <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
