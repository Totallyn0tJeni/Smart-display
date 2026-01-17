import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Image as ImageIcon, ExternalLink, ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { api } from "@shared/routes";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface PhotosAppProps {
  onClose: () => void;
  isWidget?: boolean;
}

const VSCO_GALLERY_PHOTOS = [
  "https://im.vsco.co/aws-us-west-2/259d2e/281885216/69560a9ae0147372eb382060/vsco_010126.jpg",
  "https://im.vsco.co/aws-us-west-2/259d2e/281885216/69560a7ae0147372eb38205c/vsco_010126.jpg",
  "https://im.vsco.co/aws-us-west-2/259d2e/281885216/69560a62e0147372eb382058/vsco_010126.jpg",
  "https://im.vsco.co/aws-us-west-2/259d2e/281885216/69560a46e0147372eb382054/vsco_010126.jpg",
  "https://im.vsco.co/aws-us-west-2/259d2e/281885216/69560a92e0147372eb38205f/vsco_010126.jpg",
  "https://im.vsco.co/aws-us-west-2/259d2e/281885216/69560a74e0147372eb38205b/vsco_010126.jpg",
  "https://im.vsco.co/aws-us-west-2/259d2e/281885216/69560a58e0147372eb382057/vsco_010126.jpg",
  "https://im.vsco.co/aws-us-west-2/259d2e/281885216/69560a40e0147372eb382053/vsco_010126.jpg"
];

export function PhotosApp({ onClose, isWidget = false }: PhotosAppProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const { toast } = useToast();

  const { data: apiPhotos } = useQuery({
    queryKey: [api.photos.list.path],
  });

  const photos = apiPhotos && (apiPhotos as any).length > 0 
    ? [...(apiPhotos as any).map((p: any) => p.url), ...VSCO_GALLERY_PHOTOS] 
    : VSCO_GALLERY_PHOTOS;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % photos.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPlaying, photos.length]);

  if (isWidget) {
    return (
      <div className="w-full h-full relative group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${photos[currentIndex]})` }}
          />
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white/60 text-xs uppercase tracking-widest">VSCO Gallery</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-6 h-6" /> VSCO Gallery
        </h2>
        <Button variant="outline" className="border-white/10 bg-white/5 text-white">
          <ExternalLink className="w-4 h-4 mr-2" /> Open VSCO
        </Button>
      </div>

      <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 group">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${photos[currentIndex]})` }}
          />
        </AnimatePresence>

        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

        <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)} className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20">
            <ChevronLeft className="w-8 h-8" />
          </button>
          <button onClick={() => setIsPlaying(!isPlaying)} className="p-5 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20">
            {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
          </button>
          <button onClick={() => setCurrentIndex((prev) => (prev + 1) % photos.length)} className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20">
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos.map((url, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            onClick={() => setCurrentIndex(idx)}
            className={`aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all ${idx === currentIndex ? 'border-white ring-2 ring-white/50' : 'border-white/10 opacity-60'}`}
          >
            <img src={url} className="w-full h-full object-cover" alt={`Photo ${idx}`} />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
