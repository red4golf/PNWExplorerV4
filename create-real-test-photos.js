import fs from 'fs';
import path from 'path';

// Create realistic sample photos for testing
function createSamplePhotos() {
  const uploadsDir = path.join(process.cwd(), 'uploads');
  
  // Ensure uploads directory exists
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

  // Create different types of sample images for various locations
  const samplePhotos = [
    {
      filename: 'fort-clatsop-exterior.jpg',
      content: createJPEGHeader() + 'Fort Clatsop exterior view sample data',
      caption: 'Fort Clatsop exterior - historic reconstruction'
    },
    {
      filename: 'pia-peacekeeper-full.jpg',
      content: createJPEGHeader() + 'Pia the Peacekeeper troll sculpture sample data',
      caption: 'Pia the Peacekeeper - full view'
    },
    {
      filename: 'astoria-column-view.jpg',
      content: createJPEGHeader() + 'Astoria Column panoramic view sample data',
      caption: 'Astoria Column - panoramic view'
    },
    {
      filename: 'fort-flagler-battery.jpg',
      content: createJPEGHeader() + 'Fort Flagler artillery battery sample data',
      caption: 'Fort Flagler - artillery battery'
    },
    {
      filename: 'crater-lake-rim.jpg',
      content: createJPEGHeader() + 'Crater Lake rim view sample data',
      caption: 'Crater Lake - rim trail view'
    }
  ];

  for (const photo of samplePhotos) {
    const filePath = path.join(uploadsDir, photo.filename);
    fs.writeFileSync(filePath, photo.content);
    console.log(`✓ Created sample photo: ${photo.filename}`);
  }

  console.log(`📸 Created ${samplePhotos.length} sample photos for testing`);
  return samplePhotos;
}

function createJPEGHeader() {
  // Create a minimal valid JPEG header
  return Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xD9
  ]).toString('binary');
}

// Run the function
createSamplePhotos();