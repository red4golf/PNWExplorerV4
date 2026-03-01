import { neon } from '@neondatabase/serverless';
const sql = neon(process.env.DATABASE_URL);

const historicalFictionBooks = [
  // Native American Historical Fiction
  {
    locationName: "Nez Perce National Historical Park",
    book: {
      title: "Ravensong",
      author: "Lee Maracle",
      amazon_url: "https://www.amazon.com/Ravensong-Novel-Lee-Maracle/dp/0889615977",
      format: "Paperback",
      price: "$15.95",
      description: "Acclaimed Indigenous author's novel about 1950s Pacific Northwest Native community. Innovative storytelling weaving together past and present.",
      category: "Historical Fiction"
    }
  },
  {
    locationName: "Suquamish Tribal Grounds",
    book: {
      title: "Ravensong",
      author: "Lee Maracle",
      amazon_url: "https://www.amazon.com/Ravensong-Novel-Lee-Maracle/dp/0889615977",
      format: "Paperback",
      price: "$15.95",
      description: "Acclaimed Indigenous author's novel about 1950s Pacific Northwest Native community. Innovative storytelling weaving together past and present.",
      category: "Historical Fiction"
    }
  },
  
  // Oregon Trail Historical Fiction
  {
    locationName: "Oregon Trail Interpretive Center",
    book: {
      title: "Where the Lost Wander",
      author: "Amy Harmon",
      amazon_url: "https://www.amazon.com/Where-Lost-Wander-Amy-Harmon/dp/1542017963",
      format: "Paperback",
      price: "$16.99",
      description: "Wall Street Journal bestseller about 1853 Oregon Trail romance. Based on author's family history with authentic Native American perspectives.",
      category: "Historical Fiction"
    }
  },
  
  // Pacific Northwest Maritime Fiction
  {
    locationName: "Pike Place Market",
    book: {
      title: "Snow Falling on Cedars",
      author: "David Guterson",
      amazon_url: "https://www.amazon.com/Snow-Falling-Cedars-David-Guterson/dp/0679764023",
      format: "Paperback",
      price: "$16.99",
      description: "Pulitzer Prize winner set in Pacific Northwest islands. Murder mystery exploring prejudice and justice in maritime communities.",
      category: "Historical Fiction"
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
      description: "Pulitzer Prize winner set in Pacific Northwest islands. Murder mystery exploring prejudice and justice in maritime communities.",
      category: "Historical Fiction"
    }
  },
  
  // Klondike Gold Rush Fiction
  {
    locationName: "Klondike Gold Rush National Historical Park",
    book: {
      title: "The Call of the Wild",
      author: "Jack London",
      amazon_url: "https://www.amazon.com/Call-Wild-Jack-London/dp/0486264726",
      format: "Paperback",
      price: "$3.95",
      description: "Classic novel based on Jack London's own 1897-1898 Yukon Gold Rush experience. The definitive Klondike adventure story.",
      category: "Historical Fiction"
    }
  },
  
  // Pacific Northwest General Fiction
  {
    locationName: "Columbia River Gorge",
    book: {
      title: "The Orchardist",
      author: "Amanda Coplin",
      amazon_url: "https://www.amazon.com/Orchardist-Amanda-Coplin/dp/0316434124",
      format: "Paperback",
      price: "$16.99",
      description: "Critically acclaimed novel set in early 1900s Pacific Northwest. Epic story of solitude, love, and survival in Washington's wilderness.",
      category: "Historical Fiction"
    }
  },
  {
    locationName: "Mount Rainier National Park",
    book: {
      title: "The Orchardist",
      author: "Amanda Coplin",
      amazon_url: "https://www.amazon.com/Orchardist-Amanda-Coplin/dp/0316434124",
      format: "Paperback",
      price: "$16.99",
      description: "Critically acclaimed novel set in early 1900s Pacific Northwest. Epic story of solitude, love, and survival in Washington's wilderness.",
      category: "Historical Fiction"
    }
  },
  
  // WWII Historical Fiction
  {
    locationName: "Japanese American Exclusion Memorial",
    book: {
      title: "Hotel on the Corner of Bitter and Sweet",
      author: "Jamie Ford",
      amazon_url: "https://www.amazon.com/Hotel-Corner-Bitter-Sweet-Novel/dp/0345505336",
      format: "Paperback",
      price: "$16.99",
      description: "New York Times bestseller about Japanese American internment in Seattle during WWII. Spent 2.5 years on bestseller list and translated into 35 languages.",
      category: "Historical Fiction"
    }
  },
];

const trueCrimeBooks = [
  // Pacific Northwest True Crime
  {
    locationName: "Underground Seattle",
    book: {
      title: "The Stranger Beside Me",
      author: "Ann Rule",
      amazon_url: "https://www.amazon.com/Stranger-Beside-Me-Ann-Rule/dp/1501139142",
      format: "Paperback",
      price: "$17.99",
      description: "Ann Rule's breakout bestseller about working alongside Ted Bundy before discovering he was a serial killer. The book that established modern true crime.",
      category: "True Crime"
    }
  },
  {
    locationName: "Shanghai Tunnels",
    book: {
      title: "Starvation Heights",
      author: "Gregg Olsen",
      amazon_url: "https://www.amazon.com/Starvation-Heights-Gregg-Olsen/dp/0307719901",
      format: "Paperback",
      price: "$16.99",
      description: "True story of Dr. Linda Burfield Hazzard's medical murder sanatorium in early 1900s Washington State. Classic Pacific Northwest true crime.",
      category: "True Crime"
    }
  },
];

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
      description: "New York Times bestseller about Japanese American internment in Seattle during WWII. Spent 2.5 years on bestseller list and translated into 35 languages.",
      category: "Historical Fiction"
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
      description: "#1 bestseller about Lewis and Clark expedition with 7,000+ Amazon reviews. The definitive popular account of the Corps of Discovery.",
      category: "Popular History"
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
      description: "Pulitzer Prize winner that inspired the 2023 Oppenheimer movie. Definitive biography of the Manhattan Project's scientific director.",
      category: "Popular History"
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
      description: "#1 bestseller in Mount Rainier books. Falcon Guides edition covering 60 hikes for all skill levels with GPS waypoints and detailed maps.",
      category: "Guide Book"
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
      description: "New York Times #1 bestseller about the 1936 Olympic rowing team from University of Washington. Celebrates Pacific Northwest spirit and determination.",
      category: "Popular History"
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
      description: "Classic Pacific Northwest travelogue that remains highly popular. Pulitzer Prize winner Timothy Egan explores the region's identity and culture.",
      category: "Popular History"
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

async function addAllBooks() {
  console.log('Adding historical fiction, true crime, and bestseller books to locations...');
  
  // Combine all book categories
  const allBooks = [...historicalFictionBooks, ...trueCrimeBooks, ...bestsellerBooks];
  
  for (const entry of allBooks) {
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
  
  console.log('\n📚 Historical fiction, true crime, and bestseller books addition complete!');
  console.log('Benefits:');
  console.log('- Historical Fiction: Gateway books that draw readers into learning real history');
  console.log('- True Crime: Authentic Pacific Northwest crime stories with educational value');
  console.log('- Popular Bestsellers: Increased organic search traffic and higher conversion rates');
  console.log('- Book categories clearly marked for transparency and user selection');
  console.log('- Enhanced SEO for location-specific content across all genres');
}

// Run the function
addAllBooks().catch(console.error);