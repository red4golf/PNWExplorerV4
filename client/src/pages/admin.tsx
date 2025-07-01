import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Lock, Clock, MapPin, Users, CheckCircle, XCircle, LogIn } from "lucide-react";
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
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
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

  const handleStatusUpdate = (locationId: number, status: string) => {
    updateStatusMutation.mutate({ id: locationId, status });
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
          <TabsList className="grid w-full grid-cols-3 max-w-lg">
            <TabsTrigger value="pending">Pending Locations</TabsTrigger>
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

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="text-heritage-brown">
                  System Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-4 border-b">
                    <div>
                      <h4 className="font-semibold">Auto-approve submissions</h4>
                      <p className="text-sm text-gray-600">
                        Automatically approve submissions from trusted contributors
                      </p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex justify-between items-center py-4 border-b">
                    <div>
                      <h4 className="font-semibold">Email notifications</h4>
                      <p className="text-sm text-gray-600">
                        Get notified when new submissions are received
                      </p>
                    </div>
                    <Button variant="outline">Configure</Button>
                  </div>
                  
                  <div className="flex justify-between items-center py-4">
                    <div>
                      <h4 className="font-semibold">Export data</h4>
                      <p className="text-sm text-gray-600">
                        Download historical location data
                      </p>
                    </div>
                    <Button variant="outline">Download</Button>
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
