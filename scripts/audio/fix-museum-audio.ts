import { db } from './server/db';
import { locations } from './shared/schema';
import { eq, sql } from 'drizzle-orm';
import * as fs from 'fs';

async function fixMuseumAudio() {
  console.log('🎵 Fixing Museum of Flight audio storage...');
  
  const filePath = './uploads/location-111/museum-of-flight-narration.mp3';
  
  if (!fs.existsSync(filePath)) {
    console.error('❌ Audio file not found at', filePath);
    return;
  }
  
  const audioBuffer = fs.readFileSync(filePath);
  console.log(`📂 Read audio file: ${audioBuffer.length} bytes`);
  
  // Verify MP3 header
  const header = audioBuffer.slice(0, 4);
  console.log(`🔍 Audio header: ${Array.from(header).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
  
  const filename = 'museum-of-flight-narration.mp3';
  const locationId = 111;
  
  // Store in file_storage table using raw SQL with hex encoding
  const hexData = audioBuffer.toString('hex');
  
  const insertQuery = `
    INSERT INTO file_storage (filename, location_id, file_data, file_size, mime_type, uploaded_at)
    VALUES ('${filename}', ${locationId}, '\\x${hexData}', ${audioBuffer.length}, 'audio/mpeg', NOW())
    ON CONFLICT (location_id, filename) 
    DO UPDATE SET 
      file_data = EXCLUDED.file_data,
      file_size = EXCLUDED.file_size,
      uploaded_at = NOW()
  `;
  
  await db.execute(sql.raw(insertQuery));
  console.log(`💾 Stored in database`);
  
  // Update location audio_narration field
  await db.update(locations)
    .set({ audioNarration: `/api/files/location-${locationId}/${filename}` })
    .where(eq(locations.id, locationId));
  
  console.log('✅ Updated location record');
  
  // Verify storage
  const verifyResult = await db.execute(sql.raw(`
    SELECT filename, file_size FROM file_storage WHERE location_id = ${locationId} AND filename = '${filename}'
  `));
  
  console.log('📊 Verification:', verifyResult.rows);
  console.log('🎉 Done!');
}

fixMuseumAudio().catch(console.error);
