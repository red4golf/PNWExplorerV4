import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { db } from './db';
import { locations, photos } from '@shared/schema';

interface ImportLocation {
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  period: string;
  submitterName?: string;
  submitterEmail?: string;
  status?: string;
  images?: string[];
  content?: string;
}

interface ImportPhoto {
  locationId: number;
  url: string;
  caption: string;
  altText: string;
}

// Import locations from JSON files
async function importFromJSON(filePath: string) {
  try {
    const data = JSON.parse(readFileSync(filePath, 'utf8'));
    
    if (Array.isArray(data)) {
      // Multiple locations in array
      for (const locationData of data) {
        await importSingleLocation(locationData);
      }
    } else {
      // Single location object
      await importSingleLocation(data);
    }
    
    console.log(`Successfully imported from ${filePath}`);
  } catch (error) {
    console.error(`Error importing from ${filePath}:`, error);
  }
}

// Import from CSV (simplified)
async function importFromCSV(filePath: string) {
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    for (let i = 1; i < lines.length; i++) {
      if (lines[i].trim()) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        const locationData: any = {};
        
        headers.forEach((header, index) => {
          locationData[header] = values[index];
        });
        
        // Convert string coordinates to numbers
        if (locationData.latitude) locationData.latitude = parseFloat(locationData.latitude);
        if (locationData.longitude) locationData.longitude = parseFloat(locationData.longitude);
        
        await importSingleLocation(locationData);
      }
    }
    
    console.log(`Successfully imported from ${filePath}`);
  } catch (error) {
    console.error(`Error importing from ${filePath}:`, error);
  }
}

// Import a single location
async function importSingleLocation(data: ImportLocation) {
  try {
    const locationData = {
      name: data.name,
      description: data.description,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,
      category: data.category,
      period: data.period,
      submitterName: data.submitterName || 'Content Import',
      submitterEmail: data.submitterEmail || 'import@pnwhistory.org',
      status: data.status || 'approved'
    };

    const [newLocation] = await db.insert(locations).values(locationData).returning();
    console.log(`Imported location: ${data.name}`);

    // Import associated images if provided
    if (data.images && data.images.length > 0) {
      for (const imageUrl of data.images) {
        await db.insert(photos).values({
          locationId: newLocation.id,
          filename: imageUrl,
          caption: `Image of ${data.name}`
        });
      }
    }

    return newLocation;
  } catch (error) {
    console.error(`Error importing location ${data.name}:`, error);
  }
}

// Auto-discover and import files from assets/locations
async function importAllFiles() {
  const assetsPath = join(process.cwd(), 'assets', 'locations');
  
  try {
    const files = readdirSync(assetsPath);
    
    for (const file of files) {
      const filePath = join(assetsPath, file);
      
      if (file.endsWith('.json')) {
        await importFromJSON(filePath);
      } else if (file.endsWith('.csv')) {
        await importFromCSV(filePath);
      }
    }
  } catch (error) {
    console.log('No assets/locations folder found or no files to import');
  }
}

// Export functions for manual use
export { importFromJSON, importFromCSV, importSingleLocation, importAllFiles };

// If run directly, import all files
if (require.main === module) {
  importAllFiles().then(() => {
    console.log('Import process completed');
    process.exit(0);
  });
}