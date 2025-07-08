import fs from 'fs';
import path from 'path';
import { db } from './db';
import { photos } from '../shared/schema';

export class PhotoPersistenceManager {
  private uploadsDir: string;
  
  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      console.log('📁 Created uploads directory:', this.uploadsDir);
    }
  }

  async validatePhotosIntegrity() {
    // Skip validation when using database storage
    if (process.env.REPLIT_ENVIRONMENT === 'production') {
      console.log('🌐 Database storage detected - skipping photo integrity validation');
      return { validFiles: [], missingFiles: [] };
    }
    
    console.log('🔍 Validating photo integrity...');
    
    const dbPhotos = await db.select().from(photos);
    const missingFiles = [];
    const validFiles = [];
    
    for (const photo of dbPhotos) {
      const fullPath = path.join(process.cwd(), photo.filename.replace(/^\//, ''));
      
      if (fs.existsSync(fullPath)) {
        validFiles.push(photo);
      } else {
        missingFiles.push(photo);
        console.log(`❌ Missing file: ${photo.filename} (ID: ${photo.id})`);
      }
    }
    
    console.log(`✅ Valid files: ${validFiles.length}`);
    console.log(`❌ Missing files: ${missingFiles.length}`);
    
    return { validFiles, missingFiles };
  }

  async createBackupSnapshot() {
    console.log('💾 Creating backup snapshot...');
    
    const backupDir = path.join(this.uploadsDir, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(backupDir, `backup-${timestamp}.json`);
    
    const dbPhotos = await db.select().from(photos);
    const backupData = {
      timestamp: new Date().toISOString(),
      photoCount: dbPhotos.length,
      photos: dbPhotos
    };
    
    fs.writeFileSync(backupPath, JSON.stringify(backupData, null, 2));
    console.log('💾 Backup created:', backupPath);
    
    return backupPath;
  }

  async purgeTemporaryFiles() {
    const tempFiles = fs.readdirSync(this.uploadsDir).filter(file => 
      file.includes('temp') || file.includes('tmp') || file.startsWith('.')
    );
    
    for (const file of tempFiles) {
      const filePath = path.join(this.uploadsDir, file);
      try {
        fs.unlinkSync(filePath);
        console.log('🗑️ Purged temp file:', file);
      } catch (error) {
        console.error('❌ Failed to purge temp file:', file, error);
      }
    }
  }

  async generateFileReport() {
    console.log('📊 Generating file report...');
    
    const { validFiles, missingFiles } = await this.validatePhotosIntegrity();
    
    const report = {
      timestamp: new Date().toISOString(),
      diskUsage: this.calculateDiskUsage(),
      database: {
        totalPhotos: validFiles.length + missingFiles.length,
        validPhotos: validFiles.length,
        missingPhotos: missingFiles.length
      },
      filesystem: {
        totalFiles: this.countFiles(),
        totalSize: this.calculateTotalSize()
      }
    };
    
    console.log('📊 File Report:', JSON.stringify(report, null, 2));
    return report;
  }

  private calculateDiskUsage(): string {
    try {
      const stats = fs.statSync(this.uploadsDir);
      const sizeInMB = Math.round(stats.size / 1024 / 1024 * 100) / 100;
      return `${sizeInMB}MB`;
    } catch (error) {
      return 'unknown';
    }
  }

  private countFiles(): number {
    try {
      const files = fs.readdirSync(this.uploadsDir, { recursive: true });
      return files.filter(file => typeof file === 'string' && !file.includes('/')).length;
    } catch (error) {
      return 0;
    }
  }

  private calculateTotalSize(): string {
    try {
      let totalSize = 0;
      const files = fs.readdirSync(this.uploadsDir, { recursive: true });
      
      for (const file of files) {
        if (typeof file === 'string' && !file.includes('/')) {
          const filePath = path.join(this.uploadsDir, file);
          const stats = fs.statSync(filePath);
          totalSize += stats.size;
        }
      }
      
      const sizeInMB = Math.round(totalSize / 1024 / 1024 * 100) / 100;
      return `${sizeInMB}MB`;
    } catch (error) {
      return 'unknown';
    }
  }
}

export const photoPersistenceManager = new PhotoPersistenceManager();