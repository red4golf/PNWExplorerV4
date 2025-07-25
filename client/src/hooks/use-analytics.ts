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

// Check if we're in developer mode
const isDeveloperMode = () => {
  return localStorage.getItem('dev-mode') === 'true';
};

export const useAnalytics = () => {
  const trackEvent = async (eventType: string, metadata?: any, locationId?: number) => {
    // Skip tracking in developer mode
    if (isDeveloperMode()) {
      console.log("🔍 Developer mode - skipping analytics:", eventType, metadata);
      return;
    }

    try {
      await apiRequest("POST", "/api/analytics", {
        eventType,
        locationId,
        metadata,
        sessionId: getSessionId(),
        isDeveloper: false
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

  const trackSearch = (searchTerms: string, resultCount: number) => {
    trackEvent("search", { searchTerms, resultCount });
  };

  const trackFilter = (filterType: string, filterValue: string, resultCount: number) => {
    trackEvent("filter_use", { filterType, filterValue, resultCount });
  };

  const trackDirections = (locationId: number, locationName: string) => {
    trackEvent("directions_click", { locationName }, locationId);
  };

  const trackPhotoView = (locationId: number, photoIndex: number, isGallery: boolean) => {
    trackEvent("photo_view", { photoIndex, isGallery }, locationId);
  };

  const trackBookClick = (locationId: number, bookTitle: string, isAffiliate: boolean) => {
    trackEvent("book_click", { bookTitle, isAffiliate }, locationId);
  };

  const trackAudioPlay = (locationId: number, action: "play" | "pause" | "complete") => {
    trackEvent("audio_play", { action }, locationId);
  };

  const trackTimeSpent = (locationId: number, timeSpent: number, pageName?: string) => {
    trackEvent("time_spent", { timeSpent, pageName }, locationId);
  };

  return {
    trackEvent,
    trackPageView,
    trackLocationView,
    trackQRScan,
    trackShareLink,
    trackSearch,
    trackFilter,
    trackDirections,
    trackPhotoView,
    trackBookClick,
    trackAudioPlay,
    trackTimeSpent,
    isDeveloperMode,
    enableDeveloperMode: () => {
      localStorage.setItem('dev-mode', 'true');
      console.log("🔧 Developer mode enabled - analytics disabled");
    },
    disableDeveloperMode: () => {
      localStorage.setItem('dev-mode', 'false');
      console.log("👥 Developer mode disabled - analytics enabled");
    }
  };
};

// Hook to automatically track page views
export const usePageView = (pageName: string, metadata?: any) => {
  const { trackPageView } = useAnalytics();
  
  useEffect(() => {
    trackPageView(pageName, metadata);
  }, [pageName, trackPageView]);
};