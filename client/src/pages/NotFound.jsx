import { Compass } from 'lucide-react';
import { EmptyState } from '../components/Feedback.jsx';
import usePageTitle from '../hooks/usePageTitle.js';

export default function NotFound() {
  usePageTitle('Page not found');
  return (
    <EmptyState
      icon={Compass}
      title="We couldn't find that page"
      text="The link may be broken, or the page may have moved."
      actionLabel="Back to home"
      actionTo="/"
    />
  );
}
