import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Navigation } from "lucide-react";
import { getCategoryIcon, getCategoryColor, getDirectionsUrl } from "@/lib/utils";
import type { Location } from "@shared/schema";

interface LocationCardProps {
  location: Location;
}

export default function LocationCard({ location }: LocationCardProps) {
  // Use hero image if available, otherwise use placeholder
  // Use a local placeholder to avoid cross-origin issues
  const placeholderImage = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"><rect width="800" height="600" fill="%23f3f4f6"/><text x="400" y="300" text-anchor="middle" font-size="24" fill="%236b7280">Historical Location</text></svg>`;
  const imageUrl = location.heroImage || placeholderImage;

  return (
    <Card className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <img 
        src={imageUrl} 
        alt={location.name}
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-6">
        <div className="flex items-center mb-2">
          <span className="text-heritage-gold mr-2 text-lg">
            {getCategoryIcon(location.category || '')}
          </span>
          <Badge 
            variant="secondary" 
            className={`text-sm font-medium ${getCategoryColor(location.category || '')}`}
          >
            {location.category}
          </Badge>
        </div>
        
        <h3 className="text-xl font-bold text-heritage-brown mb-3">
          {location.name}
        </h3>
        
        <p className="text-gray-600 mb-4 line-clamp-3">
          {location.description}
        </p>
        
        <div className="flex items-center justify-between">
          <span className="text-sm text-heritage-olive font-medium">
            {location.period}
          </span>
          <div className="flex gap-2">
            {location.latitude && location.longitude && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-blue-600 hover:text-blue-700"
                onClick={() => window.open(getDirectionsUrl(location), '_blank')}
              >
                <Navigation className="w-4 h-4" />
              </Button>
            )}
            <Link href={`/location/${location.slug}`}>
              <Button variant="ghost" size="sm" className="text-heritage-brown hover:text-heritage-gold">
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
