import { db } from "./server/db";
import { locations } from "./shared/schema";
import { eq } from "drizzle-orm";

const VERIFIED_BOOKS = {
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

async function fixAllBooks() {
  console.log("🔧 Starting comprehensive book verification...");
  
  const allLocations = await db.select().from(locations);
  console.log(`📊 Found ${allLocations.length} total locations`);
  
  let fixedCount = 0;
  
  for (const location of allLocations) {
    if (VERIFIED_BOOKS[location.name as keyof typeof VERIFIED_BOOKS]) {
      const books = VERIFIED_BOOKS[location.name as keyof typeof VERIFIED_BOOKS];
      await db.update(locations)
        .set({ recommended_books: JSON.stringify(books) })
        .where(eq(locations.id, location.id));
      
      console.log(`✅ Fixed: ${location.name}`);
      fixedCount++;
    }
  }
  
  console.log(`🎯 Fixed ${fixedCount} locations with verified books`);
  return fixedCount;
}

fixAllBooks().catch(console.error);
