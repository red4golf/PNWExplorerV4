const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');

async function createAudioPreview() {
  console.log("🎵 Generating audio preview for Castillo de San Marcos...");
  
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("❌ ELEVENLABS_API_KEY not found");
    return;
  }

  // Short preview text from Castillo de San Marcos story
  const previewText = `Welcome to Castillo de San Marcos National Monument. Standing sentinel over Matanzas Bay for more than 350 years, this massive star-shaped fortress represents one of America's most remarkable architectural and military achievements. Built from native coquina stone between 1672 and 1695, this fortress tells the story of Spanish colonization and the birth of America's oldest continuously inhabited European settlement. The choice of coquina proved ingenious - unlike brick or stone that shatters under cannonball impact, coquina compressed and absorbed the blow, making the fortress virtually indestructible.`;
  
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'Xi-Api-Key': apiKey,
      },
      body: JSON.stringify({
        text: previewText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.6,
          similarity_boost: 0.8,
          style: 0.2,
          use_speaker_boost: true
        }
      }),
    });

    if (!response.ok) {
      console.error("❌ ElevenLabs API error:", response.status, await response.text());
      return;
    }

    const audioBuffer = Buffer.from(await response.arrayBuffer());
    
    // Ensure uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Save audio to uploads directory
    const audioPath = path.join(uploadsDir, 'castillo-preview.mp3');
    fs.writeFileSync(audioPath, audioBuffer);
    
    console.log("✅ Audio preview generated successfully!");
    console.log(`📊 Audio size: ${Math.round(audioBuffer.length / 1024)}KB`);
    console.log(`📊 Duration: ~${Math.round(previewText.length / 15)} seconds`);
    console.log(`🎧 Audio saved to: ${audioPath}`);
    console.log(`🌐 Access via: http://localhost:5000/uploads/castillo-preview.mp3`);
    
    return true;
    
  } catch (error) {
    console.error("❌ Error generating audio preview:", error.message);
    return false;
  }
}

createAudioPreview();