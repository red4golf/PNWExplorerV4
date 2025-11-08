import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { useAnalytics } from "@/hooks/use-analytics";
import { generateLocationSEO, updatePageSEO } from "@/lib/seo";
import type { Location } from "@shared/schema";
import { useState, useEffect } from "react";
import { useDesignMode } from "@/contexts/design-mode-context";
import ClassicLocationDetail from "@/components/classic-location-detail";
import ModernLocationDetail from "@/components/modern-location-detail";

export default function LocationDetail() {
  const [, params] = useRoute("/location/:id");
  const idOrSlug = params?.id || "";
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { trackLocationView } = useAnalytics();
  const { designMode } = useDesignMode();

  const { data: location, isLoading, error } = useQuery<Location>({
    queryKey: [`/api/locations/${idOrSlug}`],
    enabled: !!idOrSlug,
  });

  // Get user location for directions
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Silently fail if location access is denied
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 300000 }
      );
    }
  }, []);

  // Track location view and update SEO when location data is loaded
  useEffect(() => {
    if (location) {
      trackLocationView(location.id, location.name);
      
      // Update SEO metadata for this location
      const seoData = generateLocationSEO(location);
      updatePageSEO(seoData);
    }
  }, [location, trackLocationView]);

  // Switch between Classic and Modern design based on designMode
  if (designMode === "modern") {
    return (
      <ModernLocationDetail
        location={location}
        isLoading={isLoading}
        error={error}
        userLocation={userLocation}
      />
    );
  }

  return (
    <ClassicLocationDetail
      location={location}
      isLoading={isLoading}
      error={error}
      userLocation={userLocation}
    />
  );
}
