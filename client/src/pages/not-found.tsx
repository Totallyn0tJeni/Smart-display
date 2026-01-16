import { Link } from "wouter";
import { GlassCard } from "@/components/GlassCard";
import { AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4">
      <GlassCard variant="panel" className="max-w-md w-full p-8 text-center flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 mb-2">
          <AlertTriangle className="w-8 h-8" />
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <p className="text-white/60 mb-6">
          The page you're looking for seems to have drifted away into the digital void.
        </p>

        <Link href="/" className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors border border-white/10">
          Return Home
        </Link>
      </GlassCard>
    </div>
  );
}
