import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Filter, List, MapPin } from "lucide-react";
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
  
  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

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

  useEffect(() => {
    if (!L || !mapRef.current || !locations) return;

    // Initialize map
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView([47.6262, -122.5194], 12);
      
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(mapInstanceRef.current);
    }

    // Clear existing markers
    mapInstanceRef.current.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        mapInstanceRef.current.removeLayer(layer);
      }
    });

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
      }
    };
  }, [L, locations, onLocationSelect]);

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
        
        {/* Map Controls */}
        <div className="flex flex-wrap gap-4 mt-6">
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
