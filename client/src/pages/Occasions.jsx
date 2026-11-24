import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { OCCASIONS } from '../utils/constants.js';
import usePageTitle from '../hooks/usePageTitle.js';

export default function Occasions() {
  usePageTitle('Shop by occasion');
  return (
    <div className="container-page py-12">
      <div className="mx-auto mb-12 max-w-2xl text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-lavender-600">Shop by occasion</p>
        <h1 className="text-4xl sm:text-5xl">What are you celebrating?</h1>
        <p className="mt-4 text-ink/70">Pick an occasion to see gifts chosen for the moment.</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {OCCASIONS.map((o) => (
          <Link
            key={o.value}
            to={`/shop?occasion=${encodeURIComponent(o.value)}`}
            className="card group flex flex-col p-7 transition hover:-translate-y-1 hover:shadow-lift"
          >
            <span className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition group-hover:scale-110 ${o.tint}`}>
              <o.icon className="h-6 w-6" />
            </span>
            <h2 className="text-2xl">{o.label} gifts</h2>
            <p className="mt-2 flex-1 text-sm text-ink/70">{o.blurb}</p>
            <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-plum-600">
              Browse gifts <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
