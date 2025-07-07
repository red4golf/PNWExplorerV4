import { db } from "../db";
import { photos } from "@shared/schema";

// This migration preserves photos during development by backing them up
export async function preservePhotos() {
  try {
    console.log("Preserving existing photos...");
    
    // Get all existing photos
    const existingPhotos = await db.select().from(photos);
    
    if (existingPhotos.length === 0) {
      console.log("No photos to preserve");
      return;
    }
    
    // Store in a backup table that won't be affected by schema changes
    await db.execute(`
      CREATE TABLE IF NOT EXISTS photos_backup (
        id SERIAL PRIMARY KEY,
        original_id INTEGER,
        location_id INTEGER,
        filename TEXT,
        caption TEXT,
        uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        backup_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert photos into backup
    for (const photo of existingPhotos) {
      await db.execute(`
        INSERT INTO photos_backup (original_id, location_id, filename, caption, uploaded_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT DO NOTHING
      `, [photo.id, photo.locationId, photo.filename, photo.caption, photo.uploadedAt]);
    }
    
    console.log(`✓ Preserved ${existingPhotos.length} photos in backup table`);
    
  } catch (error) {
    console.error("Error preserving photos:", error);
  }
}

// Restore photos from backup if main table is empty
export async function restorePhotos() {
  try {
    const existingPhotos = await db.select().from(photos).limit(1);
    
    if (existingPhotos.length > 0) {
      console.log("Photos already exist, skipping restore");
      return;
    }
    
    console.log("Restoring photos from backup...");
    
    // Check if backup table exists
    const backupPhotos = await db.execute(`
      SELECT location_id, filename, caption, uploaded_at 
      FROM photos_backup 
      ORDER BY backup_date DESC
    `);
    
    if (backupPhotos.rows.length === 0) {
      console.log("No backup photos found");
      return;
    }
    
    // Restore photos to main table
    const photosToRestore = backupPhotos.rows.map(row => ({
      locationId: row.location_id as number,
      filename: row.filename as string,
      caption: row.caption as string,
    }));
    
    await db.insert(photos).values(photosToRestore);
    
    console.log(`✓ Restored ${photosToRestore.length} photos from backup`);
    
  } catch (error) {
    console.error("Error restoring photos:", error);
  }
}