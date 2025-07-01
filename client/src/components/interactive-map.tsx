import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, List, MapPin, Navigation, AlertCircle } from "lucide-react";
import { getCategoryIcon, getCategoryColor } from "@/lib/utils";
import type { Location } from "@shared/schema";

// Leaflet imports with dynamic loading
let L: any = null;

interface InteractiveMapProps {
  onLocationSelect?: (location: Location) => void;
}

export default function InteractiveMap({ onLocationSelect }: InteractiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  
  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  // Load Leaflet
  useEffect(() => {
    const loadLeaflet = async () => {
      if (typeof window !== "undefined" && !L) {
        // Dynamic import of Leaflet
        const leaflet = await import("leaflet");
        L = leaflet.default;
        
        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }
      }
    };

    loadLeaflet();
  }, []);

  // Get user's current location
  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setIsLocating(false);
        
        // Center map on user location if map is available
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
        }
      },
      (error) => {
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Location access denied by user");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Location information is unavailable");
            break;
          case error.TIMEOUT:
            setLocationError("Location request timed out");
            break;
          default:
            setLocationError("An unknown error occurred while retrieving location");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  };

  // Auto-get location on component mount
  useEffect(() => {
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (!L || !mapRef.current || !locations) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([47.6262, -122.5194], 12);
      
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers (except user location marker)
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker && layer !== userMarkerRef.current) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

    // Add user location marker
    if (userLocation && !userMarkerRef.current) {
      const userIcon = L.divIcon({
        html: `<div style="background-color: #3b82f6; border: 3px solid white; border-radius: 50%; width: 16px; height: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
        className: 'user-location-marker',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });

      userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(mapInstanceRef.current)
        .bindPopup(`<div class="text-center"><strong>Your Location</strong><br/><small>Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}</small></div>`);
    }

    // Add markers for each location
    locations.forEach((location) => {
      if (location.latitude && location.longitude) {
        const icon = L.divIcon({
          html: `<div class="custom-marker ${location.category?.toLowerCase().replace(/\s+/g, '-')}" style="background-color: var(--heritage-gold); border: 2px solid var(--heritage-brown); border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; color: white; font-size: 12px;">${getCategoryIcon(location.category || '')}</div>`,
          className: 'custom-div-icon',
          iconSize: [20, 20],
          iconAnchor: [10, 10]
        });

        const marker = L.marker([location.latitude, location.longitude], { icon })
          .addTo(mapInstanceRef.current);

        const popupContent = `
          <div class="p-2 min-w-[200px]">
            <h3 class="font-bold text-lg mb-2">${location.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${location.category}</p>
            <p class="text-sm mb-3">${location.description.substring(0, 100)}...</p>
            <button class="bg-heritage-brown text-white px-3 py-1 rounded text-sm hover:bg-opacity-90" onclick="window.selectLocation(${location.id})">
              View Details
            </button>
          </div>
        `;

        marker.bindPopup(popupContent);
      }
    });

    // Add global function to handle location selection
    (window as any).selectLocation = (locationId: number) => {
      const location = locations.find(l => l.id === locationId);
      if (location && onLocationSelect) {
        onLocationSelect(location);
      }
    };

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        userMarkerRef.current = null;
      }
    };
  }, [L, locations, onLocationSelect, userLocation]);

  if (isLoading) {
    return (
      <Card className="bg-heritage-beige">
        <CardContent className="p-6">
          <div className="h-96 rounded-lg overflow-hidden bg-gray-200 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-16 h-16 text-heritage-olive mb-4 mx-auto" />
                <p className="text-xl font-semibold text-heritage-olive">Loading Interactive Map...</p>
                <p className="text-sm text-gray-600 mt-2">Preparing historical locations</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-heritage-beige">
      <CardContent className="p-6">
        <div 
          ref={mapRef} 
          className="h-96 rounded-lg overflow-hidden bg-gray-300 relative"
        />
        
        {/* Map Legend */}
        <div className="absolute top-10 left-10 bg-white rounded-lg shadow-md p-3 z-[1000]">
          <h4 className="font-semibold text-heritage-brown mb-2">Map Legend</h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-heritage-gold rounded-full mr-2"></div>
              <span>Historical Landmarks</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-heritage-olive rounded-full mr-2"></div>
              <span>Cultural Sites</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-heritage-brown rounded-full mr-2"></div>
              <span>Natural Heritage</span>
            </div>
          </div>
        </div>
        
        {/* Location Status */}
        {locationError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{locationError}</span>
          </div>
        )}

        {/* Map Controls */}
        <div className="flex flex-wrap gap-4 mt-6">
          <Button 
            onClick={getCurrentLocation}
            disabled={isLocating}
            variant="outline" 
            className="bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
          >
            {isLocating ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Locating...
              </>
            ) : (
              <>
                <Navigation className="w-4 h-4 mr-2" />
                Find My Location
              </>
            )}
          </Button>
          <Button variant="outline" className="bg-heritage-brown text-white hover:bg-heritage-brown/90">
            <Filter className="w-4 h-4 mr-2" />
            Filter Locations
          </Button>
          <Button variant="outline" className="bg-heritage-olive text-white hover:bg-heritage-olive/90">
            <Search className="w-4 h-4 mr-2" />
            Search Places
          </Button>
          <Button variant="outline" className="bg-heritage-gold text-heritage-brown hover:bg-heritage-gold/90">
            <List className="w-4 h-4 mr-2" />
            List View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
