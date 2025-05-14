import { useState, useEffect } from 'react';

/**
 * Custom hook to detect if the device is a mobile device using window width
 * @param breakpoint Breakpoint for mobile detection in pixels (default: 768px)
 * @returns Boolean indicating if the device is mobile
 */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Check on initial render

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}