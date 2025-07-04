import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock, Clock, MapPin, Users, CheckCircle, XCircle, LogIn, Upload, FileText, Database, Edit3, Search, Save, Filter, Eye, Trash2, Image, Calendar, BarChart3, Settings, RefreshCw, Download, ChevronDown, AlertCircle, X } from "lucide-react";
import { formatDate, getCategoryColor } from "@/lib/utils";
import type { Location } from "@shared/schema";

interface LoginForm {
  email: string;
  password: string;
}

interface AdminStats {
  pendingCount: number;
  approvedCount: number;
  contributorCount: number;
}

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [selectedLocations, setSelectedLocations] = useState<Set<number>>(new Set());
  const [showPreview, setShowPreview] = useState<Location | null>(null);
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const loginForm = useForm<LoginForm>({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { data: stats } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: isAuthenticated,
  });

  const { data: pendingLocations } = useQuery<Location[]>({
    queryKey: ["/api/admin/locations/pending"],
    enabled: isAuthenticated,
  });

  const { data: allLocations } = useQuery<Location[]>({
    queryKey: ["/api/admin/locations"],
    enabled: isAuthenticated,
  });

  const loginMutation = useMutation({
    mutationFn: async (data: LoginForm) => {
      const response = await apiRequest("POST", "/api/admin/login", data);
      return response.json();
    },
    onSuccess: () => {
      setIsAuthenticated(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin dashboard!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/locations/pending"] });
    },
    onError: () => {
      toast({
        title: "Login Failed",
        description: "Invalid email or password. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await apiRequest("PATCH", `/api/admin/locations/${id}/status`, { status });
      return response.json();
    },
    onSuccess: (_, { status }) => {
      toast({
        title: "Status Updated",
        description: `Location has been ${status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/locations/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Could not update location status. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onLogin = (data: LoginForm) => {
    loginMutation.mutate(data);
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/admin/import", {});
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Import Successful",
        description: "Location data has been imported successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
    onError: (error: any) => {
      toast({
        title: "Import Failed",
        description: error.message || "Failed to import location data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (locationId: number, status: string) => {
    updateStatusMutation.mutate({ id: locationId, status });
  };

  const updateLocationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Location> }) => {
      const response = await apiRequest("PATCH", `/api/admin/locations/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Location Updated",
        description: "Location details have been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/locations/pending"] });
      setEditingLocation(null);
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Failed to update location. Please try again.",
        variant: "destructive",
      });
    },
  });

  const uploadHeroImageMutation = useMutation({
    mutationFn: async ({ locationId, file }: { locationId: number; file: File }) => {
      const formData = new FormData();
      formData.append('heroImage', file);
      
      const response = await fetch(`/api/admin/locations/${locationId}/upload-hero`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Hero Image Updated",
        description: "Location image has been uploaded successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/locations/pending"] });
    },
    onError: (error) => {
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload image. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImport = () => {
    importMutation.mutate();
  };

  const handleEditLocation = (location: Location) => {
    setEditingLocation(location);
  };

  // Bulk operations
  const bulkUpdateStatusMutation = useMutation({
    mutationFn: async ({ ids, status }: { ids: number[]; status: string }) => {
      const promises = ids.map(id => 
        apiRequest("PATCH", `/api/admin/locations/${id}/status`, { status })
      );
      return Promise.all(promises);
    },
    onSuccess: (_, { status }) => {
      toast({
        title: "Bulk Update Complete",
        description: `${selectedLocations.size} locations ${status}.`,
      });
      setSelectedLocations(new Set());
      queryClient.invalidateQueries({ queryKey: ["/api/admin/locations/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const promises = ids.map(id => 
        apiRequest("DELETE", `/api/admin/locations/${id}`, {})
      );
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Bulk Delete Complete",
        description: `${selectedLocations.size} locations deleted.`,
      });
      setSelectedLocations(new Set());
      queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
    },
  });

  const handleBulkAction = (action: string) => {
    const ids = Array.from(selectedLocations);
    if (ids.length === 0) return;

    switch (action) {
      case "approve":
        bulkUpdateStatusMutation.mutate({ ids, status: "approved" });
        break;
      case "reject":
        bulkUpdateStatusMutation.mutate({ ids, status: "rejected" });
        break;
      case "delete":
        if (confirm(`Are you sure you want to delete ${ids.length} locations?`)) {
          bulkDeleteMutation.mutate(ids);
        }
        break;
    }
  };

  const handleSelectLocation = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedLocations);
    if (checked) {
      newSelected.add(id);
    } else {
      newSelected.delete(id);
    }
    setSelectedLocations(newSelected);
  };

  const handleSelectAll = (locations: Location[], checked: boolean) => {
    if (checked) {
      const newSelected = new Set(selectedLocations);
      locations.forEach(location => newSelected.add(location.id));
      setSelectedLocations(newSelected);
    } else {
      setSelectedLocations(new Set());
    }
  };

  // Enhanced filtering and sorting
  const getFilteredAndSortedLocations = (locations: Location[]) => {
    let filtered = locations.filter(location => {
      const matchesSearch = !searchTerm || 
        location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        location.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || location.status === filterStatus;
      const matchesCategory = filterCategory === "all" || location.category === filterCategory;
      
      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Sort locations
    filtered.sort((a, b) => {
      let aValue: any = a[sortBy as keyof Location];
      let bValue: any = b[sortBy as keyof Location];
      
      if (sortBy === "createdAt") {
        aValue = new Date(aValue || 0).getTime();
        bValue = new Date(bValue || 0).getTime();
      } else if (typeof aValue === "string") {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return filtered;
  };

  // LocationEditForm component
  const LocationEditForm = ({ location, onSave }: { location: Location; onSave: (data: Partial<Location>) => void }) => {
    const editForm = useForm({
      defaultValues: {
        name: location.name || '',
        description: location.description || '',
        address: location.address || '',
        category: location.category || '',
        period: location.period || '',
        content: location.content || '',
        status: location.status || 'pending',
      },
    });

    const onSubmit = (data: any) => {
      onSave(data);
    };

    return (
      <Form {...editForm}>
        <form onSubmit={editForm.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={editForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={editForm.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter category" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={editForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter location description"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={editForm.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={editForm.control}
              name="period"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Historical Period</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 1800s, Victorian Era" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={editForm.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Extended Story Content (Markdown)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter the detailed story content for this location. You can use markdown formatting."
                    className="min-h-[200px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Hero Image Upload Section */}
          <div className="border-t pt-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-lg font-semibold text-heritage-brown">Hero Image</h4>
                <p className="text-sm text-gray-600">Upload a main image for this location</p>
              </div>
              {location.heroImage && (
                <div className="relative">
                  <img 
                    src={location.heroImage} 
                    alt="Current hero image" 
                    className="w-24 h-16 object-cover rounded-lg border"
                  />
                  <Badge className="absolute -top-2 -right-2 bg-green-500 text-white">
                    Current
                  </Badge>
                </div>
              )}
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <input
                  id={`heroImage-${location.id}`}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      uploadHeroImageMutation.mutate({ locationId: location.id, file });
                    }
                  }}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm"
                  disabled={uploadHeroImageMutation.isPending}
                  onClick={(e) => {
                    e.preventDefault();
                    const fileInput = document.getElementById(`heroImage-${location.id}`) as HTMLInputElement;
                    fileInput?.click();
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadHeroImageMutation.isPending ? 'Uploading...' : 'Upload Image'}
                </Button>
              </div>
              
              {location.heroImage && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm"
                  onClick={() => {
                    updateLocationMutation.mutate({ 
                      id: location.id, 
                      data: { heroImage: null } 
                    });
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Remove
                </Button>
              )}
            </div>
            
            <p className="text-xs text-gray-500">
              Supported formats: JPEG, PNG, GIF, WebP. Max size: 5MB
            </p>
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="submit" disabled={updateLocationMutation.isPending}>
              <Save className="w-4 h-4 mr-2" />
              {updateLocationMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Form>
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-heritage-cream py-8">
        <div className="container mx-auto px-4 max-w-md">
          <Card className="bg-heritage-beige shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-8">
                <Lock className="w-16 h-16 text-heritage-olive mb-4 mx-auto" />
                <h1 className="text-2xl font-bold text-heritage-brown mb-4">
                  Administrator Access
                </h1>
                <p className="text-gray-600">
                  Please log in to access the content management dashboard
                </p>
              </div>

              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLogin)} className="space-y-4">
                  <FormField
                    control={loginForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Administrator Email</FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="admin@pnwhistory.org"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="Enter your password"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    disabled={loginMutation.isPending}
                    className="w-full bg-heritage-brown hover:bg-heritage-brown/90"
                  >
                    {loginMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Signing In...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Sign In
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="mt-6 p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Demo Credentials:</strong>
                </p>
                <p className="text-sm text-gray-600">
                  Email: admin@pnwhistory.org<br />
                  Password: admin123
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-heritage-cream py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-heritage-brown mb-4">
            Content Management Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Administrative tools for managing historical content
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-white border-2 border-heritage-beige">
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-heritage-gold mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-heritage-brown mb-2">
                Pending Reviews
              </h3>
              <p className="text-3xl font-bold text-heritage-olive">
                {stats?.pendingCount || 0}
              </p>
              <p className="text-sm text-gray-600">Submissions awaiting approval</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-heritage-beige">
            <CardContent className="p-6 text-center">
              <MapPin className="w-12 h-12 text-heritage-gold mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-heritage-brown mb-2">
                Published Locations
              </h3>
              <p className="text-3xl font-bold text-heritage-olive">
                {stats?.approvedCount || 0}
              </p>
              <p className="text-sm text-gray-600">Live historical sites</p>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-heritage-beige">
            <CardContent className="p-6 text-center">
              <Users className="w-12 h-12 text-heritage-gold mb-4 mx-auto" />
              <h3 className="text-xl font-semibold text-heritage-brown mb-2">
                Contributors
              </h3>
              <p className="text-3xl font-bold text-heritage-olive">
                {stats?.contributorCount || 0}
              </p>
              <p className="text-sm text-gray-600">Community members</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-3xl">
            <TabsTrigger value="pending">Pending Locations</TabsTrigger>
            <TabsTrigger value="manage">Manage Locations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="import">Import Data</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-heritage-brown">
                  Pending Location Submissions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!pendingLocations || pendingLocations.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    No pending submissions at this time.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {pendingLocations.map((location) => (
                      <Card key={location.id} className="border border-gray-200">
                        <CardContent className="p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold text-heritage-brown mb-2">
                                {location.name}
                              </h3>
                              <Badge 
                                className={`mb-2 ${getCategoryColor(location.category || '')}`}
                              >
                                {location.category}
                              </Badge>
                              <p className="text-gray-600 mb-4">
                                {location.description}
                              </p>
                              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                <div>
                                  <strong>Period:</strong> {location.period}
                                </div>
                                <div>
                                  <strong>Address:</strong> {location.address || "Not provided"}
                                </div>
                                <div>
                                  <strong>Submitted by:</strong> {location.submitterName || "Anonymous"}
                                </div>
                                <div>
                                  <strong>Date:</strong> {location.createdAt ? formatDate(location.createdAt) : "Unknown"}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleStatusUpdate(location.id, "approved")}
                              disabled={updateStatusMutation.isPending}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                            <Button
                              onClick={() => handleStatusUpdate(location.id, "rejected")}
                              disabled={updateStatusMutation.isPending}
                              variant="destructive"
                            >
                              <XCircle className="w-4 h-4 mr-2" />
                              Reject
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-heritage-brown flex items-center justify-between">
                  <div className="flex items-center">
                    <Edit3 className="w-5 h-5 mr-2" />
                    Manage Locations
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/locations"] })}
                    >
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Export
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Enhanced Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search locations..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterCategory} onValueChange={setFilterCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Historical">Historical</SelectItem>
                      <SelectItem value="Natural">Natural</SelectItem>
                      <SelectItem value="Cultural">Cultural</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                    const [field, order] = value.split('-');
                    setSortBy(field);
                    setSortOrder(order as "asc" | "desc");
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                      <SelectItem value="category-asc">Category (A-Z)</SelectItem>
                      <SelectItem value="createdAt-desc">Newest First</SelectItem>
                      <SelectItem value="createdAt-asc">Oldest First</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Bulk Actions */}
                {selectedLocations.size > 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>{selectedLocations.size} locations selected</span>
                      <div className="flex space-x-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleBulkAction("approve")}
                          disabled={bulkUpdateStatusMutation.isPending}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve All
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleBulkAction("reject")}
                          disabled={bulkUpdateStatusMutation.isPending}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject All
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => handleBulkAction("delete")}
                          disabled={bulkDeleteMutation.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-1" />
                          Delete All
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Locations List */}
                <div className="space-y-4">
                  {allLocations && allLocations.length > 0 && (
                    <div className="flex items-center space-x-2 mb-4">
                      <Checkbox
                        id="select-all"
                        checked={
                          getFilteredAndSortedLocations(allLocations).length > 0 &&
                          getFilteredAndSortedLocations(allLocations).every(location => 
                            selectedLocations.has(location.id)
                          )
                        }
                        onCheckedChange={(checked) => 
                          handleSelectAll(getFilteredAndSortedLocations(allLocations), checked as boolean)
                        }
                      />
                      <label htmlFor="select-all" className="text-sm font-medium">
                        Select All ({getFilteredAndSortedLocations(allLocations).length} locations)
                      </label>
                    </div>
                  )}
                  
                  {getFilteredAndSortedLocations(allLocations || []).map((location) => (
                    <Card key={location.id} className="border border-gray-200">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <Checkbox
                            checked={selectedLocations.has(location.id)}
                            onCheckedChange={(checked) => 
                              handleSelectLocation(location.id, checked as boolean)
                            }
                          />
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-2">
                                  <h3 className="text-xl font-semibold text-heritage-brown">
                                    {location.name}
                                  </h3>
                                  {location.heroImage && (
                                    <div className="relative">
                                      <img 
                                        src={location.heroImage} 
                                        alt="Hero" 
                                        className="w-8 h-8 object-cover rounded border"
                                      />
                                      <Badge className="absolute -top-1 -right-1 bg-green-500 text-white text-xs px-1 py-0">
                                        ✓
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center space-x-2 mb-2">
                                  <Badge className={`${getCategoryColor(location.category || '')}`}>
                                    {location.category}
                                  </Badge>
                                  <Badge variant={
                                    location.status === 'approved' ? 'default' : 
                                    location.status === 'pending' ? 'secondary' : 'destructive'
                                  }>
                                    {location.status}
                                  </Badge>
                                </div>
                                <p className="text-gray-600 mb-2">{location.description}</p>
                                <div className="flex items-center space-x-4 text-sm text-gray-500">
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-1" />
                                    {location.address || "No address"}
                                  </div>
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    {location.period || "No period"}
                                  </div>
                                  {location.content && (
                                    <div className="flex items-center">
                                      <FileText className="w-4 h-4 mr-1" />
                                      Story content
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex space-x-2">
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => setShowPreview(location)}
                                    >
                                      <Eye className="w-4 h-4 mr-2" />
                                      Preview
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>{location.name}</DialogTitle>
                                      <DialogDescription>
                                        Preview how this location appears to users
                                      </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4">
                                      <div className="flex items-center space-x-2">
                                        <Badge className={`${getCategoryColor(location.category || '')}`}>
                                          {location.category}
                                        </Badge>
                                        <Badge variant="outline">{location.period}</Badge>
                                      </div>
                                      <p className="text-gray-600">{location.description}</p>
                                      {location.content && (
                                        <div className="prose prose-sm max-w-none">
                                          <h4>Extended Story</h4>
                                          <div className="bg-gray-50 p-4 rounded-lg">
                                            <pre className="whitespace-pre-wrap text-sm">
                                              {location.content.substring(0, 500)}
                                              {location.content.length > 500 && '...'}
                                            </pre>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </DialogContent>
                                </Dialog>
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => handleEditLocation(location)}
                                    >
                                      <Edit3 className="w-4 h-4 mr-2" />
                                      Edit
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                                    <DialogHeader>
                                      <DialogTitle>Edit Location: {location.name}</DialogTitle>
                                      <DialogDescription>
                                        Update location details, description, and extended story content.
                                      </DialogDescription>
                                    </DialogHeader>
                                    {editingLocation && <LocationEditForm location={editingLocation} onSave={(data) => {
                                      updateLocationMutation.mutate({ id: editingLocation.id, data });
                                    }} />}
                                  </DialogContent>
                                </Dialog>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {allLocations && getFilteredAndSortedLocations(allLocations).length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500">No locations match your current filters.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-heritage-brown flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Analytics & Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Analytics Overview */}
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="bg-blue-50 border-blue-200">
                    <CardContent className="p-4 text-center">
                      <h4 className="font-semibold text-blue-900 mb-1">Total Locations</h4>
                      <p className="text-2xl font-bold text-blue-700">{allLocations?.length || 0}</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-green-50 border-green-200">
                    <CardContent className="p-4 text-center">
                      <h4 className="font-semibold text-green-900 mb-1">Approved</h4>
                      <p className="text-2xl font-bold text-green-700">
                        {allLocations?.filter(l => l.status === 'approved').length || 0}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4 text-center">
                      <h4 className="font-semibold text-yellow-900 mb-1">Pending</h4>
                      <p className="text-2xl font-bold text-yellow-700">
                        {allLocations?.filter(l => l.status === 'pending').length || 0}
                      </p>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-purple-50 border-purple-200">
                    <CardContent className="p-4 text-center">
                      <h4 className="font-semibold text-purple-900 mb-1">With Stories</h4>
                      <p className="text-2xl font-bold text-purple-700">
                        {allLocations?.filter(l => l.content && l.content.length > 100).length || 0}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Category Breakdown */}
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Locations by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {['Historical', 'Natural', 'Cultural'].map(category => {
                          const count = allLocations?.filter(l => l.category === category).length || 0;
                          const total = allLocations?.length || 1;
                          const percentage = Math.round((count / total) * 100);
                          
                          return (
                            <div key={category} className="space-y-2">
                              <div className="flex justify-between items-center">
                                <span className="font-medium">{category}</span>
                                <span className="text-sm text-gray-600">{count} ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    category === 'Historical' ? 'bg-amber-500' :
                                    category === 'Natural' ? 'bg-green-500' : 'bg-blue-500'
                                  }`}
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Content Completion</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Basic Information</span>
                            <span className="text-sm text-gray-600">
                              {allLocations?.filter(l => l.name && l.description && l.category).length || 0}
                              /{allLocations?.length || 0}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <span>Extended Stories</span>
                            <span className="text-sm text-gray-600">
                              {allLocations?.filter(l => l.content && l.content.length > 100).length || 0}
                              /{allLocations?.length || 0}
                            </span>
                          </div>
                          <div className="space-y-2">
                            <span>Geographic Data</span>
                            <span className="text-sm text-gray-600">
                              {allLocations?.filter(l => l.latitude && l.longitude && l.address).length || 0}
                              /{allLocations?.length || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {allLocations
                        ?.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                        .slice(0, 5)
                        .map(location => (
                          <div key={location.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
                            <div>
                              <p className="font-medium">{location.name}</p>
                              <p className="text-sm text-gray-600">
                                {location.category} • {location.status}
                              </p>
                            </div>
                            <div className="text-sm text-gray-500">
                              {location.createdAt ? formatDate(location.createdAt) : 'Unknown date'}
                            </div>
                          </div>
                        )) || (
                        <p className="text-gray-500 text-center py-4">No recent activity</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-heritage-brown flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Import Location Data
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <h3 className="font-semibold text-blue-900 mb-2 flex items-center">
                    <FileText className="w-4 h-4 mr-2" />
                    How to Import Your Data
                  </h3>
                  <div className="text-sm text-blue-800 space-y-2">
                    <p>Place your location files in the <code className="bg-blue-100 px-1 rounded">assets/locations/</code> directory.</p>
                    <p><strong>Supported formats:</strong></p>
                    <ul className="list-disc list-inside ml-4 space-y-1">
                      <li><strong>JSON files:</strong> Single location objects or arrays of locations</li>
                      <li><strong>CSV files:</strong> Comma-separated values with headers</li>
                    </ul>
                    <p><strong>Required fields:</strong> name, description, address, latitude, longitude, category, period</p>
                    <p><strong>Optional fields:</strong> submitterName, submitterEmail, images, content</p>
                  </div>
                </div>

                <div className="text-center">
                  <Button
                    onClick={handleImport}
                    disabled={importMutation.isPending}
                    className="bg-heritage-brown hover:bg-heritage-olive text-white px-8 py-3"
                    size="lg"
                  >
                    {importMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Importing...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Import Location Files
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="font-semibold text-yellow-900 mb-2">
                    ⚠️ Important Notes
                  </h3>
                  <div className="text-sm text-yellow-800 space-y-1">
                    <p>• This will import all valid files from the assets/locations/ directory</p>
                    <p>• Duplicate locations (same name and coordinates) will be skipped</p>
                    <p>• All imported locations will have "pending" status and require approval</p>
                    <p>• Invalid data entries will be logged and skipped during import</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Data Management */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-heritage-brown flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    Data Management
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b">
                    <div>
                      <h4 className="font-semibold">Export All Locations</h4>
                      <p className="text-sm text-gray-600">
                        Download complete database as JSON
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (allLocations) {
                          const dataStr = JSON.stringify(allLocations, null, 2);
                          const dataBlob = new Blob([dataStr], {type: 'application/json'});
                          const url = URL.createObjectURL(dataBlob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `pnw-locations-${new Date().toISOString().split('T')[0]}.json`;
                          link.click();
                          URL.revokeObjectURL(url);
                          toast({
                            title: "Export Complete",
                            description: "Location data has been downloaded as JSON file.",
                          });
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export JSON
                    </Button>
                  </div>
                  
                  <div className="flex justify-between items-center py-3 border-b">
                    <div>
                      <h4 className="font-semibold">Export for Backup</h4>
                      <p className="text-sm text-gray-600">
                        Export with all metadata for restoration
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        if (allLocations) {
                          const backupData = {
                            exportDate: new Date().toISOString(),
                            totalLocations: allLocations.length,
                            locations: allLocations
                          };
                          const dataStr = JSON.stringify(backupData, null, 2);
                          const dataBlob = new Blob([dataStr], {type: 'application/json'});
                          const url = URL.createObjectURL(dataBlob);
                          const link = document.createElement('a');
                          link.href = url;
                          link.download = `pnw-backup-${new Date().toISOString().split('T')[0]}.json`;
                          link.click();
                          URL.revokeObjectURL(url);
                          toast({
                            title: "Backup Complete",
                            description: "Complete backup file has been downloaded.",
                          });
                        }
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Backup
                    </Button>
                  </div>

                  <div className="flex justify-between items-center py-3">
                    <div>
                      <h4 className="font-semibold">System Statistics</h4>
                      <p className="text-sm text-gray-600">
                        View detailed system information
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        const stats = {
                          totalLocations: allLocations?.length || 0,
                          approvedLocations: allLocations?.filter(l => l.status === 'approved').length || 0,
                          locationsWithImages: allLocations?.filter(l => l.heroImage).length || 0,
                          categories: [...new Set(allLocations?.map(l => l.category))],
                          lastUpdate: new Date().toISOString()
                        };
                        console.log('System Statistics:', stats);
                        toast({
                          title: "Statistics Generated",
                          description: "Check browser console for detailed statistics.",
                        });
                      }}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Stats
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* System Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-heritage-brown flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-semibold mb-2">Default Location Status</h4>
                      <Select defaultValue="pending">
                        <SelectTrigger>
                          <SelectValue placeholder="Select default status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending Review</SelectItem>
                          <SelectItem value="approved">Auto-Approved</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-gray-600 mt-1">
                        Status assigned to new location submissions
                      </p>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Upload Settings</h4>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Max File Size</span>
                          <Badge variant="outline">5MB</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Allowed Formats</span>
                          <Badge variant="outline">JPEG, PNG, GIF, WebP</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Upload Directory</span>
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">/uploads</code>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-heritage-brown flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  System Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-heritage-brown">
                      {allLocations?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Locations</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {allLocations?.filter(l => l.status === 'approved').length || 0}
                    </div>
                    <div className="text-sm text-gray-600">Published</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {allLocations?.filter(l => l.heroImage).length || 0}
                    </div>
                    <div className="text-sm text-gray-600">With Images</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {new Set(allLocations?.map(l => l.category)).size || 0}
                    </div>
                    <div className="text-sm text-gray-600">Categories</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Database Status</span>
                    <Badge variant="default" className="bg-green-500">Connected</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Application Version</span>
                    <span>v2.1.0</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Database Type</span>
                    <span>PostgreSQL</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Last Updated</span>
                    <span>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
