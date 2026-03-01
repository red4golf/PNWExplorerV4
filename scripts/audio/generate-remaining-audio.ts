import { db } from './server/db';
import { locations, fileStorage } from './shared/schema';
import { eq, notExists } from 'drizzle-orm';

const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';
const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;

const remainingLocationIds = [33,34,35,36,37,38,39,40,41,42,49,50,51,52,53,54,55,56,57,58,59,60,61,62,63,64,65,66,67,68,69,70,71,72,73,75,77,79,80,81,82,83,84,85,86,110,111];

async function generateBatchAudio() {
  console.log(`🎵 Generating audio for ${remainingLocationIds.length} remaining locations...`);

  for (const locationId of remainingLocationIds) {
    try {
      // Get location details
      const location = await db
        .select({ id: locations.id, name: locations.name, content: locations.content })
        .from(locations)
        .where(eq(locations.id, locationId))
        .limit(1);

      if (!location[0]) {
        console.log(`⚠️ Location ${locationId} not found`);
        continue;
      }

      const loc = location[0];
      const audioScript = `Welcome to ${loc.name}. ${(loc.content || '').slice(0, 1500)}${(loc.content || '').length > 1500 ? '...' : ''}`;

      // Generate audio
      const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY!
        },
        body: JSON.stringify({
          text: audioScript,
          model_id: 'eleven_monolingual_v1',
          voice_settings: { stability: 0.5, similarity_boost: 0.5 }
        })
      });

      if (!response.ok) {
        console.log(`❌ ${loc.name}: API error ${response.status}`);
        continue;
      }

      const audioBuffer = Buffer.from(await response.arrayBuffer());
      const cleanName = loc.name.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-');
      const filename = `narration-${cleanName}`;

      // Save to database
      await db.insert(fileStorage).values({
        locationId: loc.id,
        filename: filename,
        mimeType: 'audio/mpeg',
        fileSize: audioBuffer.length,
        fileData: audioBuffer.toString('base64')
      });

      console.log(`✅ ${loc.name}: ${audioBuffer.length} bytes`);
      
      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));

    } catch (error) {
      console.log(`❌ Location ${locationId}: ${error}`);
    }
  }

  console.log('🎉 Batch audio generation complete!');
}

generateBatchAudio();