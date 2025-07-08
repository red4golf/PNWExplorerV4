import { useEffect } from "react";
import { apiRequest } from "../lib/queryClient";

// Generate or get session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

export const useAnalytics = () => {
  const trackEvent = async (eventType: string, metadata?: any, locationId?: number) => {
    try {
      await apiRequest("POST", "/api/analytics", {
        eventType,
        locationId,
        metadata,
        sessionId: getSessionId()
      });
    } catch (error) {
      console.log("Analytics tracking failed:", error);
    }
  };

  const trackPageView = (page: string, metadata?: any) => {
    trackEvent("page_view", { page, ...metadata });
  };

  const trackLocationView = (locationId: number, locationName: string) => {
    trackEvent("location_view", { locationName }, locationId);
  };

  const trackQRScan = (method: string = "unknown") => {
    trackEvent("qr_scan", { method });
  };

  const trackShareLink = (method: string = "unknown") => {
    trackEvent("share_link", { method });
  };

  return {
    trackEvent,
    trackPageView,
    trackLocationView,
    trackQRScan,
    trackShareLink
  };
};

// Hook to automatically track page views
export const usePageView = (pageName: string, metadata?: any) => {
  const { trackPageView } = useAnalytics();
  
  useEffect(() => {
    trackPageView(pageName, metadata);
  }, [pageName, trackPageView]);
};