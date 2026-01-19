import { GlassCard } from "@/components/GlassCard";
import { Music, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SpotifyAppProps {
  onClose: () => void;
}

export function SpotifyApp({ onClose }: SpotifyAppProps) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-8 text-center">
      <div className="w-24 h-24 rounded-full flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl border border-white/20">
        <Music className="w-12 h-12 text-white" />
      </div>
      
      <div className="space-y-4 max-w-md">
        <h2 className="text-4xl font-bold text-white">Spotify</h2>
        <p className="text-white/60 leading-relaxed">
          Log in to your Spotify account to sync your library and see what's playing on your other devices.
        </p>
      </div>

      <div className="flex flex-col gap-4 w-full max-w-xs">
        <Button 
          size="lg" 
          className="bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold rounded-2xl h-14"
          onClick={() => window.open('https://open.spotify.com', '_blank')}
        >
          <ExternalLink className="w-5 h-5 mr-2" /> Log In to Spotify
        </Button>
        
        <Button 
          variant="outline"
          className="border-white/10 bg-white/5 text-white hover:bg-white/10 rounded-2xl h-14"
          onClick={() => window.open('https://open.spotify.com/user/w7ush2lhxu8sl4v84dye3li0d', '_blank')}
        >
          <ExternalLink className="w-5 h-5 mr-2" /> View Your Profile
        </Button>
      </div>

      <GlassCard className="p-6 bg-black/40 border-white/10 rounded-3xl w-full max-w-2xl overflow-hidden mt-4">
        <p className="text-xs text-white/40 uppercase tracking-widest font-bold mb-4">Preview Player</p>
        <iframe 
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0" 
          width="100%" 
          height="160" 
          frameBorder="0" 
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
          className="rounded-xl opacity-80"
        />
      </GlassCard>
    </div>
  );
}
