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

async function generateThirdBatch() {
  const locations = [
    {
      id: 79,
      name: 'Redwood National and State Parks',
      script: 'Redwood National and State Parks protect the tallest living things on Earth - ancient coast redwoods that have stood for over 2,000 years. These magnificent trees, some reaching heights of over 350 feet, represent one of the most successful conservation stories in American history. The coastal redwood forests once covered 2 million acres from central California to southern Oregon, but by the 1960s, logging had reduced them to just 120,000 acres. The Yurok, Hoopa, and other Native American tribes had lived sustainably among these giants for thousands of years, viewing them as sacred relatives rather than resources to exploit. The parks preserve not just trees, but entire ecosystems - from the misty forest floor carpeted with ferns to the canopy highways used by spotted owls and marbled murrelets. These ancient groves create their own climate, capturing fog and creating the perfect conditions for their continued growth. Walking among these towering giants is a humbling experience that connects us to both geological time and the wisdom of indigenous stewardship. The redwoods remind us that some things are more valuable standing than cut down, serving as living cathedrals that inspire reverence for the natural world.'
    },
    {
      id: 82,
      name: 'Sawtooth National Recreation Area',
      script: 'The Sawtooth National Recreation Area protects some of Idahos most spectacular wilderness, featuring jagged granite peaks that rise dramatically from pristine alpine valleys. These mountains, carved by ancient glaciers, create a landscape so stunning that early explorers called them the Alps of Idaho. The Sawtooth range contains over 40 peaks exceeding 10,000 feet, surrounding crystal-clear lakes that reflect the rugged summits like natural mirrors. This protected area represents the successful conservation of Americas wild spaces through the 1972 legislation that established the National Recreation Area system. Unlike national parks, recreation areas allow multiple uses while prioritizing conservation - hiking, fishing, hunting, and ranching coexist with wilderness protection. The Sawtooths have been home to Shoshone-Paiute peoples for thousands of years, who followed seasonal migrations through these mountains while hunting elk and gathering traditional foods. Today, this pristine wilderness offers visitors a chance to experience the American West as it existed before development, where wildlife roams freely and the night sky blazes with stars unpolluted by artificial light.'
    },
    {
      id: 81,
      name: 'Sun Valley Resort',
      script: 'Sun Valley Resort pioneered the American ski industry when it opened in 1936, becoming the worlds first destination ski resort designed specifically for winter recreation. Railroad baron Averell Harriman chose this remote Idaho location after conducting a global search for the perfect combination of snow conditions, terrain, and accessibility. The resort introduced revolutionary innovations including the worlds first chairlift, designed by railroad engineers who adapted mining equipment for mountain transportation. Within years, Sun Valley became a playground for Hollywood celebrities - stars like Clark Gable, Gary Cooper, and Marilyn Monroe transformed skiing from a regional activity into glamorous entertainment. The resort proved that winter tourism could be profitable, inspiring similar developments throughout the Rocky Mountains and establishing the template for modern ski resort design. During World War Two, the resort trained the 10th Mountain Division, elite soldiers who later returned to build ski areas across America. Sun Valley represents the transformation of winter from a season to endure into a season to enjoy, democratizing mountain recreation and creating an entire industry built around outdoor adventure and alpine lifestyle.'
    },
    {
      id: 64,
      name: 'Rajneeshpuram',
      script: 'Rajneeshpuram stands as one of the most controversial and fascinating social experiments in American history. In 1981, followers of the Indian guru Bhagwan Shree Rajneesh purchased a 64,000-acre ranch in remote eastern Oregon, establishing a commune that would challenge every convention of American religious and social life. Within four years, they had built a functioning city complete with its own airport, police force, and fire department, housing over 7,000 residents from around the world. The commune promoted radical ideas about spirituality, sexuality, and communal living that shocked conservative Oregon. Tensions escalated dramatically as the Rajneeshees attempted to gain political control of nearby Antelope, leading to armed confrontations and national media attention. The experiment collapsed spectacularly in 1985 when it was revealed that commune leaders had poisoned local restaurants with salmonella, wiretapped members, and stockpiled weapons. The Bhagwan was arrested and deported, ending one of the largest immigration raids in US history. Today, the site serves as a reminder of both the promise and peril of utopian communities, demonstrating how quickly social experiments can turn from idealism to extremism.'
    },
    {
      id: 20,
      name: 'Winslow Ferry Terminal',
      script: 'The Winslow Ferry Terminal serves as the historic gateway connecting Bainbridge Island to Seattle, representing over 70 years of daily commuter life and island identity. Since 1951, this terminal has witnessed countless arrivals and departures as island residents travel to work in Seattle while maintaining their connection to small-town life. The ferry ride itself became a ritual of transition - a 35-minute journey that separates the urban bustle of Seattle from the rural tranquility of Bainbridge Island. For decades, commuters have used this crossing to read, socialize, and decompress, creating a unique community of travelers who share daily boat rides regardless of weather or season. The terminal has also served as a window into Pacific Northwest history, as ferry passengers can observe the changing Seattle skyline, the working waterfront of Elliott Bay, and the natural beauty of Puget Sound. During World War Two, the terminal witnessed the painful departure of Japanese American families forced into internment camps, marking one of the islands darkest moments. Today, the Winslow Ferry Terminal continues to embody the Pacific Northwest lifestyle, where natural beauty and urban opportunity coexist, connected by the rhythmic passage of ferries across Puget Sounds blue waters.'
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

generateThirdBatch().then(() => {
  console.log('\n✅ Final batch of audio generation completed!');
}).catch(console.error);