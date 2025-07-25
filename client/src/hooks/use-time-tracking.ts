import { useEffect, useRef } from "react";
import { useAnalytics } from "./use-analytics";

// Hook to track time spent on pages/locations
export const useTimeTracking = (locationId?: number, pageName?: string) => {
  const { trackTimeSpent } = useAnalytics();
  const startTimeRef = useRef<number>(Date.now());
  const hasTrackedRef = useRef<boolean>(false);

  useEffect(() => {
    startTimeRef.current = Date.now();
    hasTrackedRef.current = false;

    return () => {
      if (!hasTrackedRef.current) {
        const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
        if (timeSpent >= 5) { // Only track if spent at least 5 seconds
          trackTimeSpent(locationId || 0, timeSpent, pageName);
          hasTrackedRef.current = true;
        }
      }
    };
  }, [locationId, pageName, trackTimeSpent]);

  // Manual tracking for specific events
  const trackCurrentTime = () => {
    if (!hasTrackedRef.current) {
      const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000);
      if (timeSpent >= 5) {
        trackTimeSpent(locationId || 0, timeSpent, pageName);
        hasTrackedRef.current = true;
        return timeSpent;
      }
    }
    return 0;
  };

  return { trackCurrentTime };
};