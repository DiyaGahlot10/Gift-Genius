import { Star } from 'lucide-react';

export default function Rating({ value = 0, count, className = '' }) {
  if (!value) return null;
  return (
    <span className={`inline-flex items-center gap-1 text-sm text-ink/70 ${className}`}>
      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
      <span className="font-semibold text-ink">{value.toFixed(1)}</span>
      {count ? <span>({count})</span> : null}
    </span>
  );
}
