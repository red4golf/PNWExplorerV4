import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

const bestsellerBooks = [
  // High-traffic bestsellers by category
  {
    locationName: "Japanese American Exclusion Memorial",
    book: {
      title: "Hotel on the Corner of Bitter and Sweet",
      author: "Jamie Ford",
      amazon_url: "https://www.amazon.com/Hotel-Corner-Bitter-Sweet-Novel/dp/0345505336",
      format: "Paperback",
      price: "$16.99",
      description: "New York Times bestseller about Japanese American internment in Seattle during WWII. Spent 2.5 years on bestseller list and translated into 35 languages."
    }
  },
  {
    locationName: "Fort Clatsop National Memorial",
    book: {
      title: "Undaunted Courage",
      author: "Stephen E. Ambrose",
      amazon_url: "https://www.amazon.com/Undaunted-Courage-Meriwether-Jefferson-American/dp/0684826976",
      format: "Paperback",
      price: "$17.99",
      description: "#1 bestseller about Lewis and Clark expedition with 7,000+ Amazon reviews. The definitive popular account of the Corps of Discovery."
    }
  },
  {
    locationName: "Hanford Site",
    book: {
      title: "American Prometheus: The Triumph and Tragedy of J. Robert Oppenheimer",
      author: "Kai Bird & Martin J. Sherwin",
      amazon_url: "https://www.amazon.com/American-Prometheus-Triumph-Tragedy-Oppenheimer/dp/0375726268",
      format: "Paperback",
      price: "$18.99",
      description: "Pulitzer Prize winner that inspired the 2023 Oppenheimer movie. Definitive biography of the Manhattan Project's scientific director."
    }
  },
  {
    locationName: "Mount Rainier National Park",
    book: {
      title: "Hiking Mount Rainier National Park",
      author: "Mary Skjelset & Heidi Schneider",
      amazon_url: "https://www.amazon.com/Hiking-Mount-Rainier-National-Park/dp/149303202X",
      format: "Paperback",
      price: "$19.95",
      description: "#1 bestseller in Mount Rainier books. Falcon Guides edition covering 60 hikes for all skill levels with GPS waypoints and detailed maps."
    }
  },
  {
    locationName: "Fort Casey",
    book: {
      title: "The Boys in the Boat",
      author: "Daniel James Brown",
      amazon_url: "https://www.amazon.com/Boys-Boat-Americans-Berlin-Olympics/dp/0143125478",
      format: "Paperback",
      price: "$17.99",
      description: "New York Times #1 bestseller about the 1936 Olympic rowing team from University of Washington. Celebrates Pacific Northwest spirit and determination."
    }
  },
  {
    locationName: "Pike Place Market",
    book: {
      title: "The Good Rain",
      author: "Timothy Egan",
      amazon_url: "https://www.amazon.com/Good-Rain-Across-Pacific-Northwest/dp/0679734856",
      format: "Paperback",
      price: "$16.99",
      description: "Classic Pacific Northwest travelogue that remains highly popular. Pulitzer Prize winner Timothy Egan explores the region's identity and culture."
    }
  },
  {
    locationName: "San Juan Islands Pig War",
    book: {
      title: "Snow Falling on Cedars",
      author: "David Guterson",
      amazon_url: "https://www.amazon.com/Snow-Falling-Cedars-David-Guterson/dp/0679764023",
      format: "Paperback",
      price: "$16.99",
      description: "Pulitzer Prize winner set in the Pacific Northwest. National bestseller exploring themes of prejudice and justice in island communities."
    }
  },
  {
    locationName: "Columbia River Gorge",
    book: {
      title: "Astoria: John Jacob Astor and Thomas Jefferson's Lost Pacific Empire",
      author: "Peter Stark",
      amazon_url: "https://www.amazon.com/Astoria-Jacob-Jeffersons-Pacific-Empire/dp/0061859567",
      format: "Paperback",
      price: "$17.99",
      description: "Popular history of early Pacific Northwest exploration and the founding of Astoria. Gripping adventure story of America's westward expansion."
    }
  },
  {
    locationName: "Fort Worden",
    book: {
      title: "The Boys in the Boat",
      author: "Daniel James Brown",
      amazon_url: "https://www.amazon.com/Boys-Boat-Americans-Berlin-Olympics/dp/0143125478",
      format: "Paperback",
      price: "$17.99",
      description: "New York Times #1 bestseller about the 1936 Olympic rowing team from University of Washington. Celebrates Pacific Northwest spirit and determination."
    }
  },
  {
    locationName: "Fort Flagler",
    book: {
      title: "The Boys in the Boat",
      author: "Daniel James Brown",
      amazon_url: "https://www.amazon.com/Boys-Boat-Americans-Berlin-Olympics/dp/0143125478",
      format: "Paperback",
      price: "$17.99",
      description: "New York Times #1 bestseller about the 1936 Olympic rowing team from University of Washington. Celebrates Pacific Northwest spirit and determination."
    }
  },
  {
    locationName: "Mount St. Helens",
    book: {
      title: "The Good Rain",
      author: "Timothy Egan",
      amazon_url: "https://www.amazon.com/Good-Rain-Across-Pacific-Northwest/dp/0679734856",
      format: "Paperback",
      price: "$16.99",
      description: "Classic Pacific Northwest travelogue that remains highly popular. Pulitzer Prize winner Timothy Egan explores the region's identity and culture."
    }
  },
  {
    locationName: "Crater Lake National Park",
    book: {
      title: "The Good Rain",
      author: "Timothy Egan",
      amazon_url: "https://www.amazon.com/Good-Rain-Across-Pacific-Northwest/dp/0679734856",
      format: "Paperback",
      price: "$16.99",
      description: "Classic Pacific Northwest travelogue that remains highly popular. Pulitzer Prize winner Timothy Egan explores the region's identity and culture."
    }
  }
];

async function addBestsellerBooks() {
  console.log('Adding bestseller books to locations...');
  
  for (const entry of bestsellerBooks) {
    try {
      // Get current location data
      const locationResult = await sql`
        SELECT id, name, recommended_books 
        FROM locations 
        WHERE name = ${entry.locationName}
        LIMIT 1
      `;
      
      if (locationResult.length === 0) {
        console.log(`Location not found: ${entry.locationName}`);
        continue;
      }
      
      const location = locationResult[0];
      let currentBooks = [];
      
      // Parse existing books
      if (location.recommended_books) {
        try {
          currentBooks = JSON.parse(location.recommended_books);
        } catch (e) {
          console.log(`Error parsing books for ${entry.locationName}:`, e.message);
          currentBooks = [];
        }
      }
      
      // Check if this book already exists
      const bookExists = currentBooks.some(book => 
        book.title === entry.book.title && book.author === entry.book.author
      );
      
      if (!bookExists) {
        // Add the new bestseller book
        currentBooks.push(entry.book);
        
        // Update the location
        await sql`
          UPDATE locations 
          SET recommended_books = ${JSON.stringify(currentBooks)}
          WHERE id = ${location.id}
        `;
        
        console.log(`✅ Added "${entry.book.title}" to ${entry.locationName}`);
      } else {
        console.log(`⚠️ Book "${entry.book.title}" already exists for ${entry.locationName}`);
      }
      
    } catch (error) {
      console.error(`Error processing ${entry.locationName}:`, error);
    }
  }
  
  console.log('\n📚 Bestseller books addition complete!');
  console.log('Benefits:');
  console.log('- Increased organic search traffic from popular book searches');
  console.log('- Higher affiliate conversion rates from proven bestsellers');
  console.log('- Cross-pollination between fiction readers and historical sites');
  console.log('- Enhanced SEO for location-specific content');
}

// Run the function
addBestsellerBooks().catch(console.error);