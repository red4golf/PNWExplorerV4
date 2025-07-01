import { db } from "./db";
import { locations, admins } from "@shared/schema";

async function seed() {
  try {
    console.log("Seeding database...");

    // Create default admin
    await db.insert(admins).values({
      email: "admin@bainbridgehistory.org",
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
    ]).onConflictDoNothing();

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

export { seed };

// Run seed if this file is executed directly
seed().then(() => process.exit(0));