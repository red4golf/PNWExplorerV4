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
