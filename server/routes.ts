import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLocationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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

  const httpServer = createServer(app);
  return httpServer;
}
