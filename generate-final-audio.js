const AudioService = require('./server/audio-service.ts').default;
const fs = require('fs');
const path = require('path');

// Import database connection
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

async function generateFinalAudioBatch() {
  const audioService = new AudioService();
  
  const locations = [
    {
      id: 23,
      name: 'Historic Strawberry Fields',
      script: 'Historic Strawberry Fields represents the agricultural heritage that shaped the Pacific Northwest economy for over a century. These fertile fields, stretching across the Puget Sound region, became the foundation of Washington States berry industry in the early 1900s. Japanese American families were instrumental in developing innovative farming techniques that made strawberry cultivation profitable in the regions unique climate. The fields tell a story of immigration, innovation, and community resilience. During World War Two, many of these family farms were abandoned when Japanese Americans were forcibly relocated to internment camps, representing a profound loss to both families and the agricultural community. Today, these historic fields remind us of the vital contributions of immigrant farmers who helped build the Pacific Northwests agricultural legacy through hard work, technical expertise, and deep connection to the land.'
    },
    {
      id: 111,
      name: 'Museum of Flight',
      script: 'The Museum of Flight in Seattle stands as one of the worlds premier aviation museums, chronicling humanitys journey from the Wright brothers first flight to modern space exploration. Located on the original Boeing Field, this museum occupies a site where aviation history was literally made. The museum houses over 175 aircraft and spacecraft, from vintage biplanes to supersonic jets, each telling a story of innovation and courage. Seattles connection to aviation runs deep, with Boeing calling this region home since 1916. The museums Red Barn, Boeings original manufacturing facility, represents the birthplace of commercial aviation as we know it. Visitors can explore everything from the supersonic Concorde to NASA space shuttles, experiencing the evolution of human flight. The museum demonstrates how the Pacific Northwest became the epicenter of aerospace innovation, with engineers and visionaries pushing the boundaries of what seemed possible, transforming dreams of flight into the reality of modern aviation.'
    },
    {
      id: 53,
      name: 'Pioneer Square - Klondike Gold Rush',
      script: 'Pioneer Square and the Klondike Gold Rush National Historical Park commemorate one of Americas most dramatic economic transformations. In 1897, the steamship Portland arrived in Seattle carrying gold prospectors and over a ton of Klondike gold, instantly transforming this modest Pacific Northwest city into the gateway to Alaskan riches. Within months, Seattle became a boomtown as thousands of fortune seekers flocked here to purchase supplies and book passage north. Local merchants like the Nordstrom family and Frederick and Nelson built business empires outfitting prospectors with everything from boots to beans. The economic impact was staggering - Seattles population doubled in just two years. Though few prospectors actually struck it rich in the Klondike, Seattle merchants certainly did, using gold rush profits to build the foundations of modern Seattle. Today, Pioneer Square preserves this remarkable period when a distant gold discovery transformed a frontier town into a major American city.'
    },
    {
      id: 59,
      name: 'Manzanar National Historic Site',
      script: 'Manzanar National Historic Site stands as a powerful reminder of one of Americas most shameful chapters - the mass incarceration of Japanese Americans during World War Two. Located in Californias remote Owens Valley, Manzanar housed over 10,000 people behind barbed wire from 1942 to 1945. Families were given just days to abandon their homes, businesses, and lives, taking only what they could carry. The camp was built on ancient Paiute lands, adding another layer to this sites complex history of displacement. Despite harsh conditions - extreme temperatures, dust storms, and overcrowded barracks - internees created schools, gardens, newspapers, and art, demonstrating remarkable resilience. Many young men even volunteered for military service while their families remained imprisoned. Manzanar represents not just injustice, but also the strength of human dignity under impossible circumstances. Today, the preserved site ensures that this violation of civil liberties is never forgotten, serving as an eternal reminder that democracy requires constant vigilance to protect the rights of all people.'
    },
    {
      id: 69,
      name: 'Shanghai Tunnels Portland',
      script: 'Beneath the streets of Portland lies a network of tunnels that once served one of Americas most notorious criminal enterprises - shanghaiing. These underground passages, known as the Shanghai Tunnels, connected waterfront saloons and hotels to the Willamette River docks during the late 1800s and early 1900s. Ship captains desperate for crew members paid crimps - professional kidnappers - to provide sailors through any means necessary. Unsuspecting men would be drugged, knocked unconscious, or trapped in these tunnels, then sold to outbound ships. Portland became known as the most dangerous port in the world, where visitors could disappear without a trace. The tunnels also served Chinese immigrants who faced violent discrimination above ground, providing safe passage and underground businesses. Local legends claim thousands were shanghaied through these passages, though historians debate the exact numbers. Today, these tunnels represent a dark chapter in maritime history, where economic desperation and racial prejudice created an underground world of crime and survival.'
    }
  ];

  for (const location of locations) {
    try {
      console.log(`\n🎵 Generating audio for ${location.name}...`);
      
      const audioBuffer = await audioService.generateSpeech({
        text: location.script,
        voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      });

      const filename = `narration-${location.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      await storeAudioInDatabase(audioBuffer, filename, location.id);
      
      // Small delay to respect API limits
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error(`❌ Failed to generate audio for ${location.name}:`, error);
    }
  }
}

// Run the batch generation
generateFinalAudioBatch().then(() => {
  console.log('\n✅ First batch of audio generation completed!');
}).catch(console.error);