import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import InteractiveMap from "@/components/interactive-map";
import LocationCard from "@/components/location-card";
import PhotoGallery from "@/components/photo-gallery";
import { MapPin, BookOpen } from "lucide-react";
import type { Location } from "@shared/schema";

export default function Home() {
  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  const handleLocationSelect = (location: Location) => {
    // Navigate to location detail page
    window.location.href = `/location/${location.id}`;
  };

  return (
    <div className="bg-heritage-cream">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&w=1920&h=1080&fit=crop')`
          }}
        />
        <div className="absolute inset-0 bg-heritage-brown bg-opacity-50" />
        
        <div className="relative container mx-auto px-4 text-center text-white">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            Discover Bainbridge Island's{" "}
            <span className="text-heritage-gold">Rich History</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Explore the stories, landmarks, and heritage that shaped our island community 
            through interactive maps and historical narratives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-brown px-8 py-4 text-lg font-semibold"
            >
              <MapPin className="w-5 h-5 mr-2" />
              Start Exploring
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="border-2 border-white hover:bg-white hover:text-heritage-brown px-8 py-4 text-lg font-semibold"
            >
              <BookOpen className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Interactive Map Section */}
      <section id="explore" className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-heritage-brown mb-4">
              Interactive Historical Map
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Click on markers to discover the stories behind Bainbridge Island's most 
              significant historical locations.
            </p>
          </div>
          
          <InteractiveMap onLocationSelect={handleLocationSelect} />
        </div>
      </section>

      {/* Featured Locations */}
      <section id="locations" className="py-16 bg-heritage-beige">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-heritage-brown mb-4">
              Featured Historical Locations
            </h2>
            <p className="text-xl text-gray-600">
              Discover the most significant places in Bainbridge Island's history
            </p>
          </div>
          
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
              {locations?.map((location) => (
                <LocationCard key={location.id} location={location} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Button 
              size="lg" 
              className="bg-heritage-brown text-white hover:bg-heritage-brown/90 px-8 py-3 font-semibold"
            >
              View All Locations
            </Button>
          </div>
        </div>
      </section>

      {/* Photo Gallery */}
      <PhotoGallery />

      {/* Call to Action */}
      <section className="py-16 bg-heritage-brown text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Help Preserve Our History</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Have a historical location or story to share? Contribute to our growing collection 
            of Bainbridge Island's heritage.
          </p>
          <Link href="/submit">
            <Button 
              size="lg" 
              className="bg-heritage-gold hover:bg-heritage-gold/90 text-heritage-brown px-8 py-4 text-lg font-semibold"
            >
              Submit a Location
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
