#!/usr/bin/env node

/**
 * Comprehensive Book Verification System
 * 
 * This script helps systematically verify and fix Amazon book links across all locations.
 * It creates prioritized lists, extracts all URLs, and provides verification tools.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const path = require('path');

import { sql } from '@neondatabase/serverless';
import { extractASIN } from './client/src/lib/book-utils.ts';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const db = sql(connectionString);

// Analytics data for prioritization (top 20 locations by views)
const TOP_VIEWED_LOCATIONS = {
  21: 31, 62: 24, 134: 18, 50: 10, 65: 8, 136: 7, 23: 6, 32: 5, 135: 4, 56: 3,
  130: 3, 52: 2, 20: 2, 131: 2, 53: 2, 70: 2, 41: 2, 36: 2, 124: 1, 125: 1
};

async function getAllLocationsWithBooks() {
  console.log('🔍 Fetching all locations with book data...');
  
  const locations = await db`
    SELECT id, name, category, period, recommended_books, status 
    FROM locations 
    WHERE recommended_books IS NOT NULL 
    AND recommended_books != '' 
    AND recommended_books != '[]' 
    ORDER BY id
  `;
  
  return locations.map(location => ({
    ...location,
    parsedBooks: JSON.parse(location.recommended_books || '[]')
  }));
}

function calculatePriorityScore(location) {
  let score = 0;
  
  // Traffic weight (40% of score)
  const viewCount = TOP_VIEWED_LOCATIONS[location.id] || 0;
  score += (viewCount / 31) * 40; // Normalize by max views (31)
  
  // Number of books weight (20% of score)
  const bookCount = location.parsedBooks.length;
  score += Math.min(bookCount / 3, 1) * 20; // Cap at 3 books for full score
  
  // Category importance weight (20% of score)
  const categoryWeights = {
    'Cultural Site': 10,
    'Historic Landmark': 9,
    'Memorial Site': 8,
    'Natural Heritage': 7,
    'Indigenous Heritage': 8,
    'Industrial Heritage': 6,
    'Transportation Hub': 5,
    'Maritime Heritage': 6,
    'Agricultural Heritage': 5
  };
  score += (categoryWeights[location.category] || 5) * 2;
  
  // Status weight (20% of score)
  if (location.status === 'approved') score += 20;
  else if (location.status === 'pending') score += 10;
  
  return Math.round(score);
}

function extractAllBookData(locations) {
  console.log('📚 Extracting all book data...');
  
  const allBooks = [];
  const allUrls = new Set();
  const duplicateUrls = [];
  const urlErrors = [];
  
  locations.forEach(location => {
    location.parsedBooks.forEach((book, bookIndex) => {
      const asin = extractASIN(book.amazon_url);
      const bookData = {
        locationId: location.id,
        locationName: location.name,
        bookIndex,
        title: book.title,
        author: book.author,
        amazonUrl: book.amazon_url,
        asin,
        format: book.format,
        price: book.price,
        description: book.description
      };
      
      // Check for URL issues
      if (!book.amazon_url) {
        urlErrors.push({ ...bookData, issue: 'Missing URL' });
      } else if (!asin) {
        urlErrors.push({ ...bookData, issue: 'Invalid Amazon URL format' });
      } else if (allUrls.has(book.amazon_url)) {
        duplicateUrls.push(bookData);
      } else {
        allUrls.add(book.amazon_url);
      }
      
      allBooks.push(bookData);
    });
  });
  
  return {
    allBooks,
    urlErrors,
    duplicateUrls,
    stats: {
      totalBooks: allBooks.length,
      totalUrls: allUrls.size,
      uniqueAsins: new Set(allBooks.filter(b => b.asin).map(b => b.asin)).size,
      urlErrors: urlErrors.length,
      duplicates: duplicateUrls.length
    }
  };
}

function createPrioritizedList(locations) {
  console.log('📋 Creating prioritized verification list...');
  
  return locations
    .map(location => ({
      ...location,
      priorityScore: calculatePriorityScore(location),
      bookCount: location.parsedBooks.length,
      viewCount: TOP_VIEWED_LOCATIONS[location.id] || 0
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

function generateVerificationChecklist() {
  return `
# Book Verification Checklist

## For Each Location:

### Step 1: Pre-Check
- [ ] Location has books assigned (not empty)
- [ ] All books have required fields (title, author, amazon_url, price, description)
- [ ] Amazon URLs follow correct format

### Step 2: Book Verification Process
For each book in the location:

1. **URL Validation**
   - [ ] Click the Amazon URL
   - [ ] Verify it leads to a real product page (not 404/error)
   - [ ] Check that it's the correct book (title & author match)

2. **Content Accuracy**
   - [ ] Book title matches exactly (check spelling, punctuation)
   - [ ] Author name is correct and complete
   - [ ] Price is reasonable and current (within $5 of actual)
   - [ ] Format (Paperback/Hardcover) matches Amazon listing

3. **Relevance Check**
   - [ ] Book is actually relevant to the historical location
   - [ ] Description accurately reflects the book's content
   - [ ] Historical period/topic aligns with location

### Step 3: Common Issues to Watch For
- Wrong book with similar title
- Author name variations (middle initials, different spelling)
- Out-of-print books with inflated prices
- Generic books not specific to the location/region
- Broken affiliate links or redirects

### Step 4: Documentation
- [ ] Mark as ✅ VERIFIED or ❌ NEEDS FIX in tracking sheet
- [ ] Note specific issues found
- [ ] If fixing, record new correct Amazon URL

## Red Flags That Need Immediate Attention:
- Price over $50 (likely out of print or wrong book)
- URL leads to different book entirely
- Book has no clear connection to the location
- Author name is completely different
`;
}

async function generateReports() {
  try {
    console.log('🚀 Starting Book Verification System Analysis...\n');
    
    const locations = await getAllLocationsWithBooks();
    const prioritizedList = createPrioritizedList(locations);
    const bookData = extractAllBookData(locations);
    
    // Generate Priority List Report
    const priorityReport = `# 📊 PRIORITY VERIFICATION LIST
    
Based on traffic data, content quality, and importance scores.

## Top 20 Priority Locations (Start Here!)

${prioritizedList.slice(0, 20).map((loc, index) => `
**${index + 1}. ${loc.name}** (ID: ${loc.id})
- Priority Score: ${loc.priorityScore}/100
- Page Views: ${loc.viewCount}
- Books to Verify: ${loc.bookCount}
- Category: ${loc.category}
- Books: ${loc.parsedBooks.map(b => `"${b.title}"`).join(', ')}
`).join('\n')}

## Complete Priority List (All ${prioritizedList.length} locations)

${prioritizedList.map((loc, index) => 
  `${index + 1}. ${loc.name} (ID: ${loc.id}) - Score: ${loc.priorityScore} - Books: ${loc.bookCount} - Views: ${loc.viewCount}`
).join('\n')}
`;

    // Generate Book Database Report
    const bookReport = `# 📚 COMPLETE BOOK DATABASE

## Summary Statistics
- **Total Locations with Books:** ${locations.length}
- **Total Books:** ${bookData.stats.totalBooks}
- **Unique URLs:** ${bookData.stats.totalUrls}
- **Unique ASINs:** ${bookData.stats.uniqueAsins}
- **URL Errors:** ${bookData.stats.urlErrors}
- **Duplicate URLs:** ${bookData.stats.duplicates}

## All Books by Location

${locations.map(loc => `
### ${loc.name} (ID: ${loc.id})
${loc.parsedBooks.map((book, index) => `
${index + 1}. **${book.title}** by ${book.author}
   - URL: ${book.amazon_url}
   - ASIN: ${extractASIN(book.amazon_url) || 'INVALID'}
   - Price: ${book.price} | Format: ${book.format}
`).join('')}
`).join('')}

## Quick URL Reference (for bulk checking)
${bookData.allBooks.map(book => 
  `${book.locationId}|${book.title}|${book.amazonUrl}`
).join('\n')}
`;

    // Generate Error Report
    const errorReport = `# ⚠️ IMMEDIATE ATTENTION REQUIRED

## URL Errors (${bookData.urlErrors.length} issues)
${bookData.urlErrors.map(error => 
  `- **${error.locationName}** (ID: ${error.locationId}): "${error.title}" - ${error.issue}`
).join('\n')}

## Duplicate URLs (${bookData.duplicateUrls.length} duplicates)
${bookData.duplicateUrls.map(dup => 
  `- ${dup.amazonUrl} appears in multiple locations`
).join('\n')}

## High-Price Books (Likely Issues)
${bookData.allBooks
  .filter(book => {
    const price = parseFloat(book.price.replace(/[$,]/g, ''));
    return price > 50;
  })
  .map(book => 
    `- **${book.locationName}**: "${book.title}" - ${book.price} - ${book.amazonUrl}`
  ).join('\n')}
`;

    // Generate Tracking Template
    const trackingTemplate = `# 📋 BOOK VERIFICATION TRACKING SHEET

Instructions: Copy this to a Google Sheet or use as a checklist.

| Priority | Location ID | Location Name | Books Count | Status | Issues Found | Verifier | Date |
|----------|-------------|---------------|-------------|---------|--------------|----------|------|
${prioritizedList.slice(0, 30).map(loc => 
  `| ${prioritizedList.indexOf(loc) + 1} | ${loc.id} | ${loc.name} | ${loc.bookCount} | ❌ | | | |`
).join('\n')}

## Status Legend:
- ❌ = Not Started
- 🔄 = In Progress  
- ✅ = Verified Correct
- ⚠️ = Has Issues, Needs Fix
- 🔧 = Fixed, Ready for Re-verification

## Common Issue Codes:
- WB = Wrong Book
- BL = Broken Link
- HP = High Price (likely out of print)
- IR = Irrelevant to Location
- MF = Missing Fields
`;

    // Write all reports
    const timestamp = new Date().toISOString().slice(0, 10);
    const reports = [
      { name: 'PRIORITY_LIST', content: priorityReport, filename: `book-verification-priority-${timestamp}.md` },
      { name: 'COMPLETE_DATABASE', content: bookReport, filename: `book-database-complete-${timestamp}.md` },
      { name: 'ERROR_REPORT', content: errorReport, filename: `book-errors-${timestamp}.md` },
      { name: 'TRACKING_SHEET', content: trackingTemplate, filename: `book-tracking-template-${timestamp}.md` },
      { name: 'VERIFICATION_CHECKLIST', content: generateVerificationChecklist(), filename: 'book-verification-checklist.md' }
    ];

    for (const report of reports) {
      fs.writeFileSync(report.filename, report.content);
      console.log(`✅ Generated: ${report.filename}`);
    }

    console.log('\n🎉 Book Verification System Complete!');
    console.log('\n📁 Files Generated:');
    console.log('1. book-verification-priority-YYYY-MM-DD.md - Start verification here!');
    console.log('2. book-database-complete-YYYY-MM-DD.md - Complete book reference');
    console.log('3. book-errors-YYYY-MM-DD.md - Issues requiring immediate attention');
    console.log('4. book-tracking-template-YYYY-MM-DD.md - Copy to Google Sheets for progress tracking');
    console.log('5. book-verification-checklist.md - Step-by-step verification process');
    
    console.log('\n🚀 NEXT STEPS:');
    console.log('1. Review the priority list and start with the top 20 locations');
    console.log('2. Fix any critical URL errors first (see error report)');
    console.log('3. Use the checklist for each location verification');
    console.log('4. Track progress in the tracking sheet');
    console.log('5. Focus on high-traffic locations to maximize impact');

  } catch (error) {
    console.error('❌ Error generating reports:', error);
    process.exit(1);
  } finally {
    await db.end?.();
  }
}

// Run the report generation
generateReports();