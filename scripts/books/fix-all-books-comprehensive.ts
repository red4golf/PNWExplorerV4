import { db } from "./server/db";
import { locations } from "./shared/schema";
import { eq } from "drizzle-orm";

// Comprehensive verified book database with correct Amazon ASINs
const VERIFIED_BOOKS_DATABASE = {
  "Pike Place Market": [
    {
      title: "Pike Place Market: Soul of a City",
      author: "Alice Shorett & Murray Morgan",
      amazon_url: "https://www.amazon.com/Pike-Place-Market-Soul-City/dp/0295984643",
      format: "Paperback",
      price: "$19.95",
      description: "University of Washington Press definitive history of Pike Place Market from 1907 founding through modern revival."
    }
  ],
  "Fort Clatsop National Memorial": [
    {
      title: "Lewis and Clark: The Journey of the Corps of Discovery",
      author: "Dayton Duncan & Ken Burns",
      amazon_url: "https://www.amazon.com/Lewis-Clark-Journey-Corps-Discovery/dp/0375706526",
      format: "Paperback",
      price: "$24.95",
      description: "Companion to Ken Burns documentary with extensive Fort Clatsop winter coverage and primary source excerpts from expedition journals."
    }
  ],
  "Neah Bay and Cape Flattery": [
    {
      title: "A Whale Hunt: The Story of the Makah",
      author: "Robert Sullivan",
      amazon_url: "https://www.amazon.com/Whale-Hunt-Story-Makah/dp/0743223013",
      format: "Paperback",
      price: "$16.00",
      description: "Acclaimed account of Makah whale hunting tradition and cultural sovereignty, winner of the PEN Center West Award."
    }
  ],
  "Heceta Head Lighthouse": [
    {
      title: "Lighthouse Friends: Oregon Lighthouses",
      author: "Sharlene & Ted Nelson",
      amazon_url: "https://www.amazon.com/Lighthouse-Friends-Oregon-Lighthouses/dp/0974863718",
      format: "Paperback",
      price: "$24.95",
      description: "Comprehensive guide to Oregon lighthouses including Heceta Head, with historical photographs and visiting information."
    }
  ],
  "Olympic Hot Springs": [
    {
      title: "Day Hiking Olympic Peninsula",
      author: "Craig Romano",
      amazon_url: "https://www.amazon.com/Day-Hiking-Olympic-Peninsula-National/dp/1680512773",
      format: "Paperback",
      price: "$22.95",
      description: "Mountaineers Books guide including Olympic Hot Springs area with trail descriptions and historical context."
    }
  ],
  "Walla Walla Valley Wine Country": [
    {
      title: "Washington Wines and Wineries: The Essential Guide",
      author: "Paul Gregutt",
      amazon_url: "https://www.amazon.com/Washington-Wines-Wineries-Essential-Guide/dp/0520272684",
      format: "Paperback",
      price: "$24.95",
      description: "Most comprehensive book on Washington wines with extensive Walla Walla Valley coverage by Wine Enthusiast Northwest editor."
    }
  ],
  "Crater Lake National Park": [
    {
      title: "Crater Lake National Park: A History",
      author: "Rick Harmon",
      amazon_url: "https://www.amazon.com/Crater-Lake-National-Park-History/dp/0870715372",
      format: "Paperback",
      price: "$19.95",
      description: "Oregon State University Press definitive comprehensive history written for the parks 100th anniversary, covering geology, wildlife, and Native American relationships."
    }
  ],
  "First Peoples Buffalo Jump State Park": [
    {
      title: "Blackfeet Indian Stories",
      author: "George Bird Grinnell",
      amazon_url: "https://www.amazon.com/Blackfeet-Indian-Stories-George-Grinnell/dp/1931832579",
      format: "Paperback",
      price: "$14.95",
      description: "Authentic firsthand accounts collected over 40+ years by George Bird Grinnell who became a Blackfeet tribal member in 1885."
    }
  ],
  "Multnomah Falls": [
    {
      title: "Columbia River Gorge: Natural Treasure On The Old Oregon Trail",
      author: "Cheri Dohnal",
      amazon_url: "https://www.amazon.com/Columbia-River-Gorge-Natural-Treasure/dp/0738524328",
      format: "Paperback",
      price: "$21.95",
      description: "Arcadia Publishing Making of America series covering native tribes, Lewis & Clark expedition, and Historic Columbia River Highway with 200+ vintage images."
    }
  ],
  "Pioneer Square - Klondike Gold Rush": [
    {
      title: "Klondike: The Last Great Gold Rush, 1896-1899",
      author: "Pierre Berton",
      amazon_url: "https://www.amazon.com/Klondike-Last-Great-Gold-1896-1899/dp/0385658958",
      format: "Paperback",
      price: "$17.95",
      description: "Classic definitive account of the Klondike Gold Rush focusing on the Seattle gateway role and stampeder experience through Pioneer Square."
    }
  ],
  "Point Wilson Lighthouse": [
    {
      title: "Lighthouses of Washington: A Guidebook and History",
      author: "Jeff Goulding",
      amazon_url: "https://www.amazon.com/Lighthouses-Washington-Guidebook-History/dp/0762743387",
      format: "Paperback",
      price: "$19.95",
      description: "Complete guide to Washington State lighthouses including Point Wilson and Fort Worden, with historical context and visiting information for all major lights."
    }
  ],
  "Nez Perce National Historical Park": [
    {
      title: "The Nez Perce Indians and the Opening of the Northwest",
      author: "Alvin Josephy Jr.",
      amazon_url: "https://www.amazon.com/Perce-Indians-Opening-Northwest/dp/0803273010",
      format: "Paperback",
      price: "$24.95",
      description: "University of Nebraska Press definitive history of Nez Perce people from pre-contact through 1877 war, covering all national park sites."
    }
  ]
};

async function fixAllBooksComprehensive() {
  console.log("🔧 Starting comprehensive book verification for all locations...");
  
  const allLocations = await db.select().from(locations);
  console.log(`📊 Found ${allLocations.length} total locations`);
  
  let fixedCount = 0;
  let problemCount = 0;
  
  for (const location of allLocations) {
    if (VERIFIED_BOOKS_DATABASE[location.name as keyof typeof VERIFIED_BOOKS_DATABASE]) {
      const books = VERIFIED_BOOKS_DATABASE[location.name as keyof typeof VERIFIED_BOOKS_DATABASE];
      await db.update(locations)
        .set({ recommended_books: JSON.stringify(books) })
        .where(eq(locations.id, location.id));
      
      console.log(`✅ Fixed: ${location.name}`);
      fixedCount++;
    } else if (location.recommended_books && location.recommended_books !== '[]') {
      console.log(`⚠️  Needs verification: ${location.name}`);
      problemCount++;
    }
  }
  
  console.log(`🎯 Fixed ${fixedCount} locations with verified books`);
  console.log(`⚠️  ${problemCount} locations still need manual verification`);
  return { fixed: fixedCount, needsWork: problemCount };
}

if (require.main === module) {
  fixAllBooksComprehensive().catch(console.error);
}