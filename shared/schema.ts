import { pgTable, text, serial, integer, boolean, timestamp, real, unique, varchar, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(), // SEO-friendly URL slug
  description: text("description").notNull(),
  address: text("address"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  category: text("category").notNull(),
  period: text("period"),
  photos: text("photos").array().default([]),
  heroImage: text("hero_image"), // Main image for the location
  content: text("content"), // Rich story content
  audioNarration: text("audio_narration"), // Generated audio file path/URL
  recommendedBooks: text("recommended_books"), // JSON array of book recommendations with affiliate links
  submitterName: text("submitter_name"),
  submitterEmail: text("submitter_email"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id),
  filename: text("filename").notNull(),
  caption: text("caption"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
});

export const admins = pgTable("admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // "general", "bug", "feature", "location"
  title: text("title").notNull(),
  message: text("message").notNull(),
  userEmail: text("user_email"),
  userName: text("user_name"),
  locationId: integer("location_id").references(() => locations.id),
  userAgent: text("user_agent"),
  url: text("url"),
  status: text("status").notNull().default("new"), // new, in-progress, resolved
  createdAt: timestamp("created_at").defaultNow(),
});

export const affiliateClicks = pgTable("affiliate_clicks", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").references(() => locations.id),
  bookTitle: text("book_title").notNull(),
  clickedAt: timestamp("clicked_at").defaultNow(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
});

export const fileStorage = pgTable("file_storage", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  locationId: integer("location_id").notNull(),
  fileData: text("file_data").notNull(), // Binary data stored as base64 text
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
}, (table) => ({
  uniqueFilename: unique().on(table.filename, table.locationId),
}));

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: varchar("key", { length: 100 }).notNull().unique(),
  value: text("value"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userAnalytics = pgTable("user_analytics", {
  id: serial("id").primaryKey(),
  eventType: varchar("event_type", { length: 50 }).notNull(), // 'qr_scan', 'share_link', 'page_view', 'location_view', 'search', 'filter_use', 'directions_click', 'photo_view', 'book_click', 'audio_play', 'feedback_submit'
  locationId: integer("location_id").references(() => locations.id),
  referrer: text("referrer"),
  userAgent: text("user_agent"),
  ipAddress: varchar("ip_address", { length: 45 }),
  sessionId: varchar("session_id", { length: 255 }),
  isDeveloper: boolean("is_developer").default(false),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata"), // Additional data like shared_via, qr_location, search_terms, filter_criteria, time_spent, etc.
  deviceType: varchar("device_type", { length: 20 }), // mobile, tablet, desktop
  browserName: varchar("browser_name", { length: 50 }),
  timeSpent: integer("time_spent"), // seconds spent on page/location
  city: varchar("city", { length: 100 }),
  region: varchar("region", { length: 100 }),
  country: varchar("country", { length: 100 }),
  countryCode: varchar("country_code", { length: 10 }),
});

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
  slug: true, // Auto-generated from name
  createdAt: true,
  status: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  uploadedAt: true,
});

export const insertAdminSchema = createInsertSchema(admins).omit({
  id: true,
});

export const insertFeedbackSchema = createInsertSchema(feedback).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertAffiliateClickSchema = createInsertSchema(affiliateClicks).omit({
  id: true,
  clickedAt: true,
});

export const insertUserAnalyticsSchema = createInsertSchema(userAnalytics).omit({
  id: true,
  timestamp: true,
});

// Relations
export const locationsRelations = relations(locations, ({ many }) => ({
  photos: many(photos),
  feedback: many(feedback),
  affiliateClicks: many(affiliateClicks),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  location: one(locations, {
    fields: [photos.locationId],
    references: [locations.id],
  }),
}));

export const feedbackRelations = relations(feedback, ({ one }) => ({
  location: one(locations, {
    fields: [feedback.locationId],
    references: [locations.id],
  }),
}));

export const affiliateClicksRelations = relations(affiliateClicks, ({ one }) => ({
  location: one(locations, {
    fields: [affiliateClicks.locationId],
    references: [locations.id],
  }),
}));

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type Feedback = typeof feedback.$inferSelect;
export type InsertAffiliateClick = z.infer<typeof insertAffiliateClickSchema>;
export type AffiliateClick = typeof affiliateClicks.$inferSelect;
export type InsertUserAnalytics = z.infer<typeof insertUserAnalyticsSchema>;
export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
