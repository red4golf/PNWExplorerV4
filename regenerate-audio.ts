import { db } from './server/db';
import { locations, fileStorage } from './shared/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

interface ElevenLabsResponse {
  audio_base64?: string;
  error?: string;
}

// ElevenLabs voice configuration
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Rachel voice
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

async function generateAudioContent(locationName: string, content: string): Promise<Buffer | null> {
  if (!ELEVENLABS_API_KEY) {
    console.error('❌ ElevenLabs API key not found');
    return null;
  }

  // Create a focused narrative for the location
  const audioScript = `Welcome to ${locationName}. ${content.slice(0, 1500)}${content.length > 1500 ? '...' : ''}`;

  try {
    console.log(`🎵 Generating audio for: ${locationName}`);
    
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
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.5
        }
      })
    });

    if (!response.ok) {
      console.error(`❌ ElevenLabs API error: ${response.status} ${response.statusText}`);
      return null;
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    console.log(`✅ Generated audio for ${locationName}: ${audioBuffer.length} bytes`);
    return audioBuffer;

  } catch (error) {
    console.error(`❌ Error generating audio for ${locationName}:`, error);
    return null;
  }
}

async function regenerateAllAudio() {
  console.log('🎵 Starting comprehensive audio regeneration...');

  // Get all approved locations with their content
  const allLocations = await db
    .select({
      id: locations.id,
      name: locations.name,
      content: locations.content,
      category: locations.category
    })
    .from(locations)
    .where(eq(locations.status, 'approved'))
    .orderBy(locations.id);

  console.log(`📍 Found ${allLocations.length} approved locations`);

  let successCount = 0;
  let errorCount = 0;

  for (const location of allLocations) {
    try {
      // Generate unique audio content for this location
      const audioBuffer = await generateAudioContent(location.name, location.content || '');
      
      if (!audioBuffer) {
        console.error(`❌ Failed to generate audio for: ${location.name}`);
        errorCount++;
        continue;
      }

      // Create descriptive filename
      const cleanName = location.name
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .replace(/\s+/g, '-');
      const filename = `narration-${cleanName}`;

      // Store in database (note: fileStorage id is serial, locationId is integer)
      await db.insert(fileStorage).values({
        locationId: location.id,
        filename: filename,
        mimeType: 'audio/mpeg',
        fileSize: audioBuffer.length,
        fileData: audioBuffer.toString('base64') // Store as base64 text
      });

      console.log(`✅ Saved audio for ${location.name} (${audioBuffer.length} bytes)`);
      successCount++;

      // Add delay to respect API rate limits
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.error(`❌ Error processing ${location.name}:`, error);
      errorCount++;
    }
  }

  console.log('🎵 Audio regeneration complete!');
  console.log(`✅ Successfully generated: ${successCount} audio files`);
  console.log(`❌ Failed: ${errorCount} audio files`);
  console.log(`📊 Total coverage: ${successCount}/${allLocations.length} locations`);

  return { successCount, errorCount, totalLocations: allLocations.length };
}

// Export for use in other scripts
export { regenerateAllAudio, generateAudioContent };

// Run the audio regeneration
regenerateAllAudio()
  .then((result) => {
    console.log('🎉 Audio regeneration completed:', result);
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Audio regeneration failed:', error);
    process.exit(1);
  });