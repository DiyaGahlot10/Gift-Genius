import { Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import { EmptyState, ProductGridSkeleton } from '../components/Feedback.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

export default function Wishlist() {
  usePageTitle('Wishlist');
  const { products, loading } = useWishlist();

  return (
    <div className="container-page py-10">
      <h1 className="mb-8 text-3xl sm:text-4xl">Your wishlist</h1>
      {loading && products.length === 0 && <ProductGridSkeleton count={4} />}
      {!loading && products.length === 0 && (
        <EmptyState
          icon={Heart}
          title="Nothing saved yet"
          text="Tap the heart on any gift to save it here for later."
          actionLabel="Find a gift"
          actionTo="/find-a-gift"
        />
      )}
      {products.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
