import { locations, photos, admins, type Location, type InsertLocation, type Photo, type InsertPhoto, type Admin, type InsertAdmin } from "@shared/schema";

export interface IStorage {
  // Location methods
  getLocation(id: number): Promise<Location | undefined>;
  getAllLocations(): Promise<Location[]>;
  getApprovedLocations(): Promise<Location[]>;
  getPendingLocations(): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocationStatus(id: number, status: string): Promise<Location | undefined>;
  
  // Photo methods
  getPhotosByLocationId(locationId: number): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  
  // Admin methods
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
}

export class MemStorage implements IStorage {
  private locations: Map<number, Location>;
  private photos: Map<number, Photo>;
  private admins: Map<number, Admin>;
  private currentLocationId: number;
  private currentPhotoId: number;
  private currentAdminId: number;

  constructor() {
    this.locations = new Map();
    this.photos = new Map();
    this.admins = new Map();
    this.currentLocationId = 1;
    this.currentPhotoId = 1;
    this.currentAdminId = 1;
    
    // Initialize with some sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Sample historical locations
    const sampleLocations: Location[] = [
      {
        id: 1,
        name: "Winslow Ferry Terminal",
        description: "The historic gateway to Bainbridge Island, serving as the primary connection to Seattle since 1951. This terminal has witnessed countless arrivals and departures, connecting island residents to the mainland for over 70 years.",
        address: "Winslow Way NE, Bainbridge Island, WA",
        latitude: 47.6262,
        longitude: -122.5194,
        category: "Transportation Hub",
        period: "Established 1951",
        photos: [],
        submitterName: "Island Historical Society",
        submitterEmail: "info@bainbridgehistory.org",
        status: "approved",
        createdAt: new Date(),
      },
      {
        id: 2,
        name: "Japanese American Exclusion Memorial",
        description: "A powerful reminder of the forced removal of Japanese Americans during World War II. This memorial honors the 276 Japanese Americans who were forced to leave Bainbridge Island on March 30, 1942, the first community in the United States to be removed under Executive Order 9066.",
        address: "4192 Eagle Harbor Dr NE, Bainbridge Island, WA",
        latitude: 47.6244,
        longitude: -122.5075,
        category: "Memorial Site",
        period: "Dedicated 2011",
        photos: [],
        submitterName: "Bainbridge Island Japanese American Community",
        submitterEmail: "info@bijac.org",
        status: "approved",
        createdAt: new Date(),
      },
      {
        id: 3,
        name: "Point No Point Lighthouse",
        description: "Standing guard over Puget Sound since 1879, this lighthouse has guided vessels safely through treacherous waters for over 140 years. Built to mark the entrance to Port Gamble Bay, it remains an active aid to navigation.",
        address: "9009 Point No Point Rd NE, Hansville, WA",
        latitude: 47.9119,
        longitude: -122.5264,
        category: "Maritime Heritage",
        period: "Built 1879",
        photos: [],
        submitterName: "U.S. Coast Guard Auxiliary",
        submitterEmail: "lighthouse@uscgaux.org",
        status: "approved",
        createdAt: new Date(),
      },
      {
        id: 4,
        name: "Historic Strawberry Fields",
        description: "Once the heart of the island's agricultural economy, these fields tell the story of immigrant farmers who helped build Bainbridge Island's prosperity. Japanese American families were particularly prominent in strawberry farming before World War II.",
        address: "Various locations throughout Bainbridge Island",
        latitude: 47.6307,
        longitude: -122.5651,
        category: "Agricultural Heritage",
        period: "1900s-1940s",
        photos: [],
        submitterName: "Bainbridge Island Historical Museum",
        submitterEmail: "curator@bainbridgehistory.org",
        status: "approved",
        createdAt: new Date(),
      },
      {
        id: 5,
        name: "Port Blakely Mill Site",
        description: "Once the world's largest lumber mill, this site was the economic engine of early Bainbridge Island. The mill employed hundreds of workers and produced lumber that helped build cities across the Pacific Northwest and beyond.",
        address: "Port Blakely area, Bainbridge Island, WA",
        latitude: 47.5900,
        longitude: -122.5017,
        category: "Industrial Heritage",
        period: "1864-1922",
        photos: [],
        submitterName: "Port Blakely Heritage Society",
        submitterEmail: "heritage@portblakely.org",
        status: "approved",
        createdAt: new Date(),
      },
      {
        id: 6,
        name: "Suquamish Tribal Grounds",
        description: "Sacred grounds of the Suquamish Tribe, the original inhabitants of this land for thousands of years. These grounds hold deep cultural significance and represent the continuous presence of indigenous peoples in the region.",
        address: "Suquamish, WA",
        latitude: 47.7311,
        longitude: -122.5556,
        category: "Indigenous Heritage",
        period: "Ancient - Present",
        photos: [],
        submitterName: "Suquamish Tribe",
        submitterEmail: "cultural@suquamish.nsn.us",
        status: "approved",
        createdAt: new Date(),
      },
    ];

    sampleLocations.forEach(location => {
      this.locations.set(location.id, location);
    });
    this.currentLocationId = 7;

    // Create default admin
    const defaultAdmin: Admin = {
      id: 1,
      email: "admin@bainbridgehistory.org",
      password: "admin123", // In production, this would be hashed
    };
    this.admins.set(1, defaultAdmin);
    this.currentAdminId = 2;
  }

  async getLocation(id: number): Promise<Location | undefined> {
    return this.locations.get(id);
  }

  async getAllLocations(): Promise<Location[]> {
    return Array.from(this.locations.values());
  }

  async getApprovedLocations(): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(location => location.status === "approved");
  }

  async getPendingLocations(): Promise<Location[]> {
    return Array.from(this.locations.values()).filter(location => location.status === "pending");
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const id = this.currentLocationId++;
    const location: Location = {
      ...insertLocation,
      id,
      status: "pending",
      createdAt: new Date(),
    };
    this.locations.set(id, location);
    return location;
  }

  async updateLocationStatus(id: number, status: string): Promise<Location | undefined> {
    const location = this.locations.get(id);
    if (location) {
      const updatedLocation = { ...location, status };
      this.locations.set(id, updatedLocation);
      return updatedLocation;
    }
    return undefined;
  }

  async getPhotosByLocationId(locationId: number): Promise<Photo[]> {
    return Array.from(this.photos.values()).filter(photo => photo.locationId === locationId);
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const id = this.currentPhotoId++;
    const photo: Photo = {
      ...insertPhoto,
      id,
      uploadedAt: new Date(),
    };
    this.photos.set(id, photo);
    return photo;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    return Array.from(this.admins.values()).find(admin => admin.email === email);
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const id = this.currentAdminId++;
    const admin: Admin = {
      ...insertAdmin,
      id,
    };
    this.admins.set(id, admin);
    return admin;
  }
}

export const storage = new MemStorage();
