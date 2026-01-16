import { db } from "./db";
import {
  ledStates,
  photos,
  type InsertLedState,
  type UpdateLedStateRequest,
  type LedState,
  type Photo,
  type InsertPhoto
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getLedState(): Promise<LedState | undefined>;
  updateLedState(updates: UpdateLedStateRequest): Promise<LedState>;
  
  getPhotos(): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;
}

export class DatabaseStorage implements IStorage {
  async getLedState(): Promise<LedState | undefined> {
    const [state] = await db.select().from(ledStates).limit(1);
    return state;
  }

  async updateLedState(updates: UpdateLedStateRequest): Promise<LedState> {
    // Check if state exists, if not create default
    let [existing] = await db.select().from(ledStates).limit(1);
    
    if (!existing) {
      const [created] = await db.insert(ledStates).values({
        color: "#ffffff",
        mode: "static",
        brightness: 100,
        isOn: true,
        ...updates
      }).returning();
      return created;
    }

    const [updated] = await db.update(ledStates)
      .set(updates)
      .where(eq(ledStates.id, existing.id))
      .returning();
    return updated;
  }

  async getPhotos(): Promise<Photo[]> {
    return await db.select().from(photos);
  }

  async createPhoto(photo: InsertPhoto): Promise<Photo> {
    const [newPhoto] = await db.insert(photos).values(photo).returning();
    return newPhoto;
  }
}

export const storage = new DatabaseStorage();
