# Deployment Configuration for Pacific Northwest Historical Explorer

## Storage Solution Overview

The application now includes a comprehensive cloud storage system that automatically handles file persistence across different deployment environments.

### Environment Detection

The system automatically detects the deployment environment:

- **Preview Environment**: Uses local file system storage (persistent)
- **Deployed Environment**: Uses database BYTEA storage (cloud persistent)

### Cloud Storage Features

#### 1. Dual Storage Providers

**LocalStorageProvider** (Preview Environment):
- Stores files in `/uploads/location-{id}/` directories
- Creates automatic `.backup` copies
- Serves files via Express static middleware

**DatabaseStorageProvider** (Deployed Environment):
- Stores files as BYTEA data in PostgreSQL
- Automatic table creation with migration
- Serves files via `/api/files/location-{id}/{filename}` endpoint

#### 2. Automatic Environment Switching

The `StorageManager` class automatically chooses the appropriate provider based on:
- `NODE_ENV === 'production'`
- `REPLIT_DEPLOYMENT === 'true'`
- Absence of `REPLIT_DEV_DOMAIN`

#### 3. Database Storage Schema

```sql
CREATE TABLE file_storage (
  id SERIAL PRIMARY KEY,
  filename TEXT NOT NULL,
  location_id INTEGER NOT NULL,
  file_data BYTEA NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type TEXT,
  uploaded_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(filename, location_id)
);
```

### Deployment Steps

1. **Database Setup**: The file storage table is created automatically when the DatabaseStorageProvider initializes
2. **Environment Variables**: No additional configuration needed - automatic detection
3. **File Serving**: Database files are served via `/api/files/` routes with proper caching headers

### File Access Patterns

**Preview Environment URLs**:
- Hero images: `/uploads/location-50/IMG_2813.jpeg`
- Gallery photos: `/uploads/location-50/photo1.jpg`

**Deployed Environment URLs**:
- Hero images: `/api/files/location-50/IMG_2813.jpeg`  
- Gallery photos: `/api/files/location-50/photo1.jpg`

### Upload Process

1. **File Upload**: Standard multer multipart upload
2. **Temporary Storage**: File temporarily saved to disk
3. **Cloud Processing**: File read into buffer and processed by StorageManager
4. **Persistence**: 
   - Preview: Saved to local filesystem with backup
   - Deployed: Saved to database BYTEA with metadata
5. **Database Update**: Location/photo records updated with appropriate URL paths

### Monitoring and Backup

- **Persistence Monitoring**: Continuous file existence checking
- **Backup Creation**: Automatic backup copies in both environments
- **Error Handling**: Comprehensive error logging and recovery
- **Performance**: Database files include caching headers for optimal performance

### Testing Results

**Preview Environment (Local Storage)**:
- ✅ Files persist across application restarts
- ✅ Backup system functional
- ✅ HTTP 200 responses for uploaded files

**Deployed Environment (Database Storage)**:
- ✅ Files survive container restarts
- ✅ Database persistence confirmed
- ✅ API endpoint serving functional
- ✅ Automatic table creation working

### Migration Strategy

Existing installations will automatically:
1. Detect their environment type
2. Initialize the appropriate storage provider
3. Create necessary database tables (if deployed)
4. Continue serving existing files normally

No manual migration steps required - the system handles the transition transparently.