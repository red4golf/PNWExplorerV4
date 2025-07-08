// Test the photo API endpoints
import fs from 'fs';

async function testPhotoAPI() {
  try {
    console.log('🧪 Testing photo API endpoints...');
    
    // Test 1: Get photos for location 33 (Fort Clatsop)
    const response1 = await fetch('http://localhost:5000/api/locations/33/photos');
    const photos1 = await response1.json();
    console.log('✓ Fort Clatsop photos:', photos1.length, 'photos found');
    
    // Test 2: Get photos for location 50 (Pia)
    const response2 = await fetch('http://localhost:5000/api/locations/50/photos');
    const photos2 = await response2.json();
    console.log('✓ Pia the Peacekeeper photos:', photos2.length, 'photos found');
    
    // Test 3: Check if actual files exist
    console.log('\n📁 File existence check:');
    const testFiles = [
      'fort-clatsop-exterior.jpg',
      'pia-peacekeeper-full.jpg',
      'astoria-column-view.jpg',
      'test-upload.jpg',
      'test-upload.svg'
    ];
    
    for (const file of testFiles) {
      const exists = fs.existsSync(`uploads/${file}`);
      console.log(`${exists ? '✓' : '❌'} ${file}: ${exists ? 'EXISTS' : 'MISSING'}`);
    }
    
    // Test 4: Test direct file access
    console.log('\n🌐 HTTP file access test:');
    for (const file of testFiles) {
      try {
        const response = await fetch(`http://localhost:5000/uploads/${file}`);
        console.log(`${response.ok ? '✓' : '❌'} ${file}: HTTP ${response.status}`);
      } catch (error) {
        console.log(`❌ ${file}: ERROR - ${error.message}`);
      }
    }
    
    console.log('\n✅ Photo API testing complete!');
    
  } catch (error) {
    console.error('❌ Photo API test failed:', error);
  }
}

testPhotoAPI();