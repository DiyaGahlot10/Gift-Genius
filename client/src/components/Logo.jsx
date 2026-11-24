import { Link } from 'react-router-dom';
import { Gift } from 'lucide-react';

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="group inline-flex items-center gap-2.5" aria-label="GiftGenius home">
      <span
        className={`flex h-9 w-9 items-center justify-center rounded-xl transition group-hover:rotate-6 ${
          light ? 'bg-white/15 text-white' : 'bg-plum-600 text-white'
        }`}
      >
        <Gift className="h-[18px] w-[18px]" />
      </span>
      <span className={`font-display text-xl font-semibold tracking-tight ${light ? 'text-white' : 'text-plum-700'}`}>
        Gift<span className={light ? 'text-blush-300' : 'text-lavender-500'}>Genius</span>
      </span>
    </Link>
  );
}
