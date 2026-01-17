import { useState } from "react";
import { Play, Film, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface MoviesAppProps {
  onClose: () => void;
}

export function MoviesApp({ onClose }: MoviesAppProps) {
  return (
    <div className="flex-1 p-8 flex flex-col gap-6 overflow-hidden">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Film className="w-8 h-8 text-indigo-400" /> Cinema Hub
        </h2>
        <p className="text-white/60">Stream free movies and TV shows from trusted platforms.</p>
      </div>

      <Tabs defaultValue="cineplay" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-white/5 border-white/10 w-full justify-start p-1 h-12">
          <TabsTrigger value="cineplay" className="flex-1 data-[state=active]:bg-white/10 text-white">CinePlay</TabsTrigger>
          <TabsTrigger value="tubi" className="flex-1 data-[state=active]:bg-white/10 text-white">Tubi TV</TabsTrigger>
        </TabsList>

        <TabsContent value="cineplay" className="flex-1 min-h-0 mt-4">
          <GlassCard className="w-full h-full overflow-hidden border-white/10 bg-black/20">
            <iframe 
              src="https://cineplayapk.com/" 
              className="w-full h-full border-0"
              title="CinePlay"
              allowFullScreen
            />
          </GlassCard>
        </TabsContent>

        <TabsContent value="tubi" className="flex-1 min-h-0 mt-4">
          <GlassCard className="w-full h-full overflow-hidden border-white/10 bg-black/20">
            <iframe 
              src="https://tubitv.com" 
              className="w-full h-full border-0"
              title="Tubi TV"
              allowFullScreen
            />
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
