const fetch = require('node-fetch');
const { neon } = require('@neondatabase/serverless');
const db = neon(process.env.DATABASE_URL);

async function storeAudioInDatabase(audioBuffer, filename, locationId) {
  try {
    const base64Data = audioBuffer.toString('base64');
    const fileSize = audioBuffer.length;
    const mimeType = 'audio/mpeg';
    
    await db`
      INSERT INTO file_storage (filename, location_id, file_data, file_size, mime_type, uploaded_at)
      VALUES (${filename}, ${locationId}, ${base64Data}, ${fileSize}, ${mimeType}, NOW())
      ON CONFLICT (filename, location_id) DO UPDATE SET
        file_data = EXCLUDED.file_data,
        file_size = EXCLUDED.file_size,
        uploaded_at = NOW()
    `;
    
    console.log(`✅ Stored ${filename} for location ${locationId}: ${fileSize} bytes`);
  } catch (error) {
    console.error(`❌ Error storing ${filename}:`, error);
  }
}

async function generateAudio(text, voiceId = '21m00Tcm4TlvDq8ikWAM') {
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'Accept': 'audio/mpeg',
      'Content-Type': 'application/json',
      'xi-api-key': process.env.ELEVENLABS_API_KEY
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.buffer();
}

async function generateSecondBatch() {
  const locations = [
    {
      id: 66,
      name: 'Treaty Rock',
      script: 'Treaty Rock represents one of the most controversial chapters in Pacific Northwest history - the systematic dispossession of Native American lands through dubious treaty negotiations. Here, Washington Territorial Governor Isaac Stevens conducted treaty meetings with various Pacific Northwest tribes in the 1850s, using pressure tactics, misleading translations, and outright deception to secure tribal signatures. Stevens was under federal orders to clear Native title to vast territories for white settlement, regardless of tribal consent. The treaties promised reservations and guaranteed rights, but these promises were repeatedly broken. Many tribal leaders never understood what they were signing, as interpreters deliberately mistranslated crucial terms. The consequences were devastating - tribes lost millions of acres of ancestral homeland while receiving minimal compensation. Treaty Rock stands as a stark reminder of how legal documents were weaponized to justify theft on an enormous scale, representing not diplomacy but systematic cultural destruction disguised as legitimate governance.'
    },
    {
      id: 65,
      name: 'Underground Seattle',
      script: 'Beneath the streets of Pioneer Square lies Underground Seattle, a remarkable testament to human ingenuity and urban transformation. In the 1890s, city planners made the bold decision to raise downtown Seattle by up to 22 feet to solve persistent flooding problems and improve sanitation. Rather than demolish existing buildings, they built retaining walls around them and filled in the spaces, creating an entirely new street level above the original city. For years, businesses operated on both levels, with the underground serving as a secondary commercial district. The underground featured shops, hotels, and even opium dens, creating a shadow city beneath the respectable surface. As the decades passed, the underground was largely abandoned, becoming a forgotten relic of Seattles early engineering ambitions. Today, guided tours reveal this hidden world of brick archways, old storefronts, and sidewalks that once bustled with activity. Underground Seattle represents one of the most ambitious urban engineering projects in American history, demonstrating how cities can literally reinvent themselves.'
    },
    {
      id: 110,
      name: 'Boeing Red Barn Historic Site',
      script: 'The Boeing Red Barn historic site commemorates the birthplace of modern commercial aviation. In 1910, William Boeing established his first aircraft manufacturing facility in this simple wooden structure on the shores of Lake Union. Here, Boeing built his first airplane - the B&W Seaplane - launching an industry that would transform both Seattle and the world. The Red Barn witnessed the early experiments of aviation pioneers who believed that flight could become practical and profitable. During World War One, the facility expanded rapidly as Boeing produced training aircraft for the military. The company that started in this humble barn would eventually become the worlds largest aerospace manufacturer, creating iconic aircraft from the Model 40 mail plane to the 747 jumbo jet. Though the original Red Barn was relocated to the Museum of Flight for preservation, this site remains sacred ground in aviation history. The Boeing Red Barn represents the entrepreneurial spirit that made Seattle the global center of aerospace innovation, where dreams of flight became the foundation of a multi-billion dollar industry.'
    },
    {
      id: 83,
      name: 'Lava Beds National Monument',
      script: 'Lava Beds National Monument preserves both geological wonders and one of the most significant Native American resistance stories in the West. This rugged volcanic landscape, formed by ancient lava flows, became the stronghold of the Modoc people during their desperate fight for survival in 1872-1873. Led by Captain Jack, a small band of Modoc warriors used the natural lava tube caves and rocky fortresses to hold off the United States Army for months. The Modocs were fighting for their right to remain on their ancestral lands rather than be forced onto a reservation with their traditional enemies. The volcanic terrain provided perfect natural defenses - the Modocs knew every cave, tunnel, and hidden passage. Despite being vastly outnumbered, they inflicted heavy casualties on federal troops, including killing General Edward Canby during peace negotiations. The war ended tragically with Captain Jacks capture and execution. Today, visitors can explore the same lava tubes where Modoc families sheltered during the siege, experiencing both the raw power of volcanic geology and the courage of people fighting for their homeland.'
    },
    {
      id: 70,
      name: 'Olympic Hot Springs',
      script: 'Olympic Hot Springs represents the transformation of sacred Native American sites into commercial tourist destinations, and ultimately into protected wilderness. For thousands of years, the Klallam and other Olympic Peninsula tribes considered these natural hot springs sacred, using them for healing ceremonies and spiritual renewal. The mineral-rich waters, heated deep within the earth, were believed to possess powerful medicine. In the early 1900s, entrepreneurs built the Olympic Hot Springs Resort, complete with hotels, bathhouses, and even a swimming pool fed by the natural springs. Wealthy visitors traveled from Seattle and beyond to soak in the therapeutic waters and enjoy the pristine wilderness setting. The resort operated for decades, bringing both economic opportunity and environmental impact to the remote valley. When Olympic National Park was established in 1938, the resort was eventually removed to restore the area to its natural state. Today, the undeveloped hot springs still flow, but they represent our evolving understanding of wilderness preservation - the recognition that some places are too sacred and fragile for commercial development, and must be protected for future generations.'
    }
  ];

  for (const location of locations) {
    try {
      console.log(`\n🎵 Generating audio for ${location.name}...`);
      
      const audioBuffer = await generateAudio(location.script);
      const filename = `narration-${location.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      await storeAudioInDatabase(audioBuffer, filename, location.id);
      
      // Delay to respect API limits
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error) {
      console.error(`❌ Failed to generate audio for ${location.name}:`, error);
    }
  }
}

generateSecondBatch().then(() => {
  console.log('\n✅ Second batch of audio generation completed!');
}).catch(console.error);