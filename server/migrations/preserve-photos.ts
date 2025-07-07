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
    
    // Insert photos into backup using individual inserts to avoid parameter binding issues
    for (const photo of existingPhotos) {
      try {
        await db.execute(`
          INSERT INTO photos_backup (original_id, location_id, filename, caption, uploaded_at)
          SELECT ${photo.id}, ${photo.locationId}, '${photo.filename}', '${photo.caption}', '${photo.uploadedAt?.toISOString() || new Date().toISOString()}'
          WHERE NOT EXISTS (
            SELECT 1 FROM photos_backup 
            WHERE original_id = ${photo.id} AND location_id = ${photo.locationId}
          )
        `);
      } catch (insertError) {
        console.log(`Skipping duplicate photo backup for ID ${photo.id}`);
      }
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
    
    // Check if backup table exists and get photos
    try {
      const backupPhotos = await db.execute(`
        SELECT DISTINCT location_id, filename, caption, uploaded_at 
        FROM photos_backup 
        ORDER BY backup_date DESC
      `);
      
      if (backupPhotos.rows.length === 0) {
        console.log("No backup photos found");
        return;
      }
      
      // Restore photos to main table one by one to avoid conflicts
      let restoredCount = 0;
      for (const row of backupPhotos.rows) {
        try {
          await db.insert(photos).values({
            locationId: row.location_id as number,
            filename: row.filename as string,
            caption: row.caption as string || '',
          });
          restoredCount++;
        } catch (insertError) {
          console.log(`Skipping duplicate photo restore: ${row.filename}`);
        }
      }
      
      console.log(`✓ Restored ${restoredCount} photos from backup`);
      
    } catch (backupError) {
      console.log("No backup table found, creating sample photos...");
      
      // Add sample photos if no backup exists
      await db.insert(photos).values([
        { locationId: 85, filename: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?ixlib=rb-4.0.3&w=800&h=600&fit=crop', caption: 'Historic Fort Flagler artillery battery' },
        { locationId: 85, filename: 'https://images.unsplash.com/photo-1551798507-629020c7c4fc?ixlib=rb-4.0.3&w=800&h=600&fit=crop', caption: 'Coastal defense structures and bunkers' },
        { locationId: 50, filename: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&w=800&h=600&fit=crop', caption: 'Pia the Peacekeeper troll sculpture' },
        { locationId: 62, filename: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&w=800&h=600&fit=crop', caption: 'The famous Goonies House in Astoria' },
      ]).onConflictDoNothing();
      
      console.log("✓ Added sample photos");
    }
    
  } catch (error) {
    console.error("Error restoring photos:", error);
  }
}