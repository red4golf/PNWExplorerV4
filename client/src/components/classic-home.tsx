import { useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import LocationCard from "@/components/location-card";
import FeedbackForm from "@/components/feedback-form";
import QRShare from "@/components/qr-share";
import { MapPin, BookOpen, Plus, Users, Mountain, TreePine, MessageCircle } from "lucide-react";
import type { Location } from "@shared/schema";

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function hasRealPhoto(location: Location): boolean {
  return !!(location.heroImage && location.heroImage.startsWith('/api/files/'));
}

interface ClassicHomeProps {
  locations?: Location[];
  isLoading: boolean;
  onStartExploring: () => void;
}

export default function ClassicHome({ locations, isLoading, onStartExploring }: ClassicHomeProps) {
  const featuredLocations = useMemo(() => {
    if (!locations) return [];
    const locationsWithPhotos = locations.filter(hasRealPhoto);
    const shuffled = shuffleArray(locationsWithPhotos);
    return shuffled.slice(0, 6);
  }, [locations]);
  return (
    <div className="bg-heritage-cream min-h-screen">
      {/* Beta Ribbon */}
      <div className="absolute top-0 right-0 z-50 overflow-hidden w-32 h-16">
        <div className="bg-gradient-to-r from-heritage-gold to-yellow-500 text-white px-4 sm:px-6 py-1 sm:py-2 transform rotate-12 translate-x-2 sm:translate-x-4 -translate-y-1 sm:-translate-y-2 shadow-lg">
          <span className="font-semibold text-xs sm:text-sm tracking-wide whitespace-nowrap">BETA VERSION</span>
        </div>
      </div>
      
      {/* Hero/Intro Section - Responsive Heights */}
      <section className="relative min-h-screen md:min-h-[85vh] lg:min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=1920&h=1080&fit=crop')`
          }}
        />
        <div className="absolute inset-0 bg-heritage-brown bg-opacity-50" />
        
        <div className="relative container mx-auto px-4 md:px-6 text-center text-white max-w-4xl w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-4 md:mb-6 leading-tight break-words">
            Discover the Pacific Northwest's{" "}
            <span className="text-heritage-gold">Rich History</span>
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 md:mb-8 leading-relaxed px-2 md:px-0 max-w-3xl mx-auto">
            Explore the stories, landmarks, and heritage across Washington, Oregon, Northern California, Idaho, Montana, and Southern British Columbia through interactive maps and historical narratives.
          </p>
          
          {/* iPad/Tablet specific statistics preview */}
          <div className="hidden md:block lg:hidden mb-8">
            <div className="flex justify-center gap-6 text-sm">
              <div className="text-center">
                <div className="text-2xl font-bold text-heritage-gold">{locations?.length || 0}</div>
                <div className="text-white/80">Historic Sites</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-heritage-gold">{locations?.filter(l => l.category === 'Natural').length || 0}</div>
                <div className="text-white/80">Natural Wonders</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-heritage-gold">{locations?.filter(l => l.category === 'Cultural').length || 0}</div>
                <div className="text-white/80">Cultural Sites</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 md:gap-4 max-w-xs sm:max-w-sm md:max-w-md mx-auto">
            <Button 
              onClick={onStartExploring}
              size="lg" 
              className="bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-brown px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold w-full"
              data-testid="button-start-exploring"
            >
              <MapPin className="w-4 h-4 md:w-5 md:h-5 mr-2" />
              Start Exploring
            </Button>
            <Link href="/learn-more">
              <Button 
                variant="outline" 
                size="lg" 
                style={{ color: 'white', borderColor: 'white' }}
                className="border-2 bg-transparent hover:bg-white hover:text-heritage-brown px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold w-full"
                data-testid="button-learn-more"
              >
                <BookOpen className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                Learn More
              </Button>
            </Link>
            
            {/* Beta Utility Bar - Responsive */}
            <div className="flex justify-center gap-2 md:gap-3 pt-2 md:pt-4">
              <FeedbackForm 
                trigger={
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20 text-xs md:text-sm"
                    data-testid="button-feedback"
                  >
                    <MessageCircle className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                    Feedback
                  </Button>
                }
              />
              <QRShare variant="dark" />
            </div>
          </div>
        </div>

        {/* Scroll indicator for desktop */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden lg:block">
          <div className="text-white text-sm opacity-75 animate-bounce">
            Scroll down to explore
          </div>
        </div>
      </section>

      {/* Featured Locations - Hidden on mobile initially, shown on desktop */}
      <section id="locations" className="py-16 bg-white hidden md:block">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-heritage-brown mb-4">
              Explore Pacific Northwest Heritage
            </h2>
            <p className="text-xl text-gray-600">
              From ancient redwood forests to modern ski resorts, discover the diverse history of the Pacific Northwest
            </p>
          </div>
          
          {/* Category Highlights */}
          {locations && (
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardContent className="p-6 text-center">
                  <TreePine className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-green-800 mb-2">Natural Wonders</h3>
                  <p className="text-green-700 mb-4">Ancient forests, volcanic landscapes, and pristine wilderness areas</p>
                  <Badge variant="secondary" className="bg-green-200 text-green-800">
                    {locations.filter(l => l.category === 'Natural').length} locations
                  </Badge>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-6 text-center">
                  <Mountain className="w-12 h-12 text-amber-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-amber-800 mb-2">Historical Sites</h3>
                  <p className="text-amber-700 mb-4">Gold rush towns, frontier forts, and landmark battles</p>
                  <Badge variant="secondary" className="bg-amber-200 text-amber-800">
                    {locations.filter(l => l.category === 'Historical').length} locations
                  </Badge>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-6 text-center">
                  <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-blue-800 mb-2">Cultural Heritage</h3>
                  <p className="text-blue-700 mb-4">Indigenous traditions, maritime culture, and modern innovations</p>
                  <Badge variant="secondary" className="bg-blue-200 text-blue-800">
                    {locations.filter(l => l.category === 'Cultural').length} locations
                  </Badge>
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Featured Location Samples */}
          {isLoading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-white">
                  <Skeleton className="w-full h-48" />
                  <CardContent className="p-6">
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-6 w-full mb-3" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3 mb-4" />
                    <div className="flex justify-between items-center">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredLocations.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button 
              onClick={onStartExploring}
              size="lg" 
              className="bg-heritage-brown text-white hover:bg-heritage-brown/90 px-8 py-3 font-semibold"
              data-testid="button-explore-all"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Explore All {locations?.length || 0} Locations
            </Button>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-heritage-brown text-white hidden md:block">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Help Preserve Pacific Northwest History</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Have a historical location or story to share? Contribute to our growing collection 
            of Pacific Northwest heritage spanning Washington, Oregon, Northern California, Idaho, Montana, and Southern British Columbia.
          </p>
          <Link href="/submit">
            <Button 
              size="lg" 
              className="bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-brown px-8 py-4 text-lg font-semibold"
              data-testid="button-submit-location"
            >
              <Plus className="w-5 h-5 mr-2" />
              Submit a Location
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
