import { locations, photos, admins, feedback, type Location, type InsertLocation, type Photo, type InsertPhoto, type Admin, type InsertAdmin, type Feedback, type InsertFeedback } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Location methods
  getLocation(id: number): Promise<Location | undefined>;
  getAllLocations(): Promise<Location[]>;
  getApprovedLocations(): Promise<Location[]>;
  getPendingLocations(): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocationStatus(id: number, status: string): Promise<Location | undefined>;
  updateLocationHeroImage(id: number, heroImage: string): Promise<Location | undefined>;
  
  // Photo methods
  getPhotosByLocationId(locationId: number): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  
  // Admin methods
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // Feedback methods
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getAllFeedback(): Promise<Feedback[]>;
  getFeedbackById(id: number): Promise<Feedback | undefined>;
  updateFeedbackStatus(id: number, status: string): Promise<Feedback | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location || undefined;
  }

  async getAllLocations(): Promise<Location[]> {
    return await db.select().from(locations);
  }

  async getApprovedLocations(): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.status, "approved"));
  }

  async getPendingLocations(): Promise<Location[]> {
    return await db.select().from(locations).where(eq(locations.status, "pending"));
  }

  async createLocation(insertLocation: InsertLocation): Promise<Location> {
    const [location] = await db
      .insert(locations)
      .values({
        ...insertLocation,
        status: "pending",
      })
      .returning();
    return location;
  }

  async updateLocationStatus(id: number, status: string): Promise<Location | undefined> {
    const [location] = await db
      .update(locations)
      .set({ status })
      .where(eq(locations.id, id))
      .returning();
    return location || undefined;
  }

  async updateLocationHeroImage(id: number, heroImage: string): Promise<Location | undefined> {
    const [location] = await db
      .update(locations)
      .set({ heroImage })
      .where(eq(locations.id, id))
      .returning();
    return location || undefined;
  }

  async getPhotosByLocationId(locationId: number): Promise<Photo[]> {
    return await db.select().from(photos).where(eq(photos.locationId, locationId));
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    const [photo] = await db
      .insert(photos)
      .values(insertPhoto)
      .returning();
    return photo;
  }

  async getAdminByEmail(email: string): Promise<Admin | undefined> {
    const [admin] = await db.select().from(admins).where(eq(admins.email, email));
    return admin || undefined;
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    const [admin] = await db
      .insert(admins)
      .values(insertAdmin)
      .returning();
    return admin;
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const [feedbackItem] = await db.insert(feedback).values(insertFeedback).returning();
    return feedbackItem;
  }

  async getAllFeedback(): Promise<Feedback[]> {
    return await db.select().from(feedback).orderBy(desc(feedback.createdAt));
  }

  async getFeedbackById(id: number): Promise<Feedback | undefined> {
    const [feedbackItem] = await db.select().from(feedback).where(eq(feedback.id, id));
    return feedbackItem;
  }

  async updateFeedbackStatus(id: number, status: string): Promise<Feedback | undefined> {
    const [feedbackItem] = await db.update(feedback)
      .set({ status })
      .where(eq(feedback.id, id))
      .returning();
    return feedbackItem;
  }
}

export const storage = new DatabaseStorage();
