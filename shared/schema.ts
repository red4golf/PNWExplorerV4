import { pgTable, text, serial, integer, boolean, timestamp, real, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const locations = pgTable("locations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  address: text("address"),
  latitude: real("latitude"),
  longitude: real("longitude"),
  category: text("category").notNull(),
  period: text("period"),
  photos: text("photos").array().default([]),
  heroImage: text("hero_image"), // Main image for the location
  content: text("content"), // Rich story content
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
  fileData: text("file_data", { mode: 'binary' }).notNull(), // Using binary mode for BYTEA
  fileSize: integer("file_size").notNull(),
  mimeType: text("mime_type"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
}, (table) => ({
  uniqueFilename: unique().on(table.filename, table.locationId),
}));

export const insertLocationSchema = createInsertSchema(locations).omit({
  id: true,
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
