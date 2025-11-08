import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import InteractiveMap from "@/components/interactive-map";
import ClassicHome from "@/components/classic-home";
import ModernHome from "@/components/modern-home";
import { useDesignMode } from "@/contexts/design-mode-context";
import { usePageView } from "@/hooks/use-analytics";
import { generateHomeSEO, updatePageSEO } from "@/lib/seo";
import { ArrowLeft, Menu, Plus, Settings } from "lucide-react";
import type { Location } from "@shared/schema";

export default function Home() {
  const [showMap, setShowMap] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { designMode } = useDesignMode();
  
  // Track page views
  usePageView("home", { showMap });
  
  const { data: locations, isLoading } = useQuery<Location[]>({
    queryKey: ["/api/locations"],
  });

  // Check for hash to show map directly and update SEO
  useEffect(() => {
    if (window.location.hash === '#map') {
      setShowMap(true);
    }
    
    // Update SEO metadata for home page
    const seoData = generateHomeSEO();
    updatePageSEO(seoData);
  }, []);

  const handleLocationSelect = (location: Location) => {
    // Navigate to location detail page
    window.location.href = `/location/${location.slug}`;
  };

  const handleStartExploring = () => {
    setShowMap(true);
    window.location.hash = '#map';
  };

  const handleBackToIntro = () => {
    setShowMap(false);
    window.location.hash = '';
  };

  // Show map view if user clicked Start Exploring
  if (showMap) {
    return (
      <div className="bg-heritage-cream min-h-screen">
        {/* Beta Ribbon */}
        <div className="absolute top-0 right-0 z-50 overflow-hidden w-32 h-16">
          <div className="bg-gradient-to-r from-heritage-gold to-yellow-500 text-white px-4 sm:px-6 py-1 sm:py-2 transform rotate-12 translate-x-2 sm:translate-x-4 -translate-y-1 sm:-translate-y-2 shadow-lg">
            <span className="font-semibold text-xs sm:text-sm tracking-wide whitespace-nowrap">BETA VERSION</span>
          </div>
        </div>
        
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
              <h1 className="text-sm sm:text-lg font-semibold text-heritage-brown break-words max-w-xs sm:max-w-none text-center">Pacific Northwest Historical Explorer</h1>
              
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

  // Show intro screen by default - switch between Modern and Classic based on designMode
  if (designMode === "modern") {
    return (
      <ModernHome 
        locations={locations}
        isLoading={isLoading}
        onStartExploring={handleStartExploring}
      />
    );
  }

  return (
    <ClassicHome 
      locations={locations}
      isLoading={isLoading}
      onStartExploring={handleStartExploring}
    />
  );
}
