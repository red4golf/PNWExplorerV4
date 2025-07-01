import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
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
  content: text("content"), // Rich story content
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

// Relations
export const locationsRelations = relations(locations, ({ many }) => ({
  photos: many(photos),
}));

export const photosRelations = relations(photos, ({ one }) => ({
  location: one(locations, {
    fields: [photos.locationId],
    references: [locations.id],
  }),
}));

export type InsertLocation = z.infer<typeof insertLocationSchema>;
export type Location = typeof locations.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertAdmin = z.infer<typeof insertAdminSchema>;
export type Admin = typeof admins.$inferSelect;
