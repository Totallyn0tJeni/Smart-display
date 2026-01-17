import { pgTable, text, serial, boolean, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ledStates = pgTable("led_states", {
  id: serial("id").primaryKey(),
  color: text("color").notNull().default("#ffffff"),
  mode: text("mode").notNull().default("static"), // static, pulse, fade, sunrise
  brightness: integer("brightness").notNull().default(100),
  isOn: boolean("is_on").notNull().default(true),
  backgroundUrl: text("background_url"),
  backgroundColor: text("background_color").default("#000000"),
  backgroundGradient: text("background_gradient"),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  caption: text("caption"),
  source: text("source").default("local"), // "local", "vsco"
});

export const focusSessions = pgTable("focus_sessions", {
  id: serial("id").primaryKey(),
  duration: integer("duration").notNull(), // in minutes
  startTime: timestamp("start_time").defaultNow().notNull(),
  isActive: boolean("is_active").default(true).notNull(),
});

export const insertLedStateSchema = createInsertSchema(ledStates).omit({ id: true });
export const insertPhotoSchema = createInsertSchema(photos).omit({ id: true });
export const insertFocusSessionSchema = createInsertSchema(focusSessions).omit({ id: true, startTime: true });

export type LedState = typeof ledStates.$inferSelect;
export type InsertLedState = z.infer<typeof insertLedStateSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type FocusSession = typeof focusSessions.$inferSelect;
export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;

export type UpdateLedStateRequest = Partial<InsertLedState>;
