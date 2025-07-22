const fetch = require('node-fetch');

async function testElevenLabsAudio() {
  console.log("🎵 Testing ElevenLabs with simple script...");
  
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) {
    console.error("❌ ELEVENLABS_API_KEY not found");
    return;
  }

  const text = "Welcome to Castillo de San Marcos. Standing sentinel over Matanzas Bay for more than 350 years, this massive star-shaped fortress represents one of America's most remarkable architectural achievements.";
  
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'Xi-Api-Key': apiKey,
      },
      body: JSON.stringify({
        text: text,
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
    console.log("✅ Audio generated successfully!");
    console.log(`📊 Audio size: ${Math.round(audioBuffer.length / 1024)}KB`);
    
    // Save to filesystem
    const fs = require('fs');
    fs.writeFileSync('/tmp/test-castillo.mp3', audioBuffer);
    console.log("🎧 Test audio saved to /tmp/test-castillo.mp3");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

testElevenLabsAudio();