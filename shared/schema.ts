import { pgTable, text, serial, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const ledStates = pgTable("led_states", {
  id: serial("id").primaryKey(),
  color: text("color").notNull().default("#ffffff"),
  mode: text("mode").notNull().default("static"), // static, pulse, fade, sunrise
  brightness: integer("brightness").notNull().default(100),
  isOn: boolean("is_on").notNull().default(true),
});

export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  caption: text("caption"),
});

export const insertLedStateSchema = createInsertSchema(ledStates).omit({ id: true });
export const insertPhotoSchema = createInsertSchema(photos).omit({ id: true });

export type LedState = typeof ledStates.$inferSelect;
export type InsertLedState = z.infer<typeof insertLedStateSchema>;
export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;

export type UpdateLedStateRequest = Partial<InsertLedState>;
