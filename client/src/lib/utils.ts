import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    "Transportation Hub": "🚢",
    "Memorial Site": "🏛️",
    "Maritime Heritage": "🗼",
    "Agricultural Heritage": "🌾",
    "Industrial Heritage": "🏭",
    "Indigenous Heritage": "🪶",
    "Community & Culture": "🏛️",
    "Natural Heritage": "🌲",
  };
  
  return icons[category] || "📍";
}

export function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    "Transportation Hub": "bg-blue-100 text-blue-800",
    "Memorial Site": "bg-purple-100 text-purple-800",
    "Maritime Heritage": "bg-cyan-100 text-cyan-800",
    "Agricultural Heritage": "bg-green-100 text-green-800",
    "Industrial Heritage": "bg-gray-100 text-gray-800",
    "Indigenous Heritage": "bg-amber-100 text-amber-800",
    "Community & Culture": "bg-pink-100 text-pink-800",
    "Natural Heritage": "bg-emerald-100 text-emerald-800",
  };
  
  return colors[category] || "bg-gray-100 text-gray-800";
}

export function getDirectionsUrl(
  destination: { latitude?: number | null; longitude?: number | null; address?: string | null; name: string },
  userLocation?: { lat: number; lng: number }
): string {
  // Construct the destination parameter
  let destinationParam = '';
  
  if (destination.latitude && destination.longitude) {
    destinationParam = `${destination.latitude},${destination.longitude}`;
  } else if (destination.address) {
    destinationParam = encodeURIComponent(destination.address);
  } else {
    destinationParam = encodeURIComponent(destination.name);
  }
  
  // If we have user location, include it as origin
  let originParam = '';
  if (userLocation) {
    originParam = `&origin=${userLocation.lat},${userLocation.lng}`;
  }
  
  // Return Google Maps directions URL
  return `https://www.google.com/maps/dir/?api=1${originParam}&destination=${destinationParam}&travelmode=driving`;
}

export function calculateDistance(
  point1: { lat: number; lng: number },
  point2: { lat: number; lng: number }
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (point2.lat - point1.lat) * (Math.PI / 180);
  const dLng = (point2.lng - point1.lng) * (Math.PI / 180);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(point1.lat * (Math.PI / 180)) * Math.cos(point2.lat * (Math.PI / 180)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c; // Distance in miles
}
