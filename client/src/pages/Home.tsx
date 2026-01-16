import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClockWidget } from "@/components/ClockWidget";
import { GlassCard } from "@/components/GlassCard";
import { 
  Music, 
  Image as ImageIcon, 
  Calendar as CalendarIcon, 
  Lightbulb,
  X
} from "lucide-react";

// App Components
import { SpotifyApp } from "./apps/SpotifyApp";
import { PhotosApp } from "./apps/PhotosApp";
import { CalendarApp } from "./apps/CalendarApp";
import { LightsApp } from "./apps/LightsApp";

type AppType = "spotify" | "photos" | "calendar" | "lights" | null;

const APPS = [
  { id: "photos", icon: ImageIcon, label: "Photos", color: "from-pink-500/50 to-rose-500/50" },
  { id: "calendar", icon: CalendarIcon, label: "Calendar", color: "from-blue-500/50 to-cyan-500/50" },
  { id: "spotify", icon: Music, label: "Spotify", color: "from-green-500/50 to-emerald-500/50" },
  { id: "lights", icon: Lightbulb, label: "Lights", color: "from-yellow-500/50 to-orange-500/50" },
] as const;

export default function Home() {
  const [activeApp, setActiveApp] = useState<AppType>(null);

  const renderApp = () => {
    switch (activeApp) {
      case "spotify": return <SpotifyApp onClose={() => setActiveApp(null)} />;
      case "photos": return <PhotosApp onClose={() => setActiveApp(null)} />;
      case "calendar": return <CalendarApp onClose={() => setActiveApp(null)} />;
      case "lights": return <LightsApp onClose={() => setActiveApp(null)} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
      {/* Main Dashboard Content */}
      <AnimatePresence>
        {!activeApp && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="flex-1 flex flex-col items-center justify-center p-8 z-10"
          >
            <div className="flex-1 flex items-center justify-center w-full max-w-4xl">
              <ClockWidget />
            </div>

            {/* Dock */}
            <div className="mb-12 w-full max-w-3xl">
              <GlassCard 
                variant="panel" 
                className="p-4 flex justify-around items-center gap-4 bg-white/5 border-white/10"
              >
                {APPS.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setActiveApp(app.id as AppType)}
                    className="group relative flex flex-col items-center gap-2 p-4 rounded-xl transition-all duration-300 hover:-translate-y-2"
                  >
                    <div className={`
                      w-16 h-16 rounded-2xl flex items-center justify-center
                      bg-gradient-to-br ${app.color}
                      shadow-lg shadow-black/20 border border-white/20
                      group-hover:shadow-xl group-hover:shadow-white/10
                      transition-all duration-300
                    `}>
                      <app.icon className="w-8 h-8 text-white drop-shadow-md" />
                    </div>
                    <span className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                      {app.label}
                    </span>
                    
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-white/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                  </button>
                ))}
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* App Overlay */}
      <AnimatePresence>
        {activeApp && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-4 md:inset-8 z-50 flex items-center justify-center"
          >
            <GlassCard variant="panel" className="w-full h-full relative overflow-hidden flex flex-col">
              {/* App Header */}
              <div className="absolute top-6 right-6 z-50">
                <button 
                  onClick={() => setActiveApp(null)}
                  className="p-3 rounded-full bg-black/20 hover:bg-red-500/80 text-white border border-white/10 transition-all duration-200"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              {renderApp()}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Decorative ambient blobs */}
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
