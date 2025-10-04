import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Search, Sparkles, Box } from "lucide-react";
import type { Location } from "@shared/schema";

interface ModernHomeProps {
  locations?: Location[];
  isLoading: boolean;
  onStartExploring: () => void;
}

export default function ModernHome({ locations, isLoading, onStartExploring }: ModernHomeProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [timePeriod, setTimePeriod] = useState<number[]>([1800, 2000]);
  const [searchTerm, setSearchTerm] = useState("");

  const categories = ["all", "landmarks", "parks", "museums", "cultural", "natural", "historical"];
  const featuredLocations = locations?.slice(0, 3) || [];

  return (
    <div className="bg-[var(--modern-cream)] min-h-screen">
      {/* Beta Ribbon */}
      <div className="absolute top-0 right-0 z-50 overflow-hidden w-32 h-16">
        <div className="bg-gradient-to-r from-[var(--modern-sage)] to-[var(--modern-olive-light)] text-white px-4 sm:px-6 py-1 sm:py-2 transform rotate-12 translate-x-2 sm:translate-x-4 -translate-y-1 sm:-translate-y-2 shadow-lg">
          <span className="font-semibold text-xs sm:text-sm tracking-wide whitespace-nowrap">BETA VERSION</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-[60vh] md:min-h-[70vh] flex items-center justify-center py-12 md:py-20">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-5xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-6 md:mb-8 leading-tight text-[var(--modern-warm-gray)]">
              Discover the History of the{" "}
              <span className="text-[var(--modern-sage)]">Pacific Northwest</span>
            </h1>
            
            <Button 
              onClick={onStartExploring}
              size="lg"
              className="bg-[var(--modern-sage)] hover:bg-[var(--modern-sage)]/90 text-white px-8 md:px-12 py-4 md:py-6 text-base md:text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all"
              data-testid="button-explore-modern"
            >
              Explore
            </Button>
          </div>
        </div>
      </section>

      {/* Map Preview Section */}
      <section className="py-8 md:py-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="relative h-[300px] md:h-[400px] bg-gradient-to-br from-[#5c8a89] to-[#4a7170]">
              {/* Simplified PNW Map Representation */}
              <svg
                viewBox="0 0 600 400"
                className="w-full h-full"
                preserveAspectRatio="xMidYMid meet"
              >
                {/* PNW coastline approximation */}
                <path
                  d="M 100 50 L 120 100 L 110 150 L 100 200 L 90 250 L 100 300 L 150 320 L 200 310 L 250 300 L 300 290 L 350 280 L 400 270 L 450 260 L 500 250 L 520 200 L 510 150 L 500 100 L 480 70 L 450 50 L 400 40 L 350 45 L 300 50 L 250 50 L 200 48 L 150 47 L 100 50 Z"
                  fill="#7ba5a4"
                  fillOpacity="0.6"
                  stroke="#e8dcc8"
                  strokeWidth="2"
                />
                
                {/* Location dots */}
                {locations?.slice(0, 12).map((loc, index) => {
                  const x = 150 + (index % 5) * 80;
                  const y = 80 + Math.floor(index / 5) * 80;
                  return (
                    <g key={loc.id}>
                      <circle
                        cx={x}
                        cy={y}
                        r="8"
                        fill={index % 3 === 0 ? "#e07856" : index % 3 === 1 ? "#8c9f5f" : "#5c8a89"}
                        opacity="0.9"
                        className="hover:opacity-100 transition-opacity cursor-pointer"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="12"
                        fill="none"
                        stroke="white"
                        strokeWidth="1"
                        opacity="0.5"
                      />
                    </g>
                  );
                })}
              </svg>
              
              {/* Overlay content */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white p-6">
                  <MapPin className="w-12 h-12 mx-auto mb-4 opacity-80" />
                  <p className="text-lg md:text-xl font-semibold mb-2">
                    {locations?.length || 0} Historic Locations
                  </p>
                  <p className="text-sm md:text-base opacity-90">
                    Across the Pacific Northwest
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Locations */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--modern-warm-gray)] mb-8 md:mb-12 text-center">
            Featured
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {featuredLocations.map((location) => (
              <Card
                key={location.id}
                className="group overflow-hidden bg-white hover:shadow-xl transition-all duration-300 cursor-pointer rounded-2xl"
                onClick={() => window.location.href = `/location/${location.id}`}
                data-testid={`card-featured-${location.id}`}
              >
                <div className="relative h-48 md:h-56 overflow-hidden">
                  <img
                    src={location.heroImage || `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop`}
                    alt={location.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  
                  {/* Category badge overlay */}
                  <Badge
                    className="absolute top-4 left-4 bg-white/90 text-[var(--modern-warm-gray)] hover:bg-white"
                  >
                    {location.category}
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-[var(--modern-warm-gray)] mb-2 group-hover:text-[var(--modern-sage)] transition-colors">
                    {location.name}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {location.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 md:py-16 bg-white/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12">
            {/* Categories Pills */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--modern-warm-gray)] mb-6">
                Categories
              </h2>
              <div className="flex flex-wrap gap-3">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    onClick={() => setSelectedCategory(category)}
                    className={`rounded-full px-6 py-2 capitalize transition-all ${
                      selectedCategory === category
                        ? "bg-[var(--modern-sage)] text-white hover:bg-[var(--modern-sage)]/90"
                        : "border-2 border-gray-300 text-gray-700 hover:border-[var(--modern-sage)] hover:text-[var(--modern-sage)]"
                    }`}
                    data-testid={`button-category-${category}`}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Time Period Slider */}
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[var(--modern-warm-gray)] mb-6">
                Search by Time Period
              </h2>
              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-600 w-16">From:</label>
                    <input
                      type="range"
                      min={1800}
                      max={timePeriod[1] - 10}
                      step={10}
                      value={timePeriod[0]}
                      onChange={(e) => setTimePeriod([parseInt(e.target.value), timePeriod[1]])}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      data-testid="slider-time-period-start"
                    />
                    <span className="font-bold text-[var(--modern-sage)] w-16 text-right">{timePeriod[0]}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-sm font-medium text-gray-600 w-16">To:</label>
                    <input
                      type="range"
                      min={timePeriod[0] + 10}
                      max={2000}
                      step={10}
                      value={timePeriod[1]}
                      onChange={(e) => setTimePeriod([timePeriod[0], parseInt(e.target.value)])}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      data-testid="slider-time-period-end"
                    />
                    <span className="font-bold text-[var(--modern-terra-cotta)] w-16 text-right">{timePeriod[1]}</span>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-400 px-2">
                  <span>1800</span>
                  <span>1900</span>
                  <span>2000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Features */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl mx-auto">
            <Card className="bg-gradient-to-br from-[#e8dcc8] to-[#d4c4a8] border-none rounded-3xl overflow-hidden hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#8c9f5f] to-[#7a8b52] rounded-2xl flex items-center justify-center transform rotate-3">
                    <Sparkles className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[var(--modern-warm-gray)] mb-3">
                  Immerse Yourself
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Experience rich historical narratives with premium audio tours and interactive content at each location.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-[#e8dcc8] to-[#d4c4a8] border-none rounded-3xl overflow-hidden hover:shadow-xl transition-all">
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#5c8a89] to-[#4a7170] rounded-2xl flex items-center justify-center transform -rotate-3">
                    <Box className="w-10 h-10 text-white" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-[var(--modern-warm-gray)] mb-3">
                  Interactive Maps
                </h3>
                <p className="text-gray-700 leading-relaxed">
                  Explore detailed interactive maps with GPS directions and location-based discovery features.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-[var(--modern-cream)] rounded-3xl p-6 md:p-8 shadow-lg">
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="search locations"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 pr-4 py-6 rounded-2xl border-2 border-gray-200 focus:border-[var(--modern-sage)] text-base"
                    data-testid="input-search-locations"
                  />
                </div>

                {/* Filter */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--modern-warm-gray)] mb-2">
                    Filter
                  </label>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-full py-6 rounded-2xl border-2 border-gray-200 text-base" data-testid="select-filter">
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="landmarks">Landmarks</SelectItem>
                      <SelectItem value="parks">Parks</SelectItem>
                      <SelectItem value="museums">Museums</SelectItem>
                      <SelectItem value="cultural">Cultural</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* CTA Button */}
                <Button
                  onClick={onStartExploring}
                  size="lg"
                  className="w-full bg-[var(--modern-sage)] hover:bg-[var(--modern-sage)]/90 text-white py-6 text-lg font-semibold rounded-2xl shadow-md hover:shadow-lg transition-all"
                  data-testid="button-start-exploring-modern"
                >
                  Start Exploring
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Footer */}
      <section className="py-8 md:py-12 bg-[var(--modern-sage)] text-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">{locations?.length || 0}</div>
              <div className="text-sm md:text-base opacity-90">Historic Sites</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {locations?.filter(l => l.category === 'Natural').length || 0}
              </div>
              <div className="text-sm md:text-base opacity-90">Natural Wonders</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">
                {locations?.filter(l => l.category === 'Cultural').length || 0}
              </div>
              <div className="text-sm md:text-base opacity-90">Cultural Sites</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold mb-2">6</div>
              <div className="text-sm md:text-base opacity-90">States & Regions</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
