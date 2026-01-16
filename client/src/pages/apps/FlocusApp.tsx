import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Play, Pause, RotateCcw, Volume2, Music, CloudRain, Waves, Flame, Trees } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { api, buildUrl } from "@shared/routes";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";

interface FlocusAppProps {
  onClose: () => void;
}

const AMBIENT_SOUNDS = [
  { id: "rain", icon: CloudRain, label: "Rain" },
  { id: "waves", icon: Waves, label: "Waves" },
  { id: "fire", icon: Flame, label: "Fire" },
  { id: "forest", icon: Trees, label: "Forest" },
];

export function FlocusApp({ onClose }: FlocusAppProps) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [activeSound, setActiveSound] = useState<string | null>(null);

  const { data: currentSession } = useQuery({
    queryKey: [api.focus.current.path],
  });

  const startMutation = useMutation({
    mutationFn: async (duration: number) => {
      return apiRequest("POST", api.focus.start.path, { duration, isActive: true });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.focus.current.path] });
    },
  });

  const stopMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", api.focus.stop.path);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.focus.current.path] });
    },
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => {
    if (!isActive) {
      startMutation.mutate(Math.ceil(timeLeft / 60));
    } else {
      stopMutation.mutate();
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
    stopMutation.mutate();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row gap-8 p-8 overflow-y-auto">
      {/* Timer Section */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
          {/* Progress Ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="white"
              strokeOpacity="0.1"
              strokeWidth="8"
            />
            <motion.circle
              cx="50%"
              cy="50%"
              r="45%"
              fill="none"
              stroke="white"
              strokeWidth="8"
              strokeDasharray="100 100"
              initial={{ pathLength: 1 }}
              animate={{ pathLength: timeLeft / (25 * 60) }}
              transition={{ duration: 1, ease: "linear" }}
              strokeLinecap="round"
            />
          </svg>
          
          <div className="text-6xl md:text-8xl font-bold text-white font-mono tracking-tighter">
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-full w-16 h-16 p-0 border-white/20 bg-white/5 hover:bg-white/10"
            onClick={toggleTimer}
          >
            {isActive ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="rounded-full w-12 h-12 p-0 border-white/20 bg-white/5 hover:bg-white/10"
            onClick={resetTimer}
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Controls Section */}
      <div className="w-full md:w-80 flex flex-col gap-6">
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50 flex items-center gap-2">
            <Volume2 className="w-4 h-4" /> Ambient Sounds
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {AMBIENT_SOUNDS.map((sound) => (
              <Button
                key={sound.id}
                variant="outline"
                className={`
                  h-20 flex flex-col gap-2 border-white/10 
                  ${activeSound === sound.id ? "bg-white/20 border-white/40" : "bg-white/5 hover:bg-white/10"}
                `}
                onClick={() => setActiveSound(activeSound === sound.id ? null : sound.id)}
              >
                <sound.icon className="w-6 h-6" />
                <span className="text-xs">{sound.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-white/50 flex items-center gap-2">
            <Music className="w-4 h-4" /> Focus Mode
          </h3>
          <GlassCard className="p-4 bg-white/5 border-white/10 space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/70">Session Type</span>
              <span className="text-white font-medium">Pomodoro</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-white/70">Duration</span>
              <span className="text-white font-medium">25 min</span>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
