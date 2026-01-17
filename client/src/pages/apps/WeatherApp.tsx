import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cloud, Sun, CloudRain, Wind, Thermometer, MapPin, Navigation, Globe } from "lucide-react";
import { api } from "@shared/routes";
import { GlassCard } from "@/components/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { ComposableMap, Geographies, Geography, Sphere, Graticule } from "react-simple-maps";

const geoUrl = "https://raw.githubusercontent.com/lotusms/world_map/master/world.json";

interface WeatherAppProps {
  onClose: () => void;
}

const LOCATIONS = [
  { name: "New York", coordinates: [-74.006, 40.7128], temp: 22, condition: "Sunny" },
  { name: "London", coordinates: [-0.1276, 51.5074], temp: 15, condition: "Rainy" },
  { name: "Tokyo", coordinates: [139.6503, 35.6762], temp: 28, condition: "Clear" },
  { name: "Sydney", coordinates: [151.2093, -33.8688], temp: 18, condition: "Windy" },
  { name: "Paris", coordinates: [2.3522, 48.8566], temp: 20, condition: "Cloudy" },
];

export function WeatherApp({ onClose }: WeatherAppProps) {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [rotation, setRotation] = useState(0);

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes("sun") || lower.includes("clear")) {
      return (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <Sun className="w-24 h-24 text-yellow-400" />
        </motion.div>
      );
    }
    if (lower.includes("rain")) {
      return (
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <CloudRain className="w-24 h-24 text-blue-400" />
        </motion.div>
      );
    }
    if (lower.includes("wind")) {
      return (
        <motion.div
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Wind className="w-24 h-24 text-slate-300" />
        </motion.div>
      );
    }
    return (
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 4, repeat: Infinity }}
      >
        <Cloud className="w-24 h-24 text-white" />
      </motion.div>
    );
  };

  return (
    <div className="flex-1 p-8 flex flex-col md:flex-row gap-8 overflow-hidden">
      <div className="flex-1 flex flex-col gap-8 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-white/70 text-lg">
            <MapPin className="w-5 h-5" />
            <span>{selectedLocation.name}</span>
          </div>
          
          <div className="flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedLocation.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                {getWeatherIcon(selectedLocation.condition)}
              </motion.div>
            </AnimatePresence>
            <div className="text-8xl font-bold text-white mt-4">{selectedLocation.temp}°</div>
            <div className="text-2xl text-white/80 font-medium">{selectedLocation.condition}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
          <GlassCard className="p-4 bg-white/5 border-white/10 flex items-center gap-3">
            <Thermometer className="w-6 h-6 text-orange-400" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/50">High / Low</div>
              <div className="text-lg text-white font-medium">{selectedLocation.temp + 3}° / {selectedLocation.temp - 2}°</div>
            </div>
          </GlassCard>
          <GlassCard className="p-4 bg-white/5 border-white/10 flex items-center gap-3">
            <Wind className="w-6 h-6 text-blue-300" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/50">Wind</div>
              <div className="text-lg text-white font-medium">12 km/h</div>
            </div>
          </GlassCard>
          <GlassCard className="p-4 bg-white/5 border-white/10 flex items-center gap-3">
            <Navigation className="w-6 h-6 text-emerald-400" />
            <div>
              <div className="text-[10px] uppercase tracking-wider text-white/50">Humidity</div>
              <div className="text-lg text-white font-medium">45%</div>
            </div>
          </GlassCard>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-white/70 mb-2">
          <Globe className="w-5 h-5" />
          <span className="font-medium uppercase tracking-widest text-sm">Global Outlook</span>
        </div>
        <GlassCard className="flex-1 bg-black/20 border-white/10 overflow-hidden relative min-h-[300px]">
          <ComposableMap
            projection="geoOrthographic"
            projectionConfig={{
              scale: 150,
              rotate: [rotation, -20, 0]
            }}
            className="w-full h-full"
          >
            <Sphere stroke="#ffffff10" strokeWidth={0.5} fill="transparent" />
            <Graticule stroke="#ffffff10" strokeWidth={0.5} />
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill="#ffffff10"
                    stroke="#ffffff20"
                    style={{
                      default: { outline: "none" },
                      hover: { fill: "#ffffff30", outline: "none" },
                    }}
                  />
                ))
              }
            </Geographies>
            {LOCATIONS.map((loc) => (
              <motion.circle
                key={loc.name}
                cx={0} cy={0} r={4}
                fill={selectedLocation.name === loc.name ? "#fff" : "#ffffff40"}
                stroke="#fff"
                strokeWidth={selectedLocation.name === loc.name ? 2 : 0}
                className="cursor-pointer"
                onClick={() => setSelectedLocation(loc)}
              />
            ))}
          </ComposableMap>
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto pb-2">
            {LOCATIONS.map((loc) => (
              <button
                key={loc.name}
                onClick={() => setSelectedLocation(loc)}
                className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter transition-all ${
                  selectedLocation.name === loc.name 
                    ? 'bg-white text-black shadow-lg' 
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {loc.name}
              </button>
            ))}
          </div>

          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button 
              onClick={() => setRotation(r => r - 45)}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"
            >
              <Navigation className="w-4 h-4 -rotate-90" />
            </button>
            <button 
              onClick={() => setRotation(r => r + 45)}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white"
            >
              <Navigation className="w-4 h-4 rotate-90" />
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
