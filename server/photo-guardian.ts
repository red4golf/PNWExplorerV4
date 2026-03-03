import fs from 'fs';
import path from 'path';
import { db } from './db';
import { photos } from '../shared/schema';

export class PhotoGuardian {
  private static instance: PhotoGuardian;
  private backupInterval: NodeJS.Timeout | null = null;
  private isDisabled = true; // DISABLED for stable uploads

  static getInstance(): PhotoGuardian {
    if (!PhotoGuardian.instance) {
      PhotoGuardian.instance = new PhotoGuardian();
    }
    return PhotoGuardian.instance;
  }

  async initialize() {
    console.log('🛡️ Photo Guardian initializing...');
    
    if (this.isDisabled) {
      console.log('🛡️ Photo Guardian is DISABLED for stable uploads');
      return;
    }

    await this.createBackupTable();
    await this.backupAllPhotos();
    this.startMonitoring();
  }

  private async createBackupTable() {
    // Create a backup table to store photo metadata
    try {
      await db.execute(`
        CREATE TABLE IF NOT EXISTS photo_vault (
          id SERIAL PRIMARY KEY,
          original_photo_id INTEGER,
          location_id INTEGER,
          filename TEXT,
          caption TEXT,
          file_data BYTEA,
          backup_timestamp TIMESTAMP DEFAULT NOW()
        )
      `);
      console.log('🛡️ Photo vault table ready');
    } catch (error) {
      console.error('❌ Failed to create photo vault:', error);
    }
  }

  async backupAllPhotos() {
    console.log('💾 Backing up all photos to vault...');
    
    const allPhotos = await db.select().from(photos);
    
    for (const photo of allPhotos) {
      const fullPath = path.join(process.cwd(), photo.filename.replace(/^\//, ''));
      
      if (fs.existsSync(fullPath)) {
        try {
          const fileData = fs.readFileSync(fullPath);
          
          // Store in vault
          await (db as any).execute(`
            INSERT INTO photo_vault (original_photo_id, location_id, filename, caption, file_data)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (original_photo_id) DO UPDATE SET
              file_data = EXCLUDED.file_data,
              backup_timestamp = NOW()
          `, [photo.id, photo.locationId, photo.filename, photo.caption, fileData]);
          
          console.log(`✅ Backed up photo ID ${photo.id} to vault`);
        } catch (error) {
          console.error(`❌ Failed to backup photo ID ${photo.id}:`, error);
        }
      } else {
        console.log(`⚠️ Photo file missing for ID ${photo.id}: ${photo.filename}`);
        // Create emergency photo
        await this.createEmergencyPhotos();
      }
    }
  }

  async emergencyRestore() {
    console.log('🚨 EMERGENCY RESTORE INITIATED');
    
    try {
      const vaultPhotos = await db.execute('SELECT * FROM photo_vault');
      
      for (const vaultPhoto of vaultPhotos.rows as Array<{ filename: string; file_data: Buffer }>) {
        const fullPath = path.join(process.cwd(), vaultPhoto.filename.replace(/^\//, ''));
        
        if (!fs.existsSync(fullPath)) {
          // Restore from vault
          const dir = path.dirname(fullPath);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
          }
          
          fs.writeFileSync(fullPath, vaultPhoto.file_data);
          console.log(`✅ RESTORED: ${vaultPhoto.filename}`);
        }
      }
      
      console.log('🚨 Emergency restore completed');
    } catch (error) {
      console.error('❌ Emergency restore failed:', error);
    }
  }

  private async createEmergencyPhotos() {
    console.log('🆘 Creating emergency photos...');
    
    const emergencyJpeg = Buffer.from([
      0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x01, 0x00, 0x48,
      0x00, 0x48, 0x00, 0x00, 0xff, 0xdb, 0x00, 0x43, 0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08,
      0x07, 0x07, 0x07, 0x09, 0x09, 0x08, 0x0a, 0x0c, 0x14, 0x0d, 0x0c, 0x0b, 0x0b, 0x0c, 0x19, 0x12,
      0x13, 0x0f, 0x14, 0x1d, 0x1a, 0x1f, 0x1e, 0x1d, 0x1a, 0x1c, 0x1c, 0x20, 0x24, 0x2e, 0x27, 0x1c,
      0x1c, 0x28, 0x37, 0x29, 0x2c, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1f, 0x27, 0x39, 0x3d, 0x38, 0x32,
      0x3c, 0x2e, 0x33, 0x34, 0x32, 0xff, 0xc0, 0x00, 0x11, 0x08, 0x00, 0x64, 0x00, 0x64, 0x01, 0x01,
      0x11, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01, 0xff, 0xc4, 0x00, 0x14, 0x00, 0x01, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x08, 0xff, 0xc4,
      0x00, 0x14, 0x10, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x00, 0x00, 0xff, 0xda, 0x00, 0x0c, 0x03, 0x01, 0x00, 0x02, 0x11, 0x03, 0x11, 0x00,
      0x3f, 0x00, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa,
      0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa, 0xaa,
      0xff, 0xd9
    ]);

    const missingPhotos = await db.select().from(photos);
    
    for (const photo of missingPhotos) {
      const fullPath = path.join(process.cwd(), photo.filename.replace(/^\//, ''));
      
      if (!fs.existsSync(fullPath)) {
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(fullPath, emergencyJpeg);
        console.log(`🆘 Created emergency photo: ${photo.filename}`);
      }
    }
  }

  private startMonitoring() {
    // Monitor every 30 seconds
    this.backupInterval = setInterval(async () => {
      await this.backupAllPhotos();
    }, 30000);
    
    console.log('👁️ Photo Guardian monitoring started (30-second intervals)');
  }

  async stop() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      console.log('🛡️ Photo Guardian stopped');
    }
  }
}

export const photoGuardian = PhotoGuardian.getInstance();