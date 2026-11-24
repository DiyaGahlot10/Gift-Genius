import { useState } from 'react';
import { Gift } from 'lucide-react';

// Shows a soft lavender placeholder while loading and if the image ever fails.
export default function SafeImage({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-gradient-to-br from-lavender-100 to-blush-100 text-lavender-500 ${className}`}
      >
        <Gift className="h-1/4 w-1/4 max-h-16 max-w-16" strokeWidth={1.5} />
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-lavender-50 ${className}`}>
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
}
