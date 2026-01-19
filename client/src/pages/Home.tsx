import { useState, useEffect } from "react";
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
  Youtube,
  StickyNote,
  Heart,
  ExternalLink
} from "lucide-react";
import { SiYoutube } from "react-icons/si";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { api } from "@shared/routes";

const AFFIRMATIONS = [
  "You are capable of amazing things.",
  "Your potential is limitless.",
  "Make today incredible.",
  "Focus on the progress, not perfection.",
  "Believe in yourself and all that you are.",
  "Your energy creates your reality.",
  "Small steps lead to big results."
];

// App Components
import { SpotifyApp } from "./apps/SpotifyApp";
import { PhotosApp } from "./apps/PhotosApp";
import { CalendarApp } from "./apps/CalendarApp";
import { LightsApp } from "./apps/LightsApp";
import { FlocusApp } from "./apps/FlocusApp";
import { WeatherApp } from "./apps/WeatherApp";
import { Button } from "@/components/ui/button";

function ExternalLinkApp({ title, url, icon: Icon, color, secondaryUrl, secondaryTitle }: { title: string, url: string, icon: any, color: string, secondaryUrl?: string, secondaryTitle?: string }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-6 text-center">
      <div className={`w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br ${color} shadow-2xl border border-white/20 mb-4`}>
        <Icon className="w-12 h-12 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-white">{title}</h2>
      <p className="text-white/60 max-w-md">
        Choose a service to open in a new tab for the best experience.
      </p>
      <div className="flex flex-wrap justify-center gap-4">
        <Button 
          size="lg" 
          className="bg-white text-black hover:bg-white/90 font-bold rounded-xl px-8"
          onClick={() => window.open(url, '_blank')}
        >
          <ExternalLink className="w-5 h-5 mr-2" /> Open {secondaryUrl ? title : title}
        </Button>
        {secondaryUrl && (
          <Button 
            size="lg" 
            variant="outline"
            className="border-white/20 bg-white/5 text-white hover:bg-white/10 font-bold rounded-xl px-8"
            onClick={() => window.open(secondaryUrl, '_blank')}
          >
            <ExternalLink className="w-5 h-5 mr-2" /> Open {secondaryTitle}
          </Button>
        )}
      </div>
    </div>
  );
}

type AppType = "spotify" | "photos" | "calendar" | "lights" | "flocus" | "weather" | "movies" | "settings" | "youtube" | "notion" | null;

const APPS = [
  { id: "weather", icon: Cloud, label: "Weather", color: "from-sky-400/50 to-blue-500/50" },
  { id: "photos", icon: ImageIcon, label: "Photos", color: "from-pink-500/50 to-rose-500/50" },
  { id: "movies", icon: Film, label: "Movies", color: "from-indigo-600/50 to-violet-600/50" },
  { id: "youtube", icon: SiYoutube, label: "YouTube", color: "from-red-500/50 to-orange-600/50" },
  { id: "notion", icon: StickyNote, label: "Notion", color: "from-gray-400/50 to-gray-600/50" },
  { id: "calendar", icon: CalendarIcon, label: "Calendar", color: "from-blue-500/50 to-cyan-500/50" },
  { id: "spotify", icon: Music, label: "Spotify", color: "from-green-500/50 to-emerald-500/50" },
  { id: "lights", icon: Lightbulb, label: "Lights", color: "from-yellow-500/50 to-orange-500/50" },
  { id: "flocus", icon: Timer, label: "Flocus", color: "from-indigo-500/50 to-purple-500/50" },
  { id: "settings", icon: Settings, label: "Settings", color: "from-gray-500/50 to-slate-600/50" },
] as const;

const PRESET_BACKGROUNDS = [
  { name: "Deep Space", color: "#0a0a1a", url: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=80", gradient: null },
  { name: "Sunset", color: "#2d1b2d", url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1920&q=80", gradient: null },
  { name: "Forest", color: "#1a241a", url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80", gradient: null },
];

const PRESET_GRADIENTS = [
  { name: "Original", gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Ocean", gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "Nature", gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)" },
  { name: "Twilight", gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)" },
  { name: "Midnight", gradient: "linear-gradient(135deg, #243949 0%, #517fa4 100%)" },
  { name: "Deep Purple", gradient: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)" },
];

export default function Home() {
  const [activeApp, setActiveApp] = useState<AppType>(null);
  const [customStart, setCustomStart] = useState("#667eea");
  const [customEnd, setCustomEnd] = useState("#764ba2");
  const [quickNotes, setQuickNotes] = useState(() => localStorage.getItem("quick-notes") || "");
  const [affirmationIdx, setAffirmationIdx] = useState(() => Math.floor(Math.random() * AFFIRMATIONS.length));

  useEffect(() => {
    localStorage.setItem("quick-notes", quickNotes);
  }, [quickNotes]);

  useEffect(() => {
    const interval = setInterval(() => {
      setAffirmationIdx((prev) => (prev + 1) % AFFIRMATIONS.length);
    }, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, []);

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
      case "movies": return (
        <ExternalLinkApp 
          title="Netflix" 
          url="https://www.netflix.com" 
          secondaryTitle="Tubi"
          secondaryUrl="https://tubitv.com"
          icon={Film} 
          color="from-indigo-600/50 to-violet-600/50" 
        />
      );
      case "youtube": return (
        <ExternalLinkApp 
          title="YouTube" 
          url="https://www.youtube.com" 
          icon={SiYoutube} 
          color="from-red-500/50 to-orange-600/50" 
        />
      );
      case "notion": return (
        <ExternalLinkApp 
          title="Notion" 
          url="https://www.notion.so" 
          icon={StickyNote} 
          color="from-gray-400/50 to-gray-600/50" 
        />
      );
      case "settings": return (
        <div className="p-8 flex flex-col gap-8 overflow-y-auto">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Preset Backgrounds</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {PRESET_BACKGROUNDS.map((bg) => (
                <button
                  key={bg.name}
                  onClick={() => ledMutation.mutate({ backgroundUrl: bg.url, backgroundColor: bg.color, backgroundGradient: null })}
                  className="group relative aspect-video rounded-xl overflow-hidden border border-white/10"
                >
                  <img src={bg.url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold uppercase">{bg.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Gradients</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {PRESET_GRADIENTS.map((grad) => (
                <button
                  key={grad.name}
                  onClick={() => ledMutation.mutate({ backgroundUrl: null, backgroundGradient: grad.gradient })}
                  className="group relative aspect-video rounded-xl overflow-hidden border border-white/10"
                  style={{ background: grad.gradient }}
                >
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-white text-xs font-bold uppercase">{grad.name}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Custom Gradient</h2>
            <div className="flex flex-col md:flex-row items-center gap-6 bg-white/5 p-6 rounded-2xl border border-white/10">
              <div 
                className="w-full md:w-48 aspect-video rounded-xl border border-white/20 shadow-xl"
                style={{ background: `linear-gradient(135deg, ${customStart}, ${customEnd})` }}
              />
              <div className="flex-1 flex flex-col gap-4 w-full">
                <div className="flex gap-4">
                  <div className="flex-1 space-y-2">
                    <label className="text-xs text-white/50 uppercase font-bold">Start Color</label>
                    <input 
                      type="color" 
                      value={customStart}
                      onChange={(e) => setCustomStart(e.target.value)}
                      className="w-full h-10 bg-transparent rounded cursor-pointer"
                    />
                  </div>
                  <div className="flex-1 space-y-2">
                    <label className="text-xs text-white/50 uppercase font-bold">End Color</label>
                    <input 
                      type="color" 
                      value={customEnd}
                      onChange={(e) => setCustomEnd(e.target.value)}
                      className="w-full h-10 bg-transparent rounded cursor-pointer"
                    />
                  </div>
                </div>
                <button
                  onClick={() => ledMutation.mutate({ 
                    backgroundUrl: null, 
                    backgroundGradient: `linear-gradient(135deg, ${customStart}, ${customEnd})` 
                  })}
                  className="w-full py-3 bg-white text-black font-bold rounded-xl hover:bg-white/90 transition-colors"
                >
                  Apply Custom Gradient
                </button>
              </div>
            </div>
          </div>
        </div>
      );
      default: return null;
    }
  };

  const isNightMode = (ledState as any)?.mode === "pulse";
  const backgroundUrl = (ledState as any)?.backgroundUrl;
  const backgroundColor = (ledState as any)?.backgroundColor || "#000000";
  const backgroundGradient = (ledState as any)?.backgroundGradient;

  return (
    <div 
      className={`min-h-screen w-full relative overflow-hidden flex flex-col transition-all duration-1000`}
      style={{ 
        backgroundColor: isNightMode ? "#0a0a1a" : backgroundColor,
        backgroundImage: isNightMode ? "none" : (backgroundUrl ? `url(${backgroundUrl})` : backgroundGradient || "none"),
        backgroundSize: "cover",
        backgroundPosition: "center",
        opacity: isNightMode ? 0.4 : 1
      }}
    >
      {/* Background Dark Overlay */}
      <div className={`absolute inset-0 transition-opacity duration-1000 ${isNightMode ? 'bg-black/60' : 'bg-black/20'}`} />

      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] bg-blue-500/20 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            x: [0, -40, 0],
            y: [0, 60, 0],
            opacity: [0.1, 0.15, 0.1] 
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-purple-500/20 rounded-full blur-[100px]"
        />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

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
            <div className="flex-[3] flex flex-col gap-6 items-center justify-center relative">
              <div className="flex items-start gap-8 w-full max-w-5xl justify-center relative">
                <div className="flex flex-col gap-4 self-stretch">
                  <ClockWidget />
                  {/* Daily Affirmation */}
                  <GlassCard className="p-4 bg-white/5 border-white/10 rounded-2xl max-w-[300px] flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Heart className="w-3 h-3 text-pink-400" />
                      <span className="text-[10px] uppercase tracking-widest text-white/40 font-bold">Daily Affirmation</span>
                    </div>
                    <p className="text-white/80 text-sm font-medium leading-relaxed italic">
                      "{AFFIRMATIONS[affirmationIdx]}"
                    </p>
                  </GlassCard>
                </div>
                
                <div className="flex flex-col gap-4 self-stretch">
                  {/* Spotify Now Playing Widget */}
                  <GlassCard className="p-3 pr-6 flex items-center gap-4 bg-black/40 border-white/10 rounded-2xl shadow-xl hover-elevate cursor-pointer transition-all duration-300" onClick={() => setActiveApp('spotify')}>
                    <div className="w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                      <img src="https://i.scdn.co/image/ab67616d0000b2734616ecf6e89793746a9a8342" alt="Album Cover" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-white text-sm font-bold truncate max-w-[150px]">Lover</span>
                      <span className="text-white/60 text-xs truncate max-w-[150px]">Taylor Swift</span>
                    </div>
                    <Music className="w-4 h-4 text-green-400 ml-2 animate-pulse" />
                  </GlassCard>

                  {/* Quick Notes Widget */}
                  <GlassCard className="p-4 bg-white/5 border-white/10 rounded-2xl w-full min-w-[280px] flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <StickyNote className="w-4 h-4 text-yellow-400" />
                      <span className="text-xs uppercase tracking-widest text-white/40 font-bold">Quick Notes</span>
                    </div>
                    <textarea 
                      value={quickNotes}
                      onChange={(e) => setQuickNotes(e.target.value)}
                      placeholder="Type a quick note..."
                      className="w-full bg-transparent border-none text-white text-sm placeholder:text-white/20 focus:ring-0 resize-none h-full min-h-[100px] p-0"
                    />
                  </GlassCard>
                </div>
              </div>
              
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
