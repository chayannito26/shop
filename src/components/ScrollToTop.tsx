import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop
 * Ensures the window scrolls to the top on every route change.
 * Uses useLayoutEffect to avoid a visible jump after navigation.
 */
export function ScrollToTop() {
  const { pathname, search } = useLocation();

  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;
    // Reset scroll position to top-left on navigation
    try {
      window.scrollTo(0, 0);
    } catch {
      // ignore
    }
  }, [pathname, search]);

  return null;
}
