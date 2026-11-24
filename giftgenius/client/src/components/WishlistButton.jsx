import { Heart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';

export default function WishlistButton({ productId, className = '', label = false }) {
  const { has, toggle } = useWishlist();
  const saved = has(productId);
  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
      className={`inline-flex items-center justify-center gap-2 transition ${className}`}
    >
      <Heart className={`h-5 w-5 transition ${saved ? 'fill-blush-400 text-blush-400' : 'text-plum-600'}`} />
      {label && <span className="text-sm font-semibold">{saved ? 'Saved' : 'Add to wishlist'}</span>}
    </button>
  );
}
