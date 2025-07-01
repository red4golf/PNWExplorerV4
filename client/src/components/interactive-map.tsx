import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, List, MapPin, Navigation, AlertCircle } from "lucide-react";
import { getCategoryIcon, getCategoryColor, calculateDistance, getDirectionsUrl } from "@/lib/utils";
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
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showListView, setShowListView] = useState(false);
  
  // Pacific Northwest boundaries (more accurate - includes parts of Northern California, Idaho, Montana, and southern BC)
  const PNW_BOUNDS = {
    north: 54.0, // Southern BC border
    south: 40.0, // Northern California border
    east: -110.0, // Eastern Montana/Idaho border
    west: -125.0  // Pacific coast
  };

  // Default PNW view center and zoom
  const PNW_CENTER = { lat: 47.0, lng: -120.0 };
  const PNW_ZOOM = 5;
  
  // Function to check if coordinates are within PNW boundaries
  const isWithinPNW = (lat: number, lng: number): boolean => {
    const inLatBounds = lat >= PNW_BOUNDS.south && lat <= PNW_BOUNDS.north;
    const inLngBounds = lng >= PNW_BOUNDS.west && lng <= PNW_BOUNDS.east; // west (-125) to east (-110)
    console.log(`Checking bounds for ${lat}, ${lng}: lat OK: ${inLatBounds}, lng OK: ${inLngBounds}`);
    return inLatBounds && inLngBounds;
  };
  
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

  // Get user's current location and center map on it
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
        const newUserLocation = { lat: latitude, lng: longitude };
        setUserLocation(newUserLocation);
        setIsLocating(false);
        
        // Center map on actual user location when button is clicked
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView([latitude, longitude], 15);
        }
        
        // Update or add user marker
        if (mapInstanceRef.current) {
          if (userMarkerRef.current) {
            mapInstanceRef.current.removeLayer(userMarkerRef.current);
          }
          
          const userIcon = L.divIcon({
            html: `<div style="background-color: #3b82f6; border: 3px solid white; border-radius: 50%; width: 16px; height: 16px; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
            className: 'user-location-marker',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });

          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon })
            .addTo(mapInstanceRef.current)
            .bindPopup(`<div class="text-center"><strong>Your Location</strong><br/><small>Lat: ${latitude.toFixed(4)}, Lng: ${longitude.toFixed(4)}</small></div>`);
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
        maximumAge: 60000 // 1 minute for "Find My Location" button
      }
    );
  };

  // Auto-get location on component mount
  useEffect(() => {
    const getUserLocation = async () => {
      if (!navigator.geolocation) {
        console.log("Geolocation not supported");
        return;
      }

      try {
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000
          });
        });

        const { latitude, longitude } = position.coords;
        const userLoc = { lat: latitude, lng: longitude };
        console.log("User location detected:", userLoc);
        console.log("Is within PNW?", isWithinPNW(latitude, longitude));
        setUserLocation(userLoc);
      } catch (error) {
        console.log("Geolocation failed:", error);
        setLocationError("Unable to get your location. Showing full Pacific Northwest view.");
      }
    };

    getUserLocation();
  }, []);

  useEffect(() => {
    if (!L || !mapRef.current || !locations) return;

    // Initialize map with appropriate view
    if (!mapInstanceRef.current) {
      let initialView = [PNW_CENTER.lat, PNW_CENTER.lng];
      let initialZoom = PNW_ZOOM;
      
      // If user location is available and within PNW, center on it
      if (userLocation && isWithinPNW(userLocation.lat, userLocation.lng)) {
        initialView = [userLocation.lat, userLocation.lng];
        initialZoom = 12;
        console.log("Centering map on user location:", initialView);
      } else {
        console.log("Showing PNW view - user location:", userLocation);
      }
      
      mapInstanceRef.current = L.map(mapRef.current).setView(initialView, initialZoom);
      
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

        const distance = userLocation && location.latitude && location.longitude 
          ? (calculateDistance(userLocation, { lat: location.latitude, lng: location.longitude })).toFixed(1)
          : null;

        const popupContent = `
          <div class="p-3 min-w-[220px]">
            <h3 class="font-bold text-lg mb-2">${location.name}</h3>
            <p class="text-sm text-gray-600 mb-2">${location.category}</p>
            <p class="text-sm mb-3">${location.description.substring(0, 100)}...</p>
            ${distance ? `<p class="text-xs text-blue-600 font-semibold mb-3">${distance} miles away</p>` : ''}
            <div class="flex gap-2">
              <button class="bg-heritage-brown text-white px-3 py-1 rounded text-sm hover:bg-opacity-90" onclick="window.selectLocation(${location.id})">
                View Details
              </button>
              ${location.latitude && location.longitude ? `
                <button class="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-opacity-90" onclick="window.getDirections(${location.id})">
                  Directions
                </button>
              ` : ''}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent);
      }
    });

    // Add global functions to handle location selection and directions
    (window as any).selectLocation = (locationId: number) => {
      const location = locations.find(l => l.id === locationId);
      if (location && onLocationSelect) {
        onLocationSelect(location);
      }
    };

    (window as any).getDirections = (locationId: number) => {
      const location = locations.find(l => l.id === locationId);
      if (location) {
        const directionsUrl = getDirectionsUrl(location, userLocation || undefined);
        window.open(directionsUrl, '_blank');
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
        
        {/* Map Legend - Moved below map */}
        <div className="mt-4 bg-white rounded-lg shadow-md p-4">
          <h4 className="font-semibold text-heritage-brown mb-3">Map Legend</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
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

        {/* Search Bar */}
        {searchTerm !== "" && (
          <div className="mt-4">
            <Input
              type="text"
              placeholder="Search locations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {/* Category Filter */}
        {showFilters && (
          <div className="mt-4 bg-white rounded-lg shadow-md p-4">
            <h5 className="font-semibold text-heritage-brown mb-3">Filter by Category</h5>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("all")}
                className="text-xs"
              >
                All Categories
              </Button>
              <Button
                variant={selectedCategory === "Historic Landmark" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("Historic Landmark")}
                className="text-xs"
              >
                Historic Landmarks
              </Button>
              <Button
                variant={selectedCategory === "Cultural Site" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("Cultural Site")}
                className="text-xs"
              >
                Cultural Sites
              </Button>
              <Button
                variant={selectedCategory === "Natural Heritage" ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory("Natural Heritage")}
                className="text-xs"
              >
                Natural Heritage
              </Button>
            </div>
          </div>
        )}

        {/* List View */}
        {showListView && locations && (
          <div className="mt-4 bg-white rounded-lg shadow-md p-4">
            <h5 className="font-semibold text-heritage-brown mb-3">All Locations</h5>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {locations
                .filter(loc => selectedCategory === "all" || loc.category === selectedCategory)
                .filter(loc => searchTerm === "" || loc.name.toLowerCase().includes(searchTerm.toLowerCase()))
                .map((location) => (
                <div
                  key={location.id}
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                  onClick={() => onLocationSelect?.(location)}
                >
                  <div>
                    <span className="font-medium">{location.name}</span>
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {location.category}
                    </Badge>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MapPin className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
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
          <Button 
            variant="outline" 
            className={`${showFilters ? 'bg-heritage-brown text-white' : 'bg-heritage-brown text-white hover:bg-heritage-brown/90'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter Locations
          </Button>
          <Button 
            variant="outline" 
            className="bg-heritage-olive text-white hover:bg-heritage-olive/90"
            onClick={() => setSearchTerm(searchTerm === "" ? " " : "")}
          >
            <Search className="w-4 h-4 mr-2" />
            Search Places
          </Button>
          <Button 
            variant="outline" 
            className={`${showListView ? 'bg-heritage-gold text-heritage-brown' : 'bg-heritage-gold text-heritage-brown hover:bg-heritage-gold/90'}`}
            onClick={() => setShowListView(!showListView)}
          >
            <List className="w-4 h-4 mr-2" />
            List View
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
