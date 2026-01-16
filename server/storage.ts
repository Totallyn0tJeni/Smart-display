import { db } from "./db";
import {
  ledStates,
  photos,
  focusSessions,
  type InsertLedState,
  type UpdateLedStateRequest,
  type LedState,
  type Photo,
  type InsertPhoto,
  type FocusSession,
  type InsertFocusSession
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getLedState(): Promise<LedState | undefined>;
  updateLedState(updates: UpdateLedStateRequest): Promise<LedState>;
  
  getPhotos(): Promise<Photo[]>;
  createPhoto(photo: InsertPhoto): Promise<Photo>;

  startFocusSession(session: InsertFocusSession): Promise<FocusSession>;
  getCurrentFocusSession(): Promise<FocusSession | undefined>;
  stopFocusSession(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getLedState(): Promise<LedState | undefined> {
    const [state] = await db.select().from(ledStates).limit(1);
    return state;
  }

  async updateLedState(updates: UpdateLedStateRequest): Promise<LedState> {
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
    const [newPhoto] = await db.insert(photos).values({
      ...photo,
      source: photo.source || "local"
    }).returning();
    return newPhoto;
  }

  async startFocusSession(session: InsertFocusSession): Promise<FocusSession> {
    // Stop any existing active sessions
    await this.stopFocusSession();
    const [newSession] = await db.insert(focusSessions).values(session).returning();
    return newSession;
  }

  async getCurrentFocusSession(): Promise<FocusSession | undefined> {
    const [session] = await db.select().from(focusSessions).where(eq(focusSessions.isActive, true)).limit(1);
    return session;
  }

  async stopFocusSession(): Promise<void> {
    await db.update(focusSessions).set({ isActive: false }).where(eq(focusSessions.isActive, true));
  }
}

export const storage = new DatabaseStorage();
