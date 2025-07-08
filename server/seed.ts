import { db } from "./db";
import { locations, admins, photos } from "@shared/schema";

async function seedPhotos() {
  console.log("🖼️ Initializing photo system...");
  const existingPhotos = await db.select().from(photos).limit(1);
  
  if (existingPhotos.length > 0) {
    console.log("✓ Photos exist in database, photo system ready");
    return;
  }
  
  console.log("📸 Setting up initial demo photos (real uploads will replace these)...");
  // Only add initial demo photos if none exist - these will be replaced by real uploads
  // Create initial real upload demos using our test files
  await db.insert(photos).values([
    { locationId: 33, filename: '/uploads/test-upload.jpg', caption: 'Fort Clatsop National Memorial - Historic reconstruction' },
    { locationId: 50, filename: '/uploads/test-upload.svg', caption: 'Pia the Peacekeeper demonstration photo' },
  ]).onConflictDoNothing();
  console.log("✅ Initial demo photos created - ready for real uploads!");
}

async function seed() {
  try {
    console.log("Seeding database...");

    // Create default admin for beta release
    await db.insert(admins).values({
      email: "admin@pnwhistory.org",
      password: "PNWHistoryBeta2025!", // Secure password for beta release
    }).onConflictDoNothing();

    // Insert sample historical locations
    await db.insert(locations).values([
      {
        name: "Winslow Ferry Terminal",
        description: "The historic gateway to Bainbridge Island, serving as the primary connection to Seattle since 1951. This terminal has witnessed countless arrivals and departures, connecting island residents to the mainland for over 70 years.",
        address: "Winslow Way NE, Bainbridge Island, WA",
        latitude: 47.6262,
        longitude: -122.5194,
        category: "Transportation Hub",
        period: "Established 1951",
        submitterName: "Island Historical Society",
        submitterEmail: "info@bainbridgehistory.org",
        status: "approved",
      },
      {
        name: "Japanese American Exclusion Memorial",
        description: "A powerful reminder of the forced removal of Japanese Americans during World War II. This memorial honors the 276 Japanese Americans who were forced to leave Bainbridge Island on March 30, 1942, the first community in the United States to be removed under Executive Order 9066.",
        address: "4192 Eagle Harbor Dr NE, Bainbridge Island, WA",
        latitude: 47.6244,
        longitude: -122.5075,
        category: "Memorial Site",
        period: "Dedicated 2011",
        submitterName: "Bainbridge Island Japanese American Community",
        submitterEmail: "info@bijac.org",
        status: "approved",
      },
      {
        name: "Point No Point Lighthouse",
        description: "Standing guard over Puget Sound since 1879, this lighthouse has guided vessels safely through treacherous waters for over 140 years. Built to mark the entrance to Port Gamble Bay, it remains an active aid to navigation.",
        address: "9009 Point No Point Rd NE, Hansville, WA",
        latitude: 47.9119,
        longitude: -122.5264,
        category: "Maritime Heritage",
        period: "Built 1879",
        submitterName: "U.S. Coast Guard Auxiliary",
        submitterEmail: "lighthouse@uscgaux.org",
        status: "approved",
      },
      {
        name: "Historic Strawberry Fields",
        description: "Once the heart of the island's agricultural economy, these fields tell the story of immigrant farmers who helped build Bainbridge Island's prosperity. Japanese American families were particularly prominent in strawberry farming before World War II.",
        address: "Various locations throughout Bainbridge Island",
        latitude: 47.6307,
        longitude: -122.5651,
        category: "Agricultural Heritage",
        period: "1900s-1940s",
        submitterName: "Bainbridge Island Historical Museum",
        submitterEmail: "curator@bainbridgehistory.org",
        status: "approved",
      },
      {
        name: "Port Blakely Mill Site",
        description: "Once the world's largest lumber mill, this site was the economic engine of early Bainbridge Island. The mill employed hundreds of workers and produced lumber that helped build cities across the Pacific Northwest and beyond.",
        address: "Port Blakely area, Bainbridge Island, WA",
        latitude: 47.5900,
        longitude: -122.5017,
        category: "Industrial Heritage",
        period: "1864-1922",
        submitterName: "Port Blakely Heritage Society",
        submitterEmail: "heritage@portblakely.org",
        status: "approved",
      },
      {
        name: "Suquamish Tribal Grounds",
        description: "Sacred grounds of the Suquamish Tribe, the original inhabitants of this land for thousands of years. These grounds hold deep cultural significance and represent the continuous presence of indigenous peoples in the region.",
        address: "Suquamish, WA",
        latitude: 47.7311,
        longitude: -122.5556,
        category: "Indigenous Heritage",
        period: "Ancient - Present",
        submitterName: "Suquamish Tribe",
        submitterEmail: "cultural@suquamish.nsn.us",
        status: "approved",
      },
      // Oregon locations
      {
        name: "Crater Lake National Park",
        description: "Formed by the collapse of Mount Mazama around 7,700 years ago, Crater Lake is one of the most pristine and deepest lakes in the world. The lake sits within the caldera of the ancient volcano and is renowned for its deep blue color and crystal-clear water.",
        address: "Crater Lake National Park, OR",
        latitude: 42.9446,
        longitude: -122.1090,
        category: "Natural Heritage",
        period: "Formed ~7,700 years ago",
        submitterName: "National Park Service",
        submitterEmail: "info@nps.gov",
        status: "approved",
      },
      {
        name: "Oregon Trail Interpretive Center",
        description: "Commemorating the historic Oregon Trail that brought thousands of pioneers to the Pacific Northwest between 1841 and 1869. This interpretive center preserves the story of the 2,000-mile journey that shaped the settlement of the American West.",
        address: "22267 OR-86, Baker City, OR",
        latitude: 44.7596,
        longitude: -117.8311,
        category: "Historic Landmark",
        period: "1841-1869",
        submitterName: "Bureau of Land Management",
        submitterEmail: "interpretive@blm.gov",
        status: "approved",
      },
      {
        name: "Multnomah Falls",
        description: "Oregon's most visited natural recreation site, this 620-foot waterfall has been a sacred place for indigenous peoples for thousands of years. The falls cascade in two major steps down the basalt cliffs of the Columbia River Gorge.",
        address: "Columbia River Gorge, OR",
        latitude: 45.5762,
        longitude: -122.1158,
        category: "Natural Heritage",
        period: "Ancient - Present",
        submitterName: "US Forest Service",
        submitterEmail: "gorge@fs.fed.us",
        status: "approved",
      },
      // Idaho locations
      {
        name: "Craters of the Moon National Monument",
        description: "A vast ocean of lava flows with scattered islands of cinder cones and sagebrush. This unique volcanic landscape was formed by eruptions along the Great Rift between 15,000 and 2,000 years ago, creating one of the best-preserved flood basalt areas in the continental United States.",
        address: "Craters of the Moon National Monument, ID",
        latitude: 43.2081,
        longitude: -113.5163,
        category: "Natural Heritage",
        period: "Formed 15,000-2,000 years ago",
        submitterName: "National Park Service",
        submitterEmail: "crmo@nps.gov",
        status: "approved",
      },
      {
        name: "Nez Perce National Historical Park",
        description: "Preserving the history and culture of the Nez Perce people, this park encompasses 38 sites across four states. The Nez Perce lived in the region for thousands of years before European contact and played a crucial role in the Lewis and Clark expedition.",
        address: "Spalding, ID",
        latitude: 46.4431,
        longitude: -116.8267,
        category: "Indigenous Heritage",
        period: "Ancient - Present",
        submitterName: "National Park Service",
        submitterEmail: "nepe@nps.gov",
        status: "approved",
      },
      // Additional Washington locations
      {
        name: "Mount Rainier National Park",
        description: "Dominated by the massive stratovolcano Mount Rainier, this park preserves pristine wilderness and serves as a natural laboratory for studying volcanic processes. The mountain, known as Tahoma to local indigenous peoples, is an active volcano and the most glaciated peak in the contiguous United States.",
        address: "Mount Rainier National Park, WA",
        latitude: 46.8800,
        longitude: -121.7269,
        category: "Natural Heritage",
        period: "Established 1899",
        submitterName: "National Park Service",
        submitterEmail: "mora@nps.gov",
        status: "approved",
      },
      {
        name: "Pike Place Market",
        description: "Opened in 1907, Pike Place Market is one of the oldest continuously operated public farmers' markets in the United States. It has been the heart of Seattle's food scene for over a century and continues to be a vibrant marketplace for local farmers, craftspeople, and small businesses.",
        address: "85 Pike St, Seattle, WA",
        latitude: 47.6097,
        longitude: -122.3331,
        category: "Cultural Site",
        period: "Established 1907",
        submitterName: "Pike Place Market Foundation",
        submitterEmail: "info@pikeplacemarket.org",
        status: "approved",
      },
      // Additional diverse Pacific Northwest locations
      {
        name: "Fort Clatsop National Memorial",
        description: "The winter quarters of the Lewis and Clark Expedition in 1805-1806. This replica fort commemorates where the Corps of Discovery spent their most challenging winter, enduring constant rain and establishing trade relationships with local Clatsop and Chinook peoples.",
        address: "92343 Fort Clatsop Rd, Astoria, OR",
        latitude: 46.1351,
        longitude: -123.8786,
        category: "Historic Landmark",
        period: "1805-1806",
        submitterName: "National Park Service",
        submitterEmail: "lewi@nps.gov",
        status: "approved",
      },
      {
        name: "Columbia River Gorge",
        description: "A spectacular river canyon cutting through the Cascade Mountain Range, forming the boundary between Washington and Oregon. This area has been a vital transportation corridor for thousands of years, from Native American trade routes to the modern Interstate 84.",
        address: "Columbia River Gorge, OR/WA",
        latitude: 45.6769,
        longitude: -121.5203,
        category: "Natural Heritage",
        period: "Ancient - Present",
        submitterName: "Columbia River Gorge Commission",
        submitterEmail: "info@gorgecommission.org",
        status: "approved",
      },
      {
        name: "Bonneville Dam",
        description: "Completed in 1938, this massive hydroelectric dam was one of the first major projects of the New Deal era. It transformed the Columbia River and regional economy while providing crucial fish ladders to maintain salmon runs that have sustained Pacific Northwest cultures for millennia.",
        address: "Cascade Locks, OR",
        latitude: 45.6441,
        longitude: -121.9405,
        category: "Industrial Heritage",
        period: "Built 1933-1938",
        submitterName: "U.S. Army Corps of Engineers",
        submitterEmail: "bonneville@usace.army.mil",
        status: "approved",
      },
      {
        name: "Celilo Falls",
        description: "Once known as the 'Great Falls of the Columbia,' this was one of the most important salmon fishing sites in North America for over 10,000 years. Native American tribes gathered here for centuries until the falls were submerged by The Dalles Dam in 1957.",
        address: "The Dalles, OR",
        latitude: 45.6073,
        longitude: -121.1789,
        category: "Indigenous Heritage",
        period: "Ancient - 1957",
        submitterName: "Confederated Tribes of Warm Springs",
        submitterEmail: "cultural@warmsprings.org",
        status: "approved",
      },
      {
        name: "Snoqualmie Falls",
        description: "This 268-foot waterfall has been sacred to the Snoqualmie people since time immemorial. Known as the place where the first salmon was created, it later became the site of the world's first underground power plant in 1898, pioneering hydroelectric power in the Pacific Northwest.",
        address: "Snoqualmie, WA",
        latitude: 47.5420,
        longitude: -121.8372,
        category: "Natural Heritage",
        period: "Ancient - Present",
        submitterName: "Snoqualmie Tribe",
        submitterEmail: "cultural@snoqualmietribe.us",
        status: "approved",
      },
      {
        name: "Oregon State Capitol",
        description: "Built in 1938 after fire destroyed the previous capitol, this Art Moderne building represents Oregon's growth during the New Deal era. The 23-karat gold-leafed Oregon Pioneer statue atop the dome has become an iconic symbol of the state's pioneering spirit.",
        address: "900 Court St NE, Salem, OR",
        latitude: 44.9308,
        longitude: -123.0351,
        category: "Cultural Site",
        period: "Built 1936-1938",
        submitterName: "Oregon State Legislature",
        submitterEmail: "info@oregonlegislature.gov",
        status: "approved",
      },
      {
        name: "Hanford Site",
        description: "This former nuclear production complex played a crucial role in the Manhattan Project, producing plutonium for nuclear weapons during World War II. Now a cleanup site and national monument, it represents both scientific achievement and environmental responsibility.",
        address: "Richland, WA",
        latitude: 46.5658,
        longitude: -119.6060,
        category: "Historic Landmark",
        period: "1943-1987",
        submitterName: "U.S. Department of Energy",
        submitterEmail: "hanford@doe.gov",
        status: "approved",
      },
      {
        name: "Coeur d'Alene Mission of the Sacred Heart",
        description: "Built in 1853, this is Idaho's oldest building and a National Historic Landmark. The mission served as a center for Catholic evangelization among the Coeur d'Alene tribe and represents the complex cultural exchanges between European missionaries and Native peoples.",
        address: "Old Mission State Park, Cataldo, ID",
        latitude: 47.5543,
        longitude: -116.3473,
        category: "Cultural Site",
        period: "Built 1850-1853",
        submitterName: "Idaho State Parks",
        submitterEmail: "oldmission@idpr.idaho.gov",
        status: "approved",
      },
      {
        name: "Glacier National Park",
        description: "Known as the 'Crown of the Continent,' this pristine wilderness preserves over 1 million acres of ecosystems spanning from prairie to alpine tundra. The park protects sacred sites of the Blackfeet Nation and showcases the dramatic geological history carved by ancient glaciers.",
        address: "West Glacier, MT",
        latitude: 48.7596,
        longitude: -113.7870,
        category: "Natural Heritage",
        period: "Established 1910",
        submitterName: "National Park Service",
        submitterEmail: "glac@nps.gov",
        status: "approved",
      },
      {
        name: "Skagit Valley Tulip Fields",
        description: "Beginning in the 1940s, Dutch immigrants transformed the fertile Skagit Valley into one of North America's premier tulip growing regions. This agricultural heritage represents the successful adaptation of Old World farming traditions to Pacific Northwest conditions.",
        address: "Skagit Valley, WA",
        latitude: 48.4228,
        longitude: -122.3374,
        category: "Agricultural Heritage",
        period: "1940s - Present",
        submitterName: "Skagit Valley Tulip Festival",
        submitterEmail: "info@tulipfestival.org",
        status: "approved",
      },
    ]).onConflictDoNothing();

    // Add sample photos to prevent them from disappearing
    await seedPhotos();
    
    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export { seed };

// Run seed if this file is executed directly
seed().then(() => process.exit(0));