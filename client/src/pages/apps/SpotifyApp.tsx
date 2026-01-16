import { GlassCard } from "@/components/GlassCard";

interface SpotifyAppProps {
  onClose: () => void;
}

export function SpotifyApp({ onClose }: SpotifyAppProps) {
  return (
    <div className="w-full h-full flex flex-col p-8">
      <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col gap-6">
        <h2 className="text-3xl font-display text-white mb-2">Music Player</h2>
        
        <GlassCard variant="panel" className="flex-1 w-full overflow-hidden bg-black/40">
          <iframe 
            style={{ borderRadius: "12px" }} 
            src="https://open.spotify.com/embed/playlist/37i9dQZF1DXcBWIGoYBM5M?utm_source=generator&theme=0" 
            width="100%" 
            height="100%" 
            frameBorder="0" 
            allowFullScreen 
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
            loading="lazy"
            className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
          ></iframe>
        </GlassCard>
      </div>
    </div>
  );
}
