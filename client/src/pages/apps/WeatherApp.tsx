import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Cloud, Sun, CloudRain, Wind, Thermometer, MapPin, Navigation } from "lucide-react";
import { api } from "@shared/routes";
import { GlassCard } from "@/components/GlassCard";

interface WeatherAppProps {
  onClose: () => void;
}

export function WeatherApp({ onClose }: WeatherAppProps) {
  const { data: weather, isLoading } = useQuery({
    queryKey: [api.weather.get.path],
  });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  const getWeatherIcon = (condition: string) => {
    const lower = condition.toLowerCase();
    if (lower.includes("sun") || lower.includes("clear")) return <Sun className="w-24 h-24 text-yellow-400" />;
    if (lower.includes("rain")) return <CloudRain className="w-24 h-24 text-blue-400" />;
    if (lower.includes("wind")) return <Wind className="w-24 h-24 text-slate-300" />;
    return <Cloud className="w-24 h-24 text-white" />;
  };

  return (
    <div className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2 text-white/70 text-lg">
          <MapPin className="w-5 h-5" />
          <span>{weather?.location}</span>
        </div>
        
        <div className="flex flex-col items-center">
          {getWeatherIcon(weather?.condition || "")}
          <div className="text-8xl font-bold text-white mt-4">{weather?.temp}°</div>
          <div className="text-2xl text-white/80 font-medium">{weather?.condition}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl">
        <GlassCard className="p-6 bg-white/5 border-white/10 flex items-center gap-4">
          <Thermometer className="w-8 h-8 text-orange-400" />
          <div>
            <div className="text-xs uppercase tracking-wider text-white/50">High / Low</div>
            <div className="text-xl text-white font-medium">{weather?.high}° / {weather?.low}°</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-white/5 border-white/10 flex items-center gap-4">
          <Wind className="w-8 h-8 text-blue-300" />
          <div>
            <div className="text-xs uppercase tracking-wider text-white/50">Wind Speed</div>
            <div className="text-xl text-white font-medium">12 km/h</div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 bg-white/5 border-white/10 flex items-center gap-4">
          <Navigation className="w-8 h-8 text-emerald-400" />
          <div>
            <div className="text-xs uppercase tracking-wider text-white/50">Humidity</div>
            <div className="text-xl text-white font-medium">45%</div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
