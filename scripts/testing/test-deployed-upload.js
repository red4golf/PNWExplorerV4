import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

// Test hero image upload in deployed environment
async function testDeployedUpload() {
  try {
    // Login first
    const loginResponse = await fetch('http://localhost:5000/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@pnwhistory.org',
        password: 'PNWHistoryBeta2025!'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('Login result:', loginData);
    
    // Create test image
    const testImageBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU8xTAAAAABJRU5ErkJggg==', 'base64');
    
    // Test hero image upload
    const form = new FormData();
    form.append('heroImage', testImageBuffer, {
      filename: 'test-hero.png',
      contentType: 'image/png'
    });
    
    console.log('Testing hero image upload...');
    const uploadResponse = await fetch('http://localhost:5000/api/admin/locations/33/upload-hero', {
      method: 'POST',
      body: form
    });
    
    console.log('Upload response status:', uploadResponse.status);
    const uploadResult = await uploadResponse.text();
    console.log('Upload result:', uploadResult.substring(0, 200) + '...');
    
    // Check database
    const dbResponse = await fetch('http://localhost:5000/api/locations/33');
    const locationData = await dbResponse.json();
    console.log('Location after upload:', {
      id: locationData.id,
      name: locationData.name,
      heroImage: locationData.heroImage
    });
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testDeployedUpload();