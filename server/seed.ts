import { db } from "./db";
import { locations, admins } from "@shared/schema";

async function seed() {
  try {
    console.log("Seeding database...");

    // Create default admin
    await db.insert(admins).values({
      email: "admin@pnwhistory.org",
      password: "admin123", // In production, this would be hashed
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
    ]).onConflictDoNothing();

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export { seed };

// Run seed if this file is executed directly
seed().then(() => process.exit(0));