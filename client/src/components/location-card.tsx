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
  // Use a placeholder image for now since we don't have actual photos
  const placeholderImage = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=800&h=600&fit=crop`;

  return (
    <Card className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <img 
        src={placeholderImage} 
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
            <Link href={`/location/${location.id}`}>
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
