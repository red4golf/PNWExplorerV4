import { audioService } from './server/audio-service';
import { db } from './server/db';
import { locations } from './shared/schema';
import { eq } from 'drizzle-orm';
import * as fs from 'fs';
import * as path from 'path';

const NARRATION_SCRIPT = `Welcome to the Museum of Flight, the world's largest independent air and space museum, located at the edge of Seattle's historic Boeing Field.

What began in 1965 as a modest collection in a rented hangar has grown into one of humanity's most comprehensive tributes to the dream of flight. Today, over one hundred seventy-five aircraft and spacecraft fill these halls, each one a chapter in the remarkable story of how we conquered the sky.

At the heart of this institution sits the Boeing Red Barn, a humble wooden structure carefully relocated from its original Georgetown site. This is where it all began. In this unassuming building, William Boeing built his first aircraft in 1916, launching what would become one of the world's great aerospace companies. Standing inside, you can almost hear the sound of hand tools shaping wood and fabric into flying machines.

The Great Gallery, with its soaring glass walls and three and a half acres of exhibit space, houses aircraft spanning the entire history of powered flight. From fragile biplanes of the First World War to sleek supersonic jets, the evolution of aircraft design unfolds before you. The innovative suspension system allows these magnificent machines to be viewed from every angle, their forms appearing almost frozen in flight.

The museum's World War Two collection includes rare aircraft from all major combatant nations. A restored B-17 Flying Fortress stands as a testament to the Pacific Northwest's wartime manufacturing might, when tens of thousands of workers built the bombers that would help determine the outcome of the war.

Beyond our atmosphere, the space exploration galleries chart humanity's bold ventures into the cosmos. Authentic spacecraft, spacesuits, and artifacts from NASA's pioneering missions demonstrate how aviation's greatest minds turned their ambitions skyward, building on decades of atmospheric flight to reach for the stars.

But the Museum of Flight is more than a collection of historic machines. It is an educational institution dedicated to inspiring the next generation of pilots, engineers, and dreamers. Through hands-on programs, flight simulators, and encounters with aviation professionals, young visitors discover that the spirit of innovation that built these aircraft continues today.

The story of flight is the story of human ambition, ingenuity, and the refusal to accept limits. Every aircraft here represents countless hours of engineering, testing, and courage. From the Wright Brothers' first twelve-second flight to journeys beyond Earth's orbit, this museum preserves that legacy while inspiring those who will write its next chapters.`;

async function generateAudio() {
  console.log('🎙️ Generating Museum of Flight narration...');
  console.log(`📝 Script length: ${NARRATION_SCRIPT.split(' ').length} words`);
  
  try {
    const audioBuffer = await audioService.generateSpeech({
      text: NARRATION_SCRIPT,
      voice_id: '21m00Tcm4TlvDq8ikWAM',
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.65,
        similarity_boost: 0.8,
        style: 0.25,
        use_speaker_boost: true
      }
    });
    
    console.log(`✅ Audio generated: ${audioBuffer.length} bytes`);
    
    const uploadDir = path.join(process.cwd(), 'uploads', 'location-111');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const fileName = 'museum-of-flight-narration.mp3';
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, audioBuffer);
    console.log(`💾 Saved to: ${filePath}`);
    
    const audioUrl = `/api/files/location-111/${fileName}`;
    await db.update(locations)
      .set({ audioNarration: audioUrl })
      .where(eq(locations.id, 111));
    
    console.log(`📊 Database updated with audio URL: ${audioUrl}`);
    console.log('🎉 Complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

generateAudio();
