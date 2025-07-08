import { db } from './db';
import { photos } from '../shared/schema';
import fs from 'fs';
import path from 'path';

export async function emergencyPhotoRecovery() {
  console.log('🔄 Starting emergency photo recovery...');
  
  // Check uploads directory for files
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    console.log('❌ No uploads directory found');
    return;
  }

  // Find all image files
  const imageFiles = fs.readdirSync(uploadsDir).filter(file => 
    /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
  );

  console.log(`📁 Found ${imageFiles.length} image files in uploads directory`);

  // Check existing photos in database
  const existingPhotos = await db.select().from(photos);
  console.log(`💾 Found ${existingPhotos.length} photos in database`);

  // Create emergency photo entries for orphaned files
  let recoveredCount = 0;
  for (const file of imageFiles) {
    const filePath = `/uploads/${file}`;
    
    // Check if already in database
    const exists = existingPhotos.some(p => p.filename === filePath);
    if (!exists) {
      // Try to extract location ID from filename
      const locationMatch = file.match(/location-(\d+)/);
      if (locationMatch) {
        const locationId = parseInt(locationMatch[1]);
        
        try {
          await db.insert(photos).values({
            locationId,
            filename: filePath,
            caption: `Recovered: ${file}`,
          });
          
          recoveredCount++;
          console.log(`✅ Recovered photo: ${file} for location ${locationId}`);
        } catch (error) {
          console.error(`❌ Failed to recover ${file}:`, error);
        }
      }
    }
  }

  console.log(`🎉 Recovery complete! Recovered ${recoveredCount} photos`);
  return recoveredCount;
}

// Simple function to run recovery
if (require.main === module) {
  emergencyPhotoRecovery().then(count => {
    console.log('Recovery completed, recovered:', count, 'photos');
    process.exit(0);
  }).catch(err => {
    console.error('Recovery failed:', err);
    process.exit(1);
  });
}