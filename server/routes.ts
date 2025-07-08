import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLocationSchema, insertFeedbackSchema, insertAffiliateClickSchema, locations } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";
import { eq } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";

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
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = 'photo-' + uniqueSuffix + path.extname(file.originalname);
      console.log('Multer filename generated:', filename, 'for location:', req.params.id);
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
            
            // Create immediate backup for persistence
            if (fileExists) {
              try {
                const backupPath = file.path + '.backup';
                fs.copyFileSync(file.path, backupPath);
                console.log('💾 BACKUP: Created backup copy for photo ID:', photo.id);
              } catch (error) {
                console.error('❌ BACKUP: Failed to create backup for photo ID:', photo.id, error);
              }
            } else {
              console.error('❌ CRITICAL: Photo file missing immediately after upload!');
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
          return res.status(500).json({ message: "File upload failed - file not saved" });
        }
        
        const heroImagePath = `/uploads/${req.file.filename}`;
        const updatedLocation = await storage.updateLocationHeroImage(locationId, heroImagePath);
        
        if (!updatedLocation) {
          return res.status(404).json({ message: "Location not found" });
        }
        
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

  const httpServer = createServer(app);
  return httpServer;
}
