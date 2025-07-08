import { existsSync, copyFileSync, statSync, readdirSync } from 'fs';
import { join } from 'path';
import { db } from './db';
import { locations, photos } from '../shared/schema';
import { eq } from 'drizzle-orm';

export class UploadPersistenceFix {
  private static instance: UploadPersistenceFix;
  private monitoringInterval: NodeJS.Timeout | null = null;

  static getInstance(): UploadPersistenceFix {
    if (!UploadPersistenceFix.instance) {
      UploadPersistenceFix.instance = new UploadPersistenceFix();
    }
    return UploadPersistenceFix.instance;
  }

  async startMonitoring() {
    console.log('🔍 Starting upload persistence monitoring...');
    
    // Check every 30 seconds for missing files
    this.monitoringInterval = setInterval(async () => {
      await this.validateAllUploads();
    }, 30000);
    
    // Run initial validation
    await this.validateAllUploads();
  }

  async validateAllUploads() {
    try {
      // Check hero images
      const allLocations = await db.select().from(locations).where(eq(locations.status, 'approved'));
      let heroMissing = 0;
      let heroFixed = 0;
      
      for (const location of allLocations) {
        if (location.heroImage) {
          const heroPath = join(process.cwd(), location.heroImage.replace(/^\//, ''));
          if (!existsSync(heroPath)) {
            console.log(`❌ MISSING HERO: ${location.name} - ${location.heroImage}`);
            heroMissing++;
            
            // Try to restore from backup
            const backupPath = heroPath + '.backup';
            if (existsSync(backupPath)) {
              try {
                copyFileSync(backupPath, heroPath);
                console.log(`✅ RESTORED HERO: ${location.name} from backup`);
                heroFixed++;
              } catch (error) {
                console.error(`❌ FAILED TO RESTORE HERO: ${location.name}`, error);
              }
            }
          }
        }
      }
      
      // Check gallery photos
      const allPhotos = await db.select().from(photos);
      let photosMissing = 0;
      let photosFixed = 0;
      
      for (const photo of allPhotos) {
        const photoPath = join(process.cwd(), photo.filename.replace(/^\//, ''));
        if (!existsSync(photoPath)) {
          console.log(`❌ MISSING PHOTO: ID ${photo.id} - ${photo.filename}`);
          photosMissing++;
          
          // Try to restore from backup
          const backupPath = photoPath + '.backup';
          if (existsSync(backupPath)) {
            try {
              copyFileSync(backupPath, photoPath);
              console.log(`✅ RESTORED PHOTO: ID ${photo.id} from backup`);
              photosFixed++;
            } catch (error) {
              console.error(`❌ FAILED TO RESTORE PHOTO: ID ${photo.id}`, error);
            }
          }
        }
      }
      
      if (heroMissing > 0 || photosMissing > 0) {
        console.log(`🔍 PERSISTENCE CHECK: Heroes missing: ${heroMissing} (fixed: ${heroFixed}), Photos missing: ${photosMissing} (fixed: ${photosFixed})`);
      }
      
    } catch (error) {
      console.error('❌ Error during upload validation:', error);
    }
  }

  async emergencyBackupAll() {
    console.log('🚨 EMERGENCY BACKUP: Creating backups for all uploads...');
    
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      console.log('No uploads directory found');
      return;
    }
    
    const locationDirs = readdirSync(uploadsDir).filter(dir => dir.startsWith('location-'));
    
    for (const locationDir of locationDirs) {
      const locationPath = join(uploadsDir, locationDir);
      const files = readdirSync(locationPath).filter(file => 
        !file.endsWith('.backup') && 
        !file.endsWith('.tmp') && 
        !file.startsWith('.')
      );
      
      for (const file of files) {
        const filePath = join(locationPath, file);
        const backupPath = filePath + '.backup';
        
        if (!existsSync(backupPath)) {
          try {
            copyFileSync(filePath, backupPath);
            console.log(`💾 EMERGENCY BACKUP: Created backup for ${file}`);
          } catch (error) {
            console.error(`❌ EMERGENCY BACKUP FAILED: ${file}`, error);
          }
        }
      }
    }
  }

  async getUploadStatus() {
    const uploadsDir = join(process.cwd(), 'uploads');
    if (!existsSync(uploadsDir)) {
      return { totalFiles: 0, totalBackups: 0, locationDirs: 0 };
    }
    
    const locationDirs = readdirSync(uploadsDir).filter(dir => dir.startsWith('location-'));
    let totalFiles = 0;
    let totalBackups = 0;
    
    for (const locationDir of locationDirs) {
      const locationPath = join(uploadsDir, locationDir);
      const files = readdirSync(locationPath);
      const mainFiles = files.filter(file => !file.endsWith('.backup') && !file.endsWith('.tmp'));
      const backupFiles = files.filter(file => file.endsWith('.backup'));
      
      totalFiles += mainFiles.length;
      totalBackups += backupFiles.length;
    }
    
    return {
      totalFiles,
      totalBackups,
      locationDirs: locationDirs.length
    };
  }

  stop() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('🛑 Upload persistence monitoring stopped');
    }
  }
}

export const uploadPersistenceFix = UploadPersistenceFix.getInstance();