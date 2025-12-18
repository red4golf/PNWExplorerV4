import { Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { Pool } from "@neondatabase/serverless";
import crypto from "crypto";

const PgSession = connectPgSimple(session);

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function getSessionSecret(): string {
  if (process.env.SESSION_SECRET) {
    return process.env.SESSION_SECRET;
  }
  
  if (process.env.NODE_ENV === "production") {
    console.error("⚠️ SECURITY WARNING: SESSION_SECRET not set in production! Generating temporary secret.");
    console.error("⚠️ Please set SESSION_SECRET environment variable for persistent sessions.");
  }
  
  return crypto.randomBytes(32).toString("hex");
}

export const sessionMiddleware = session({
  store: new PgSession({
    pool: pool as any,
    tableName: "admin_sessions",
    createTableIfMissing: false,
  }),
  secret: getSessionSecret(),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: "lax",
  },
});

declare module "express-session" {
  interface SessionData {
    adminId: number;
    adminEmail: string;
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.session?.adminId) {
    return res.status(401).json({ message: "Unauthorized - Admin login required" });
  }
  next();
}

export function isAuthenticated(req: Request): boolean {
  return !!req.session?.adminId;
}
