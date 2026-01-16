import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  // LED Routes
  app.get(api.led.get.path, async (req, res) => {
    let state = await storage.getLedState();
    if (!state) {
      // Initialize if empty
      state = await storage.updateLedState({});
    }
    res.json(state);
  });

  app.post(api.led.update.path, async (req, res) => {
    try {
      const input = api.led.update.input.parse(req.body);
      const updated = await storage.updateLedState(input);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Photo Routes
  app.get(api.photos.list.path, async (req, res) => {
    const photos = await storage.getPhotos();
    res.json(photos);
  });

  app.post(api.photos.create.path, async (req, res) => {
    try {
      const input = api.photos.create.input.parse(req.body);
      const photo = await storage.createPhoto(input);
      res.status(201).json(photo);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // VSCO Simulation Endpoint
  app.post("/api/vsco/import", async (req, res) => {
    const { url } = req.body;
    // Mock import logic
    const photo = await storage.createPhoto({
      url: url || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      caption: "Imported from VSCO",
      source: "vsco"
    });
    res.json(photo);
  });

  // Seed data on startup
  await seedDatabase();

  // Focus Session Routes
  app.get(api.focus.current.path, async (req, res) => {
    const session = await storage.getCurrentFocusSession();
    res.json(session || null);
  });

  app.post(api.focus.start.path, async (req, res) => {
    try {
      const input = api.focus.start.input.parse(req.body);
      const session = await storage.startFocusSession(input);
      res.status(201).json(session);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.focus.stop.path, async (req, res) => {
    await storage.stopFocusSession();
    res.json({ success: true });
  });

  // Weather Route
  app.get(api.weather.get.path, async (req, res) => {
    // Mock weather data
    res.json({
      temp: 22,
      condition: "Partly Cloudy",
      location: "San Francisco, CA",
      high: 25,
      low: 18
    });
  });

  return httpServer;
}

// Seed function to ensure we have some initial data
export async function seedDatabase() {
  const existingState = await storage.getLedState();
  if (!existingState) {
    await storage.updateLedState({
      color: "#ff00ff", // Fun default color
      mode: "pulse"
    });
  }

  const photos = await storage.getPhotos();
  if (photos.length === 0) {
    await storage.createPhoto({
      url: "https://images.unsplash.com/photo-1518020382113-a7e8fc38eac9?auto=format&fit=crop&w=1600&q=80",
      caption: "Rainy Day"
    });
    await storage.createPhoto({
      url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=80",
      caption: "Mountain Lake"
    });
    await storage.createPhoto({
      url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1600&q=80",
      caption: "Sunset Fields"
    });
  }
}
