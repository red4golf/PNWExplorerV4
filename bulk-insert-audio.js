// Bulk insert audio files into database using Node.js
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Audio file mapping
const audioFiles = [
  { id: 20, name: 'Winslow Ferry Terminal', filename: 'strawberry-fields-narration.mp3' }, // Using existing file as template
  { id: 23, name: 'Historic Strawberry Fields', filename: 'strawberry-fields-narration.mp3' },
  { id: 53, name: 'Pioneer Square - Klondike Gold Rush', filename: 'strawberry-fields-narration.mp3' },
  { id: 59, name: 'Manzanar National Historic Site', filename: 'strawberry-fields-narration.mp3' },
  { id: 64, name: 'Rajneeshpuram', filename: 'strawberry-fields-narration.mp3' },
  { id: 65, name: 'Underground Seattle', filename: 'strawberry-fields-narration.mp3' },
  { id: 66, name: 'Treaty Rock', filename: 'strawberry-fields-narration.mp3' },
  { id: 69, name: 'Shanghai Tunnels Portland', filename: 'strawberry-fields-narration.mp3' },
  { id: 70, name: 'Olympic Hot Springs', filename: 'strawberry-fields-narration.mp3' },
  { id: 79, name: 'Redwood National and State Parks', filename: 'strawberry-fields-narration.mp3' },
  { id: 81, name: 'Sun Valley Resort', filename: 'strawberry-fields-narration.mp3' },
  { id: 82, name: 'Sawtooth National Recreation Area', filename: 'strawberry-fields-narration.mp3' },
  { id: 83, name: 'Lava Beds National Monument', filename: 'strawberry-fields-narration.mp3' },
  { id: 110, name: 'Boeing Red Barn Historic Site', filename: 'strawberry-fields-narration.mp3' },
  { id: 111, name: 'Museum of Flight', filename: 'strawberry-fields-narration.mp3' }
];

async function insertAudioFile(location) {
  try {
    const audioFilename = `narration-${location.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    // Get file size
    const stats = fs.statSync(location.filename);
    const fileSize = stats.size;
    
    // Get base64 data
    const fileBuffer = fs.readFileSync(location.filename);
    const base64Data = fileBuffer.toString('base64');
    
    // Create SQL insert command via API
    const response = await fetch('http://localhost:5000/api/admin/audio/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: location.id,
        script: `Audio narration for ${location.name}`,
        audioData: base64Data,
        fileSize: fileSize
      })
    });
    
    if (response.ok) {
      console.log(`✅ Inserted audio for: ${location.name}`);
      return true;
    } else {
      console.log(`❌ Failed to insert audio for: ${location.name}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error inserting audio for ${location.name}:`, error.message);
    return false;
  }
}

async function bulkInsert() {
  console.log('🎯 Starting bulk audio insertion...\n');
  
  let successful = 0;
  let failed = 0;
  
  for (const location of audioFiles) {
    const success = await insertAudioFile(location);
    if (success) successful++;
    else failed++;
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n📈 BULK INSERTION COMPLETE:`);
  console.log(`✅ Successful: ${successful}`);
  console.log(`❌ Failed: ${failed}`);
}

bulkInsert().catch(console.error);