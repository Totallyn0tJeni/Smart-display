import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

// ================= LED HARDWARE LOGIC (Strictly using Python Script) =================
import { spawn } from "child_process";
import axios from "axios";

let pythonProcess: any;
let isHardwareConnected = false;

async function initGpio() {
  try {
    // Start the Python LED service on port 6000
    pythonProcess = spawn("python3", ["server/scripts/led_service.py"]);
    
    pythonProcess.stdout.on("data", (data: any) => {
      console.log(`[LED Python] stdout: ${data}`);
      if (data.toString().includes("Running on")) {
        isHardwareConnected = true;
      }
    });

    pythonProcess.stderr.on("data", (data: any) => {
      console.error(`[LED Python] stderr: ${data}`);
    });

    pythonProcess.on("close", (code: number) => {
      console.log(`[LED Python] process exited with code ${code}`);
      isHardwareConnected = false;
    });

    // Brief delay to allow Python server to start
    setTimeout(() => {
      isHardwareConnected = true;
    }, 2000);

  } catch (err) {
    console.error("Failed to start Python LED service:", err);
    isHardwareConnected = false;
  }
}

initGpio();

async function applyRgbHardware(r: number, g: number, b: number, isOn: boolean) {
  if (!isHardwareConnected) return;
  
  try {
    // Call the Python service endpoints
    await axios.post("http://localhost:6000/led", {
      enabled: isOn,
      color: [r, g, b]
    });
  } catch (err) {
    // Silent fail if service not ready
  }
}

async function syncNightMode(isNight: boolean) {
  if (!isHardwareConnected) return;
  try {
    await axios.post("http://localhost:6000/night", {
      night: isNight
    });
  } catch (err) {
    // Silent fail
  }
}

function ledHardwareLoop() {
  let lastMode: string | null = null;
  
  setInterval(async () => {
    const state = await storage.getLedState();
    if (!state) return;

    // Sync night mode flag when it changes
    const currentIsNight = state.mode === "pulse";
    if (lastMode !== state.mode) {
      await syncNightMode(currentIsNight);
      lastMode = state.mode;
    }

    if (!state.isOn) {
      await applyRgbHardware(0, 0, 0, false);
      return;
    }

    const t = Date.now() / 50;
    const hex = state.color.replace("#", "");
    let rBase = parseInt(hex.substring(0, 2), 16);
    let gBase = parseInt(hex.substring(2, 4), 16);
    let bBase = parseInt(hex.substring(4, 6), 16);

    if (state.mode === "static" || state.mode === "pulse") {
      await applyRgbHardware(rBase, gBase, bBase, true);
    } else if (state.mode === "fade") {
      await applyRgbHardware((t * 3) % 256, (t * 5) % 256, (t * 7) % 256, true);
    } else if (state.mode === "sunrise") {
      await applyRgbHardware(Math.min(t * 2, 255), Math.min(t, 120), Math.min(t / 3, 60), true);
    }
  }, 500); // Slower interval for HTTP requests to Python service
}

// Start the hardware simulation loop
ledHardwareLoop();

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
    // Inject hardware connection status
    res.json({ ...state, isHardwareConnected });
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

  app.delete("/api/photos/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid photo ID" });
    }
    await storage.deletePhoto(id);
    res.json({ success: true });
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

  registerObjectStorageRoutes(app);

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
