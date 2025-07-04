import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Calendar, User, Navigation, ExternalLink, FileText } from "lucide-react";
import { Link } from "wouter";
import { getCategoryIcon, getCategoryColor, formatDate, getDirectionsUrl, calculateDistance } from "@/lib/utils";
import type { Location } from "@shared/schema";
import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';



export default function LocationDetail() {
  const [, params] = useRoute("/location/:id");
  const locationId = params?.id ? parseInt(params.id) : 0;
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  const { data: location, isLoading, error } = useQuery<Location>({
    queryKey: [`/api/locations/${locationId}`],
    enabled: !!locationId,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-heritage-cream py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-8 w-32 mb-6" />
          <div className="grid lg:grid-cols-2 gap-8">
            <div>
              <Skeleton className="w-full h-96 rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !location) {
    return (
      <div className="min-h-screen bg-heritage-cream py-8">
        <div className="container mx-auto px-4">
          <Card className="max-w-2xl mx-auto">
            <CardContent className="p-8 text-center">
              <h1 className="text-2xl font-bold text-heritage-brown mb-4">
                Location Not Found
              </h1>
              <p className="text-gray-600 mb-6">
                The historical location you're looking for doesn't exist or has been removed.
              </p>
              <Link href="/">
                <Button className="bg-heritage-brown hover:bg-heritage-brown/90">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const placeholderImage = `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=800&h=600&fit=crop`;
  const imageUrl = location.heroImage || placeholderImage;

  return (
    <div className="min-h-screen bg-heritage-cream py-8">
      <div className="container mx-auto px-4">
        {/* Back Button */}
        <Link href="/#map">
          <Button variant="ghost" className="mb-6 text-heritage-brown hover:text-heritage-gold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Map
          </Button>
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Image Section */}
          <div>
            <img
              src={imageUrl}
              alt={location.name}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
            />
            
            {/* Map Section */}
            {location.latitude && location.longitude && (
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="flex items-center text-heritage-brown">
                    <MapPin className="w-5 h-5 mr-2" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48 bg-gray-100 rounded-lg border relative overflow-hidden">
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude-0.01},${location.latitude-0.01},${location.longitude+0.01},${location.latitude+0.01}&layer=mapnik&marker=${location.latitude},${location.longitude}`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      loading="lazy"
                      title={`Map showing ${location.name}`}
                    />
                  </div>
                  {location.address && (
                    <p className="mt-4 text-sm text-gray-600">{location.address}</p>
                  )}
                  <div className="mt-4 flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}&zoom=15`, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      View on OpenStreetMap
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Content Section */}
          <div>
            <div className="flex items-center mb-4">
              <span className="text-heritage-gold mr-3 text-2xl">
                {getCategoryIcon(location.category || '')}
              </span>
              <Badge 
                variant="secondary" 
                className={`${getCategoryColor(location.category || '')}`}
              >
                {location.category}
              </Badge>
            </div>

            <h1 className="text-4xl font-bold text-heritage-brown mb-4">
              {location.name}
            </h1>

            {location.period && (
              <div className="flex items-center mb-6 text-heritage-olive">
                <Calendar className="w-5 h-5 mr-2" />
                <span className="font-semibold">{location.period}</span>
              </div>
            )}

            <div className="prose prose-lg max-w-none mb-8">
              <p className="text-gray-700 leading-relaxed">
                {location.description}
              </p>
            </div>

            {/* Extended Story Section */}
            {location.content && (
              <Card className="mb-8 border-heritage-beige">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold text-heritage-brown mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    The Story
                  </h3>
                  <div className="prose prose-lg max-w-none text-gray-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {location.content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Submission Info */}
            <Card className="bg-heritage-beige">
              <CardContent className="p-6">
                <h3 className="font-semibold text-heritage-brown mb-4">
                  Contribution Information
                </h3>
                <div className="space-y-2 text-sm">
                  {location.submitterName && (
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2 text-heritage-olive" />
                      <span>Submitted by: {location.submitterName}</span>
                    </div>
                  )}
                  {location.createdAt && (
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2 text-heritage-olive" />
                      <span>Added: {formatDate(location.createdAt)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Distance and Directions */}
            {location.latitude && location.longitude && userLocation && (
              <Card className="bg-blue-50 border-blue-200 mt-6">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-blue-800">
                        Distance from your location
                      </p>
                      <p className="text-lg font-bold text-blue-900">
                        {calculateDistance(
                          userLocation,
                          { lat: location.latitude, lng: location.longitude }
                        ).toFixed(1)} miles away
                      </p>
                    </div>
                    <Button 
                      onClick={() => window.open(getDirectionsUrl(location, userLocation || undefined), '_blank')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Navigation className="w-4 h-4 mr-2" />
                      Get Directions
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 mt-8">
              {location.latitude && location.longitude && (
                <Button 
                  onClick={() => window.open(getDirectionsUrl(location, userLocation || undefined), '_blank')}
                  className="bg-heritage-brown hover:bg-heritage-brown/90"
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Directions
                </Button>
              )}
              <Button 
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: location.name,
                      text: location.description,
                      url: window.location.href,
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                  }
                }}
                variant="outline" 
                className="border-heritage-brown text-heritage-brown hover:bg-heritage-brown hover:text-white"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Share Location
              </Button>
              <Button variant="outline" className="border-heritage-brown text-heritage-brown hover:bg-heritage-brown hover:text-white">
                Add to Favorites
              </Button>
            </div>
          </div>
        </div>

        {/* Related Locations */}
        <section className="mt-16">
          <h2 className="text-3xl font-bold text-heritage-brown mb-8">
            Related Historical Locations
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="hover:shadow-lg transition-shadow">
                <div className="h-32 bg-gray-200 rounded-t-lg"></div>
                <CardContent className="p-4">
                  <h3 className="font-semibold text-heritage-brown mb-2">
                    Related Location {i}
                  </h3>
                  <p className="text-sm text-gray-600">
                    Brief description of another historical location...
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
