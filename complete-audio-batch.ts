import { db } from './server/db';
import { locations, fileStorage } from './shared/schema';
import { eq, and, notInArray } from 'drizzle-orm';

const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Rachel voice
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

async function generateAudioForLocation(location: any): Promise<boolean> {
  if (!ELEVENLABS_API_KEY) return false;

  const audioScript = `Welcome to ${location.name}. ${(location.content || '').slice(0, 1500)}${(location.content || '').length > 1500 ? '...' : ''}`;

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: audioScript,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.5 }
      })
    });

    if (!response.ok) return false;

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    const cleanName = location.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
    const filename = `narration-${cleanName}`;

    await db.insert(fileStorage).values({
      locationId: location.id,
      filename: filename,
      mimeType: 'audio/mpeg',
      fileSize: audioBuffer.length,
      fileData: audioBuffer.toString('base64')
    });

    console.log(`✅ ${location.name}: ${audioBuffer.length} bytes`);
    return true;

  } catch (error) {
    console.error(`❌ ${location.name}: ${error}`);
    return false;
  }
}

async function completeAudioGeneration() {
  console.log('🎵 Completing audio generation for remaining locations...');

  // Get locations that don't have audio yet
  const existingAudioLocations = await db
    .select({ locationId: fileStorage.locationId })
    .from(fileStorage)
    .where(eq(fileStorage.filename, 'narration-%'));

  const existingIds = existingAudioLocations.map(row => row.locationId);

  const missingLocations = await db
    .select({ id: locations.id, name: locations.name, content: locations.content })
    .from(locations)
    .where(
      existingIds.length > 0 
        ? and(eq(locations.status, 'approved'), notInArray(locations.id, existingIds))
        : eq(locations.status, 'approved')
    )
    .orderBy(locations.id);

  console.log(`📍 Found ${missingLocations.length} locations needing audio`);

  let successCount = 0;
  for (const location of missingLocations) {
    const success = await generateAudioForLocation(location);
    if (success) successCount++;
    
    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`🎉 Completed: ${successCount}/${missingLocations.length} locations`);
  return { successCount, totalAttempted: missingLocations.length };
}

completeAudioGeneration()
  .then(result => {
    console.log('Audio generation complete:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Audio generation failed:', error);
    process.exit(1);
  });