import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ClockWidget } from "@/components/ClockWidget";
import { GlassCard } from "@/components/GlassCard";
import { 
  Music, 
  Image as ImageIcon, 
  Calendar as CalendarIcon, 
  Lightbulb,
  Timer,
  Cloud,
  Moon,
  Sun,
  Film,
  Settings,
  X,
  Youtube
} from "lucide-react";
import { SiYoutube } from "react-icons/si";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { api } from "@shared/routes";

// App Components
import { SpotifyApp } from "./apps/SpotifyApp";
import { PhotosApp } from "./apps/PhotosApp";
import { CalendarApp } from "./apps/CalendarApp";
import { LightsApp } from "./apps/LightsApp";
import { FlocusApp } from "./apps/FlocusApp";
import { WeatherApp } from "./apps/WeatherApp";
import { MoviesApp } from "./apps/MoviesApp";

function YouTubeApp({ onClose }: { onClose: () => void }) {
  return (
    <div className="w-full h-full flex flex-col p-8 gap-6">
      <h2 className="text-3xl font-bold text-white flex items-center gap-3">
        <SiYoutube className="w-8 h-8 text-red-600" /> YouTube
      </h2>
      <GlassCard variant="panel" className="flex-1 w-full overflow-hidden bg-black/40">
        <iframe 
          src="https://www.youtube.com/embed?listType=user_uploads&list=vsco" 
          width="100%" 
          height="100%" 
          frameBorder="0" 
          allowFullScreen 
          allow="autoplay; encrypted-media" 
          className="w-full h-full"
        />
      </GlassCard>
    </div>
  );
}

type AppType = "spotify" | "photos" | "calendar" | "lights" | "flocus" | "weather" | "movies" | "settings" | "youtube" | null;

const APPS = [
  { id: "weather", icon: Cloud, label: "Weather", color: "from-sky-400/50 to-blue-500/50" },
  { id: "photos", icon: ImageIcon, label: "Photos", color: "from-pink-500/50 to-rose-500/50" },
  { id: "movies", icon: Film, label: "Movies", color: "from-indigo-600/50 to-violet-600/50" },
  { id: "youtube", icon: SiYoutube, label: "YouTube", color: "from-red-500/50 to-orange-600/50" },
  { id: "calendar", icon: CalendarIcon, label: "Calendar", color: "from-blue-500/50 to-cyan-500/50" },
  { id: "spotify", icon: Music, label: "Spotify", color: "from-green-500/50 to-emerald-500/50" },
  { id: "lights", icon: Lightbulb, label: "Lights", color: "from-yellow-500/50 to-orange-500/50" },
  { id: "flocus", icon: Timer, label: "Flocus", color: "from-indigo-500/50 to-purple-500/50" },
  { id: "settings", icon: Settings, label: "Settings", color: "from-gray-500/50 to-slate-600/50" },
] as const;

const PRESET_BACKGROUNDS = [
  { name: "Default", color: "#000000", url: null },
  { name: "Deep Space", color: "#0a0a1a", url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=80" },
  { name: "Sunset", color: "#2d1b2d", url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1920&q=80" },
  { name: "Forest", color: "#1a241a", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80" },
  { name: "Nordic Lake", color: "#1a2a3a", url: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1920&q=80" },
];

export default function Home() {
  const [activeApp, setActiveApp] = useState<AppType>(null);

  const { data: ledState } = useQuery({
    queryKey: [api.led.get.path],
  });

  const ledMutation = useMutation({
    mutationFn: async (updates: any) => {
      return apiRequest("POST", api.led.update.path, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.led.get.path] });
    },
  });

  const toggleNightMode = () => {
    const isNight = (ledState as any)?.mode === "pulse";
    ledMutation.mutate({
      mode: isNight ? "static" : "pulse",
      color: isNight ? "#ffffff" : "#1a1a2e",
    });
  };

  const renderApp = () => {
    switch (activeApp) {
      case "spotify": return <SpotifyApp onClose={() => setActiveApp(null)} />;
      case "photos": return <PhotosApp onClose={() => setActiveApp(null)} />;
      case "calendar": return <CalendarApp onClose={() => setActiveApp(null)} />;
      case "lights": return <LightsApp onClose={() => setActiveApp(null)} />;
      case "flocus": return <FlocusApp onClose={() => setActiveApp(null)} />;
      case "weather": return <WeatherApp onClose={() => setActiveApp(null)} />;
      case "movies": return <MoviesApp onClose={() => setActiveApp(null)} />;
      case "youtube": return <YouTubeApp onClose={() => setActiveApp(null)} />;
      case "settings": return (
        <div className="p-8 flex flex-col gap-6">
          <h2 className="text-2xl font-bold text-white">Appearance</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {PRESET_BACKGROUNDS.map((bg) => (
              <button
                key={bg.name}
                onClick={() => ledMutation.mutate({ backgroundUrl: bg.url, backgroundColor: bg.color })}
                className="group relative aspect-video rounded-xl overflow-hidden border border-white/10"
              >
                {bg.url ? (
                  <img src={bg.url} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-black" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-white text-xs font-bold uppercase">{bg.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      );
      default: return null;
    }
  };

  const isNightMode = (ledState as any)?.mode === "pulse";
  const backgroundUrl = (ledState as any)?.backgroundUrl;
  const backgroundColor = (ledState as any)?.backgroundColor || "#000000";

  return (
    <div 
      className={`min-h-screen w-full relative overflow-hidden flex flex-col transition-colors duration-1000`}
      style={{ 
        backgroundColor: isNightMode ? "#0a0a1a" : backgroundColor,
        backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : "none",
        backgroundSize: "cover",
        backgroundPosition: "center"
      }}
    >
      {/* Background Dark Overlay */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isNightMode ? 'bg-black/60' : 'bg-black/20'}`} />

      {/* Night Mode Toggle */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleNightMode}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white transition-all duration-300"
        >
          {isNightMode ? <Sun className="w-6 h-6" /> : <Moon className="w-6 h-6" />}
        </button>
      </div>

      {/* Main Dashboard Content */}
      <AnimatePresence>
        {!activeApp && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: "circOut" }}
            className="flex-1 flex p-8 z-10 gap-8"
          >
            {/* Left Side: Vertical Navigation */}
            <div className="flex-1 flex flex-col justify-center max-w-[120px]">
              <GlassCard 
                variant="panel" 
                className="p-3 flex flex-col justify-around items-center gap-4 bg-white/5 border-white/10 rounded-full"
              >
                {APPS.map((app) => (
                  <button
                    key={app.id}
                    onClick={() => setActiveApp(app.id as AppType)}
                    className="group relative flex flex-col items-center gap-1 p-3 rounded-full transition-all duration-300 hover:bg-white/10"
                  >
                    <div className={`
                      w-14 h-14 rounded-full flex items-center justify-center
                      bg-gradient-to-br ${app.color}
                      shadow-lg border border-white/20
                      transition-all duration-300
                      group-hover:scale-110
                    `}>
                      <app.icon className="w-7 h-7 text-white" />
                    </div>
                  </button>
                ))}
              </GlassCard>
            </div>

            {/* Right Side: Clock and Large Photo Gallery */}
            <div className="flex-[3] flex flex-col gap-8 items-center justify-center">
              <ClockWidget />
              
              <div className="w-full max-w-4xl aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative group">
                <PhotosApp onClose={() => {}} isWidget={true} />
              </div>
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
      <div className="fixed top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[50vw] h-[50vw] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
    </div>
  );
}
