import cron from 'node-cron';
import { photoPersistenceManager } from './photo-persistence';

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
    // Create backup every 6 hours
    this.backupInterval = setInterval(async () => {
      try {
        console.log('🕕 Creating scheduled backup...');
        await photoPersistenceManager.createBackupSnapshot();
        await photoPersistenceManager.validatePhotosIntegrity();
        console.log('✅ Scheduled backup completed');
      } catch (error) {
        console.error('❌ Scheduled backup failed:', error);
      }
    }, 6 * 60 * 60 * 1000); // 6 hours

    // Also run integrity check every hour
    setInterval(async () => {
      try {
        await photoPersistenceManager.validatePhotosIntegrity();
      } catch (error) {
        console.error('❌ Integrity check failed:', error);
      }
    }, 60 * 60 * 1000); // 1 hour

    console.log('📅 Photo backup scheduler started (6-hour intervals)');
  }

  async createManualBackup() {
    console.log('🔧 Creating manual backup...');
    try {
      await photoPersistenceManager.createBackupSnapshot();
      const report = await photoPersistenceManager.generateFileReport();
      console.log('✅ Manual backup completed');
      return report;
    } catch (error) {
      console.error('❌ Manual backup failed:', error);
      throw error;
    }
  }

  stop() {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
      console.log('🛑 Photo backup scheduler stopped');
    }
  }
}

export const photoBackupScheduler = PhotoBackupScheduler.getInstance();