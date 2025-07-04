import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import InteractiveMap from "@/components/interactive-map";
import LocationCard from "@/components/location-card";
import PhotoGallery from "@/components/photo-gallery";
import FeedbackForm from "@/components/feedback-form";
import QRShare from "@/components/qr-share";
import { MapPin, BookOpen, ArrowLeft, Menu, Plus, Settings, Users, Calendar, Mountain, Waves, TreePine, Factory, MessageCircle } from "lucide-react";
import type { Location } from "@shared/schema";

export default function Home() {
  const [showMap, setShowMap] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  // Check for hash to show map directly
  useEffect(() => {
    if (window.location.hash === '#map') {
      setShowMap(true);
    }
  }, []);

  const handleLocationSelect = (location: Location) => {
    // Navigate to location detail page
    window.location.href = `/location/${location.id}`;
  };

  const handleStartExploring = () => {
    setShowMap(true);
  };

  const handleBackToIntro = () => {
    setShowMap(false);
  };

  // Show map view if user clicked Start Exploring
  if (showMap) {
    return (
      <div className="bg-heritage-cream min-h-screen">
        {/* Map Navigation Header */}
        <div className="bg-white shadow-sm sticky top-0 z-10 relative">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={handleBackToIntro}
                className="text-heritage-brown hover:bg-heritage-beige"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <h1 className="text-lg font-semibold text-heritage-brown">Pacific Northwest Historical Explorer</h1>
              
              {/* Navigation Menu */}
              <div className="relative z-[2000]">
                <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-heritage-brown hover:bg-heritage-beige"
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="bg-heritage-brown text-white border-heritage-olive z-[2000]" style={{ zIndex: 2000 }}>
                  <div className="flex flex-col space-y-4 mt-8">
                    <Link href="/submit" onClick={() => setMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-white/20"
                      >
                        <Plus className="w-4 h-4 mr-3" />
                        Submit Location
                      </Button>
                    </Link>
                    <Link href="/admin" onClick={() => setMenuOpen(false)}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-white/20"
                      >
                        <Settings className="w-4 h-4 mr-3" />
                        Admin
                      </Button>
                    </Link>
                  </div>
                </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>

        {/* Full Screen Map */}
        <div className="h-[calc(100vh-64px)]">
          <InteractiveMap onLocationSelect={handleLocationSelect} />
        </div>
      </div>
    );
  }

  // Show intro screen by default
  return (
    <div className="bg-heritage-cream min-h-screen">
      {/* Hero/Intro Section - Full Screen on Mobile */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=1920&h=1080&fit=crop')`
          }}
        />
        <div className="absolute inset-0 bg-heritage-brown bg-opacity-50" />
        
        <div className="relative container mx-auto px-6 text-center text-white max-w-2xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
            Discover the Pacific Northwest's{" "}
            <span className="text-heritage-gold">Rich History</span>
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl mb-8 leading-relaxed">
            Explore the stories, landmarks, and heritage across Washington, Oregon, Northern California, Idaho, Montana, and Southern British Columbia through interactive maps and historical narratives.
          </p>
          
          {/* Statistics */}
          {locations && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-center">
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-heritage-gold">{locations.length}</div>
                <div className="text-sm">Historic Locations</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-heritage-gold">{locations.filter(l => l.category === 'Historical').length}</div>
                <div className="text-sm">Historical Sites</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-heritage-gold">{locations.filter(l => l.category === 'Natural').length}</div>
                <div className="text-sm">Natural Wonders</div>
              </div>
              <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
                <div className="text-3xl font-bold text-heritage-gold">{locations.filter(l => l.category === 'Cultural').length}</div>
                <div className="text-sm">Cultural Heritage</div>
              </div>
            </div>
          )}
          <div className="flex flex-col gap-4 max-w-sm mx-auto">
            <Button 
              onClick={handleStartExploring}
              size="lg" 
              className="bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-brown px-8 py-4 text-lg font-semibold w-full"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Start Exploring
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              style={{ color: 'white', borderColor: 'white' }}
              className="border-2 bg-transparent hover:bg-white hover:text-heritage-brown px-8 py-4 text-lg font-semibold w-full"
              onClick={() => setShowMap(false)}
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Learn More
            </Button>
            
            {/* Beta Utility Bar */}
            <div className="flex justify-center gap-3 pt-4">
              <FeedbackForm 
                trigger={
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-white/80 hover:text-white hover:bg-white/10 border border-white/20"
                  >
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Feedback
                  </Button>
                }
              />
              <QRShare />
            </div>
          </div>
        </div>

        {/* Scroll indicator for desktop */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 hidden md:block">
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
              {locations?.slice(0, 6).map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button 
              onClick={handleStartExploring}
              size="lg" 
              className="bg-heritage-brown text-white hover:bg-heritage-brown/90 px-8 py-3 font-semibold"
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
