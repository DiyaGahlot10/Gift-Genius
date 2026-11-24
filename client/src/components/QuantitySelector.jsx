import { Minus, Plus } from 'lucide-react';

export default function QuantitySelector({ value, onChange, min = 1, max = 10, size = 'md' }) {
  const btn = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  return (
    <div className="inline-flex items-center rounded-full border border-plum-600/15 bg-white">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= min}
        onClick={() => onChange(value - 1)}
        className={`${btn} flex items-center justify-center rounded-full text-plum-600 transition hover:bg-lavender-50 disabled:opacity-30`}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="min-w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Increase quantity"
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={`${btn} flex items-center justify-center rounded-full text-plum-600 transition hover:bg-lavender-50 disabled:opacity-30`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
