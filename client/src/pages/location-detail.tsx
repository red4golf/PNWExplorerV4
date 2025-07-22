import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, MapPin, Calendar, User, Navigation, ExternalLink, FileText, BookOpen } from "lucide-react";
import { Link } from "wouter";
import { getCategoryIcon, getCategoryColor, formatDate, getDirectionsUrl, calculateDistance } from "@/lib/utils";
import { useAnalytics } from "@/hooks/use-analytics";
import { generateLocationSEO, updatePageSEO } from "@/lib/seo";
import type { Location } from "@shared/schema";
import { useState, useEffect } from "react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LocationPhotoGallery from "@/components/location-photo-gallery";
import AudioPlayer from "@/components/audio-player";



export default function LocationDetail() {
  const [, params] = useRoute("/location/:id");
  const locationId = params?.id ? parseInt(params.id) : 0;
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const { trackLocationView } = useAnalytics();

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

  // Track location view and update SEO when location data is loaded
  useEffect(() => {
    if (location) {
      trackLocationView(location.id, location.name);
      
      // Update SEO metadata for this location
      const seoData = generateLocationSEO(location);
      updatePageSEO(seoData);
    }
  }, [location, trackLocationView]);

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
    <div className="min-h-screen bg-heritage-cream py-4 sm:py-8">
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        {/* Back Button */}
        <Link href="/#map">
          <Button variant="ghost" className="mb-4 sm:mb-6 text-heritage-brown hover:text-heritage-gold">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Map
          </Button>
        </Link>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Image and Map Section */}
          <div className="lg:col-span-2 overflow-hidden">
            <img
              src={imageUrl}
              alt={location.name}
              className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-lg shadow-lg"
            />
            
            {/* Photo Gallery - Moved to top for better mobile/tablet experience */}
            <Card className="mt-4 sm:mt-6 border-heritage-beige">
              <CardContent className="p-3 sm:p-4 md:p-6">
                <LocationPhotoGallery 
                  locationId={location.id} 
                  locationName={location.name}
                />
              </CardContent>
            </Card>
            
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
          <div className="lg:col-span-1 overflow-hidden">
            <div className="flex items-center mb-3 sm:mb-4">
              <span className="text-heritage-gold mr-2 sm:mr-3 text-xl sm:text-2xl">
                {getCategoryIcon(location.category || '')}
              </span>
              <Badge 
                variant="secondary" 
                className={`${getCategoryColor(location.category || '')} text-xs sm:text-sm`}
              >
                {location.category}
              </Badge>
            </div>

            <h1 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-heritage-brown mb-3 sm:mb-4 break-words leading-tight">
              {location.name}
            </h1>

            {location.period && (
              <div className="flex items-center mb-6 text-heritage-olive">
                <Calendar className="w-5 h-5 mr-2" />
                <span className="font-semibold">{location.period}</span>
              </div>
            )}

            {/* Audio Player */}
            <div className="mb-6">
              <AudioPlayer 
                locationId={location.id}
                locationName={location.name}
              />
            </div>

            <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none mb-6 sm:mb-8">
              <p className="text-gray-700 leading-relaxed text-sm sm:text-base">
                {location.description}
              </p>
            </div>

            {/* Extended Story Section */}
            {location.content && (
              <Card className="mb-6 sm:mb-8 border-heritage-beige">
                <CardContent className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-semibold text-heritage-brown mb-3 sm:mb-4 flex items-center">
                    <FileText className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                    The Story
                  </h3>
                  <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none text-gray-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {location.content}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}



            {/* Submission Info */}
            <Card className="bg-heritage-beige">
              <CardContent className="p-4 sm:p-6">
                <h3 className="text-sm sm:text-base font-semibold text-heritage-brown mb-3 sm:mb-4">
                  Contribution Information
                </h3>
                <div className="space-y-2 text-xs sm:text-sm">
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

        {/* Book Recommendations */}
        {location.recommendedBooks && JSON.parse(location.recommendedBooks).length > 0 && (
          <section className="mt-16">
            <Card className="bg-white border-heritage-olive/20">
              <CardHeader>
                <CardTitle className="flex items-center text-heritage-brown text-2xl">
                  <BookOpen className="w-6 h-6 mr-3" />
                  Further Reading
                </CardTitle>
                <p className="text-gray-600">
                  Deepen your understanding with these recommended books about {location.name} and related historical topics.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  {JSON.parse(location.recommendedBooks).map((book: any, index: number) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-4">
                        <div className="w-16 h-20 bg-heritage-beige rounded flex-shrink-0 flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-heritage-brown" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-heritage-brown">{book.title}</h3>
                            {book.category && (
                              <span className="px-2 py-1 text-xs bg-heritage-beige text-heritage-brown rounded border">
                                {book.category}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">by {book.author}</p>
                          <p className="text-sm text-gray-700 mb-3">{book.description}</p>
                          <a
                            href={book.amazonUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-3 py-2 text-sm bg-heritage-brown text-white rounded hover:bg-heritage-brown/90 transition-colors"
                            onClick={async () => {
                              try {
                                // Track affiliate clicks in database
                                await fetch('/api/affiliate-clicks', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify({
                                    locationId: location.id,
                                    bookTitle: book.title,
                                  }),
                                });
                                console.log('Affiliate click:', { locationId: location.id, bookTitle: book.title });
                              } catch (error) {
                                console.error('Failed to track affiliate click:', error);
                              }
                            }}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            View on Amazon
                          </a>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <p className="text-xs text-gray-500">
                    As an Amazon Associate, Pacific Northwest Historical Explorer earns from qualifying purchases. 
                    This helps support the development and maintenance of this historical resource.
                  </p>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Related Locations - Coming Soon */}
        <section className="mt-16">
          <div className="text-center py-12 bg-gradient-to-r from-heritage-cream to-heritage-beige rounded-lg border-2 border-dashed border-heritage-olive/30">
            <div className="max-w-2xl mx-auto px-6">
              <h2 className="text-3xl font-bold text-heritage-brown mb-4">
                Related Historical Locations
              </h2>
              <p className="text-lg text-heritage-olive mb-6">
                Discover connections between Pacific Northwest historical sites
              </p>
              <div className="bg-white/60 rounded-lg p-6 border border-heritage-olive/20">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-12 h-12 bg-heritage-brown/10 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-heritage-brown" />
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-heritage-brown mb-3">
                  Coming Soon: Smart Location Connections
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  We're developing an intelligent system to connect historical locations based on 
                  geographical proximity, time periods, cultural themes, and historical events. 
                  Soon you'll be able to explore curated trails and discover how Pacific Northwest 
                  locations relate to each other across time and space.
                </p>
                <div className="mt-4 text-sm text-heritage-olive font-medium">
                  Feature in development • Stay tuned for updates
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
