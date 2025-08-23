import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { trackPageView } from './metaPixel';

export function MetaPixelRouteListener() {
  const location = useLocation();
  const didMount = useRef(false);

  useEffect(() => {
    if (!didMount.current) {
      // Skip initial render: base code already fired the first PageView
      didMount.current = true;
      return;
    }
    trackPageView();
  }, [location.pathname, location.search]);

  return null;
}
