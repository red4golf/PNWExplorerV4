import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Filter, List, MapPin, Navigation, AlertCircle, Clock, Star, Users, Info, Calendar } from "lucide-react";
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
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [showListView, setShowListView] = useState(false);
  const [sortBy, setSortBy] = useState<string>("name");
  
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
    return inLatBounds && inLngBounds;
  };
  
  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  // Filter and sort locations
  const filteredLocations = locations?.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || location.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesPeriod = selectedPeriod === "all" || (location.period && location.period.toLowerCase().includes(selectedPeriod.toLowerCase()));
    
    return matchesSearch && matchesCategory && matchesPeriod;
  }).sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name);
      case "category":
        return a.category.localeCompare(b.category);
      case "period":
        return (a.period || "").localeCompare(b.period || "");
      case "distance":
        if (!userLocation) return 0;
        if (!a.latitude || !a.longitude || !b.latitude || !b.longitude) return 0;
        const distA = calculateDistance(userLocation, { lat: a.latitude as number, lng: a.longitude as number });
        const distB = calculateDistance(userLocation, { lat: b.latitude as number, lng: b.longitude as number });
        return distA - distB;
      default:
        return 0;
    }
  }) || [];

  // Get unique categories and periods for filters
  const categories = Array.from(new Set(locations?.map(l => l.category) || []));
  const periods = Array.from(new Set(locations?.map(l => l.period).filter(Boolean) || []));

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

        // Hover tooltip content (simpler, just key info)
        const tooltipContent = `
          <div style="padding: 8px; line-height: 1.4; word-wrap: break-word;">
            <div style="font-weight: bold; font-size: 15px; margin-bottom: 4px; color: #333;">${location.name}</div>
            <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${location.category}</div>
            <div style="font-size: 12px; color: #555; margin-bottom: 4px;">${location.description.substring(0, 90)}...</div>
            ${distance ? `<div style="font-size: 11px; color: #2563eb; font-weight: 600; margin-top: 4px;">${distance} miles away</div>` : ''}
          </div>
        `;

        // Full popup content (detailed, with action buttons)
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

        // Bind both tooltip (hover) and popup (click)
        marker.bindTooltip(tooltipContent, {
          permanent: false,
          sticky: true,
          direction: 'top',
          offset: [0, -10],
          className: 'custom-tooltip'
        });
        
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
        
        {/* Enhanced Controls */}
        <div className="mt-4 bg-white rounded-lg shadow-md p-4">
          <Tabs defaultValue="controls" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="controls" className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Controls
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search & Filter
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="w-4 h-4" />
                Location List
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="controls" className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button
                  onClick={getCurrentLocation}
                  disabled={isLocating}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Navigation className="w-4 h-4" />
                  {isLocating ? "Locating..." : "Find My Location"}
                </Button>
                
                {userLocation && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {isWithinPNW(userLocation.lat, userLocation.lng) ? "In Pacific Northwest" : "Outside Region"}
                  </Badge>
                )}
              </div>
              
              {/* Map Legend */}
              <div>
                <h5 className="font-semibold text-heritage-brown mb-2">Map Legend</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-heritage-gold rounded-full mr-2"></div>
                    <span>Historical ({locations?.filter(l => l.category === 'Historical').length || 0})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-heritage-olive rounded-full mr-2"></div>
                    <span>Cultural ({locations?.filter(l => l.category === 'Cultural').length || 0})</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-heritage-brown rounded-full mr-2"></div>
                    <span>Natural ({locations?.filter(l => l.category === 'Natural').length || 0})</span>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="search" className="space-y-4">
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search locations by name or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Time Period</label>
                    <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                      <SelectTrigger>
                        <SelectValue placeholder="All Periods" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Periods</SelectItem>
                        <SelectItem value="ancient">Ancient Times</SelectItem>
                        <SelectItem value="1800s">1800s</SelectItem>
                        <SelectItem value="1900s">1900s</SelectItem>
                        <SelectItem value="present">Present Day</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">Sort By</label>
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="name">Name (A-Z)</SelectItem>
                        <SelectItem value="category">Category</SelectItem>
                        <SelectItem value="period">Time Period</SelectItem>
                        {userLocation && <SelectItem value="distance">Distance</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Showing {filteredLocations.length} of {locations?.length || 0} locations</span>
                  {(searchTerm || selectedCategory !== "all" || selectedPeriod !== "all") && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedCategory("all");
                        setSelectedPeriod("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="list" className="space-y-3">
              <div className="max-h-64 overflow-y-auto space-y-2">
                {filteredLocations.map((location) => (
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
                      {userLocation && location.latitude && location.longitude && (
                        <span className="text-xs text-gray-500 ml-2">
                          {calculateDistance(userLocation, { lat: location.latitude as number, lng: location.longitude as number }).toFixed(1)} miles away
                        </span>
                      )}
                    </div>
                    <Button variant="ghost" size="sm">
                      <MapPin className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Location Status */}
        {locationError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span className="text-sm text-red-700">{locationError}</span>
          </div>
        )}


      </CardContent>
    </Card>
  );
}
