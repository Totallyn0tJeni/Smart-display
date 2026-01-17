import { GlassCard } from "@/components/GlassCard";
import { Music, Layout, Disc, ListMusic } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SpotifyAppProps {
  onClose: () => void;
}

export function SpotifyApp({ onClose }: SpotifyAppProps) {
  return (
    <div className="w-full h-full flex flex-col p-8 gap-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Music className="w-8 h-8 text-green-400" /> Spotify
        </h2>
      </div>
      
      <Tabs defaultValue="player" className="flex-1 flex flex-col min-h-0">
        <TabsList className="bg-white/5 border-white/10 w-fit p-1 h-12 mb-4">
          <TabsTrigger value="player" className="px-6 data-[state=active]:bg-white/10 text-white flex items-center gap-2">
            <Disc className="w-4 h-4" /> Now Playing
          </TabsTrigger>
          <TabsTrigger value="browse" className="px-6 data-[state=active]:bg-white/10 text-white flex items-center gap-2">
            <Layout className="w-4 h-4" /> Browse
          </TabsTrigger>
          <TabsTrigger value="playlists" className="px-6 data-[state=active]:bg-white/10 text-white flex items-center gap-2">
            <ListMusic className="w-4 h-4" /> Playlists
          </TabsTrigger>
        </TabsList>

        <TabsContent value="player" className="flex-1 min-h-0 mt-0">
          <GlassCard variant="panel" className="w-full h-full overflow-hidden bg-black/40">
            <iframe 
              src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0" 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              allowFullScreen 
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
              loading="lazy"
              className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
            />
          </GlassCard>
        </TabsContent>

        <TabsContent value="browse" className="flex-1 min-h-0 mt-0">
          <GlassCard variant="panel" className="w-full h-full overflow-hidden bg-black/40">
            <iframe 
              src="https://open.spotify.com/embed/section/0JQ5DAqbVvw6XvdfZZvSda" 
              width="100%" 
              height="100%" 
              frameBorder="0" 
              allowFullScreen 
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
              className="w-full h-full"
            />
          </GlassCard>
        </TabsContent>

        <TabsContent value="playlists" className="flex-1 min-h-0 mt-0">
          <GlassCard variant="panel" className="w-full h-full overflow-hidden bg-black/40 p-8 flex items-center justify-center text-center">
            <div className="max-w-md space-y-4">
              <ListMusic className="w-16 h-16 text-green-400 mx-auto opacity-50" />
              <h3 className="text-xl font-bold text-white">Connect Your Account</h3>
              <p className="text-white/60">Use the Spotify integration to view and control your personal playlists directly from the dashboard.</p>
            </div>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
