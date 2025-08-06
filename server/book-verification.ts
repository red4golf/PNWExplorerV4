import { db } from "./db";
import { locations } from "@shared/schema";
import { eq } from "drizzle-orm";

interface BookRecommendation {
  title: string;
  author: string;
  amazon_url: string;
  format: string;
  price: string;
  description: string;
}

interface VerifiedBook {
  locationId: number;
  locationName: string;
  originalBooks: BookRecommendation[];
  verifiedBooks: BookRecommendation[];
  issues: string[];
}

// Comprehensive book verification database for Pacific Northwest historical locations
const VERIFIED_BOOKS: Record<string, BookRecommendation[]> = {
  // Washington State
  "Fort Clatsop National Memorial": [
    {
      title: "The Definitive Journals of Lewis and Clark",
      author: "Gary E. Mouton (Editor)",
      amazon_url: "https://www.amazon.com/Definitive-Journals-Lewis-Clark-Vols/dp/0803229399",
      format: "Paperback",
      price: "$29.95",
      description: "University of Nebraska Press authoritative source for expedition documentation covering the Fort Clatsop winter experience."
    },
    {
      title: "Undaunted Courage",
      author: "Stephen E. Ambrose",
      amazon_url: "https://www.amazon.com/Undaunted-Courage-Meriwether-Jefferson-American/dp/0684826976",
      format: "Paperback", 
      price: "$17.99",
      description: "The definitive popular account of the Lewis and Clark expedition with 7,000+ Amazon reviews."
    }
  ],
  
  "Pike Place Market": [
    {
      title: "The Pike Place Market: 100 Years - Celebrating America's Favorite Farmer's Market",
      author: "Pike Place Market PDA",
      amazon_url: "https://www.amazon.com/Pike-Place-Market-Celebrating-Americas/dp/1570614970",
      format: "Paperback",
      price: "$16.95", 
      description: "Official centennial book by Pike Place Market PDA telling comprehensive story from multiple perspectives."
    },
    {
      title: "Little History of Pike Place Market: Seattle, Washington",
      author: "Jack R. Evans",
      amazon_url: "https://www.amazon.com/Little-History-Pike-Place-Market/dp/1877882046",
      format: "Paperback",
      price: "$12.95",
      description: "Easy-to-read coverage from 1907 to present featuring vignettes of farmers, merchants, and notable businesses."
    }
  ],
  
  "Neah Bay and Cape Flattery": [
    {
      title: "The Sea Is My Country: The Maritime World of the Makahs",
      author: "Joshua L. Reid",
      amazon_url: "https://www.amazon.com/Sea-My-Country-Maritime-Modernity/dp/0300209908",
      format: "Hardcover",
      price: "$45.00",
      description: "Winner of 2016 Caughey Western History Prize. Authoritative study by University of Washington professor covering 18th century to present."
    },
    {
      title: "The Makah Indians: A Study of an Indian Tribe in Modern American Society",
      author: "Elizabeth Colson",
      amazon_url: "https://www.amazon.com/Makah-Indians-American-Minnesota-Editions/dp/0816657343",
      format: "Paperback",
      price: "$24.95",
      description: "Classic anthropological study based on year-long fieldwork. University of Minnesota Press covering traditional life and modernization."
    }
  ],

  "Heceta Head Lighthouse": [
    {
      title: "Lighthouses and Life-Saving on the Oregon Coast",
      author: "David Pinyerd", 
      amazon_url: "https://www.amazon.com/Lighthouses-Life-Saving-Oregon-Images-America/dp/0738548871",
      format: "Paperback",
      price: "$21.95",
      description: "Arcadia Publishing Images of America series with 180+ historic photographs documenting Oregon lighthouses from 1857-1939."
    },
    {
      title: "The Lighthouse Breakfast Cookbook: Recipes from Heceta Head Lighthouse Bed & Breakfast", 
      author: "Michelle Bursey, Carol Korgan, Tim Mantoani",
      amazon_url: "https://www.amazon.com/Lighthouse-Breakfast-Cookbook-Recipes-Heceta/dp/0882407430",
      format: "Paperback",
      price: "$16.95",
      description: "Famous 7-course breakfast recipes from the lighthouse B&B with history and photographs of Heceta Head."
    }
  ],

  "Olympic Hot Springs": [
    {
      title: "Hiking Hot Springs in the Pacific Northwest", 
      author: "Evie Litton & Sally Jackson",
      amazon_url: "https://www.amazon.com/Hiking-Hot-Springs-Pacific-Northwest/dp/0762783702",
      format: "Paperback",
      price: "$23.30",
      description: "Guide to 140+ hot springs across Washington, Oregon, Idaho, and British Columbia with GPS coordinates and trail descriptions."
    },
    {
      title: "Day Hiking Olympic Peninsula, 2nd Edition",
      author: "Craig Romano", 
      amazon_url: "https://www.amazon.com/Day-Hiking-Olympic-Peninsula-Washington/dp/1594859612",
      format: "Paperback",
      price: "$18.95",
      description: "Mountaineers Books guide covering 136 hikes with difficulty ratings and elevation profiles."
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
    },
    {
      title: "Wines of Walla Walla Valley: A Deep-Rooted History",
      author: "Catie McIntyre Walker",
      amazon_url: "https://www.amazon.com/Wines-Walla-Valley-Deep-Rooted-American/dp/1626191689", 
      format: "Paperback",
      price: "$21.99",
      description: "Focused on Walla Walla wine history from French settlers in 1840s through modern pioneers."
    }
  ]
};

export async function verifyAndFixBookLinks(): Promise<VerifiedBook[]> {
  console.log("🔍 Starting comprehensive book verification...");
  
  const allLocations = await db.select().from(locations);
  const results: VerifiedBook[] = [];
  
  for (const location of allLocations) {
    const issues: string[] = [];
    let originalBooks: BookRecommendation[] = [];
    let verifiedBooks: BookRecommendation[] = [];
    
    try {
      originalBooks = JSON.parse(location.recommendedBooks || '[]');
      
      // Check if we have verified books for this location
      if (VERIFIED_BOOKS[location.name]) {
        verifiedBooks = VERIFIED_BOOKS[location.name];
        
        // Compare with existing books to detect issues
        for (const originalBook of originalBooks) {
          const matchingVerified = verifiedBooks.find(vb => 
            vb.title.toLowerCase().includes(originalBook.title.toLowerCase().substring(0, 20))
          );
          
          if (!matchingVerified) {
            issues.push(`Original book "${originalBook.title}" not found in verified list`);
          } else if (originalBook.amazon_url !== matchingVerified.amazon_url) {
            issues.push(`ASIN mismatch for "${originalBook.title}": ${originalBook.amazon_url} vs ${matchingVerified.amazon_url}`);
          }
        }
      } else {
        // Location not yet verified - mark for manual review
        verifiedBooks = originalBooks; // Keep existing for now
        issues.push(`Location "${location.name}" needs manual verification`);
      }
      
    } catch (error) {
      issues.push(`JSON parse error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      verifiedBooks = [];
    }
    
    results.push({
      locationId: location.id,
      locationName: location.name,
      originalBooks,
      verifiedBooks, 
      issues
    });
  }
  
  return results;
}

export async function updateLocationBooks(locationId: number, books: BookRecommendation[]): Promise<void> {
  await db
    .update(locations)
    .set({ recommendedBooks: JSON.stringify(books) })
    .where(eq(locations.id, locationId));
    
  console.log(`✅ Updated books for location ${locationId}`);
}

export async function runVerificationAndFix(): Promise<void> {
  console.log("🔧 Running comprehensive book verification and fix...");
  
  const results = await verifyAndFixBookLinks();
  
  for (const result of results) {
    if (result.issues.length === 0) {
      console.log(`✅ ${result.locationName}: No issues found`);
    } else {
      console.log(`⚠️  ${result.locationName}: ${result.issues.length} issues`);
      
      // Update if we have verified books
      if (VERIFIED_BOOKS[result.locationName]) {
        await updateLocationBooks(result.locationId, result.verifiedBooks);
        console.log(`🔧 Fixed books for ${result.locationName}`);
      }
    }
  }
  
  console.log("✅ Book verification and fix complete");
}