const fs = require('fs');

// Read the content files
const fortWordenContent = fs.readFileSync('attached_assets/fort-worden-battery-kinzie_1751592253748.md', 'utf8');
const fortFlaglerContent = fs.readFileSync('attached_assets/fort-flagler-marrowstone_1751592253749.md', 'utf8');

const locations = [
  {
    name: "Fort Worden & Battery Kinzie",
    description: "The crown jewel of Puget Sound coastal defense, featuring revolutionary disappearing gun technology and serving as command center for the Triangle of Fire defense system.",
    address: "200 Battery Way, Port Townsend, WA 98368",
    latitude: 48.1397,
    longitude: -122.7736,
    category: "Military History",
    period: "1897-1953",
    submitterName: "Historical Research",
    submitterEmail: "history@pnw.edu",
    status: "approved",
    content: fortWordenContent
  },
  {
    name: "Fort Flagler",
    description: "The first activated fort in the Puget Sound Triangle of Fire defense system, featuring innovative coastal artillery installations on Marrowstone Island.",
    address: "10541 Flagler Road, Nordland, WA 98358",
    latitude: 48.0889,
    longitude: -122.7008,
    category: "Military History", 
    period: "1899-1953",
    submitterName: "Historical Research",
    submitterEmail: "history@pnw.edu",
    status: "approved",
    content: fortFlaglerContent
  }
];

// Add each location
locations.forEach(async (location, index) => {
  try {
    const response = await fetch('http://localhost:5000/api/locations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(location)
    });
    
    if (response.ok) {
      const result = await response.json();
      console.log(`Added location ${index + 1}: ${location.name}`);
    } else {
      console.error(`Error adding location ${index + 1}: ${response.status}`);
    }
  } catch (error) {
    console.error(`Error adding location ${index + 1}:`, error);
  }
});