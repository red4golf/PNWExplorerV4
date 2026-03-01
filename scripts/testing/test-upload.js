import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

// Test database storage upload
async function testDatabaseUpload() {
  try {
    // Create test image data
    const imageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU8xTAAAAABJRU5ErkJggg==', 'base64');
    
    // Create form data
    const form = new FormData();
    form.append('heroImage', imageBuffer, {
      filename: 'test-database-upload.png',
      contentType: 'image/png'
    });
    
    // Upload to first location
    const response = await fetch('http://localhost:5000/api/locations/1/hero-image', {
      method: 'POST',
      body: form
    });
    
    const result = await response.json();
    console.log('Upload Result:', result);
    
    if (response.ok) {
      console.log('✅ Database upload test successful');
    } else {
      console.log('❌ Database upload test failed');
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testDatabaseUpload();