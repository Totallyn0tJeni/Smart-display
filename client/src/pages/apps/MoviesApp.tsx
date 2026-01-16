import { useState } from "react";
import { Play, Film, Search, ExternalLink } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface MoviesAppProps {
  onClose: () => void;
}

const FREE_SITES = [
  { name: "Tubi TV", url: "https://tubitv.com", desc: "Thousands of free movies and TV shows." },
  { name: "Pluto TV", url: "https://pluto.tv", desc: "Live TV and on-demand movies." },
  { name: "Freevee", url: "https://www.amazon.com/freevee", desc: "Premium free streaming from Amazon." },
  { name: "Crackle", url: "https://www.crackle.com", desc: "Originals and acquired hits." }
];

export function MoviesApp({ onClose }: MoviesAppProps) {
  return (
    <div className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl font-bold text-white flex items-center gap-3">
          <Film className="w-8 h-8 text-indigo-400" /> Cinema Hub
        </h2>
        <p className="text-white/60">Stream free movies and TV shows from trusted platforms.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {FREE_SITES.map((site) => (
          <GlassCard key={site.name} className="p-6 bg-white/5 border-white/10 flex flex-col justify-between hover:bg-white/10 transition-colors group">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-bold text-white">{site.name}</h3>
                <span className="px-2 py-1 rounded bg-green-500/20 text-green-400 text-[10px] font-bold uppercase tracking-widest">Free</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed">{site.desc}</p>
            </div>
            
            <Button 
              asChild
              className="mt-6 bg-white/10 hover:bg-indigo-500/80 text-white border border-white/10"
            >
              <a href={site.url} target="_blank" rel="noopener noreferrer">
                Launch Player <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </GlassCard>
        ))}
      </div>

      <GlassCard className="mt-auto p-6 bg-indigo-500/10 border-indigo-500/20 text-center">
        <p className="text-white/80 text-sm">
          Note: These sites are external and may contain ads. Always use a secure browser.
        </p>
      </GlassCard>
    </div>
  );
}
