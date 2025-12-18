import { locations, photos, admins, feedback, affiliateClicks, userAnalytics, fileStorage, type Location, type InsertLocation, type Photo, type InsertPhoto, type Admin, type InsertAdmin, type Feedback, type InsertFeedback, type AffiliateClick, type InsertAffiliateClick, type UserAnalytics, type InsertUserAnalytics } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // Location methods
  getLocation(id: number): Promise<Location | undefined>;
  getLocationBySlug(slug: string): Promise<Location | undefined>;
  getAllLocations(): Promise<Location[]>;
  getApprovedLocations(): Promise<Location[]>;
  getPendingLocations(): Promise<Location[]>;
  createLocation(location: InsertLocation): Promise<Location>;
  updateLocationStatus(id: number, status: string): Promise<Location | undefined>;
  updateLocationHeroImage(id: number, heroImage: string): Promise<Location | undefined>;
  updateLocationAudio(id: number, audioPath: string): Promise<Location | undefined>;
  getLocationAudio(id: number): Promise<Buffer | null>;
  getLocationById(id: number): Promise<Location | undefined>;
  
  // Photo methods
  getPhotosByLocationId(locationId: number): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
  deletePhoto(photoId: number): Promise<boolean>;
  
  // Admin methods
  getAdminByEmail(email: string): Promise<Admin | undefined>;
  createAdmin(admin: InsertAdmin): Promise<Admin>;
  updateAdminPassword(adminId: number, hashedPassword: string): Promise<void>;
  
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
  
  // Analytics methods
  createAnalyticsEvent(analytics: InsertUserAnalytics): Promise<UserAnalytics>;
  getAnalyticsStats(): Promise<{ totalEvents: number; qrScans: number; shareLinks: number; pageViews: number; locationViews: number; }>;
  getAnalyticsByEventType(eventType: string): Promise<UserAnalytics[]>;
  getAnalyticsByLocation(locationId: number): Promise<UserAnalytics[]>;
}

export class DatabaseStorage implements IStorage {
  async getLocation(id: number): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.id, id));
    return location || undefined;
  }

  async getLocationBySlug(slug: string): Promise<Location | undefined> {
    const [location] = await db.select().from(locations).where(eq(locations.slug, slug));
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
    // Generate slug from name
    const slug = insertLocation.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    
    const [location] = await db
      .insert(locations)
      .values({
        ...insertLocation,
        slug,
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

  async updateLocationAudio(id: number, audioPath: string): Promise<Location | undefined> {
    const [location] = await db
      .update(locations)
      .set({ audioNarration: audioPath })
      .where(eq(locations.id, id))
      .returning();
    return location || undefined;
  }

  async getLocationAudio(id: number): Promise<Buffer | null> {
    try {
      console.log(`🎵 STORAGE: Looking for audio for location ${id}`);
      
      // Look for audio files in file_storage table for this location
      const [audioFile] = await db
        .select({ 
          fileData: fileStorage.fileData,
          filename: fileStorage.filename,
          fileSize: fileStorage.fileSize,
          uploadedAt: fileStorage.uploadedAt
        })
        .from(fileStorage)
        .where(
          and(
            eq(fileStorage.locationId, id),
            sql`${fileStorage.filename} LIKE '%narration%'`
          )
        )
        .orderBy(desc(fileStorage.uploadedAt))
        .limit(1);
      
      console.log('🔍 STORAGE: Audio query result:', audioFile ? { 
        filename: audioFile.filename, 
        size: audioFile.fileSize,
        uploadedAt: audioFile.uploadedAt,
        hasData: !!audioFile.fileData 
      } : 'No audio found');
      
      if (audioFile?.fileData) {
        // Audio data can be stored in two formats:
        // 1. Raw binary (starts with ID3 header: bytes 0x49, 0x44, 0x33 or 0xFF, 0xFB for MP3 frame)
        // 2. Base64 encoded (starts with "SUQz" which is base64 for "ID3")
        
        let audioBuffer: Buffer;
        
        // PostgreSQL bytea columns return as Buffer in Node.js
        // Cast to any first to handle the type mismatch between schema (text) and actual db (bytea)
        const rawData = audioFile.fileData as unknown;
        
        if (Buffer.isBuffer(rawData)) {
          // Check if it's raw MP3 data (ID3 tag or MP3 frame sync)
          const firstBytes = rawData.slice(0, 3);
          const isRawMP3 = (firstBytes[0] === 0x49 && firstBytes[1] === 0x44 && firstBytes[2] === 0x33) || // ID3
                          (firstBytes[0] === 0xFF && (firstBytes[1] & 0xE0) === 0xE0); // MP3 frame sync
          
          if (isRawMP3) {
            // Already raw binary, use directly
            audioBuffer = rawData;
            console.log(`🎵 STORAGE: Detected raw MP3 binary data`);
          } else {
            // Assume base64 encoded, decode it
            const base64String = rawData.toString('utf-8');
            audioBuffer = Buffer.from(base64String, 'base64');
            console.log(`🎵 STORAGE: Decoded base64 audio data`);
          }
        } else if (typeof rawData === 'string') {
          // String data, assume base64
          audioBuffer = Buffer.from(rawData, 'base64');
          console.log(`🎵 STORAGE: Decoded base64 string audio data`);
        } else {
          console.error('🔴 STORAGE: Unknown audio data type:', typeof rawData);
          return null;
        }
        
        console.log(`✅ STORAGE: Returning audio buffer (${audioBuffer.length} bytes) from file: ${audioFile.filename}`);
        return audioBuffer;
      }
      return null;
    } catch (error) {
      console.error('Error getting location audio:', error);
      return null;
    }
  }

  async getLocationById(id: number): Promise<Location | undefined> {
    return this.getLocation(id);
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

  async updateAdminPassword(adminId: number, hashedPassword: string): Promise<void> {
    await db.update(admins).set({ password: hashedPassword }).where(eq(admins.id, adminId));
  }

  async createAdmin(insertAdmin: InsertAdmin): Promise<Admin> {
    // Always hash password before storing
    const hashedPassword = await bcrypt.hash(insertAdmin.password, 12);
    const [admin] = await db
      .insert(admins)
      .values({ ...insertAdmin, password: hashedPassword })
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

  async createAnalyticsEvent(insertAnalytics: InsertUserAnalytics): Promise<UserAnalytics> {
    const [analytics] = await db
      .insert(userAnalytics)
      .values(insertAnalytics)
      .returning();
    return analytics;
  }

  async getAnalyticsStats(): Promise<{ totalEvents: number; qrScans: number; shareLinks: number; pageViews: number; locationViews: number; }> {
    // Filter out developer IPs (172.31.128.x range and localhost)
    const allEvents = await db.select().from(userAnalytics);
    const userEvents = allEvents.filter(event => {
      const ip = event.ipAddress;
      return ip && 
             !ip.startsWith('172.31.128.') && 
             !ip.startsWith('127.0.0.1') && 
             !ip.startsWith('::1');
    });
    
    const totalEvents = userEvents.length;
    const qrScans = userEvents.filter(event => event.eventType === 'qr_scan').length;
    const shareLinks = userEvents.filter(event => event.eventType === 'share_link').length;
    const pageViews = userEvents.filter(event => event.eventType === 'page_view').length;
    const locationViews = userEvents.filter(event => event.eventType === 'location_view').length;

    return {
      totalEvents,
      qrScans,
      shareLinks,
      pageViews,
      locationViews
    };
  }

  async getAnalyticsByEventType(eventType: string): Promise<UserAnalytics[]> {
    const allEvents = await db
      .select()
      .from(userAnalytics)
      .where(eq(userAnalytics.eventType, eventType))
      .orderBy(desc(userAnalytics.timestamp));
    
    // Filter out developer IPs
    return allEvents.filter(event => {
      const ip = event.ipAddress;
      return ip && 
             !ip.startsWith('172.31.128.') && 
             !ip.startsWith('127.0.0.1') && 
             !ip.startsWith('::1');
    });
  }

  async getAnalyticsByLocation(locationId: number): Promise<UserAnalytics[]> {
    const allEvents = await db
      .select()
      .from(userAnalytics)
      .where(eq(userAnalytics.locationId, locationId))
      .orderBy(desc(userAnalytics.timestamp));
    
    // Filter out developer IPs
    return allEvents.filter(event => {
      const ip = event.ipAddress;
      return ip && 
             !ip.startsWith('172.31.128.') && 
             !ip.startsWith('127.0.0.1') && 
             !ip.startsWith('::1');
    });
  }
}

export const storage = new DatabaseStorage();
