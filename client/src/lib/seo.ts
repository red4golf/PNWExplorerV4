import type { Location } from "@shared/schema";

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage?: string;
  structuredData?: object;
}

export function generateLocationSEO(location: Location): SEOMetadata {
  const title = `${location.name} - ${location.category} Site | Pacific Northwest Historical Explorer`;
  
  const description = `Discover ${location.name}, a ${location.category.toLowerCase()} site in the Pacific Northwest. ${location.description.substring(0, 140)}...`;
  
  const keywords = [
    location.name,
    location.category,
    "Pacific Northwest history",
    "historical sites",
    location.address || "",
    location.period || "",
    "heritage sites",
    "cultural landmarks"
  ].filter(Boolean);
  
  const canonicalUrl = `https://pnw-history-explorer.replit.app/location/${location.id}`;
  
  const structuredData = {
    "@context": "https://schema.org",
    "@type": location.category === "Natural" ? "TouristAttraction" : "Place",
    "name": location.name,
    "description": location.description,
    "address": location.address,
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": location.latitude,
      "longitude": location.longitude
    },
    "url": canonicalUrl,
    "image": location.heroImage ? `https://pnw-history-explorer.replit.app${location.heroImage}` : undefined,
    "category": location.category,
    "historicalSignificance": location.period,
    "author": {
      "@type": "Organization",
      "name": "Pacific Northwest Historical Explorer"
    }
  };
  
  return {
    title,
    description,
    keywords,
    canonicalUrl,
    structuredData
  };
}

export function generateHomeSEO(): SEOMetadata {
  return {
    title: "Pacific Northwest Historical Explorer - Discover 60+ Historical Sites",
    description: "Explore over 60 historical locations across Washington, Oregon, Northern California, Idaho, and Montana. Interactive maps, rich stories, and photo galleries bring Pacific Northwest history to life.",
    keywords: [
      "Pacific Northwest history",
      "historical sites",
      "Washington history",
      "Oregon history",
      "interactive map",
      "historical locations",
      "heritage sites",
      "cultural landmarks",
      "natural wonders"
    ],
    canonicalUrl: "https://pnw-history-explorer.replit.app"
  };
}

export function updatePageSEO(metadata: SEOMetadata): void {
  // Update title
  document.title = metadata.title;
  
  // Update meta description
  updateMetaTag('name', 'description', metadata.description);
  
  // Update keywords
  updateMetaTag('name', 'keywords', metadata.keywords.join(', '));
  
  // Update canonical URL
  updateLinkTag('canonical', metadata.canonicalUrl);
  
  // Update Open Graph tags
  updateMetaTag('property', 'og:title', metadata.title);
  updateMetaTag('property', 'og:description', metadata.description);
  updateMetaTag('property', 'og:url', metadata.canonicalUrl);
  
  // Update Twitter tags
  updateMetaTag('property', 'twitter:title', metadata.title);
  updateMetaTag('property', 'twitter:description', metadata.description);
  updateMetaTag('property', 'twitter:url', metadata.canonicalUrl);
  
  // Update structured data
  if (metadata.structuredData) {
    updateStructuredData(metadata.structuredData);
  }
}

function updateMetaTag(attribute: string, value: string, content: string): void {
  let element = document.querySelector(`meta[${attribute}="${value}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attribute, value);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function updateLinkTag(rel: string, href: string): void {
  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
  if (!element) {
    element = document.createElement('link');
    element.rel = rel;
    document.head.appendChild(element);
  }
  element.href = href;
}

function updateStructuredData(data: object): void {
  // Remove existing structured data
  const existing = document.querySelector('script[type="application/ld+json"].dynamic-seo');
  if (existing) {
    existing.remove();
  }
  
  // Add new structured data
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.className = 'dynamic-seo';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
}