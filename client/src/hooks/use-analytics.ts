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

// Get user's approximate location (using browser geolocation API)
const getUserLocation = (): Promise<any> => {
  return new Promise((resolve) => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy
          });
        },
        () => {
          // If geolocation fails, try to get timezone
          resolve({
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            language: navigator.language
          });
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    } else {
      resolve({
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language
      });
    }
  });
};

// Detect user context based on behavior patterns
const detectUserContext = () => {
  const referrer = document.referrer;
  const currentTime = new Date().getHours();
  const sessionStorage = window.sessionStorage;
  
  // Check referrer patterns
  if (referrer.includes('google.com') || referrer.includes('bing.com')) {
    return 'research';
  }
  if (referrer.includes('facebook.com') || referrer.includes('twitter.com') || referrer.includes('instagram.com')) {
    return 'social_discovery';
  }
  
  // Check time patterns (trip planning often happens in evenings/weekends)
  if ((currentTime >= 19 || currentTime <= 8) || new Date().getDay() === 0 || new Date().getDay() === 6) {
    return 'planning_trip';
  }
  
  // Check session behavior
  const pageViews = parseInt(sessionStorage.getItem('pageViewCount') || '0');
  if (pageViews > 5) {
    return 'deep_research';
  }
  
  return 'general_reading';
};

// Get referrer source category
const getReferrerSource = () => {
  const referrer = document.referrer;
  if (!referrer) return 'direct';
  
  if (referrer.includes('google.com') || referrer.includes('bing.com') || referrer.includes('yahoo.com')) {
    return 'search_engine';
  }
  if (referrer.includes('facebook.com') || referrer.includes('twitter.com') || referrer.includes('instagram.com')) {
    return 'social_media';
  }
  if (referrer.includes('newsletter') || referrer.includes('email')) {
    return 'newsletter';
  }
  
  return 'referral';
};

export const useAnalytics = () => {
  const trackEvent = async (eventType: string, metadata?: any, locationId?: number) => {
    // Skip tracking in developer mode
    if (isDeveloperMode()) {
      console.log("🔍 Developer mode - skipping analytics:", eventType, metadata);
      return;
    }

    try {
      // Get enhanced user context
      const userLocation = await getUserLocation();
      const userContext = detectUserContext();
      const referrerSource = getReferrerSource();
      
      // Update session page view count
      const pageViews = parseInt(sessionStorage.getItem('pageViewCount') || '0') + 1;
      sessionStorage.setItem('pageViewCount', pageViews.toString());

      await apiRequest("POST", "/api/analytics", {
        eventType,
        locationId,
        metadata: {
          ...metadata,
          sessionPageViews: pageViews,
          timeOfDay: new Date().getHours(),
          dayOfWeek: new Date().getDay()
        },
        sessionId: getSessionId(),
        userLocation,
        userContext,
        referrerSource,
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