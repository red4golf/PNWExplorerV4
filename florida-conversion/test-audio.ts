import { audioService } from "../server/audio-service";

// Test script to generate audio for Castillo de San Marcos
async function testAudioGeneration() {
  try {
    console.log("🎵 Testing ElevenLabs audio generation...");
    
    const locationName = "Castillo de San Marcos National Monument";
    const content = `# Castillo de San Marcos: Fortress of the First Coast

Standing sentinel over Matanzas Bay for more than 350 years, Castillo de San Marcos represents one of America's most remarkable architectural and military achievements. This massive star-shaped fortress, built from native coquina stone, tells the story of Spanish colonization, military engineering, and the birth of the oldest continuously inhabited European-established settlement in the continental United States.

## Spanish Engineering Marvel

Construction began in 1672 under Spanish military engineer Ignacio Daza, replacing earlier wooden fortifications that had failed to protect St. Augustine from British raids. The fortress took 23 years to complete, employing both Spanish craftsmen and enslaved African laborers who quarried and shaped millions of tons of coquina—a unique shell-stone found only along Florida's coast.

The choice of coquina proved ingenious. Unlike brick or traditional stone that shatters under cannonball impact, coquina compressed and absorbed the blow, making the fortress virtually indestructible. British cannonballs literally bounced off or buried themselves harmlessly in the soft, porous walls.`;

    const audioBuffer = await audioService.generateHistoricalNarration(locationName, content);
    
    console.log("✅ Audio generation successful!");
    console.log(`📊 Audio size: ${Math.round(audioBuffer.length / 1024)}KB`);
    console.log(`📊 Estimated duration: ${Math.round(audioBuffer.length / 32000)}-${Math.round(audioBuffer.length / 16000)} seconds`);
    
    // Save test audio file
    import fs from 'fs';
    fs.writeFileSync('/tmp/test-castillo-narration.mp3', audioBuffer);
    console.log("🎧 Test audio saved to /tmp/test-castillo-narration.mp3");
    
    return true;
  } catch (error) {
    console.error("❌ Audio generation failed:", error);
    return false;
  }
}

testAudioGeneration().then(success => {
  console.log(success ? "🎉 Audio test completed successfully!" : "💥 Audio test failed");
  process.exit(success ? 0 : 1);
});