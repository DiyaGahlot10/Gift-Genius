import { useEffect } from 'react';

export default function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | GiftGenius` : 'GiftGenius | Because every person deserves a thoughtful gift';
  }, [title]);
}
