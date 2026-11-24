import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export default function SectionHeading({ eyebrow, title, subtitle, linkTo, linkLabel, center = false }) {
  return (
    <div className={`mb-8 flex flex-wrap items-end justify-between gap-4 ${center ? 'justify-center text-center' : ''}`}>
      <div className={center ? 'mx-auto max-w-2xl' : 'max-w-2xl'}>
        {eyebrow && <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-lavender-600">{eyebrow}</p>}
        <h2 className="text-3xl sm:text-4xl">{title}</h2>
        {subtitle && <p className="mt-3 text-ink/70">{subtitle}</p>}
      </div>
      {linkTo && (
        <Link to={linkTo} className="inline-flex items-center gap-1.5 text-sm font-semibold text-plum-600 hover:text-plum-800">
          {linkLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}
