# Content Import Guide

You can easily import your existing historical location content into the Pacific Northwest Historical Explorer using several methods.

## Quick Start

1. **Upload your files** to the `assets/locations/` folder
2. **Run the import command**: `npm run import`

## Supported Formats

### JSON Format (Recommended)

#### Single Location
Place individual location files in `assets/locations/your-location.json`:

```json
{
  "name": "Your Historic Site Name",
  "description": "Detailed historical description...",
  "address": "Full address with city, state",
  "latitude": 47.6062,
  "longitude": -122.3321,
  "category": "Historic Landmark",
  "period": "1800s-1900s",
  "submitterName": "Your Name",
  "submitterEmail": "your.email@example.com",
  "images": [
    "assets/images/photo1.jpg",
    "https://example.com/photo2.jpg"
  ]
}
```

#### Multiple Locations
Place array of locations in `assets/locations/my-locations.json`:

```json
[
  {
    "name": "First Location",
    "description": "...",
    // ... other fields
  },
  {
    "name": "Second Location", 
    "description": "...",
    // ... other fields
  }
]
```

### CSV Format

Place CSV files in `assets/locations/data.csv` with these columns:

```csv
name,description,address,latitude,longitude,category,period,submitterName,submitterEmail
"Site Name","Description","Address",47.6062,-122.3321,"Historic Landmark","1800s","Your Name","email@example.com"
```

## Categories

Use these standard categories:
- `Historic Landmark`
- `Cultural Site`
- `Natural Heritage`
- `Indigenous Heritage`
- `Industrial Heritage`
- `Agricultural Heritage`
- `Transportation Hub`
- `Memorial Site`
- `Maritime Heritage`

## Images

### Upload Images
1. Place image files in `assets/images/`
2. Reference them in your JSON as: `"assets/images/your-photo.jpg"`
3. Or use external URLs: `"https://example.com/photo.jpg"`

### Supported Image Formats
- `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`

## Import Commands

```bash
# Import all files from assets/locations/
npm run import

# Import specific file
tsx server/import.ts path/to/your/file.json

# Import from CSV
tsx server/import.ts path/to/your/data.csv
```

## Data Fields

### Required Fields
- `name`: Location name
- `description`: Historical description
- `address`: Full address
- `latitude`: Decimal latitude (-90 to 90)
- `longitude`: Decimal longitude (-180 to 180)
- `category`: From standard categories above
- `period`: Time period (e.g., "1850s-1900s")

### Optional Fields
- `submitterName`: Your name (defaults to "Content Import")
- `submitterEmail`: Your email (defaults to "import@pnwhistory.org")
- `status`: "approved", "pending", or "rejected" (defaults to "approved")
- `images`: Array of image URLs or file paths
- `content`: Extended content or notes

## Examples

See the example files in this folder:
- `example-single-location.json`
- `example-multiple-locations.json`
- `example-data.csv`

## Troubleshooting

### Common Issues
1. **Invalid coordinates**: Ensure latitude/longitude are decimal numbers
2. **Missing images**: Check file paths and ensure images are uploaded
3. **Import fails**: Check JSON syntax with a JSON validator

### Getting Help
If you encounter issues, check the console output for specific error messages when running the import command.