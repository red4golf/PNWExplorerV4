import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Play, Pause, Volume2, Download, Plus, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Location {
  id: number;
  name: string;
  category: string;
  description: string;
  content?: string;
  audioNarration?: Buffer;
}

export default function AdminAudio() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [generatingAudio, setGeneratingAudio] = useState<number | null>(null);

  const { data: locations = [], isLoading } = useQuery<Location[]>({
    queryKey: ["/api/admin/locations"],
  });

  const generateAudioMutation = useMutation({
    mutationFn: async (locationId: number) => {
      setGeneratingAudio(locationId);
      return apiRequest(`/api/admin/locations/${locationId}/generate-audio`, {
        method: "POST",
      });
    },
    onSuccess: (data, locationId) => {
      setGeneratingAudio(null);
      toast({
        title: "Audio Generated Successfully",
        description: `Audio narration created (${data.audioSize})`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] });
    },
    onError: (error: any, locationId) => {
      setGeneratingAudio(null);
      toast({
        title: "Audio Generation Failed",
        description: error.message || "Failed to generate audio narration",
        variant: "destructive",
      });
    },
  });

  const filteredLocations = locations.filter(location => {
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || location.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(locations.map(l => l.category))).sort();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-heritage-brown">Audio Narration Management</h2>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-32"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-heritage-brown">Audio Narration Management</h2>
        <div className="text-sm text-gray-600">
          {filteredLocations.length} of {locations.length} locations
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search locations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Locations Grid */}
      <div className="grid gap-4">
        {filteredLocations.map(location => (
          <Card key={location.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg text-heritage-brown mb-2">
                    {location.name}
                  </CardTitle>
                  <Badge variant="secondary" className="mb-2">
                    {location.category}
                  </Badge>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {location.description}
                  </p>
                </div>
                <div className="ml-4 flex items-center space-x-2">
                  {location.audioNarration ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Audio Ready
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-gray-500">
                      No Audio
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {location.audioNarration ? (
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const audio = new Audio(`/api/locations/${location.id}/audio`);
                          audio.play();
                        }}
                      >
                        <Play className="h-4 w-4 mr-1" />
                        Play
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = `/api/locations/${location.id}/audio`;
                          link.download = `${location.name}-audio-tour.mp3`;
                          link.click();
                        }}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  ) : null}
                </div>
                
                <Button
                  onClick={() => generateAudioMutation.mutate(location.id)}
                  disabled={generatingAudio === location.id}
                  className="bg-heritage-600 hover:bg-heritage-700"
                >
                  {generatingAudio === location.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Volume2 className="h-4 w-4 mr-2" />
                      {location.audioNarration ? 'Regenerate Audio' : 'Generate Audio'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No locations found
            </h3>
            <p className="text-gray-600">
              Try adjusting your search terms or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}