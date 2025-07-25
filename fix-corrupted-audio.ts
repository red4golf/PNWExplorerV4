#!/usr/bin/env tsx

// Script to fix all corrupted audio files by regenerating them with ElevenLabs

import { db } from './server/db';
import { eq } from 'drizzle-orm';
import { locations } from './shared/schema';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVENLABS_API_URL = 'https://api.elevenlabs.io/v1/text-to-speech';
const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Rachel voice

async function generateAudioNarration(text: string, filename: string): Promise<Buffer> {
  console.log(`🎵 Generating audio for: ${filename}`);
  
  const response = await fetch(`${ELEVENLABS_API_URL}/${VOICE_ID}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': ELEVENLABS_API_KEY!,
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.8,
        style: 0.2,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
  }

  const audioBuffer = Buffer.from(await response.arrayBuffer());
  console.log(`✅ Generated ${audioBuffer.length} bytes for ${filename}`);
  
  // Verify the audio buffer starts with valid MP3 header
  if (audioBuffer.length > 4) {
    const header = audioBuffer.slice(0, 4);
    console.log(`🔍 Audio header: ${Array.from(header).map(b => b.toString(16).padStart(2, '0')).join(' ')}`);
  }
  
  return audioBuffer;
}

async function storeAudioInDatabase(locationId: number, filename: string, audioBuffer: Buffer): Promise<void> {
  const query = `
    INSERT INTO file_storage (filename, location_id, file_data, file_size, mime_type, uploaded_at)
    VALUES ($1, $2, $3, $4, $5, NOW())
    ON CONFLICT (location_id, filename) 
    DO UPDATE SET 
      file_data = EXCLUDED.file_data,
      file_size = EXCLUDED.file_size,
      uploaded_at = NOW()
  `;
  
  await db.execute({
    sql: query,
    args: [filename, locationId, audioBuffer, audioBuffer.length, 'audio/mpeg']
  });
  
  console.log(`💾 Stored ${filename} in database (${audioBuffer.length} bytes)`);
}

async function regenerateCorruptedAudio() {
  console.log('🚀 Starting corrupted audio regeneration...');
  
  if (!ELEVENLABS_API_KEY) {
    console.error('❌ ELEVENLABS_API_KEY not found in environment variables');
    process.exit(1);
  }

  try {
    // Get all locations that have content for audio generation
    const allLocations = await db.select().from(locations).where(eq(locations.status, 'approved'));
    
    console.log(`📍 Found ${allLocations.length} approved locations`);
    
    // Check which ones have corrupted audio
    const corruptedLocations = [];
    
    for (const location of allLocations) {
      // Check if audio exists and is corrupted
      const audioQuery = `
        SELECT filename, encode(SUBSTRING(file_data, 1, 4), 'escape') as header
        FROM file_storage 
        WHERE location_id = $1 AND filename LIKE '%narration%'
      `;
      
      const result = await db.execute({
        sql: audioQuery,
        args: [location.id]
      });
      
      if (result.rows.length > 0) {
        const header = result.rows[0].header as string;
        if (header === 'SUQz') {
          corruptedLocations.push(location);
          console.log(`🔧 Found corrupted audio for: ${location.name}`);
        }
      }
    }
    
    console.log(`❌ Found ${corruptedLocations.length} locations with corrupted audio`);
    
    // Regenerate audio for corrupted locations
    let successCount = 0;
    let errorCount = 0;
    
    for (const location of corruptedLocations.slice(0, 10)) { // Limit to 10 to avoid rate limits
      try {
        if (!location.content) {
          console.log(`⏭️ Skipping ${location.name} - no content available`);
          continue;
        }
        
        // Create audio narration script from the location content
        const narrationText = createNarrationScript(location.name, location.content);
        const filename = `narration-${location.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
        
        // Generate audio with ElevenLabs
        const audioBuffer = await generateAudioNarration(narrationText, filename);
        
        // Store in database
        await storeAudioInDatabase(location.id, filename, audioBuffer);
        
        successCount++;
        console.log(`✅ Successfully regenerated audio for: ${location.name}`);
        
        // Small delay to respect rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Failed to regenerate audio for ${location.name}:`, error);
      }
    }
    
    console.log(`\n🏁 Audio regeneration complete:`);
    console.log(`   ✅ Successfully regenerated: ${successCount} files`);
    console.log(`   ❌ Failed: ${errorCount} files`);
    console.log(`   📊 Total corrupted files found: ${corruptedLocations.length}`);
    
  } catch (error) {
    console.error('❌ Audio regeneration failed:', error);
    process.exit(1);
  }
}

function createNarrationScript(locationName: string, content: string): string {
  // Create a clean narration script from the markdown content
  const cleanContent = content
    .replace(/#+\s*/g, '') // Remove markdown headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold formatting
    .replace(/\*(.*?)\*/g, '$1') // Remove italic formatting
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove links, keep text
    .replace(/\n\s*\n/g, '\n\n') // Normalize line breaks
    .trim();
  
  // Limit to reasonable length for audio (about 500 words max)
  const words = cleanContent.split(/\s+/);
  const limitedContent = words.slice(0, 500).join(' ');
  
  return `Welcome to ${locationName}. ${limitedContent}`;
}

if (require.main === module) {
  regenerateCorruptedAudio().catch(console.error);
}

export { regenerateCorruptedAudio };