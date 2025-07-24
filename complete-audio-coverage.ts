import { audioService } from './server/audio-service';
import { db } from './server/db';

// Audio scripts for the remaining 15 locations without audio narration
const audioScripts: Record<number, string> = {
  23: "Historic Strawberry Fields represents the agricultural heritage that shaped the Pacific Northwest economy for over a century. These fertile fields, stretching across the Puget Sound region, became the foundation of Washington State's berry industry in the early 1900s. Japanese American families were instrumental in developing innovative farming techniques that made strawberry cultivation profitable in the region's unique climate. The fields tell a story of immigration, innovation, and community resilience. During World War Two, many of these family farms were abandoned when Japanese Americans were forcibly relocated to internment camps, representing a profound loss to both families and the agricultural community. Today, these historic fields remind us of the vital contributions of immigrant farmers who helped build the Pacific Northwest's agricultural legacy through hard work, technical expertise, and deep connection to the land.",
  
  33: "The Museum of Flight in Seattle stands as one of the world's premier aviation museums, chronicling humanity's journey from the Wright brothers' first flight to modern space exploration. Located on the original Boeing Field, this museum occupies a site where aviation history was literally made. The museum houses over 175 aircraft and spacecraft, from vintage biplanes to supersonic jets, each telling a story of innovation and courage. Seattle's connection to aviation runs deep, with Boeing calling this region home since 1916. The museum's Red Barn, Boeing's original manufacturing facility, represents the birthplace of commercial aviation as we know it. Visitors can explore everything from the supersonic Concorde to NASA space shuttles, experiencing the evolution of human flight. The museum demonstrates how the Pacific Northwest became the epicenter of aerospace innovation, with engineers and visionaries pushing the boundaries of what seemed possible, transforming dreams of flight into the reality of modern aviation.",
  
  53: "Pioneer Square and the Klondike Gold Rush National Historical Park commemorate one of America's most dramatic economic transformations. In 1897, the steamship Portland arrived in Seattle carrying gold prospectors and over a ton of Klondike gold, instantly transforming this modest Pacific Northwest city into the gateway to Alaskan riches. Within months, Seattle became a boomtown as thousands of fortune seekers flocked here to purchase supplies and book passage north. Local merchants like the Nordstrom family and Frederick and Nelson built business empires outfitting prospectors with everything from boots to beans. The economic impact was staggering - Seattle's population doubled in just two years. Though few prospectors actually struck it rich in the Klondike, Seattle merchants certainly did, using gold rush profits to build the foundations of modern Seattle. Today, Pioneer Square preserves this remarkable period when a distant gold discovery transformed a frontier town into a major American city.",
  
  35: "Manzanar National Historic Site stands as a solemn reminder of one of America's darkest chapters in civil liberties. Located in California's Owens Valley, Manzanar was one of ten concentration camps where over 110,000 Japanese Americans were forcibly relocated during World War Two. Behind barbed wire and guard towers, entire families lost their homes, businesses, and freedom based solely on their ancestry. The camp housed over 10,000 people in harsh desert conditions, where internees worked to create a community despite the injustice of their imprisonment. Many of the imprisoned families had deep roots in the Pacific Northwest, particularly in farming communities around Seattle and the Oregon coast. Manzanar represents the constitutional crisis that occurred when fear overcame justice, and American citizens were imprisoned without trial. Today, the preserved site serves as both a memorial to those who suffered and a powerful reminder of the importance of protecting civil liberties for all Americans, regardless of their background.",
  
  38: "Shanghai Tunnels beneath Portland's Old Town tell the dark tale of maritime crime and forced labor that plagued the Pacific Northwest in the late 1800s and early 1900s. These underground passages, connecting basement levels of hotels, saloons, and boardinghouses, became notorious for the practice of 'shanghaiing' - kidnapping unsuspecting men to serve as crew members on merchant ships. Portland's location as a major port made it a prime location for this criminal enterprise, where ship captains desperate for crew members would pay crimps to provide sailors by any means necessary. Victims were often drugged in waterfront saloons, dropped through trapdoors into the tunnels below, and held until ships were ready to depart. The tunnels also served the city's thriving opium trade and housed Chinese immigrants in cramped, dangerous conditions. These underground spaces reveal the lawless side of Portland's maritime economy, where human trafficking flourished in the shadows of legitimate commerce, showing how the city's rapid growth came at a terrible human cost.",
  
  47: "Treaty Rock on the Muckleshoot Reservation marks a sacred place where indigenous peoples gathered for centuries to discuss important matters affecting their communities. This natural formation served as a neutral meeting ground where different tribes would come together to negotiate agreements, resolve disputes, and maintain relationships across tribal boundaries. The rock represents the sophisticated diplomatic traditions of Pacific Northwest indigenous peoples, who developed complex systems of governance and inter-tribal cooperation long before European contact. When American territorial officials arrived in the 1850s, they chose this respected gathering place to negotiate treaties with local tribes, understanding its significance in indigenous culture. However, many of these treaties were later broken or ignored by the federal government, leading to decades of legal battles over land rights and sovereignty. Today, Treaty Rock stands as both a symbol of indigenous diplomatic wisdom and a reminder of the ongoing struggle for tribal rights and recognition. The site represents the continuity of indigenous governance and the importance of honoring agreements between nations.",
  
  48: "Underground Seattle reveals the remarkable engineering story of how a city literally raised itself from the ashes. After the Great Seattle Fire of 1889 destroyed much of the downtown core, city planners decided to solve multiple problems simultaneously - frequent flooding from high tides, inadequate sewage systems, and the need for rapid reconstruction. Rather than rebuild at street level, they chose to raise the entire downtown area by 12 feet, creating a new ground level above the original city. As new buildings rose with their main floors at the elevated level, the original street level became a network of underground sidewalks and storefronts that operated for several years. Eventually, these spaces were abandoned as the elevated streets became the new norm, creating a buried city beneath downtown Seattle. The underground passages preserved a unique snapshot of late 19th-century architecture and urban life. Today, guided tours through these preserved underground spaces reveal the ambitious civic engineering project that allowed Seattle to reinvent itself, demonstrating the innovative spirit that has defined the city's response to challenges throughout its history.",
  
  50: "Boeing's Red Barn stands as the birthplace of commercial aviation, where William Boeing's Pacific Aero Products Company began building airplanes in 1916. This humble wooden structure on the shores of Lake Union witnessed the creation of Boeing's first aircraft, the B&W seaplane, launching what would become the world's largest aerospace company. During World War One, the company built training planes for the Navy, establishing Boeing's reputation for quality and innovation. The Red Barn represents the entrepreneurial spirit that transformed Seattle into the global center of aerospace manufacturing. Here, Boeing pioneered manufacturing techniques that revolutionized aircraft production, moving from handcrafted planes to mass production methods. The building's simple construction belies its historical importance - this is where modern commercial aviation began, where engineers and craftsmen developed the technologies that would eventually carry millions of passengers safely across the globe. Today, the preserved Red Barn at the Museum of Flight reminds visitors that the aerospace industry that defines the Pacific Northwest economy started with visionaries working in a simple wooden building beside a Seattle lake.",
  
  57: "Lava Beds National Monument preserves both geological wonders and the site of the Modoc War, one of the most significant conflicts between the U.S. Army and Native American tribes in the Pacific Northwest. The monument's rugged landscape of lava tube caves and volcanic formations provided a natural fortress for Captain Jack and his band of Modoc warriors, who used their intimate knowledge of the terrain to resist federal forces for months in 1872-1873. The Modoc people had been forced from their traditional homeland around Tule Lake to a reservation in Oregon, but conditions were so harsh that Captain Jack led his followers back to their ancestral territory. The resulting conflict demonstrated both the strategic brilliance of indigenous military tactics and the determination of Native peoples to defend their homeland. The lava tubes that provided shelter during the war also tell the geological story of massive volcanic eruptions that shaped the region thousands of years ago. Today, visitors can explore the same caves where Modoc families sought refuge, gaining understanding of both the area's violent geological past and the tragic human conflicts that occurred when different cultures and nations competed for control of this remarkable landscape.",
  
  60: "Olympic Hot Springs represents the sacred waters that have drawn people to the Olympic Peninsula for thousands of years. Long before European settlement, indigenous peoples considered these natural thermal pools sacred healing places, traveling great distances to experience their therapeutic properties. The springs emerge from deep underground at temperatures reaching 138 degrees Fahrenheit, created by geothermal processes that tap into the Earth's internal heat. In the early 1900s, entrepreneurs built the Olympic Hot Springs Resort, making these remote healing waters accessible to visitors from across the Pacific Northwest. The resort featured elaborate bath houses and accommodations, attracting guests seeking relief from various ailments. However, when Olympic National Park was established in 1938, the resort was gradually phased out to preserve the area's wilderness character. The springs now exist in their natural state, accessible only to hikers willing to make the journey through old-growth forest. The site represents the ongoing tension between development and preservation that defines much of the Pacific Northwest, where natural wonders are protected as both sacred indigenous sites and public wilderness areas.",
  
  61: "Redwood National and State Parks protect the tallest trees on Earth and represent one of conservation's greatest success stories in the Pacific Northwest region. These ancient coast redwoods, some over 2,000 years old and reaching heights of 380 feet, create cathedral-like groves that have inspired wonder and reverence for generations. The trees survived ice ages, fires, and floods, but nearly fell to the logging industry in the 20th century. By the 1960s, 90% of old-growth redwood forests had been cut down, leading to a fierce conservation battle between environmentalists and timber companies. The establishment of Redwood National Park in 1968 came just in time to save the remaining groves from destruction. The park protects not just trees, but entire ecosystems including elk herds, old-growth understory plants, and coastal rivers that support salmon runs. Native American tribes, particularly the Yurok people, consider these forests sacred and continue to practice traditional ceremonies among the ancient trees. The parks demonstrate how determined conservation efforts can preserve irreplaceable natural treasures, ensuring that future generations can experience the humbling presence of trees that were ancient when European explorers first reached the Pacific Coast.",
  
  62: "Sawtooth National Recreation Area showcases the wild heart of Idaho, where jagged granite peaks rise dramatically above pristine alpine lakes and meadows. This protected landscape preserves some of the most spectacular mountain scenery in the Pacific Northwest, with over 40 peaks exceeding 10,000 feet in elevation. The Sawtooth Mountains earned their name from their distinctive serrated ridgeline, carved by glaciers over millions of years. The area provides critical habitat for wildlife including elk, mountain goats, black bears, and one of the largest populations of chinook salmon in the region. The Salmon River, known as the 'River of No Return,' flows through the recreation area, offering some of the most challenging whitewater rafting in North America. Native American tribes, including the Shoshone-Paiute, have traveled through these mountains for thousands of years, following seasonal hunting and gathering patterns. The recreation area balances wilderness preservation with public access, allowing visitors to experience the same pristine mountain environment that has captivated people for millennia. The Sawtooths represent the untamed wilderness that once characterized much of the American West, now protected as a refuge for both wildlife and the human spirit seeking connection with nature.",
  
  63: "Sun Valley Resort revolutionized winter recreation and launched the modern ski industry in America when it opened in 1936. Railroad magnate Averell Harriman chose this Idaho location after an extensive search for the perfect combination of reliable snow, sunshine, and dramatic mountain scenery. Harriman hired Austrian count Felix Schaffgotsch to design the resort, bringing European alpine traditions to the American West. Sun Valley introduced the world's first chairlift, an innovation that transformed skiing from an arduous uphill trek into an accessible recreational activity. The resort quickly became a playground for Hollywood celebrities and wealthy Americans, with stars like Gary Cooper, Marilyn Monroe, and Ernest Hemingway making it their winter retreat. Hemingway particularly loved the area, eventually making it his permanent home and writing some of his most famous works here. Sun Valley's success sparked the development of ski resorts throughout the western United States, creating a new industry that brought economic prosperity to mountain communities. The resort represents the transformation of the American West from a region focused on mining and ranching to one that could market its natural beauty and recreational opportunities to visitors from around the world.",
  
  66: "Rajneeshpuram represents one of the most controversial social experiments in Pacific Northwest history, when followers of Indian guru Bhagwan Shree Rajneesh established a utopian city in remote eastern Oregon. In 1981, the group purchased the 64,000-acre Big Muddy Ranch and began building what they envisioned as a model sustainable community. Within a few years, Rajneeshpuram boasted a population of several thousand residents, complete with its own schools, businesses, fire department, and police force. The community pioneered ecological innovations including organic farming, renewable energy systems, and experimental architecture designed to harmonize with the high desert environment. However, the presence of the Rajneeshees created intense conflict with neighboring communities and Oregon state government, fueled by cultural differences, land use disputes, and suspicion of the group's unconventional lifestyle. The situation escalated into criminal activities by some community leaders, including the first bioterror attack in U.S. history when followers poisoned salad bars in The Dalles to influence local elections. The experiment ended in 1985 when the guru left the country and the community disbanded. Rajneeshpuram's legacy raises complex questions about religious freedom, cultural tolerance, and the limits of utopian communities in American society.",
  
  86: "Winslow Ferry Terminal on Bainbridge Island serves as the vital maritime link connecting island communities to Seattle, maintaining a transportation tradition that dates back to the late 1800s. Before the ferry system, Native American canoes and steamboats provided the primary means of transportation across Puget Sound's waters. The modern ferry route, established in the 1950s, transformed Bainbridge Island from a remote logging and farming community into a commuter suburb for Seattle professionals. The 35-minute ferry ride offers passengers spectacular views of the Seattle skyline, Mount Rainier, and the Olympic Mountains, making the daily commute a scenic journey that many consider one of the region's great pleasures. The terminal itself represents the engineering challenges of operating a reliable transportation system across the unpredictable waters of Puget Sound, where strong currents, storms, and fog can disrupt service. Washington State Ferries, which operates this route, runs one of the largest ferry systems in the United States, serving communities throughout the Puget Sound region. The Winslow terminal embodies the maritime culture that defines much of Pacific Northwest life, where boats remain essential for connecting communities separated by the region's complex geography of islands, peninsulas, and inland seas."
};

// Get locations that need audio narration
async function getLocationsNeedingAudio() {
  try {
    const query = `
      SELECT DISTINCT l.id, l.name, l.category
      FROM locations l
      WHERE l.status = 'approved' 
      AND l.id NOT IN (
        SELECT DISTINCT location_id 
        FROM file_storage 
        WHERE filename LIKE 'narration-%'
        AND location_id IS NOT NULL
      )
      ORDER BY l.id;
    `;
    
    const result = await db.raw(query);
    return result.rows || result; // Handle different database drivers
  } catch (error) {
    console.error('Database query failed:', error);
    return [];
  }
}

// Generate and save audio narration
async function generateAudioForLocation(locationId: number, locationName: string, script: string) {
  try {
    console.log(`🎵 Generating audio for: ${locationName}`);
    
    const audioBuffer = await audioService.generateSpeech({
      text: script,
      voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
      model_id: 'eleven_monolingual_v1',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
        style: 0.0,
        use_speaker_boost: true
      }
    });

    // Generate filename
    const audioFilename = `narration-${locationName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    
    // Save to database storage
    const base64Data = audioBuffer.toString('base64');
    const fileSize = audioBuffer.length;
    const mimeType = 'audio/mpeg';
    
    await db.raw(`
      INSERT INTO file_storage (filename, location_id, file_data, file_size, mime_type, uploaded_at)
      VALUES (?, ?, ?, ?, ?, NOW())
      ON CONFLICT (filename, location_id) DO UPDATE SET
        file_data = EXCLUDED.file_data,
        file_size = EXCLUDED.file_size,
        uploaded_at = NOW()
    `, [audioFilename, locationId, base64Data, fileSize, mimeType]);

    console.log(`✅ Audio saved: ${audioFilename} (${Math.round(fileSize/1024)}KB)`);
    return { success: true, filename: audioFilename, size: fileSize };
  } catch (error) {
    console.error(`❌ Failed to generate audio for ${locationName}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Main execution function
async function completeAudioCoverage() {
  console.log('🎯 Starting complete audio coverage process...\n');
  
  try {
    const locationsNeedingAudio = await getLocationsNeedingAudio();
    console.log(`📊 Found ${locationsNeedingAudio.length} locations needing audio narration:\n`);
    
    locationsNeedingAudio.forEach((loc: any) => {
      console.log(`- ID ${loc.id}: ${loc.name} (${loc.category})`);
    });
    
    console.log('\n🎵 Beginning audio generation...\n');
    
    const results = [];
    for (const location of locationsNeedingAudio) {
      const script = audioScripts[location.id];
      if (script) {
        const result = await generateAudioForLocation(location.id, location.name, script);
        results.push({ location: location.name, ...result });
        
        // Add delay to respect API rate limits
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log(`⚠️  No script found for location ID ${location.id}: ${location.name}`);
        results.push({ location: location.name, success: false, error: 'No script provided' });
      }
    }
    
    // Final statistics
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    
    console.log('\n📈 AUDIO GENERATION COMPLETE:');
    console.log(`✅ Successful: ${successful}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total processed: ${results.length}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed locations:');
      results.filter(r => !r.success).forEach(r => {
        console.log(`- ${r.location}: ${r.error}`);
      });
    }
    
    // Check final coverage
    const finalStats = await db.raw(`
      SELECT 
        COUNT(DISTINCT l.id) as total_locations,
        COUNT(DISTINCT fs.location_id) as locations_with_audio,
        ROUND(100.0 * COUNT(DISTINCT fs.location_id) / COUNT(DISTINCT l.id), 1) as coverage_percent
      FROM locations l
      LEFT JOIN file_storage fs ON l.id = fs.location_id AND fs.filename LIKE 'narration-%'
      WHERE l.status = 'approved'
    `);
    
    const stats = finalStats.rows?.[0] || finalStats[0];
    console.log(`\n🎯 FINAL AUDIO COVERAGE: ${stats.coverage_percent}% (${stats.locations_with_audio}/${stats.total_locations} locations)`);
    
    if (stats.coverage_percent >= 100) {
      console.log('\n🎉 100% AUDIO COVERAGE ACHIEVED! 🎉');
    }
    
  } catch (error) {
    console.error('❌ Process failed:', error);
  }
}

// Run the script
completeAudioCoverage().catch(console.error);