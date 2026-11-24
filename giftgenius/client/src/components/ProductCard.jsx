import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import SafeImage from './SafeImage.jsx';
import Rating from './Rating.jsx';
import WishlistButton from './WishlistButton.jsx';
import { useCart } from '../context/CartContext.jsx';
import { discountPercent, formatPrice } from '../utils/format.js';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const off = discountPercent(product.price, product.originalPrice);
  const soldOut = product.stock < 1;

  return (
    <article className="group card flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="relative">
        <Link to={`/product/${product._id}`} className="block aspect-square" aria-label={`View ${product.name}`}>
          <SafeImage
            src={product.image}
            alt={product.name}
            className="h-full w-full transition duration-500 group-hover:scale-[1.03]"
          />
        </Link>
        {off > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-plum-600 px-2.5 py-1 text-xs font-semibold text-white">
            {off}% off
          </span>
        )}
        <WishlistButton
          productId={product._id}
          className="absolute right-3 top-3 h-9 w-9 rounded-full bg-white/90 shadow-soft hover:scale-110"
        />
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-lavender-600">{product.category}</p>
        <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] font-sans text-base font-semibold leading-snug text-ink">
          <Link to={`/product/${product._id}`} className="hover:text-plum-600">
            {product.name}
          </Link>
        </h3>
        <Rating value={product.rating} count={product.numReviews} className="mt-1" />

        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg font-bold text-plum-700">{formatPrice(product.price)}</span>
          {off > 0 && <span className="text-sm text-ink/40 line-through">{formatPrice(product.originalPrice)}</span>}
        </div>

        <button
          onClick={() => addItem(product)}
          disabled={soldOut}
          className="btn-primary mt-4 w-full"
        >
          <ShoppingBag className="h-4 w-4" />
          {soldOut ? 'Out of stock' : 'Add to cart'}
        </button>
      </div>
    </article>
  );
}
