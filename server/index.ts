import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import "./ensure-uploads";
import { preservePhotos, restorePhotos } from "./migrations/preserve-photos";
// Enhanced static file serving for photo persistence
import { photoPersistenceManager } from "./photo-persistence";
import { photoBackupScheduler } from "./photo-backup-scheduler";
import path from "path";

const app = express();

// Add CORS middleware to handle cross-origin requests
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, HEAD');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: false, limit: '50mb' }));

// Note: /uploads static file serving is handled in routes.ts for proper database/filesystem routing
// Photo system completely disabled to prevent interference
console.log('📸 Photo monitoring systems disabled for stable uploads');

// Initialize upload persistence fix
import { uploadPersistenceFix } from './upload-persistence-fix';
uploadPersistenceFix.startMonitoring().then(() => {
  console.log('✅ Upload persistence monitoring initialized');
}).catch(error => {
  console.error('❌ Failed to initialize upload persistence monitoring:', error);
});

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    
    log(`Error: ${message}`, "express");
    res.status(status).json({ message });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, async () => {
    log(`serving on port ${port}`);
    
    // Initialize photo persistence validation and backup scheduler
    try {
      await photoPersistenceManager.validatePhotosIntegrity();
      photoBackupScheduler.startScheduledBackups();
      log('Photo persistence and backup systems initialized');
    } catch (error) {
      log(`Photo persistence warning: ${error}`);
    }
  });
})();
