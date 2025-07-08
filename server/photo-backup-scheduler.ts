import { photoPersistenceManager } from './photo-persistence';
import cron from 'node-cron';

export class PhotoBackupScheduler {
  private static instance: PhotoBackupScheduler;
  private backupInterval: NodeJS.Timeout | null = null;
  
  static getInstance(): PhotoBackupScheduler {
    if (!PhotoBackupScheduler.instance) {
      PhotoBackupScheduler.instance = new PhotoBackupScheduler();
    }
    return PhotoBackupScheduler.instance;
  }

  startScheduledBackups() {
    console.log('📅 Starting scheduled photo backups...');
    
    // Create backup every 6 hours
    this.backupInterval = setInterval(async () => {
      try {
        console.log('⏰ Scheduled backup starting...');
        await photoPersistenceManager.createBackupSnapshot();
        await photoPersistenceManager.validatePhotosIntegrity();
        await photoPersistenceManager.purgeTemporaryFiles();
        console.log('✅ Scheduled backup completed');
      } catch (error) {
        console.error('❌ Scheduled backup failed:', error);
      }
    }, 6 * 60 * 60 * 1000); // 6 hours in milliseconds
    
    // Also run integrity check every hour
    setInterval(async () => {
      try {
        const report = await photoPersistenceManager.generateFileReport();
        if (report.missingFiles.length > 0 || report.orphanedFiles.length > 0) {
          console.warn('⚠️ Photo integrity issues detected:', report);
        }
      } catch (error) {
        console.error('❌ Integrity check failed:', error);
      }
    }, 60 * 60 * 1000); // 1 hour
  }

  async createManualBackup() {
    console.log('📸 Creating manual backup...');
    return await photoPersistenceManager.createBackupSnapshot();
  }

  stop() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      console.log('⏹️ Photo backup scheduler stopped');
    }
  }
}

export const photoBackupScheduler = PhotoBackupScheduler.getInstance();