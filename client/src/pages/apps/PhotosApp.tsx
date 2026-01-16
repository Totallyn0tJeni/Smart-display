import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePhotos } from "@/hooks/use-photos";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { GlassCard } from "@/components/GlassCard";

interface PhotosAppProps {
  onClose: () => void;
}

const FALLBACK_PHOTOS = [
  "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=1920&h=1080&fit=crop", /* Alpine lake landscape */
  "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?w=1920&h=1080&fit=crop", /* Misty mountains */
  "https://images.unsplash.com/photo-1518173946687-a4c88928d999?w=1920&h=1080&fit=crop", /* Starry night sky */
  "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1920&h=1080&fit=crop", /* Green rolling hills */
];

export function PhotosApp({ onClose }: PhotosAppProps) {
  const { data: apiPhotos, isLoading } = usePhotos();
  const photos = apiPhotos && apiPhotos.length > 0 ? apiPhotos.map(p => p.url) : FALLBACK_PHOTOS;
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }, 5000); // 5 seconds per slide
    }
    return () => clearInterval(interval);
  }, [isPlaying, photos.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % photos.length);
    setIsPlaying(false);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    setIsPlaying(false);
  };

  if (isLoading) return <div className="flex items-center justify-center h-full text-white">Loading gallery...</div>;

  return (
    <div className="w-full h-full relative group">
      {/* Main Image Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${photos[currentIndex]})` }}
        >
          <div className="absolute inset-0 bg-black/20" /> {/* Slight overlay for text readability */}
        </motion.div>
      </AnimatePresence>

      {/* Controls Overlay - Shows on Hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-8">
        <div className="flex justify-between items-start">
          <GlassCard variant="card" className="px-4 py-2">
            <h2 className="text-white font-medium">Memory {currentIndex + 1} / {photos.length}</h2>
          </GlassCard>
        </div>

        <div className="flex items-center justify-center gap-8">
           <button onClick={prevSlide} className="p-4 rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-white/20 transition-all">
             <ChevronLeft className="w-8 h-8" />
           </button>
           
           <button onClick={() => setIsPlaying(!isPlaying)} className="p-6 rounded-full bg-white/10 text-white backdrop-blur-md border border-white/30 hover:bg-white/20 transition-all scale-100 hover:scale-105 active:scale-95">
             {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
           </button>

           <button onClick={nextSlide} className="p-4 rounded-full bg-black/30 text-white backdrop-blur-md hover:bg-white/20 transition-all">
             <ChevronRight className="w-8 h-8" />
           </button>
        </div>

        <div className="flex justify-center gap-2">
          {photos.map((_, idx) => (
            <div 
              key={idx}
              className={`h-1 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-white' : 'w-2 bg-white/30'}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
