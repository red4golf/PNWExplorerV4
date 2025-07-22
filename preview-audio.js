// Simple audio preview using curl to test the working ElevenLabs integration
const { exec } = require('child_process');
const fs = require('fs');

console.log("🎵 Creating audio preview using ElevenLabs API...");

const testText = "Welcome to Castillo de San Marcos National Monument. Standing sentinel over Matanzas Bay for more than 350 years, this massive star-shaped fortress represents one of America's most remarkable architectural and military achievements. Built from native coquina stone between 1672 and 1695, this fortress tells the story of Spanish colonization and the birth of America's oldest continuously inhabited European settlement.";

// Use the ElevenLabs API directly
const apiKey = process.env.ELEVENLABS_API_KEY;
if (!apiKey) {
  console.error("❌ ELEVENLABS_API_KEY not found");
  process.exit(1);
}

const curlCommand = `curl -X POST "https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM" \
  -H "Accept: audio/mpeg" \
  -H "Content-Type: application/json" \
  -H "xi-api-key: ${apiKey}" \
  -d '${JSON.stringify({
    text: testText,
    model_id: "eleven_monolingual_v1",
    voice_settings: {
      stability: 0.6,
      similarity_boost: 0.8,
      style: 0.2,
      use_speaker_boost: true
    }
  })}' \
  --output ./uploads/florida-castillo-preview.mp3`;

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads', { recursive: true });
}

exec(curlCommand, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  // Check if file was created
  if (fs.existsSync('./uploads/florida-castillo-preview.mp3')) {
    const stats = fs.statSync('./uploads/florida-castillo-preview.mp3');
    console.log('✅ Audio preview created successfully!');
    console.log(`📊 Size: ${Math.round(stats.size / 1024)}KB`);
    console.log('🎧 Listen at: http://localhost:5000/uploads/florida-castillo-preview.mp3');
    console.log('\n🌟 This is a sample of what Florida Historical Explorer audio narration will sound like!');
  } else {
    console.error('❌ Failed to create audio file');
  }
});