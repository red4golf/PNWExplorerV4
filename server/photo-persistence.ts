import fs from 'fs';
import path from 'path';
import { db } from './db';
import { photos } from '@shared/schema';

export class PhotoPersistenceManager {
  private uploadsDir: string;
  
  constructor() {
    this.uploadsDir = path.join(process.cwd(), 'uploads');
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      console.log('✓ Created uploads directory');
    }
  }

  async validatePhotosIntegrity() {
    console.log('🔍 Validating photo integrity...');
    
    const allPhotos = await db.select().from(photos);
    const missingFiles: string[] = [];
    const validPhotos: number = 0;
    
    for (const photo of allPhotos) {
      if (photo.filename.startsWith('/uploads/')) {
        const filePath = path.join(process.cwd(), photo.filename.substring(1));
        if (!fs.existsSync(filePath)) {
          missingFiles.push(`${photo.filename} (ID: ${photo.id})`);
          console.warn(`⚠️ Missing file: ${photo.filename}`);
        }
      }
    }
    
    const report = {
      totalPhotos: allPhotos.length,
      localPhotos: allPhotos.filter(p => p.filename.startsWith('/uploads/')).length,
      externalPhotos: allPhotos.filter(p => p.filename.startsWith('http')).length,
      missingFiles: missingFiles.length,
      missingFilesList: missingFiles
    };
    
    console.log('📊 Photo Integrity Report:', report);
    return report;
  }

  async createBackupSnapshot() {
    console.log('📸 Creating photo backup snapshot...');
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(this.uploadsDir, 'backups', timestamp);
    
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    // Copy all files in uploads to backup
    const files = fs.readdirSync(this.uploadsDir);
    let copiedFiles = 0;
    
    for (const file of files) {
      const sourcePath = path.join(this.uploadsDir, file);
      const destPath = path.join(backupDir, file);
      
      if (fs.statSync(sourcePath).isFile()) {
        fs.copyFileSync(sourcePath, destPath);
        copiedFiles++;
      }
    }
    
    console.log(`✅ Backup created: ${copiedFiles} files backed up to ${backupDir}`);
    return backupDir;
  }

  async purgeTemporaryFiles() {
    console.log('🧹 Cleaning temporary files...');
    
    const tempPatterns = [
      /^temp-/,
      /\.tmp$/,
      /\.temp$/,
      /~$/
    ];
    
    const files = fs.readdirSync(this.uploadsDir);
    let cleanedFiles = 0;
    
    for (const file of files) {
      const filePath = path.join(this.uploadsDir, file);
      
      if (tempPatterns.some(pattern => pattern.test(file))) {
        try {
          fs.unlinkSync(filePath);
          cleanedFiles++;
          console.log(`🗑️ Removed temporary file: ${file}`);
        } catch (error) {
          console.error(`❌ Failed to remove ${file}:`, error);
        }
      }
    }
    
    console.log(`✅ Cleanup complete: ${cleanedFiles} temporary files removed`);
  }

  async generateFileReport() {
    const uploadsFiles = fs.readdirSync(this.uploadsDir)
      .filter(file => fs.statSync(path.join(this.uploadsDir, file)).isFile());
    
    const dbPhotos = await db.select().from(photos);
    const dbFilenames = dbPhotos
      .filter(p => p.filename.startsWith('/uploads/'))
      .map(p => p.filename.replace('/uploads/', ''));
    
    const orphanedFiles = uploadsFiles.filter(file => !dbFilenames.includes(file));
    const missingFiles = dbFilenames.filter(filename => !uploadsFiles.includes(filename));
    
    return {
      filesOnDisk: uploadsFiles.length,
      filesInDatabase: dbFilenames.length,
      orphanedFiles,
      missingFiles,
      diskUsage: this.calculateDiskUsage()
    };
  }

  private calculateDiskUsage(): string {
    let totalSize = 0;
    const files = fs.readdirSync(this.uploadsDir);
    
    for (const file of files) {
      const filePath = path.join(this.uploadsDir, file);
      if (fs.statSync(filePath).isFile()) {
        totalSize += fs.statSync(filePath).size;
      }
    }
    
    return `${(totalSize / 1024 / 1024).toFixed(2)} MB`;
  }
}

export const photoPersistenceManager = new PhotoPersistenceManager();