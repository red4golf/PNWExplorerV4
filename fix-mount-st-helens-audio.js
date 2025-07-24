// Fix Mount St. Helens audio by directly calling the audio generation API
import fs from 'fs';

async function fixMountStHelensAudio() {
  try {
    console.log('🔧 Fixing Mount St. Helens audio...');
    
    // Read the corrected audio file
    const audioFile = fs.readFileSync('mount-st-helens-corrected.mp3');
    const base64Data = audioFile.toString('base64');
    
    // Call the API to regenerate audio for Mount St. Helens (location 56)
    const response = await fetch('http://localhost:5000/api/admin/audio/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: 56,
        script: 'Mount St. Helens National Volcanic Monument preserves the site of the most significant geological event in modern American history. On May 18, 1980, this Cascade volcano erupted with devastating force, removing 1,300 feet from its peak and creating the largest landslide in recorded history. The blast zone extended 19 miles northward, flattening 230 square miles of forest and killing 57 people. The eruption transformed understanding of volcanic processes and created a unique natural laboratory for studying ecological recovery. Today, visitors witness both natures destructive power and its remarkable ability to regenerate life from devastation.',
        audioData: base64Data
      })
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log('✅ Mount St. Helens audio corrected successfully');
      console.log('📁 New filename:', result.filename);
    } else {
      const errorText = await response.text();
      console.error('❌ Failed to fix audio:', response.status, errorText);
    }
  } catch (error) {
    console.error('❌ Error fixing Mount St. Helens audio:', error.message);
  }
}

fixMountStHelensAudio();