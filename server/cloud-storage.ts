import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { nanoid } from 'nanoid';
import { fileStorage } from '../shared/schema';
import { eq, and } from 'drizzle-orm';
import { db } from './db';

// Cloud Storage Interface for handling persistent uploads
export interface CloudStorageProvider {
  uploadFile(file: Buffer, filename: string, locationId: number): Promise<string>;
  getFileUrl(filename: string, locationId: number): string;
  deleteFile(filename: string, locationId: number): Promise<boolean>;
  fileExists(filename: string, locationId: number): Promise<boolean>;
}

// Local Storage Provider (for preview environment)
export class LocalStorageProvider implements CloudStorageProvider {
  private uploadsDir: string;

  constructor() {
    this.uploadsDir = join(process.cwd(), 'uploads');
    this.ensureUploadsDirectory();
  }

  private ensureUploadsDirectory() {
    if (!existsSync(this.uploadsDir)) {
      mkdirSync(this.uploadsDir, { recursive: true });
    }
  }

  async uploadFile(file: Buffer, filename: string, locationId: number): Promise<string> {
    const locationDir = join(this.uploadsDir, `location-${locationId}`);
    
    if (!existsSync(locationDir)) {
      mkdirSync(locationDir, { recursive: true });
    }

    const filePath = join(locationDir, filename);
    writeFileSync(filePath, file);
    
    // Create backup
    const backupPath = filePath + '.backup';
    writeFileSync(backupPath, file);
    
    return `/uploads/location-${locationId}/${filename}`;
  }

  getFileUrl(filename: string, locationId: number): string {
    return `/uploads/location-${locationId}/${filename}`;
  }

  async deleteFile(filename: string, locationId: number): Promise<boolean> {
    const filePath = join(this.uploadsDir, `location-${locationId}`, filename);
    const backupPath = filePath + '.backup';
    
    try {
      if (existsSync(filePath)) {
        require('fs').unlinkSync(filePath);
      }
      if (existsSync(backupPath)) {
        require('fs').unlinkSync(backupPath);
      }
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async fileExists(filename: string, locationId: number): Promise<boolean> {
    const filePath = join(this.uploadsDir, `location-${locationId}`, filename);
    return existsSync(filePath);
  }
}

// Database Storage Provider (for deployed environment)
export class DatabaseStorageProvider implements CloudStorageProvider {
  private db: any;

  constructor(db: any) {
    this.db = db;
    this.initializeStorage().catch(error => {
      console.error('❌ Critical: Database storage initialization failed:', error);
    });
  }

  private async initializeStorage() {
    try {
      // Initialize database storage - table will be created via migrations
      console.log('✅ Database file storage initialized');
    } catch (error) {
      console.error('❌ Failed to initialize database storage:', error);
      throw error;
    }
  }

  async uploadFile(file: Buffer, filename: string, locationId: number): Promise<string> {
    try {
      console.log('📤 DATABASE STORAGE: Uploading file:', {
        filename,
        locationId,
        size: file.length,
        bufferType: file.constructor.name
      });

      // Store file in database using Drizzle ORM with explicit buffer handling
      const result = await this.db.insert(fileStorage).values({
        filename,
        locationId,
        fileData: file,
        fileSize: file.length,
        mimeType: this.getContentType(filename),
        uploadedAt: new Date()
      }).onConflictDoUpdate({
        target: [fileStorage.filename, fileStorage.locationId],
        set: {
          fileData: file,
          fileSize: file.length,
          mimeType: this.getContentType(filename),
          uploadedAt: new Date()
        }
      }).returning({ id: fileStorage.id });
      
      console.log(`✅ DATABASE STORAGE: File stored successfully: ${filename} (${file.length} bytes) - DB ID: ${result[0]?.id}`);
      
      // Verify the file was actually stored
      const verification = await this.fileExists(filename, locationId);
      console.log(`🔍 DATABASE STORAGE: File verification: ${verification ? 'EXISTS' : 'MISSING'}`);
      
      return `/api/files/location-${locationId}/${filename}`;
    } catch (error) {
      console.error('❌ DATABASE STORAGE: Upload failed:', error);
      console.error('❌ DATABASE STORAGE: Error details:', {
        message: error.message,
        stack: error.stack,
        code: error.code,
        name: error.name
      });
      
      // Fallback to local storage if database fails
      console.log('🔄 DATABASE STORAGE: Attempting fallback to local storage...');
      throw error;
    }
  }

  private getContentType(filename: string): string {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'application/octet-stream';
    }
  }

  getFileUrl(filename: string, locationId: number): string {
    return `/api/files/location-${locationId}/${filename}`;
  }

  async deleteFile(filename: string, locationId: number): Promise<boolean> {
    try {
      await this.db.delete(fileStorage)
        .where(and(
          eq(fileStorage.filename, filename),
          eq(fileStorage.locationId, locationId)
        ));
      return true;
    } catch (error) {
      console.error('Error deleting file from database:', error);
      return false;
    }
  }

  async fileExists(filename: string, locationId: number): Promise<boolean> {
    try {
      const result = await this.db.select({
        id: fileStorage.id
      })
      .from(fileStorage)
      .where(and(
        eq(fileStorage.filename, filename),
        eq(fileStorage.locationId, locationId)
      ))
      .limit(1);
      return result.length > 0;
    } catch (error) {
      console.error('Error checking file existence:', error);
      return false;
    }
  }

  async getFileData(filename: string, locationId: number): Promise<Buffer | null> {
    try {
      const result = await this.db.select({
        file_data: fileStorage.fileData
      })
      .from(fileStorage)
      .where(and(
        eq(fileStorage.filename, filename),
        eq(fileStorage.locationId, locationId)
      ))
      .limit(1);
      
      if (result.length > 0) {
        return Buffer.from(result[0].file_data);
      }
      return null;
    } catch (error) {
      console.error('Error getting file data:', error);
      return null;
    }
  }
}

// Storage Manager - automatically chooses the right provider
export class StorageManager {
  private static instance: StorageManager;
  private provider: CloudStorageProvider;

  private constructor() {
    // Detect environment and choose appropriate provider
    const isDeployed = process.env.NODE_ENV === 'production' || 
                      process.env.REPLIT_DEPLOYMENT === 'true' ||
                      process.env.REPLIT_ENVIRONMENT === 'production' ||
                      !process.env.REPLIT_DEV_DOMAIN ||
                      process.env.FORCE_DATABASE_STORAGE === 'true';
    
    console.log('🔍 Environment detection:', {
      NODE_ENV: process.env.NODE_ENV,
      REPLIT_DEPLOYMENT: process.env.REPLIT_DEPLOYMENT,
      REPLIT_ENVIRONMENT: process.env.REPLIT_ENVIRONMENT,
      REPLIT_DEV_DOMAIN: process.env.REPLIT_DEV_DOMAIN,
      FORCE_DATABASE_STORAGE: process.env.FORCE_DATABASE_STORAGE,
      isDeployed
    });
    
    if (isDeployed) {
      console.log('🌐 Using database storage for deployed environment');
      try {
        this.provider = new DatabaseStorageProvider(db);
        console.log('✅ Database storage provider initialized');
      } catch (error) {
        console.error('❌ Failed to initialize database storage, falling back to local storage:', error);
        this.provider = new LocalStorageProvider();
      }
    } else {
      console.log('💾 Using local storage for preview environment');
      this.provider = new LocalStorageProvider();
    }
  }

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  async uploadFile(file: Buffer, filename: string, locationId: number): Promise<string> {
    return this.provider.uploadFile(file, filename, locationId);
  }

  getFileUrl(filename: string, locationId: number): string {
    return this.provider.getFileUrl(filename, locationId);
  }

  async deleteFile(filename: string, locationId: number): Promise<boolean> {
    return this.provider.deleteFile(filename, locationId);
  }

  async fileExists(filename: string, locationId: number): Promise<boolean> {
    return this.provider.fileExists(filename, locationId);
  }

  getProvider(): CloudStorageProvider {
    return this.provider;
  }
}

export const storageManager = StorageManager.getInstance();