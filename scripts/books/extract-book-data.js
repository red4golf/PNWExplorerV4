// Simple Node.js script to extract all book data for verification
const fs = require('fs');

// Sample function to extract ASIN from Amazon URL
function extractASIN(amazonUrl) {
  if (!amazonUrl) return '';
  
  // Match ASIN patterns in Amazon URLs
  const dpMatch = amazonUrl.match(/\/(?:dp|product)\/([A-Z0-9]{10})/i);
  if (dpMatch) return dpMatch[1];
  
  const gpMatch = amazonUrl.match(/\/gp\/product\/([A-Z0-9]{10})/i);
  if (gpMatch) return gpMatch[1];
  
  const asinMatch = amazonUrl.match(/asin=([A-Z0-9]{10})/i);
  if (asinMatch) return asinMatch[1];
  
  return '';
}

console.log('📚 Book Verification System - Data Extraction');
console.log('This script creates manual verification reports from database query results');
console.log('\nNext steps:');
console.log('1. Run the SQL query to get all book data');  
console.log('2. Copy the results to create verification reports');
console.log('3. Use the checklist and tracking tools provided');

// SQL query to get all location book data
const extractQuery = `
SELECT 
  id, 
  name, 
  category, 
  period, 
  recommended_books,
  status
FROM locations 
WHERE recommended_books IS NOT NULL 
AND recommended_books != '' 
AND recommended_books != '[]' 
ORDER BY id;
`;

console.log('\n📋 SQL Query to Extract All Book Data:');
console.log('-------------------------------------------');
console.log(extractQuery);

fs.writeFileSync('book-extraction-query.sql', extractQuery);
console.log('\n✅ SQL query saved to: book-extraction-query.sql');