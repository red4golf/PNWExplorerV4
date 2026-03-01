import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertLocationSchema } from "@shared/schema";
import { CloudUpload, Send, Save } from "lucide-react";
import { z } from "zod";

const formSchema = insertLocationSchema.extend({
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: "You must agree to the terms of use",
  }),
});

type FormValues = z.infer<typeof formSchema>;

export default function SubmitLocation() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      address: "",
      category: "",
      period: "",
      submitterName: "",
      submitterEmail: "",
      agreeToTerms: false,
    },
  });

  const submitMutation = useMutation({
    mutationFn: async (data: Omit<FormValues, "agreeToTerms">) => {
      const response = await apiRequest("POST", "/api/locations", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Location Submitted Successfully!",
        description: "Your historical location has been submitted for review. Thank you for contributing to our island's history.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/locations"] });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "There was an error submitting your location. Please try again.",
        variant: "destructive",
      });
      console.error("Submission error:", error);
    },
  });

  const onSubmit = (data: FormValues) => {
    const { agreeToTerms, ...locationData } = data;
    submitMutation.mutate(locationData);
  };

  const categories = [
    "Indigenous Heritage",
    "Transportation",
    "Industry & Commerce",
    "Agriculture",
    "Residential",
    "Community & Culture",
    "Natural Heritage",
  ];

  const periods = [
    "Pre-1850 (Indigenous Era)",
    "1850-1900 (Settlement Era)",
    "1900-1950 (Development Era)",
    "1950-Present (Modern Era)",
  ];

  return (
    <div className="min-h-screen bg-heritage-cream py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-heritage-brown mb-4">
            Share a Historical Location
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Help us preserve Pacific Northwest history by submitting new locations and stories
          </p>
        </div>

        <Card className="bg-white shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl text-heritage-brown">
              Historical Location Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-heritage-brown font-semibold">
                          Location Name *
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter location name"
                            className="focus:ring-heritage-gold focus:border-heritage-gold"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="period"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-heritage-brown font-semibold">
                          Historical Period
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger className="focus:ring-heritage-gold focus:border-heritage-gold">
                              <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {periods.map((period) => (
                              <SelectItem key={period} value={period}>
                                {period}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-heritage-brown font-semibold">
                          Address/Location
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Street address or general area"
                            className="focus:ring-heritage-gold focus:border-heritage-gold"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-heritage-brown font-semibold">
                          Category *
                        </FormLabel>
                        <Select onValueChange={field.onChange} value={field.value ?? ""}>
                          <FormControl>
                            <SelectTrigger className="focus:ring-heritage-gold focus:border-heritage-gold">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Description */}
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-heritage-brown font-semibold">
                        Historical Description *
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={5}
                          placeholder="Tell the story of this location... What happened here? Who was involved? Why is it significant?"
                          className="focus:ring-heritage-gold focus:border-heritage-gold"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Extended Story Content */}
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-heritage-brown font-semibold">
                        Extended Story (Optional)
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          rows={10}
                          placeholder="Share a detailed story about this location... Paint a picture with words that brings the history to life. Include sensory details, historical context, and what visitors should know."
                          className="focus:ring-heritage-gold focus:border-heritage-gold"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <p className="text-sm text-gray-600">
                        Add a rich, narrative description that tells the full story of this location. This will be displayed alongside the basic description.
                      </p>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Photo Upload */}
                <div>
                  <label className="block text-sm font-semibold text-heritage-brown mb-2">
                    Upload Photos
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-heritage-gold transition-colors">
                    <CloudUpload className="w-12 h-12 text-gray-400 mb-4 mx-auto" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop photos here, or{" "}
                      <span className="text-heritage-brown font-semibold cursor-pointer">
                        browse files
                      </span>
                    </p>
                    <p className="text-sm text-gray-500">
                      Supported formats: JPG, PNG, GIF (max 5MB each)
                    </p>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="submitterName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-heritage-brown font-semibold">
                          Your Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Your full name"
                            className="focus:ring-heritage-gold focus:border-heritage-gold"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="submitterEmail"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-heritage-brown font-semibold">
                          Contact Email
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            className="focus:ring-heritage-gold focus:border-heritage-gold"
                            {...field}
                            value={field.value ?? ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Terms Agreement */}
                <FormField
                  control={form.control}
                  name="agreeToTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-heritage-gold data-[state=checked]:border-heritage-gold"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm">
                          I agree to the{" "}
                          <a href="#" className="text-heritage-brown hover:text-heritage-gold underline">
                            Terms of Use
                          </a>{" "}
                          and confirm that I have permission to share the information and photos provided.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {/* Submit Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6">
                  <Button
                    type="submit"
                    disabled={submitMutation.isPending}
                    className="flex-1 bg-heritage-brown hover:bg-heritage-brown/90 text-white py-3 px-6 font-semibold"
                  >
                    {submitMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit for Review
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 border-heritage-brown text-heritage-brown hover:bg-heritage-brown hover:text-white py-3 px-6 font-semibold"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Draft
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
