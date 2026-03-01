import FormData from 'form-data';
import fs from 'fs';
import fetch from 'node-fetch';

// Test with a real image file
async function testRealImageUpload() {
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
    console.log('Login successful:', loginData.message);
    
    // Create a more realistic test image (JPEG)
    const jpegHeader = Buffer.from([0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46]);
    const jpegData = Buffer.alloc(5000); // 5KB
    jpegData.fill(0x80); // Fill with gray data
    const jpegEnd = Buffer.from([0xFF, 0xD9]);
    const testImage = Buffer.concat([jpegHeader, jpegData, jpegEnd]);
    
    // Test hero image upload on The Goonies House (has existing photo)
    const form = new FormData();
    form.append('heroImage', testImage, {
      filename: 'goonies-house-hero.jpg',
      contentType: 'image/jpeg'
    });
    
    console.log('Testing hero image upload on The Goonies House...');
    const uploadResponse = await fetch('http://localhost:5000/api/admin/locations/62/upload-hero', {
      method: 'POST',
      body: form
    });
    
    console.log('Upload response status:', uploadResponse.status);
    
    if (uploadResponse.status === 200) {
      const uploadResult = await uploadResponse.json();
      console.log('✅ Upload successful:', {
        message: uploadResult.message,
        heroImagePath: uploadResult.heroImagePath,
        locationName: uploadResult.location.name
      });
      
      // Test file serving
      const fileResponse = await fetch(`http://localhost:5000${uploadResult.heroImagePath}`);
      console.log('✅ File serving test:', {
        status: fileResponse.status,
        contentType: fileResponse.headers.get('content-type'),
        contentLength: fileResponse.headers.get('content-length')
      });
      
    } else {
      const errorText = await uploadResponse.text();
      console.error('❌ Upload failed:', errorText);
    }
    
  } catch (error) {
    console.error('Test error:', error);
  }
}

testRealImageUpload();