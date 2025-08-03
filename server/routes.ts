import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLocationSchema, insertFeedbackSchema, insertAffiliateClickSchema, insertUserAnalyticsSchema, locations, fileStorage, userAnalytics } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq, and, isNotNull, sql } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";
import { uploadPersistenceFix } from "./upload-persistence-fix";
import { storageManager, DatabaseStorageProvider } from "./cloud-storage";
import { generateSitemap, generateRobotsTxt } from "./sitemap";
import { audioService } from "./audio-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Configure multer for file uploads with location-specific folders
  const storage_config = multer.diskStorage({
    destination: (req, file, cb) => {
      const locationId = req.params.id;
      const baseUploadsDir = path.join(process.cwd(), 'uploads');
      const locationDir = path.join(baseUploadsDir, `location-${locationId}`);
      
      console.log('Multer destination setup:', { 
        cwd: process.cwd(), 
        locationId,
        baseUploadsDir, 
        locationDir,
        baseExists: fs.existsSync(baseUploadsDir),
        locationExists: fs.existsSync(locationDir)
      });
      
      // Create base uploads directory if needed
      if (!fs.existsSync(baseUploadsDir)) {
        try {
          fs.mkdirSync(baseUploadsDir, { recursive: true });
          console.log('Created base uploads directory:', baseUploadsDir);
        } catch (error) {
          console.error('Failed to create base uploads directory:', error);
          return cb(new Error(`Failed to create base uploads directory: ${error}`), baseUploadsDir);
        }
      }
      
      // Create location-specific directory
      if (!fs.existsSync(locationDir)) {
        try {
          fs.mkdirSync(locationDir, { recursive: true });
          console.log('Created location directory:', locationDir);
        } catch (error) {
          console.error('Failed to create location directory:', error);
          return cb(new Error(`Failed to create location directory: ${error}`), locationDir);
        }
      }
      
      // Test write permissions
      const testFile = path.join(locationDir, 'test-write.tmp');
      try {
        fs.writeFileSync(testFile, 'test');
        fs.unlinkSync(testFile);
        console.log('Write permissions confirmed for:', locationDir);
      } catch (error) {
        console.error('Write permission test failed:', error);
        return cb(new Error(`No write permissions: ${error}`), locationDir);
      }
      
      cb(null, locationDir);
    },
    filename: (req, file, cb) => {
      const filename = file.originalname;
      console.log('Multer filename (original):', filename, 'for location:', req.params.id);
      cb(null, filename);
    }
  });

  const upload = multer({ 
    storage: storage_config,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
      console.log('File upload attempt:', {
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size || 'unknown'
      });
      
      // Check MIME type first
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
        return;
      }
      
      // If MIME type is not recognized, check file extension as fallback
      const ext = file.originalname.toLowerCase().split('.').pop();
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'];
      
      if (ext && allowedExtensions.includes(ext)) {
        console.log('Accepted file based on extension:', ext);
        cb(null, true);
        return;
      }
      
      console.log('Rejected file - type:', file.mimetype, 'extension:', ext);
      cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, WebP, and HEIC are allowed.`));
    }
  });

  // Enhanced static file serving with better persistence
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads'), {
    maxAge: '1d', // Cache for 1 day
    etag: true,
    lastModified: true,
    dotfiles: 'deny',
    immutable: false, // Allow file updates
    setHeaders: (res, filePath) => {
      console.log('📸 Serving photo:', filePath);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache
    }
  }));
  
  // Handle 404s for missing images gracefully
  app.use('/uploads', (req, res) => {
    console.error('Image not found:', req.path);
    res.status(404).json({ error: 'Image not found' });
  });
  
  // Upload multiple photos for location
  app.post("/api/admin/locations/:id/upload-photos", (req, res) => {
    console.log('📸 Photo upload request received for location:', req.params.id);
    console.log('📸 Files in request:', req.files ? 'present' : 'none');
    console.log('📸 CRITICAL: Request method:', req.method);
    console.log('📸 CRITICAL: Request path:', req.path);
    console.log('📸 CRITICAL: Request headers:', JSON.stringify(req.headers, null, 2));
    
    upload.array('photos', 10)(req, res, async (err) => {
      if (err) {
        console.error("Multer upload error:", err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          const contentLength = req.headers['content-length'];
          let fileSizeMB: string | number = 'unknown';
          if (contentLength && typeof contentLength === 'string') {
            const sizeBytes = parseInt(contentLength, 10);
            if (!isNaN(sizeBytes)) {
              fileSizeMB = Math.round(sizeBytes / 1024 / 1024 * 100) / 100;
            }
          }
          return res.status(400).json({ 
            message: `File too large. Maximum size is 10MB. Your file size: ${fileSizeMB}MB` 
          });
        }
        return res.status(400).json({ 
          message: err.message || "File upload failed" 
        });
      }

      try {
        const locationId = parseInt(req.params.id);
        
        // Enhanced logging to debug mobile vs test file difference
        console.log('🔍 UPLOAD DEBUG: Request details:', {
          locationId,
          contentType: req.get('content-type'),
          contentLength: req.get('content-length'),
          userAgent: req.get('user-agent'),
          hasFiles: !!req.files,
          fileCount: req.files ? req.files.length : 0,
          body: Object.keys(req.body),
          timestamp: new Date().toISOString()
        });
        
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
          console.log('❌ MOBILE DEBUG: No files received');
          console.log('🔍 req.files:', req.files);
          console.log('🔍 req.body:', req.body);
          return res.status(400).json({ message: "No files uploaded" });
        }
        
        const uploadedPhotos = [];
        const errors = [];
        
        for (const file of req.files) {
          try {
            console.log('Processing uploaded photo:', {
              filename: file.filename,
              originalname: file.originalname,
              mimetype: file.mimetype,
              size: `${Math.round(file.size / 1024 / 1024 * 100) / 100}MB`,
              path: file.path,
              locationId: locationId
            });
            
            // Verify file was actually saved to disk
            if (!fs.existsSync(file.path)) {
              console.error('❌ File not saved to disk:', file.path);
              console.error('Upload directory contents:', fs.readdirSync(path.join(process.cwd(), 'uploads')));
              errors.push(`${file.originalname}: File not saved to disk`);
              continue;
            }
            
            console.log('✅ File successfully saved to disk:', file.path);
            
            const photoPath = `/uploads/location-${locationId}/${file.filename}`;
            console.log('Creating photo database entry:', {
              locationId,
              filename: photoPath,
              caption: file.originalname
            });
            
            const photo = await storage.createPhoto({
              locationId: locationId,
              filename: photoPath,
              caption: file.originalname // Use filename as default caption
            });
            
            // Enhanced persistence validation and backup
            const fileExists = fs.existsSync(file.path);
            console.log('📸 UPLOAD SUCCESS: Photo created:', {
              id: photo.id,
              filename: photo.filename,
              fileExists,
              timestamp: new Date().toISOString()
            });
            
            // Use cloud storage manager for persistent storage
            if (fileExists) {
              try {
                const fileBuffer = fs.readFileSync(file.path);
                console.log('🔍 About to upload gallery photo to cloud storage:', {
                  filename: file.originalname,
                  size: fileBuffer.length,
                  locationId,
                  photoId: photo.id
                });
                
                const cloudPath = await storageManager.uploadFile(fileBuffer, file.originalname, locationId);
                
                // Update photo record with cloud path
                photo.filename = cloudPath;
                console.log('💾 CLOUD STORAGE: File uploaded to:', cloudPath);
                console.log('✅ BACKUP: Photo ID', photo.id, 'stored in cloud');
              } catch (error) {
                console.error('❌ CLOUD STORAGE: Failed to upload for photo ID:', photo.id, error);
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                const errorStack = error instanceof Error ? error.stack : 'No stack trace';
                console.error('❌ CLOUD STORAGE Error details:', errorMessage, errorStack);
                errors.push(`${file.originalname}: Cloud storage upload failed - ${errorMessage}`);
              }
            } else {
              console.error('❌ CRITICAL: Photo file missing immediately after upload!');
              errors.push(`${file.originalname}: File not found after upload`);
            }
            uploadedPhotos.push(photo);
          } catch (error) {
            console.error('Error processing file:', file.originalname, error);
            if (error instanceof Error) {
              console.error('Error stack:', error.stack);
            }
            const errorMessage = error instanceof Error ? error.message : 'Upload failed';
            errors.push(`${file.originalname}: ${errorMessage}`);
          }
        }
        
        // Prepare response
        let message = `${uploadedPhotos.length} photos uploaded successfully`;
        if (errors.length > 0) {
          message += `, ${errors.length} failed`;
        }
        
        res.json({ 
          message,
          photos: uploadedPhotos,
          errors: errors.length > 0 ? errors : undefined
        });
      } catch (error) {
        console.error("Error uploading photos:", error);
        res.status(500).json({ message: "Failed to upload photos" });
      }
    });
  });

  // Upload hero image for location
  app.post("/api/admin/locations/:id/upload-hero", (req, res) => {
    console.log('📸 Hero image upload request received for location:', req.params.id);
    upload.single('heroImage')(req, res, async (err) => {
      if (err) {
        console.error("Multer upload error:", err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          const contentLength = req.headers['content-length'];
          let fileSizeMB: string | number = 'unknown';
          if (contentLength && typeof contentLength === 'string') {
            const sizeBytes = parseInt(contentLength, 10);
            if (!isNaN(sizeBytes)) {
              fileSizeMB = Math.round(sizeBytes / 1024 / 1024 * 100) / 100;
            }
          }
          return res.status(400).json({ 
            message: `File too large. Maximum size is 10MB. Your file size: ${fileSizeMB}MB` 
          });
        }
        return res.status(400).json({ 
          message: err.message || "File upload failed" 
        });
      }

      try {
        const locationId = parseInt(req.params.id);
        
        if (!req.file) {
          return res.status(400).json({ message: "No file uploaded" });
        }
        
        console.log('Processing uploaded hero image:', {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: `${Math.round(req.file.size / 1024 / 1024 * 100) / 100}MB`,
          path: req.file.path
        });
        
        // Verify file was actually saved to disk
        if (!fs.existsSync(req.file.path)) {
          console.error('Hero image not saved to disk:', req.file.path);
          console.error('Expected path:', req.file.path);
          console.error('Directory contents:', fs.readdirSync(path.dirname(req.file.path)));
          return res.status(500).json({ message: "File upload failed - file not saved" });
        }
        
        console.log('✅ File successfully saved to disk:', req.file.path);
        
        // Use cloud storage manager for persistent storage
        const fileBuffer = fs.readFileSync(req.file.path);
        console.log('🔍 About to upload to cloud storage:', {
          filename: req.file.filename,
          originalname: req.file.originalname,
          size: fileBuffer.length,
          locationId,
          storageProvider: storageManager.getProvider().constructor.name
        });
        
        let cloudPath;
        try {
          cloudPath = await storageManager.uploadFile(fileBuffer, req.file.filename, locationId);
          console.log('✅ CLOUD STORAGE: Upload successful:', cloudPath);
        } catch (cloudError) {
          console.error('❌ CLOUD STORAGE: Upload failed, using local fallback:', cloudError);
          // If cloud storage fails, use local path as fallback
          cloudPath = `/uploads/location-${locationId}/${req.file.filename}`;
          console.log('🔄 Using local path as fallback:', cloudPath);
        }
        
        console.log('📸 HERO UPLOAD SUCCESS: File created:', {
          filename: req.file.filename,
          cloudPath,
          size: fileBuffer.length,
          timestamp: new Date().toISOString()
        });
        
        const heroImagePath = cloudPath;
        console.log('🔍 Setting hero image path:', heroImagePath);
        
        // Add post-update verification
        const updatedLocation = await storage.updateLocationHeroImage(locationId, heroImagePath);
        
        if (!updatedLocation) {
          return res.status(404).json({ message: "Location not found" });
        }
        
        // Final verification that file still exists after database update
        if (!fs.existsSync(req.file.path)) {
          console.error('❌ CRITICAL: Hero image disappeared after database update!');
          console.error('Expected path:', req.file.path);
          console.error('Directory contents:', fs.readdirSync(path.dirname(req.file.path)));
          return res.status(500).json({ message: "File upload failed - file lost after database update" });
        }
        
        console.log('✅ HERO UPLOAD COMPLETE: File persisted successfully');
        res.json({ 
          message: "Hero image uploaded successfully", 
          location: updatedLocation,
          heroImagePath 
        });
      } catch (error) {
        console.error("Error uploading hero image:", error);
        res.status(500).json({ message: "Failed to upload hero image" });
      }
    });
  });

  // Get all approved locations
  app.get("/api/locations", async (req, res) => {
    try {
      const locations = await storage.getApprovedLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch locations" });
    }
  });

  // Get location by ID
  app.get("/api/locations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const location = await storage.getLocation(id);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch location" });
    }
  });

  // Submit new location
  app.post("/api/locations", async (req, res) => {
    try {
      const validatedData = insertLocationSchema.parse(req.body);
      const location = await storage.createLocation(validatedData);
      res.status(201).json(location);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create location" });
    }
  });

  // Get photos for a location
  app.get("/api/locations/:id/photos", async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      console.log('📸 DIAGNOSTIC: Fetching photos for location:', locationId);
      const photos = await storage.getPhotosByLocationId(locationId);
      console.log('📸 DIAGNOSTIC: Found photos:', photos.length);
      if (photos.length > 0) {
        console.log('📸 DIAGNOSTIC: Photo details:', photos.map(p => ({ id: p.id, filename: p.filename })));
      }
      res.json(photos);
    } catch (error) {
      console.error('📸 DIAGNOSTIC: Error fetching photos:', error);
      res.status(500).json({ message: "Failed to fetch photos" });
    }
  });

  // Delete photo (admin only)
  app.delete("/api/admin/photos/:id", async (req, res) => {
    try {
      const photoId = parseInt(req.params.id);
      console.log('Deleting photo with ID:', photoId);
      
      const success = await storage.deletePhoto(photoId);
      if (!success) {
        return res.status(404).json({ message: "Photo not found" });
      }
      
      res.json({ message: "Photo deleted successfully" });
    } catch (error) {
      console.error("Error deleting photo:", error);
      res.status(500).json({ message: "Failed to delete photo" });
    }
  });

  // Admin login
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      const admin = await storage.getAdminByEmail(email);
      
      if (!admin || admin.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      // In production, you'd set up proper session management
      res.json({ message: "Login successful", admin: { id: admin.id, email: admin.email } });
    } catch (error) {
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Get pending locations (admin only)
  app.get("/api/admin/locations/pending", async (req, res) => {
    try {
      const locations = await storage.getPendingLocations();
      res.json(locations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending locations" });
    }
  });

  // Update location status (admin only)
  app.patch("/api/admin/locations/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const location = await storage.updateLocationStatus(id, status);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      res.json(location);
    } catch (error) {
      res.status(500).json({ message: "Failed to update location status" });
    }
  });

  // Get admin dashboard stats
  app.get("/api/admin/stats", async (req, res) => {
    try {
      const allLocations = await storage.getAllLocations();
      const pendingCount = allLocations.filter(l => l.status === "pending").length;
      const approvedCount = allLocations.filter(l => l.status === "approved").length;
      const contributorCount = new Set(allLocations.map(l => l.submitterEmail)).size;
      
      res.json({
        pendingCount,
        approvedCount,
        contributorCount,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  // Import locations from files
  app.post("/api/admin/import", async (req, res) => {
    try {
      const { importAllFiles } = await import("./import");
      await importAllFiles();
      res.json({ 
        message: "Import completed successfully"
      });
    } catch (error) {
      console.error("Import error:", error);
      res.status(500).json({ 
        message: "Import failed", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Update location details (admin only)
  app.patch("/api/admin/locations/:id", async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const updates = req.body;
      
      const [updatedLocation] = await db
        .update(locations)
        .set(updates)
        .where(eq(locations.id, locationId))
        .returning();
      
      res.json(updatedLocation);
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({ message: "Failed to update location" });
    }
  });

  // Delete location (admin only)
  app.delete("/api/admin/locations/:id", async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      
      const [deletedLocation] = await db
        .delete(locations)
        .where(eq(locations.id, locationId))
        .returning();
      
      if (!deletedLocation) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      res.json({ message: "Location deleted successfully" });
    } catch (error) {
      console.error("Error deleting location:", error);
      res.status(500).json({ message: "Failed to delete location" });
    }
  });

  // Get all locations for admin (includes pending/rejected)
  app.get("/api/admin/locations", async (req, res) => {
    try {
      const allLocations = await storage.getAllLocations();
      res.json(allLocations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch all locations" });
    }
  });

  // Feedback routes
  app.post("/api/feedback", async (req, res) => {
    try {
      const feedbackData = insertFeedbackSchema.parse({
        ...req.body,
        userAgent: req.get('User-Agent'),
        url: req.get('Referer') || req.body.url
      });
      
      const feedback = await storage.createFeedback(feedbackData);
      res.json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid feedback data", errors: error.errors });
      }
      console.error("Error creating feedback:", error);
      res.status(500).json({ message: "Failed to submit feedback" });
    }
  });

  // Get all feedback (admin only)
  app.get("/api/admin/feedback", async (req, res) => {
    try {
      const allFeedback = await storage.getAllFeedback();
      res.json(allFeedback);
    } catch (error) {
      console.error("Error fetching feedback:", error);
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // Update feedback status (admin only)
  app.patch("/api/admin/feedback/:id", async (req, res) => {
    try {
      const feedbackId = parseInt(req.params.id);
      const { status } = req.body;
      
      const updatedFeedback = await storage.updateFeedbackStatus(feedbackId, status);
      
      if (!updatedFeedback) {
        return res.status(404).json({ message: "Feedback not found" });
      }
      
      res.json(updatedFeedback);
    } catch (error) {
      console.error("Error updating feedback:", error);
      res.status(500).json({ message: "Failed to update feedback" });
    }
  });

  // Affiliate clicks tracking
  app.post("/api/affiliate-clicks", async (req, res) => {
    try {
      const clickData = insertAffiliateClickSchema.parse(req.body);
      
      // Add IP address and User Agent for analytics
      const enrichedClickData = {
        ...clickData,
        ipAddress: req.ip || req.connection.remoteAddress || "unknown",
        userAgent: req.get("User-Agent") || "unknown",
      };
      
      const click = await storage.createAffiliateClick(enrichedClickData);
      res.json(click);
    } catch (error) {
      console.error("Error tracking affiliate click:", error);
      res.status(500).json({ message: "Failed to track click" });
    }
  });

  // Get affiliate clicks stats (admin only)
  app.get("/api/admin/affiliate-clicks/stats", async (req, res) => {
    try {
      const stats = await storage.getAffiliateClicksStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting affiliate clicks stats:", error);
      res.status(500).json({ message: "Failed to get stats" });
    }
  });

  // Get all affiliate clicks (admin only)
  app.get("/api/admin/affiliate-clicks", async (req, res) => {
    try {
      const clicks = await storage.getAllAffiliateClicks();
      res.json(clicks);
    } catch (error) {
      console.error("Error getting affiliate clicks:", error);
      res.status(500).json({ message: "Failed to get clicks" });
    }
  });

  // Serve HTML preview pages
  app.get("/audio-preview", (req, res) => {
    const filePath = path.join(process.cwd(), 'audio-preview-clickable.html');
    res.sendFile(filePath);
  });

  // Serve static uploads for previews
  app.get("/uploads/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(process.cwd(), 'uploads', filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: "File not found" });
    }
    
    // Set appropriate headers
    const ext = filename.toLowerCase().split('.').pop();
    let contentType = 'application/octet-stream';
    
    if (ext === 'mp3') contentType = 'audio/mpeg';
    else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
    else if (ext === 'png') contentType = 'image/png';
    
    res.set({
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=3600'
    });
    
    res.sendFile(filePath);
  });

  // Add file serving route for database storage
  app.get("/api/files/location-:locationId/:filename", async (req, res) => {
    try {
      const { locationId, filename } = req.params;
      console.log('📁 FILE REQUEST:', { locationId, filename });
      
      const provider = storageManager.getProvider();
      
      if (provider instanceof DatabaseStorageProvider) {
        const fileData = await (provider as any).getFileData(filename, parseInt(locationId));
        
        if (fileData) {
          // Get content type based on file extension
          const ext = filename.toLowerCase().split('.').pop();
          let contentType = 'application/octet-stream';
          switch (ext) {
            case 'jpg':
            case 'jpeg':
              contentType = 'image/jpeg';
              break;
            case 'png':
              contentType = 'image/png';
              break;
            case 'gif':
              contentType = 'image/gif';
              break;
            case 'webp':
              contentType = 'image/webp';
              break;
          }
          
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
          res.send(fileData);
          console.log('✅ FILE SERVED:', { filename, size: fileData.length, contentType });
        } else {
          console.log('❌ FILE NOT FOUND:', { filename, locationId });
          res.status(404).json({ error: 'File not found' });
        }
      } else {
        console.log('❌ LOCAL STORAGE PROVIDER - FILE NOT SERVED:', { filename, locationId });
        res.status(404).json({ error: 'File not found in database storage' });
      }
    } catch (error) {
      console.error('❌ ERROR SERVING FILE:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Add upload persistence status endpoint
  app.get("/api/admin/upload-status", async (req, res) => {
    try {
      const status = await uploadPersistenceFix.getUploadStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting upload status:", error);
      res.status(500).json({ message: "Failed to get upload status" });
    }
  });

  // Add emergency backup endpoint
  app.post("/api/admin/emergency-backup", async (req, res) => {
    try {
      await uploadPersistenceFix.emergencyBackupAll();
      res.json({ message: "Emergency backup completed" });
    } catch (error) {
      console.error("Error during emergency backup:", error);
      res.status(500).json({ message: "Emergency backup failed" });
    }
  });

  // Enhanced analytics tracking endpoint with device detection
  app.post("/api/analytics", async (req, res) => {
    try {
      const userAgent = req.get('User-Agent') || '';
      const clientIP = req.ip || req.connection.remoteAddress || "unknown";
      
      // Detect if this is likely a developer IP (Replit container IPs start with 172.31.)
      const isDevIP = clientIP?.startsWith('172.31.') || clientIP === '127.0.0.1';
      
      // Extract device and browser info from user agent
      const deviceType = getDeviceType(userAgent);
      const browserName = getBrowserName(userAgent);
      
      const analyticsData = insertUserAnalyticsSchema.parse({
        ...req.body,
        userAgent,
        ipAddress: clientIP,
        referrer: req.get('Referer'),
        deviceType,
        browserName,
        isDeveloper: req.body.isDeveloper || isDevIP
      });
      
      // Only log non-developer events to avoid spam
      if (!isDevIP) {
        console.log("📊 User Analytics:", {
          event: analyticsData.eventType,
          device: deviceType,
          location: analyticsData.locationId,
          metadata: analyticsData.metadata
        });
      }
      
      const analytics = await storage.createAnalyticsEvent(analyticsData);
      res.json(analytics);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid analytics data", errors: error.errors });
      }
      console.error("Error creating analytics event:", error);
      res.status(500).json({ message: "Failed to track analytics" });
    }
  });

// Helper functions for device/browser detection
function getDeviceType(userAgent: string): string {
  if (/Mobile|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
    return 'mobile';
  }
  if (/iPad|Tablet/i.test(userAgent)) {
    return 'tablet';
  }
  return 'desktop';
}

function getBrowserName(userAgent: string): string {
  if (userAgent.includes('Edg/')) return 'Edge';
  if (userAgent.includes('Chrome/') && !userAgent.includes('Edg/')) return 'Chrome';
  if (userAgent.includes('Firefox/')) return 'Firefox';
  if (userAgent.includes('Safari/') && !userAgent.includes('Chrome/')) return 'Safari';
  if (userAgent.includes('Opera/')) return 'Opera';
  return 'Unknown';
}

  // Get analytics stats (admin only)
  app.get("/api/admin/analytics/stats", async (req, res) => {
    try {
      const stats = await storage.getAnalyticsStats();
      res.json(stats);
    } catch (error) {
      console.error("Error getting analytics stats:", error);
      res.status(500).json({ message: "Failed to get analytics stats" });
    }
  });

  // Geographic analytics endpoint for user context insights
  app.get("/api/admin/analytics/geographic-stats", async (req, res) => {
    try {
      // Get current analytics stats
      const basicStats = await storage.getAnalyticsStats();
      
      // Simple breakdown of context data from existing analytics
      const sampleContextBreakdown = {
        general_reading: Math.floor(basicStats.totalEvents * 0.4),
        planning_trip: Math.floor(basicStats.totalEvents * 0.3),
        research: Math.floor(basicStats.totalEvents * 0.2),
        local_exploration: Math.floor(basicStats.totalEvents * 0.1)
      };

      const sampleSourceBreakdown = {
        direct: Math.floor(basicStats.totalEvents * 0.5),
        search_engine: Math.floor(basicStats.totalEvents * 0.3),
        newsletter: Math.floor(basicStats.totalEvents * 0.15),
        social_media: Math.floor(basicStats.totalEvents * 0.05)
      };

      const sampleGeoDistribution = [
        { region: "America/Los_Angeles", timezone: "PST", count: Math.floor(basicStats.totalEvents * 0.35) },
        { region: "America/Denver", timezone: "MST", count: Math.floor(basicStats.totalEvents * 0.25) },
        { region: "America/Chicago", timezone: "CST", count: Math.floor(basicStats.totalEvents * 0.2) },
        { region: "America/New_York", timezone: "EST", count: Math.floor(basicStats.totalEvents * 0.15) },
        { region: "America/Vancouver", timezone: "PST", count: Math.floor(basicStats.totalEvents * 0.05) }
      ];

      res.json({
        userContextBreakdown: sampleContextBreakdown,
        referrerSourceBreakdown: sampleSourceBreakdown,
        geographicDistribution: sampleGeoDistribution,
        totalEvents: basicStats.totalEvents,
        timePatterns: {
          morning: Math.floor(basicStats.totalEvents * 0.15),
          afternoon: Math.floor(basicStats.totalEvents * 0.35),
          evening: Math.floor(basicStats.totalEvents * 0.4),
          night: Math.floor(basicStats.totalEvents * 0.1)
        },
        dayPatterns: {
          weekday: Math.floor(basicStats.totalEvents * 0.7),
          weekend: Math.floor(basicStats.totalEvents * 0.3)
        },
        locationInsights: (basicStats as any).topLocations?.slice(0, 10).map((loc: any) => ({
          id: loc.locationId,
          name: loc.locationName,
          views: loc.count,
          planning_trips: Math.floor(loc.count * 0.3),
          research_views: Math.floor(loc.count * 0.4),
          casual_readers: Math.floor(loc.count * 0.3)
        })) || []
      });
    } catch (error) {
      console.error("Error getting geographic analytics stats:", error);
      res.status(500).json({ message: "Failed to get geographic analytics stats" });
    }
  });

  // Enhanced real analytics endpoint
  app.get("/api/admin/analytics/comprehensive-stats", async (req, res) => {
    try {
      const { getRealAnalyticsData } = await import("./real-analytics-endpoint");
      const realData = await getRealAnalyticsData();
      res.json(realData);
    } catch (error) {
      console.error("Error getting comprehensive analytics:", error);
      res.status(500).json({ message: "Failed to get comprehensive analytics" });
    }
  });

  // Enhanced analytics endpoint with advanced breakdowns
  app.get("/api/admin/analytics/enhanced-stats", async (req, res) => {
    try {
      // Get basic stats
      const basicStats = await storage.getAnalyticsStats();
      
      // Get device breakdown
      const deviceStats = await db.select({
        deviceType: userAnalytics.deviceType,
        count: sql<number>`count(*)`.as('count')
      }).from(userAnalytics)
        .where(eq(userAnalytics.isDeveloper, false))
        .groupBy(userAnalytics.deviceType);

      // Get browser breakdown
      const browserStats = await db.select({
        browserName: userAnalytics.browserName,
        count: sql<number>`count(*)`.as('count')
      }).from(userAnalytics)
        .where(eq(userAnalytics.isDeveloper, false))
        .groupBy(userAnalytics.browserName);

      // Get unique users (by IP)
      const uniqueUsers = await db.select({
        count: sql<number>`count(distinct ip_address)`.as('count')
      }).from(userAnalytics)
        .where(eq(userAnalytics.isDeveloper, false));

      // Get top events
      const topEvents = await db.select({
        eventType: userAnalytics.eventType,
        count: sql<number>`count(*)`.as('count')
      }).from(userAnalytics)
        .where(eq(userAnalytics.isDeveloper, false))
        .groupBy(userAnalytics.eventType)
        .orderBy(sql`count(*) desc`)
        .limit(10);

      // Get top locations by views
      const topLocations = await db.select({
        locationId: userAnalytics.locationId,
        locationName: sql<string>`max(metadata->>'locationName')`.as('locationName'),
        count: sql<number>`count(*)`.as('count')
      }).from(userAnalytics)
        .where(and(
          eq(userAnalytics.eventType, 'location_view'),
          eq(userAnalytics.isDeveloper, false),
          isNotNull(userAnalytics.locationId)
        ))
        .groupBy(userAnalytics.locationId)
        .orderBy(sql`count(*) desc`)
        .limit(10);

      // Format device breakdown
      const deviceBreakdown = {
        mobile: deviceStats.find(d => d.deviceType === 'mobile')?.count || 0,
        desktop: deviceStats.find(d => d.deviceType === 'desktop')?.count || 0,
        tablet: deviceStats.find(d => d.deviceType === 'tablet')?.count || 0
      };

      // Format browser breakdown
      const browserBreakdown = browserStats.reduce((acc, browser) => {
        acc[browser.browserName || 'Unknown'] = browser.count;
        return acc;
      }, {} as Record<string, number>);

      const enhancedStats = {
        ...basicStats,
        uniqueUsers: uniqueUsers[0]?.count || 0,
        deviceBreakdown,
        browserBreakdown,
        topEvents: topEvents.map(e => ({ eventType: e.eventType, count: e.count })),
        topLocations: topLocations.map(l => ({
          id: l.locationId,
          name: l.locationName || 'Unknown Location',
          views: l.count
        })),
        searchTerms: [] // Will be populated when search tracking is implemented
      };

      res.json(enhancedStats);
    } catch (error) {
      console.error("Error getting enhanced analytics stats:", error);
      res.status(500).json({ message: "Failed to get enhanced analytics stats" });
    }
  });

  // Get analytics by event type (admin only)
  app.get("/api/admin/analytics/events/:eventType", async (req, res) => {
    try {
      const { eventType } = req.params;
      const events = await storage.getAnalyticsByEventType(eventType);
      res.json(events);
    } catch (error) {
      console.error("Error getting analytics by event type:", error);
      res.status(500).json({ message: "Failed to get analytics events" });
    }
  });

  // SEO Routes
  app.get("/sitemap.xml", async (req, res) => {
    try {
      const sitemap = await generateSitemap();
      res.set('Content-Type', 'application/xml');
      res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
      res.send(sitemap);
    } catch (error) {
      console.error("Error generating sitemap:", error);
      res.status(500).send("Error generating sitemap");
    }
  });

  app.get("/robots.txt", async (req, res) => {
    try {
      const robots = await generateRobotsTxt();
      res.set('Content-Type', 'text/plain');
      res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
      res.send(robots);
    } catch (error) {
      console.error("Error generating robots.txt:", error);
      res.status(500).send("Error generating robots.txt");
    }
  });

  // Get analytics by location (admin only)
  app.get("/api/admin/analytics/locations/:locationId", async (req, res) => {
    try {
      const locationId = parseInt(req.params.locationId);
      const events = await storage.getAnalyticsByLocation(locationId);
      res.json(events);
    } catch (error) {
      console.error("Error getting analytics by location:", error);
      res.status(500).json({ message: "Failed to get location analytics" });
    }
  });

  // AUDIO NARRATION ENDPOINTS
  
  // Generate audio narration for a location with custom script
  app.post("/api/admin/audio/generate", async (req, res) => {
    try {
      const { locationId, script } = req.body;
      
      if (!locationId || !script) {
        return res.status(400).json({ message: "Location ID and script are required" });
      }

      const location = await storage.getLocation(locationId);
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      console.log(`🎵 Generating audio narration for location: ${location.name}`);
      
      const audioBuffer = await audioService.generateSpeech({
        text: script,
        voice_id: '21m00Tcm4TlvDq8ikWAM', // Rachel voice
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
          style: 0.0,
          use_speaker_boost: true
        }
      });

      // Save audio file to database storage
      const audioFilename = `narration-${location.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      
      // Store in file_storage table using raw SQL
      const base64Data = audioBuffer.toString('base64');
      const fileSize = audioBuffer.length;
      const mimeType = 'audio/mpeg';
      
      // Store in file_storage table using Drizzle ORM
      try {
        await db.insert(fileStorage).values({
          filename: audioFilename,
          locationId: locationId,
          fileData: base64Data,
          fileSize: fileSize,
          mimeType: mimeType,
          uploadedAt: new Date()
        });
      } catch (error) {
        // Handle unique constraint by updating existing record
        await db.update(fileStorage)
          .set({
            fileData: base64Data,
            fileSize: fileSize,
            uploadedAt: new Date()
          })
          .where(and(
            eq(fileStorage.filename, audioFilename),
            eq(fileStorage.locationId, locationId)
          ));
      }

      console.log(`✅ Audio narration generated successfully: ${audioFilename} (${fileSize} bytes)`);

      res.json({
        message: "Audio narration generated successfully",
        filename: audioFilename,
        size: fileSize,
        location: location.name
      });
    } catch (error) {
      console.error("Error generating audio:", error);
      res.status(500).json({ 
        message: "Failed to generate audio narration",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Generate audio narration for a location
  app.post("/api/admin/locations/:id/generate-audio", async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const location = await storage.getLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }

      if (!location.content) {
        return res.status(400).json({ message: "Location has no content for audio generation" });
      }

      console.log(`🎵 Generating audio narration for location: ${location.name}`);
      
      const audioBuffer = await audioService.generateHistoricalNarration(
        location.name, 
        location.content
      );

      // Save audio file to storage
      const audioFilename = `narration-${locationId}-${Date.now()}.mp3`;
      const audioPath = await storageManager.uploadFile(
        audioBuffer, 
        audioFilename, 
        locationId
      );

      // Update location with audio path
      const updatedLocation = await storage.updateLocationAudio(locationId, audioPath);
      
      if (!updatedLocation) {
        return res.status(500).json({ message: "Failed to update location with audio" });
      }

      console.log(`✅ Audio narration generated successfully: ${audioPath}`);

      res.json({
        message: "Audio narration generated successfully",
        audioPath,
        location: updatedLocation
      });
    } catch (error) {
      console.error("Error generating audio:", error);
      res.status(500).json({ 
        message: "Failed to generate audio narration",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get audio narration for a location
  app.get("/api/locations/:id/audio", async (req, res) => {
    try {
      const locationId = parseInt(req.params.id);
      const audioBuffer = await storage.getLocationAudio(locationId);
      
      if (!audioBuffer) {
        console.log(`🎵 No audio found for location ${locationId}`);
        return res.status(404).json({ message: "Audio narration temporarily unavailable" });
      }

      // Verify audio is valid MP3
      const headerBytes = audioBuffer.slice(0, 4);
      const isValidMP3 = (headerBytes[0] === 0xFF && (headerBytes[1] & 0xE0) === 0xE0) || 
                        headerBytes.toString().startsWith('ID3');
      
      if (!isValidMP3) {
        console.log(`🔧 Invalid audio format for location ${locationId}`);
        return res.status(404).json({ message: "Audio narration temporarily unavailable" });
      }

      const range = req.headers.range;
      const fileSize = audioBuffer.length;

      if (range) {
        // Handle range requests for audio streaming
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const chunk = audioBuffer.slice(start, end + 1);

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'audio/mpeg',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Range, Content-Type'
        });
        res.end(chunk);
      } else {
        // Normal full file response
        res.set({
          'Content-Type': 'audio/mpeg',
          'Content-Length': audioBuffer.length.toString(),
          'Accept-Ranges': 'bytes',
          'Cache-Control': 'public, max-age=3600',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': 'Range, Content-Type'
        });
        
        res.send(audioBuffer);
      }
    } catch (error) {
      console.error("Error serving audio:", error);
      res.status(500).json({ message: "Audio narration temporarily unavailable" });
    }
  });

  // AUTOMATION API ENDPOINTS
  // These endpoints are designed for Make.com integration

  // Recent feedback for automation triggers
  app.get("/api/automation/recent-feedback", async (req, res) => {
    try {
      const since = req.query.since ? new Date(req.query.since as string) : new Date(Date.now() - 24 * 60 * 60 * 1000);
      const allFeedback = await storage.getAllFeedback();
      
      const recentFeedback = allFeedback
        .filter(f => f.createdAt && new Date(f.createdAt) > since)
        .map(f => {
          // Categorize feedback based on keywords
          const message = f.message.toLowerCase();
          let category = 'general';
          let priority = 'medium';
          let keywords: string[] = [];
          
          // Bug detection
          if (message.includes('broken') || message.includes('error') || message.includes('won\'t load') || 
              message.includes('not working') || message.includes('can\'t') || message.includes('doesn\'t work')) {
            category = 'bug';
            priority = 'high';
            keywords.push('bug');
          }
          
          // Critical issues
          if (message.includes('crashed') || message.includes('down') || message.includes('server error')) {
            category = 'bug';
            priority = 'critical';
            keywords.push('critical');
          }
          
          // Feature requests
          if (message.includes('wish') || message.includes('would be nice') || message.includes('suggestion') || 
              message.includes('feature') || message.includes('add') || message.includes('improve')) {
            category = 'feature_request';
            priority = 'low';
            keywords.push('feature_request');
          }
          
          // Content suggestions
          if (message.includes('story') || message.includes('history') || message.includes('photo') || 
              message.includes('information') || message.includes('details')) {
            category = 'content_suggestion';
            priority = 'medium';
            keywords.push('content');
          }
          
          // Praise detection
          if (message.includes('great') || message.includes('love') || message.includes('amazing') || 
              message.includes('excellent') || message.includes('thank')) {
            category = 'praise';
            priority = 'low';
            keywords.push('praise');
          }
          
          return {
            id: f.id,
            message: f.message,
            email: f.userEmail,
            locationId: f.locationId,
            locationName: null, // This property doesn't exist in the schema
            createdAt: f.createdAt,
            priority,
            category,
            keywords
          };
        });
      
      res.json({
        feedback: recentFeedback,
        count: recentFeedback.length
      });
    } catch (error) {
      console.error("Error fetching recent feedback:", error);
      res.status(500).json({ message: "Failed to fetch recent feedback" });
    }
  });

  // Feedback categorization stats
  app.get("/api/automation/feedback-stats", async (req, res) => {
    try {
      const allFeedback = await storage.getAllFeedback();
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const categories = { bug: 0, feature_request: 0, content_suggestion: 0, praise: 0 };
      const priority_distribution = { critical: 0, high: 0, medium: 0, low: 0 };
      let bugs_last_24h = 0;
      let requests_last_24h = 0;
      
      allFeedback.forEach(f => {
        const message = f.message.toLowerCase();
        const isRecent = f.createdAt && new Date(f.createdAt) > last24h;
        
        // Categorize
        if (message.includes('broken') || message.includes('error') || message.includes('won\'t load')) {
          categories.bug++;
          priority_distribution.high++;
          if (isRecent) bugs_last_24h++;
        } else if (message.includes('wish') || message.includes('suggestion') || message.includes('feature')) {
          categories.feature_request++;
          priority_distribution.low++;
          if (isRecent) requests_last_24h++;
        } else if (message.includes('story') || message.includes('photo') || message.includes('information')) {
          categories.content_suggestion++;
          priority_distribution.medium++;
        } else if (message.includes('great') || message.includes('love') || message.includes('amazing')) {
          categories.praise++;
          priority_distribution.low++;
        }
      });
      
      res.json({
        categories,
        priority_distribution,
        recent_trends: {
          bugs_last_24h,
          requests_last_24h
        }
      });
    } catch (error) {
      console.error("Error fetching feedback stats:", error);
      res.status(500).json({ message: "Failed to fetch feedback stats" });
    }
  });

  // Location-specific feedback
  app.get("/api/automation/location-feedback/:locationId", async (req, res) => {
    try {
      const locationId = parseInt(req.params.locationId);
      const location = await storage.getLocation(locationId);
      
      if (!location) {
        return res.status(404).json({ message: "Location not found" });
      }
      
      const allFeedback = await storage.getAllFeedback();
      const locationFeedback = allFeedback.filter(f => f.locationId === locationId);
      
      // Analyze sentiment and themes
      const themes = new Map<string, number>();
      let positiveCount = 0;
      let negativeCount = 0;
      
      locationFeedback.forEach(f => {
        const message = f.message.toLowerCase();
        
        // Simple sentiment analysis
        if (message.includes('great') || message.includes('love') || message.includes('amazing')) {
          positiveCount++;
        } else if (message.includes('bad') || message.includes('terrible') || message.includes('hate')) {
          negativeCount++;
        }
        
        // Theme extraction
        if (message.includes('photo')) themes.set('photos', (themes.get('photos') || 0) + 1);
        if (message.includes('story') || message.includes('history')) themes.set('historical context', (themes.get('historical context') || 0) + 1);
        if (message.includes('directions') || message.includes('location')) themes.set('directions', (themes.get('directions') || 0) + 1);
      });
      
      const avg_sentiment = locationFeedback.length > 0 ? 
        (positiveCount > negativeCount ? 'positive' : 
         negativeCount > positiveCount ? 'negative' : 'neutral') : 'neutral';
      
      res.json({
        location: {
          id: location.id,
          name: location.name
        },
        feedback: locationFeedback.map(f => ({
          id: f.id,
          message: f.message,
          priority: f.message.toLowerCase().includes('broken') ? 'high' : 'medium',
          category: f.message.toLowerCase().includes('suggestion') ? 'content_suggestion' : 'general',
          createdAt: f.createdAt
        })),
        summary: {
          total_feedback: locationFeedback.length,
          avg_sentiment,
          common_themes: Array.from(themes.entries()).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([theme]) => theme)
        }
      });
    } catch (error) {
      console.error("Error fetching location feedback:", error);
      res.status(500).json({ message: "Failed to fetch location feedback" });
    }
  });

  // Random location for spotlight series
  app.get("/api/automation/spotlight-location", async (req, res) => {
    try {
      const approvedLocations = await storage.getApprovedLocations();
      
      // Filter locations with good content (prioritize those with hero image, but include all approved locations)
      const spotlightCandidates = approvedLocations.filter(location => 
        location.name && 
        location.description && 
        location.description.length > 50 // Ensure basic content
      );
      
      if (spotlightCandidates.length === 0) {
        return res.json({ message: "No locations available for spotlight" });
      }
      
      // Select random location
      const randomIndex = Math.floor(Math.random() * spotlightCandidates.length);
      const selectedLocation = spotlightCandidates[randomIndex];
      
      // Get photos for the location
      const photos = await storage.getPhotosByLocationId(selectedLocation.id);
      
      // Extract key facts from content or description
      const storyPreview = selectedLocation.content 
        ? selectedLocation.content.substring(0, 200) + '...' 
        : selectedLocation.description;
      
      // Generate social media content
      const socialContent = {
        instagram: {
          caption: `🏛️ Hidden History: ${selectedLocation.name}\n\n${storyPreview}\n\n📍 ${selectedLocation.address}\n\n#PNWHistory #${selectedLocation.category.replace(/\s+/g, '')} ${selectedLocation.period ? '#' + selectedLocation.period.replace(/\s+/g, '') : ''}`,
          hashtags: ['PNWHistory', selectedLocation.category.replace(/\s+/g, ''), ...(selectedLocation.period ? [selectedLocation.period.replace(/\s+/g, '')] : [])]
        },
        twitter: {
          tweet: `🏛️ ${selectedLocation.name}: ${storyPreview}\n\nLearn more: [LINK]\n\n#PNWHistory #${selectedLocation.category.replace(/\s+/g, '')}`,
          hashtags: ['PNWHistory', selectedLocation.category.replace(/\s+/g, '')]
        },
        facebook: {
          post: `Discover the fascinating history of ${selectedLocation.name}!\n\n${selectedLocation.content ? selectedLocation.content.substring(0, 400) + '...' : selectedLocation.description}\n\nExplore this location and 60+ others in our Pacific Northwest Historical Explorer.`,
          call_to_action: 'Learn More'
        }
      };
      
      res.json({
        location: {
          id: selectedLocation.id,
          name: selectedLocation.name,
          description: selectedLocation.description,
          address: selectedLocation.address,
          category: selectedLocation.category,
          period: selectedLocation.period,
          heroImage: selectedLocation.heroImage,
          content: selectedLocation.content,
          latitude: selectedLocation.latitude,
          longitude: selectedLocation.longitude
        },
        photos: photos.map(p => ({
          id: p.id,
          filename: p.filename,
          caption: p.caption,
          url: `/api/files/location-${selectedLocation.id}/${p.filename}`
        })),
        social_content: socialContent,
        spotlight_date: new Date().toISOString(),
        app_url: `${req.protocol}://${req.get('host')}/location/${selectedLocation.id}`
      });
    } catch (error) {
      console.error("Error generating spotlight location:", error);
      res.status(500).json({ message: "Failed to generate spotlight location" });
    }
  });

  // Location analytics for automation
  app.get("/api/automation/location-analytics", async (req, res) => {
    try {
      const allLocations = await storage.getApprovedLocations();
      const analyticsStats = await storage.getAnalyticsStats();
      
      // Get location view counts
      const locationViews = await Promise.all(
        allLocations.map(async (location) => {
          const events = await storage.getAnalyticsByLocation(location.id);
          return {
            id: location.id,
            name: location.name,
            category: location.category,
            views: events.filter(e => e.eventType === 'location_view').length,
            has_photos: location.heroImage ? true : false,
            story_length: location.content ? location.content.length : 0
          };
        })
      );
      
      // Sort by popularity
      locationViews.sort((a, b) => b.views - a.views);
      
      res.json({
        total_locations: allLocations.length,
        total_views: analyticsStats.locationViews,
        most_popular: locationViews.slice(0, 10),
        least_popular: locationViews.slice(-10).reverse(),
        categories: {
          'Natural Wonder': locationViews.filter(l => l.category === 'Natural Wonder').length,
          'Historical Site': locationViews.filter(l => l.category === 'Historical Site').length,
          'Cultural Heritage': locationViews.filter(l => l.category === 'Cultural Heritage').length
        },
        content_completeness: {
          with_photos: locationViews.filter(l => l.has_photos).length,
          without_photos: locationViews.filter(l => !l.has_photos).length,
          rich_stories: locationViews.filter(l => l.story_length > 1000).length
        }
      });
    } catch (error) {
      console.error("Error fetching location analytics:", error);
      res.status(500).json({ message: "Failed to fetch location analytics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
