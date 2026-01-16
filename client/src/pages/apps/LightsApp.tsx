import { useState } from "react";
import { HexColorPicker } from "react-colorful";
import { useLedState, useUpdateLedState } from "@/hooks/use-led";
import { GlassCard } from "@/components/GlassCard";
import { Power, Sun, Zap, Moon, Activity } from "lucide-react";
import { motion } from "framer-motion";

interface LightsAppProps {
  onClose: () => void;
}

const MODES = [
  { id: "static", label: "Static", icon: Sun },
  { id: "pulse", label: "Pulse", icon: Activity },
  { id: "fade", label: "Fade", icon: Zap },
  { id: "sunrise", label: "Sunrise", icon: Moon },
];

export function LightsApp({ onClose }: LightsAppProps) {
  const { data: ledState, isLoading } = useLedState();
  const updateLed = useUpdateLedState();
  
  // Local state for immediate UI feedback while dragging color picker
  const [localColor, setLocalColor] = useState<string>("#ffffff");

  if (isLoading) {
    return <div className="w-full h-full flex items-center justify-center text-white">Loading lights...</div>;
  }

  // Use local state if user is interacting, otherwise sync with DB
  const currentColor = localColor !== "#ffffff" ? localColor : (ledState?.color || "#ffffff");

  const handleColorChange = (newColor: string) => {
    setLocalColor(newColor);
  };

  const handleColorCommit = (newColor: string) => {
    updateLed.mutate({ color: newColor });
  };

  const togglePower = () => {
    updateLed.mutate({ isOn: !ledState?.isOn });
  };

  const setMode = (mode: string) => {
    updateLed.mutate({ mode });
  };

  return (
    <div className="w-full h-full p-8 md:p-12 flex flex-col md:flex-row gap-8 md:gap-16 items-center justify-center">
      <div className="flex-1 max-w-md w-full space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-4xl font-display text-white">Room Ambiance</h2>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={togglePower}
            className={`
              w-16 h-16 rounded-full flex items-center justify-center border-2 
              transition-all duration-300 shadow-lg
              ${ledState?.isOn 
                ? "bg-green-500/20 border-green-500 text-green-400 shadow-green-500/20" 
                : "bg-white/5 border-white/20 text-white/40"}
            `}
          >
            <Power className="w-8 h-8" />
          </motion.button>
        </div>

        <GlassCard variant="card" className="p-6">
          <div className="grid grid-cols-2 gap-4">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setMode(m.id)}
                disabled={!ledState?.isOn}
                className={`
                  p-4 rounded-xl flex flex-col items-center justify-center gap-2 transition-all
                  ${ledState?.mode === m.id 
                    ? "bg-white/20 text-white border border-white/40 shadow-inner" 
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent"}
                  ${!ledState?.isOn && "opacity-50 cursor-not-allowed"}
                `}
              >
                <m.icon className="w-6 h-6" />
                <span className="text-sm font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </GlassCard>

        <div className="space-y-4">
           <div className="flex justify-between text-white/80 text-sm">
             <span>Brightness</span>
             <span>{ledState?.brightness}%</span>
           </div>
           <input
             type="range"
             min="0"
             max="100"
             value={ledState?.brightness || 100}
             onChange={(e) => updateLed.mutate({ brightness: parseInt(e.target.value) })}
             disabled={!ledState?.isOn}
             className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
           />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center gap-8">
        <div className="relative">
          <div 
            className="absolute inset-0 blur-3xl opacity-40 transition-colors duration-500"
            style={{ backgroundColor: currentColor }}
          />
          <style>{`
            .custom-picker .react-colorful {
              width: 320px;
              height: 320px;
              border-radius: 9999px;
              border: 4px solid rgba(255,255,255,0.1);
            }
            .custom-picker .react-colorful__hue {
              height: 40px;
              border-radius: 9999px;
              margin-top: 20px;
            }
          `}</style>
          <div className="custom-picker">
            <HexColorPicker 
              color={currentColor} 
              onChange={handleColorChange}
              onMouseUp={() => handleColorCommit(localColor)}
              onTouchEnd={() => handleColorCommit(localColor)}
            />
          </div>
        </div>
        
        <GlassCard variant="card" className="px-6 py-3 rounded-full flex items-center gap-3">
          <div 
            className="w-6 h-6 rounded-full border border-white/20"
            style={{ backgroundColor: currentColor }}
          />
          <span className="text-white font-mono uppercase tracking-wider">
            {currentColor}
          </span>
        </GlassCard>
      </div>
    </div>
  );
}
