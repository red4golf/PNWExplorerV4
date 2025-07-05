import type { Express } from "express";
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
  // Configure multer for file uploads
  const storage_config = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadsDir = path.join(process.cwd(), 'uploads');
      console.log('Multer destination check:', { 
        cwd: process.cwd(), 
        uploadsDir, 
        exists: fs.existsSync(uploadsDir) 
      });
      
      if (!fs.existsSync(uploadsDir)) {
        try {
          fs.mkdirSync(uploadsDir, { recursive: true });
          console.log('Created uploads directory:', uploadsDir);
        } catch (error) {
          console.error('Failed to create uploads directory:', error);
          return cb(error, uploadsDir);
        }
      }
      cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const filename = 'location-' + uniqueSuffix + path.extname(file.originalname);
      console.log('Multer filename generated:', filename);
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
      
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        console.log('Rejected file type:', file.mimetype);
        cb(new Error(`Invalid file type: ${file.mimetype}. Only JPEG, PNG, GIF, WebP, and HEIC are allowed.`));
      }
    }
  });

  // Serve uploaded images
  app.use('/uploads', (req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
  });
  
  // Upload multiple photos for location
  app.post("/api/admin/locations/:id/upload-photos", (req, res) => {
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
        
        if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
          return res.status(400).json({ message: "No files uploaded" });
        }
        
        const uploadedPhotos = [];
        
        for (const file of req.files) {
          console.log('Successfully uploaded photo:', {
            filename: file.filename,
            originalname: file.originalname,
            mimetype: file.mimetype,
            size: `${Math.round(file.size / 1024 / 1024 * 100) / 100}MB`
          });
          
          const photoPath = `/uploads/${file.filename}`;
          const photo = await storage.createPhoto({
            locationId: locationId,
            filename: photoPath,
            caption: file.originalname // Use filename as default caption
          });
          
          uploadedPhotos.push(photo);
        }
        
        res.json({ 
          message: `${uploadedPhotos.length} photos uploaded successfully`, 
          photos: uploadedPhotos
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
        
        console.log('Successfully uploaded file:', {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: `${Math.round(req.file.size / 1024 / 1024 * 100) / 100}MB`
        });
        
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
      const photos = await storage.getPhotosByLocationId(locationId);
      res.json(photos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch photos" });
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
