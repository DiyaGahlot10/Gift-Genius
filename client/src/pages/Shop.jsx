import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Search, SearchX, SlidersHorizontal, X } from 'lucide-react';
import api from '../services/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { EmptyState, ErrorState, ProductGridSkeleton } from '../components/Feedback.jsx';
import { CATEGORIES, OCCASIONS, PRICE_FILTERS, SORT_OPTIONS } from '../utils/constants.js';
import usePageTitle from '../hooks/usePageTitle.js';

const PAGE_SIZE = 12;

function FilterGroup({ title, children }) {
  return (
    <fieldset className="border-b border-plum-600/10 pb-5">
      <legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-plum-700">{title}</legend>
      <div className="flex flex-wrap gap-2">{children}</div>
    </fieldset>
  );
}

function Pill({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3.5 py-1.5 text-sm transition ${
        active
          ? 'border-plum-600 bg-plum-600 text-white'
          : 'border-plum-600/15 bg-white text-ink/80 hover:border-lavender-400 hover:bg-lavender-50'
      }`}
    >
      {children}
    </button>
  );
}

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [state, setState] = useState('loading');
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const occasion = params.get('occasion') || '';
  const minPrice = params.get('minPrice') || '';
  const maxPrice = params.get('maxPrice') || '';
  const sort = params.get('sort') || 'popularity';
  const page = Math.max(parseInt(params.get('page'), 10) || 1, 1);

  const [searchText, setSearchText] = useState(search);
  useEffect(() => setSearchText(search), [search]);

  const occasionInfo = OCCASIONS.find((o) => o.value === occasion);
  usePageTitle(occasionInfo ? `${occasionInfo.label} gifts` : category || 'Shop');

  // Update one or more URL params; filter changes reset to page 1.
  const update = useCallback(
    (changes, keepPage = false) => {
      const next = new URLSearchParams(params);
      Object.entries(changes).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
      if (!keepPage) next.delete('page');
      setParams(next, { replace: true });
    },
    [params, setParams]
  );

  // Debounced search box.
  useEffect(() => {
    if (searchText === search) return undefined;
    const t = setTimeout(() => update({ search: searchText.trim() }), 400);
    return () => clearTimeout(t);
  }, [searchText, search, update]);

  const activePrice = useMemo(
    () =>
      PRICE_FILTERS.find((f) => (f.min ? String(f.min) : '') === minPrice && (f.max ? String(f.max) : '') === maxPrice)?.id ||
      'any',
    [minPrice, maxPrice]
  );

  const load = useCallback(() => {
    setState('loading');
    const query = { sort, page, limit: PAGE_SIZE };
    if (search) query.search = search;
    if (category) query.category = category;
    if (occasion) query.occasion = occasion;
    if (minPrice) query.minPrice = minPrice;
    if (maxPrice) query.maxPrice = maxPrice;

    api
      .get('/products', { params: query })
      .then((res) => {
        const d = res.data.data;
        setProducts(d.products);
        setTotal(d.total);
        setPages(d.pages);
        setState('ready');
      })
      .catch((err) => {
        setError(err.message);
        setState('error');
      });
  }, [search, category, occasion, minPrice, maxPrice, sort, page]);

  useEffect(load, [load]);

  const hasFilters = Boolean(search || category || occasion || minPrice || maxPrice);
  const clearAll = () => {
    setSearchText('');
    setParams({}, { replace: true });
  };
  const goToPage = (p) => {
    update({ page: p > 1 ? String(p) : '' }, true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const filters = (
    <div className="space-y-5">
      <FilterGroup title="Category">
        <Pill active={!category} onClick={() => update({ category: '' })}>All</Pill>
        {CATEGORIES.map((c) => (
          <Pill key={c.value} active={category === c.value} onClick={() => update({ category: c.value })}>
            {c.value}
          </Pill>
        ))}
      </FilterGroup>
      <FilterGroup title="Occasion">
        <Pill active={!occasion} onClick={() => update({ occasion: '' })}>All</Pill>
        {OCCASIONS.map((o) => (
          <Pill key={o.value} active={occasion === o.value} onClick={() => update({ occasion: o.value })}>
            {o.label}
          </Pill>
        ))}
      </FilterGroup>
      <FilterGroup title="Price">
        {PRICE_FILTERS.map((f) => (
          <Pill
            key={f.id}
            active={activePrice === f.id}
            onClick={() => update({ minPrice: f.min ? String(f.min) : '', maxPrice: f.max ? String(f.max) : '' })}
          >
            {f.label}
          </Pill>
        ))}
      </FilterGroup>
    </div>
  );

  return (
    <div className="container-page py-10">
      {/* Header / occasion banner */}
      <div className="mb-8 rounded-[2rem] bg-gradient-to-br from-lavender-100 to-blush-100 px-6 py-8 sm:px-10">
        <h1 className="text-3xl sm:text-4xl">{occasionInfo ? `${occasionInfo.label} gifts` : 'Shop all gifts'}</h1>
        <p className="mt-2 max-w-2xl text-ink/70">
          {occasionInfo ? occasionInfo.blurb : 'Browse the full collection, or use the filters to narrow it down.'}
        </p>
      </div>

      {/* Toolbar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative min-w-0 flex-1 sm:max-w-sm">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink/40" />
          <input
            type="search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search gifts by name..."
            aria-label="Search gifts"
            className="input !rounded-full !pl-11"
          />
        </div>

        <button
          onClick={() => setShowFilters((s) => !s)}
          aria-expanded={showFilters}
          className="btn-secondary !py-2.5 lg:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </button>

        <label className="ml-auto flex items-center gap-2 text-sm">
          <span className="hidden text-ink/60 sm:inline">Sort by</span>
          <select value={sort} onChange={(e) => update({ sort: e.target.value })} className="input !w-auto !rounded-full !py-2.5">
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="grid gap-8 lg:grid-cols-[18rem_1fr]">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="card p-5 lg:sticky lg:top-24">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-sans text-lg font-semibold">Filters</h2>
              {hasFilters && (
                <button onClick={clearAll} className="inline-flex items-center gap-1 text-sm font-medium text-plum-600 hover:text-plum-800">
                  <X className="h-3.5 w-3.5" /> Clear all
                </button>
              )}
            </div>
            {filters}
          </div>
        </aside>

        <section aria-live="polite">
          {state === 'loading' && <ProductGridSkeleton count={PAGE_SIZE} />}
          {state === 'error' && <ErrorState message={error} onRetry={load} />}
          {state === 'ready' && products.length === 0 && (
            <EmptyState
              icon={SearchX}
              title="No gifts found"
              text="Try removing a filter or searching for something else."
              actionLabel="Clear filters"
              onAction={clearAll}
            />
          )}
          {state === 'ready' && products.length > 0 && (
            <>
              <p className="mb-4 text-sm text-ink/60">
                Showing {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + products.length} of {total} gifts
              </p>
              <div className="grid grid-cols-2 gap-4 sm:gap-6 xl:grid-cols-3">
                {products.map((p) => (
                  <ProductCard key={p._id} product={p} />
                ))}
              </div>

              {pages > 1 && (
                <nav className="mt-10 flex items-center justify-center gap-3" aria-label="Pagination">
                  <button onClick={() => goToPage(page - 1)} disabled={page <= 1} className="btn-secondary !px-4 !py-2">
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </button>
                  <span className="text-sm text-ink/70">
                    Page {page} of {pages}
                  </span>
                  <button onClick={() => goToPage(page + 1)} disabled={page >= pages} className="btn-secondary !px-4 !py-2">
                    Next <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}
