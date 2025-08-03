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
  // Auto-detect common development scenarios
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const isDevDomain = window.location.hostname.includes('replit.dev');
  const hasDevFlag = localStorage.getItem('dev-mode') === 'true';
  const hasAdminAccess = localStorage.getItem('admin-token') !== null;
  
  return hasDevFlag || hasAdminAccess || (isLocalhost && !window.location.href.includes('deployed'));
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
          } as any);
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

// Get UTM parameters from URL
const getUtmParams = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'),
    utm_campaign: urlParams.get('utm_campaign'),
    utm_term: urlParams.get('utm_term'),
    utm_content: urlParams.get('utm_content')
  };
};

// Get and store initial traffic source for session
const getTrafficSource = () => {
  // Check if we already have the source for this session
  let source = sessionStorage.getItem('traffic_source');
  if (source) {
    return JSON.parse(source);
  }

  // Check UTM parameters first (most reliable)
  const utmParams = getUtmParams();
  if (utmParams.utm_source) {
    const sourceObj = {
      type: 'utm_campaign',
      source: utmParams.utm_source,
      medium: utmParams.utm_medium,
      campaign: utmParams.utm_campaign,
      term: utmParams.utm_term,
      content: utmParams.utm_content
    };
    sessionStorage.setItem('traffic_source', JSON.stringify(sourceObj));
    return sourceObj;
  }

  // Fall back to referrer analysis
  const referrer = document.referrer;
  let sourceObj;
  if (!referrer) {
    sourceObj = { type: 'direct', source: 'direct' };
  } else if (referrer.includes('google.com') || referrer.includes('bing.com') || referrer.includes('yahoo.com')) {
    sourceObj = { type: 'search_engine', source: 'organic_search', referrer };
  } else if (referrer.includes('facebook.com') || referrer.includes('twitter.com') || referrer.includes('instagram.com')) {
    sourceObj = { type: 'social_media', source: 'social', referrer };
  } else if (referrer.includes('newsletter') || referrer.includes('email')) {
    sourceObj = { type: 'newsletter', source: 'email', referrer };
  } else {
    sourceObj = { type: 'referral', source: 'referral', referrer };
  }

  sessionStorage.setItem('traffic_source', JSON.stringify(sourceObj));
  return sourceObj;
};

// Get referrer source category (legacy function)
const getReferrerSource = () => {
  const trafficSource = getTrafficSource();
  return trafficSource.source || 'unknown';
};

export const useAnalytics = () => {
  // Initialize session tracking on first load
  useEffect(() => {
    // Store initial referrer if not already stored
    if (!sessionStorage.getItem('initial_referrer')) {
      sessionStorage.setItem('initial_referrer', document.referrer || 'direct');
    }
    
    // Initialize traffic source tracking
    getTrafficSource();
    
    // Track session start if not already tracked
    if (!sessionStorage.getItem('session_tracked')) {
      const trackSessionStart = async () => {
        try {
          const userLocation = await getUserLocation();
          const userContext = detectUserContext();
          const trafficSource = getTrafficSource();
          
          await apiRequest("POST", "/api/analytics", {
            eventType: 'session_start',
            metadata: {
              sessionStart: new Date().toISOString(),
              trafficSource: trafficSource.type,
              trafficSourceDetails: trafficSource,
              initialReferrer: sessionStorage.getItem('initial_referrer'),
              ...getUtmParams(),
              userAgent: navigator.userAgent,
              screenWidth: window.screen.width,
              screenHeight: window.screen.height,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
              language: navigator.language,
              languages: navigator.languages?.join(',') || navigator.language
            },
            sessionId: getSessionId(),
            userLocation,
            userContext,
            referrerSource: trafficSource.source,
            isDeveloper: false
          });
          
          sessionStorage.setItem('session_tracked', 'true');
        } catch (error) {
          console.log("Session tracking failed:", error);
        }
      };
      
      trackSessionStart();
    }
  }, []);
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

      const trafficSource = getTrafficSource();
      
      await apiRequest("POST", "/api/analytics", {
        eventType,
        locationId,
        metadata: {
          ...metadata,
          sessionPageViews: pageViews,
          timeOfDay: new Date().getHours(),
          dayOfWeek: new Date().getDay(),
          // Enhanced traffic source tracking
          trafficSource: trafficSource.type,
          trafficSourceDetails: trafficSource,
          initialReferrer: sessionStorage.getItem('initial_referrer') || document.referrer,
          // UTM parameters
          ...getUtmParams(),
          // Technical context
          userAgent: navigator.userAgent,
          screenWidth: window.screen.width,
          screenHeight: window.screen.height,
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          // Browser capabilities
          cookieEnabled: navigator.cookieEnabled,
          onLine: navigator.onLine,
          // Additional context
          timestamp: new Date().toISOString(),
          url: window.location.href,
          path: window.location.pathname,
          host: window.location.host
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