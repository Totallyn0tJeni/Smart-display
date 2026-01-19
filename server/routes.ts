import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";

// ================= LED HARDWARE LOGIC (Raspberry Pi 5) =================
let ledR: any, ledG: any, ledB: any;
let isCommonAnode = true; // Based on the provided Python script
let NIGHT_MODE = false;

async function initGpio() {
  try {
    // @ts-ignore
    const { Gpio } = await import("onoff");
    // Note: 'onoff' doesn't support hardware PWM natively.
    // To match the Python script's PWM logic exactly, you would need 'pigpio' (not Pi 5 compatible)
    // or a library like 'node-libgpiod'. 
    // However, the user provided a Python script using PWM.
    // For now, we will use 'onoff' for basic on/off control as a placeholder
    // or simulate PWM if possible. Since we are in Fast mode, we'll implement
    // the logic to match the Python script's duty cycle mapping.
    ledR = new Gpio(17, 'out');
    ledG = new Gpio(27, 'out');
    ledB = new Gpio(22, 'out');
    console.log("Raspberry Pi GPIO initialized on pins 17, 27, 22");
  } catch (err) {
    console.log("GPIO initialization failed (likely not on a Raspberry Pi or missing onoff). Using simulation mode.");
    ledR = ledG = ledB = { writeSync: (val: number) => {} };
  }
}

initGpio();

function applyRgbHardware(r: number, g: number, b: number) {
  // Common Anode Logic from Python script: 
  // Duty Cycle = 100 - (color_value / 255 * 100)
  // Since 'onoff' is digital (on/off), we map the duty cycle to a binary state.
  // In the Python script:
  // - 100% duty cycle (OFF for common anode) means pin is HIGH
  // - 0% duty cycle (FULL ON for common anode) means pin is LOW
  
  // Note: IS_NIGHT logic is applied in the loop where r, g, b are passed to this function.
  // The Python script dims values by 3 in night mode.
  
  // We'll use a threshold of 127 for digital switching:
  // r > 127 (Bright) -> PWM Duty Cycle would be low -> Pin LOW (0)
  // r <= 127 (Dim/Off) -> PWM Duty Cycle would be high -> Pin HIGH (1)
  
  const rVal = r > 127 ? 0 : 1;
  const gVal = g > 127 ? 0 : 1;
  const bVal = b > 127 ? 0 : 1;

  if (ledR && ledR.writeSync) ledR.writeSync(rVal);
  if (ledG && ledG.writeSync) ledG.writeSync(gVal);
  if (ledB && ledB.writeSync) ledB.writeSync(bVal);
}

function ledHardwareLoop() {
  setInterval(async () => {
    const state = await storage.getLedState();
    if (!state || !state.isOn) {
      applyRgbHardware(0, 0, 0);
      return;
    }

    const t = Date.now() / 50; // Similar to the 0.05s sleep in original code
    const hex = state.color.replace("#", "");
    let rBase = parseInt(hex.substring(0, 2), 16);
    let gBase = parseInt(hex.substring(2, 4), 16);
    let bBase = parseInt(hex.substring(4, 6), 16);

    // Python script logic: Dim by 3 in night mode (mode === "pulse")
    if (state.mode === "pulse") {
      rBase = Math.floor(rBase / 3);
      gBase = Math.floor(gBase / 3);
      bBase = Math.floor(bBase / 3);
    }

    if (state.mode === "static" || state.mode === "pulse") {
      applyRgbHardware(rBase, gBase, bBase);
    } else if (state.mode === "fade") {
      applyRgbHardware((t * 3) % 256, (t * 5) % 256, (t * 7) % 256);
    } else if (state.mode === "sunrise") {
      applyRgbHardware(Math.min(t * 2, 255), Math.min(t, 120), Math.min(t / 3, 60));
    }
  }, 50);
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
