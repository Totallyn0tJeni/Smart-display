import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cloud, Sun, CloudRain, Wind, Thermometer, MapPin, Navigation, Globe, Search, X } from "lucide-react";
import { api } from "@shared/routes";
import { GlassCard } from "@/components/GlassCard";
import { motion, AnimatePresence } from "framer-motion";
import { ComposableMap, Geographies, Geography, Sphere, Graticule, Marker } from "react-simple-maps";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

interface WeatherAppProps {
  onClose: () => void;
}

const LOCATIONS = [
  // Canada
  { name: "Brampton", coordinates: [-79.7624, 43.7315], temp: 1, condition: "Cloudy" },
  { name: "Toronto", coordinates: [-79.3832, 43.6532], temp: 2, condition: "Cloudy" },
  { name: "Vancouver", coordinates: [-123.1207, 49.2827], temp: 8, condition: "Rainy" },
  { name: "Montreal", coordinates: [-73.5673, 45.5017], temp: -2, condition: "Snow" },
  { name: "Calgary", coordinates: [-114.0719, 51.0447], temp: -5, condition: "Clear" },
  { name: "Ottawa", coordinates: [-75.6972, 45.4215], temp: -1, condition: "Cloudy" },
  { name: "Edmonton", coordinates: [-113.4909, 53.5444], temp: -8, condition: "Clear" },
  { name: "Quebec City", coordinates: [-71.2075, 46.8139], temp: -4, condition: "Snow" },
  { name: "Winnipeg", coordinates: [-97.1384, 49.8951], temp: -12, condition: "Clear" },
  
  // Popular Global Destinations
  { name: "New York", coordinates: [-74.006, 40.7128], temp: 22, condition: "Sunny" },
  { name: "London", coordinates: [-0.1276, 51.5074], temp: 15, condition: "Rainy" },
  { name: "Tokyo", coordinates: [139.6503, 35.6762], temp: 28, condition: "Clear" },
  { name: "Sydney", coordinates: [151.2093, -33.8688], temp: 18, condition: "Windy" },
  { name: "Paris", coordinates: [2.3522, 48.8566], temp: 20, condition: "Cloudy" },
  { name: "Los Angeles", coordinates: [-118.2437, 34.0522], temp: 25, condition: "Sunny" },
  { name: "Berlin", coordinates: [13.405, 52.52], temp: 17, condition: "Cloudy" },
  { name: "Dubai", coordinates: [55.2708, 25.2048], temp: 35, condition: "Clear" },
  { name: "Rome", coordinates: [12.4964, 41.9028], temp: 24, condition: "Sunny" },
  { name: "Barcelona", coordinates: [2.1734, 41.3851], temp: 21, condition: "Sunny" },
  { name: "Singapore", coordinates: [103.8198, 1.3521], temp: 31, condition: "Rainy" },
  { name: "Hong Kong", coordinates: [114.1694, 22.3193], temp: 26, condition: "Cloudy" },
  { name: "Seoul", coordinates: [126.978, 37.5665], temp: 19, condition: "Clear" },
  { name: "Bangkok", coordinates: [100.5018, 13.7563], temp: 33, condition: "Sunny" },
  { name: "Istanbul", coordinates: [28.9784, 41.0082], temp: 18, condition: "Windy" },
  { name: "Cape Town", coordinates: [18.4241, -33.9249], temp: 22, condition: "Windy" },
  { name: "Rio de Janeiro", coordinates: [-43.1729, -22.9068], temp: 29, condition: "Sunny" },
];

export function WeatherApp({ onClose }: WeatherAppProps) {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [rotation, setRotation] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLocations = useMemo(() => {
    if (!searchQuery) return LOCATIONS;
    return LOCATIONS.filter(loc => 
      loc.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

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

  const handleLocationSelect = (loc: typeof LOCATIONS[0]) => {
    setSelectedLocation(loc);
    setRotation(-loc.coordinates[0]);
  };

  return (
    <div className="flex-1 p-8 flex flex-col md:flex-row gap-8 overflow-hidden h-full">
      <div className="flex-1 flex flex-col gap-8 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-white/70 text-lg">
            <MapPin className="w-5 h-5" />
            <AnimatePresence mode="wait">
              <motion.span
                key={selectedLocation.name}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
              >
                {selectedLocation.name}
              </motion.span>
            </AnimatePresence>
          </div>
          
          <div className="flex flex-col items-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedLocation.name}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.2 }}
                transition={{ duration: 0.5 }}
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

      <div className="flex-1 flex flex-col gap-4 overflow-hidden h-full">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2 text-white/70">
            <Globe className="w-5 h-5" />
            <span className="font-medium uppercase tracking-widest text-sm">Global Outlook</span>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cities..."
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2"
              >
                <X className="w-4 h-4 text-white/50 hover:text-white" />
              </button>
            )}
          </div>
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
                      pressed: { outline: "none" }
                    }}
                  />
                ))
              }
            </Geographies>
            {filteredLocations.map((loc) => (
              <Marker key={loc.name} coordinates={loc.coordinates as [number, number]}>
                <motion.circle
                  r={4}
                  fill={selectedLocation.name === loc.name ? "#fff" : "#ffffff40"}
                  stroke="#fff"
                  strokeWidth={selectedLocation.name === loc.name ? 2 : 0}
                  className="cursor-pointer"
                  onClick={() => handleLocationSelect(loc)}
                  whileHover={{ scale: 1.5 }}
                />
              </Marker>
            ))}
          </ComposableMap>
          
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4 overflow-x-auto pb-2 no-scrollbar">
            <AnimatePresence>
              {filteredLocations.map((loc) => (
                <motion.button
                  key={loc.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => handleLocationSelect(loc)}
                  className={`px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-tighter whitespace-nowrap transition-all flex-shrink-0 ${
                    selectedLocation.name === loc.name 
                      ? 'bg-white text-black shadow-lg' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {loc.name}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <button 
              onClick={() => setRotation(r => r - 45)}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
            >
              <Navigation className="w-4 h-4 -rotate-90" />
            </button>
            <button 
              onClick={() => setRotation(r => r + 45)}
              className="p-2 bg-white/10 rounded-full hover:bg-white/20 text-white backdrop-blur-md border border-white/10"
            >
              <Navigation className="w-4 h-4 rotate-90" />
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
