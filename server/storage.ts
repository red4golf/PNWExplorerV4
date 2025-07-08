import { locations, photos, admins, feedback, affiliateClicks, type Location, type InsertLocation, type Photo, type InsertPhoto, type Admin, type InsertAdmin, type Feedback, type InsertFeedback, type AffiliateClick, type InsertAffiliateClick } from "@shared/schema";
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
  deletePhoto(photoId: number): Promise<boolean>;
  
  // Admin methods
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  
  // Feedback methods
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  getAllFeedback(): Promise<Feedback[]>;
  getFeedbackById(id: number): Promise<Feedback | undefined>;
  updateFeedbackStatus(id: number, status: string): Promise<Feedback | undefined>;
  
  // Affiliate clicks methods
  createAffiliateClick(click: InsertAffiliateClick): Promise<AffiliateClick>;
  getAffiliateClicksByLocationId(locationId: number): Promise<AffiliateClick[]>;
  getAllAffiliateClicks(): Promise<AffiliateClick[]>;
  getAffiliateClicksStats(): Promise<{ totalClicks: number; clicksByLocation: { locationId: number; locationName: string; clicks: number; }[] }>;
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
    console.log('🔍 STORAGE: Fetching photos for location:', locationId);
    const result = await db.select().from(photos).where(eq(photos.locationId, locationId));
    console.log('📊 STORAGE: Found photos count:', result.length);
    if (result.length > 0) {
      console.log('📸 STORAGE: Photo filenames:', result.map(p => p.filename));
    }
    return result;
  }

  async createPhoto(insertPhoto: InsertPhoto): Promise<Photo> {
    console.log('💾 STORAGE: Creating photo record:', insertPhoto);
    
    try {
      const [photo] = await db
        .insert(photos)
        .values(insertPhoto)
        .returning();
      
      console.log('✅ STORAGE: Photo created successfully:', { 
        id: photo.id, 
        locationId: photo.locationId, 
        filename: photo.filename 
      });
      
      // Verify the photo was actually saved
      const verification = await db.select().from(photos).where(eq(photos.id, photo.id));
      console.log('🔍 STORAGE: Verification check:', verification.length > 0 ? 'FOUND' : 'NOT FOUND');
      
      return photo;
    } catch (error) {
      console.error('❌ STORAGE: Failed to create photo:', error);
      throw error;
    }
  }

  async deletePhoto(photoId: number): Promise<boolean> {
    const result = await db.delete(photos).where(eq(photos.id, photoId));
    return (result.rowCount || 0) > 0;
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

  async createAffiliateClick(insertClick: InsertAffiliateClick): Promise<AffiliateClick> {
    const [click] = await db.insert(affiliateClicks).values(insertClick).returning();
    return click;
  }

  async getAffiliateClicksByLocationId(locationId: number): Promise<AffiliateClick[]> {
    return await db.select().from(affiliateClicks).where(eq(affiliateClicks.locationId, locationId)).orderBy(desc(affiliateClicks.clickedAt));
  }

  async getAllAffiliateClicks(): Promise<AffiliateClick[]> {
    return await db.select().from(affiliateClicks).orderBy(desc(affiliateClicks.clickedAt));
  }

  async getAffiliateClicksStats(): Promise<{ totalClicks: number; clicksByLocation: { locationId: number; locationName: string; clicks: number; }[] }> {
    const allClicks = await db.select({
      locationId: affiliateClicks.locationId,
      locationName: locations.name,
      bookTitle: affiliateClicks.bookTitle,
      clickedAt: affiliateClicks.clickedAt,
    }).from(affiliateClicks)
      .leftJoin(locations, eq(affiliateClicks.locationId, locations.id))
      .orderBy(desc(affiliateClicks.clickedAt));
    
    const totalClicks = allClicks.length;
    
    // Group clicks by location
    const clicksByLocation = allClicks.reduce((acc, click) => {
      const existing = acc.find(item => item.locationId === click.locationId);
      if (existing) {
        existing.clicks++;
      } else {
        acc.push({
          locationId: click.locationId!,
          locationName: click.locationName!,
          clicks: 1,
        });
      }
      return acc;
    }, [] as { locationId: number; locationName: string; clicks: number; }[]);
    
    return { totalClicks, clicksByLocation };
  }
}

export const storage = new DatabaseStorage();
