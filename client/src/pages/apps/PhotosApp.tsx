import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Image as ImageIcon, ExternalLink, ChevronLeft, ChevronRight, Pause, Play, Upload, Trash2 } from "lucide-react";
import { api } from "@shared/routes";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import { ObjectUploader } from "@/components/ObjectUploader";
import { useUpload } from "@/hooks/use-upload";

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
  "https://im.vsco.co/aws-us-west-2/259d2e/281885216/69560a40e0147372eb382053/vsco_010126.jpg",
  "https://im.vsco.co/aws-us-west-2/259d2e/281885216/69560a89e0147372eb38205e/vsco_010126.jpg",
  "https://im.vsco.co/aws-us-west-2/259d2e/281885216/69560a6ee0147372eb38205a/vsco_010126.jpg",
  "https://im.vsco.co/aws-us-west-2/259d2e/281885216/69560a53e0147372eb382056/vsco_010126.jpg",
  "https://im.vsco.co/aws-us-west-2/259d2e/281885216/69560a84e0147372eb38205d/vsco_010126.jpg",
  "https://im.vsco.co/aws-us-west-2/259d2e/281885216/69560a68e0147372eb382059/vsco_010126.jpg",
  "https://im.vsco.co/aws-us-west-2/259d2e/281885216/69560a4de0147372eb382055/vsco_010126.jpg"
];

export function PhotosApp({ onClose, isWidget = false }: PhotosAppProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const { toast } = useToast();

  const { getUploadParameters } = useUpload();

  const createPhotoMutation = useMutation({
    mutationFn: async (url: string) => {
      return apiRequest("POST", api.photos.create.path, {
        url,
        caption: "Uploaded Photo",
        source: "local"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.photos.list.path] });
      toast({ title: "Success", description: "Photo uploaded successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to upload photo", variant: "destructive" });
    }
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/photos/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.photos.list.path] });
      toast({ title: "Success", description: "Photo deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete photo", variant: "destructive" });
    }
  });

  const { data: apiPhotos } = useQuery({
    queryKey: [api.photos.list.path],
  });

  const photos = apiPhotos && (apiPhotos as any).length > 0 
    ? [...(apiPhotos as any).map((p: any) => ({ url: p.url, id: p.id, canDelete: true })), ...VSCO_GALLERY_PHOTOS.map(url => ({ url, id: null, canDelete: false }))] 
    : VSCO_GALLERY_PHOTOS.map(url => ({ url, id: null, canDelete: false }));

  // Guard against out of bounds index after photos change
  useEffect(() => {
    if (photos.length > 0 && currentIndex >= photos.length) {
      setCurrentIndex(0);
    }
  }, [photos.length, currentIndex]);

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
            style={{ backgroundImage: `url(${photos[currentIndex].url})` }}
          />
        </AnimatePresence>
        <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
          <p className="text-white/60 text-[10px] uppercase tracking-widest font-medium">VSCO Collection</p>
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
        <div className="flex gap-2 mr-10">
          <ObjectUploader
            maxNumberOfFiles={10}
            onGetUploadParameters={getUploadParameters}
            onComplete={(result) => {
              if (result?.successful) {
                result.successful.forEach((file) => {
                  if (file.uploadURL) {
                    const url = file.uploadURL.split('?')[0];
                    // If it's a replit object storage URL, convert to /objects/ path
                    let storagePath = url;
                    if (url.includes('.private/uploads/')) {
                      storagePath = `/objects/uploads/${url.split('/uploads/')[1]}`;
                    } else if (url.includes('/api/uploads/local/')) {
                      // Convert local upload API URL to public static URL
                      storagePath = `/uploads/${url.split('/api/uploads/local/')[1]}`;
                    }
                    createPhotoMutation.mutate(storagePath);
                  }
                });
              }
            }}
          >
            <Button size="default" variant="outline" className="border-white/10 bg-white/5 text-white">
              <Upload className="w-4 h-4 mr-2" /> Upload
            </Button>
          </ObjectUploader>
          <Button variant="outline" className="border-white/10 bg-white/5 text-white" asChild>
            <a href="https://vsco.co/tottalyn0tjeni/gallery" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" /> View Original
            </a>
          </Button>
        </div>
      </div>

      {photos.length > 0 && photos[currentIndex] ? (
        <>
          <div className="relative aspect-video rounded-3xl overflow-hidden border border-white/10 group shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${photos[currentIndex].url})` }}
              />
            </AnimatePresence>

            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

            <div className="absolute inset-0 flex items-center justify-between px-6 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length)} className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20">
                <ChevronLeft className="w-8 h-8" />
              </button>
                      <div className="flex flex-col items-center gap-4">
                <button onClick={() => setIsPlaying(!isPlaying)} className="p-5 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20">
                  {isPlaying ? <Pause className="w-10 h-10" /> : <Play className="w-10 h-10 ml-1" />}
                </button>
                {photos[currentIndex].canDelete && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhotoMutation.mutate(photos[currentIndex].id!);
                    }} 
                    className="p-3 rounded-full bg-red-500/20 backdrop-blur-md text-red-500 border border-red-500/30 hover:bg-red-500/40 transition-all z-50"
                    title="Delete photo"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                )}
              </div>
              <button onClick={() => setCurrentIndex((prev) => (prev + 1) % photos.length)} className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20">
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
            {photos.map((photo, idx) => (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.05 }}
                onClick={() => setCurrentIndex(idx)}
                className={`group aspect-square rounded-lg overflow-hidden border cursor-pointer transition-all relative ${idx === currentIndex ? 'border-white ring-2 ring-white/50' : 'border-white/10 opacity-60 hover:opacity-100'}`}
              >
                <img src={photo.url} className="w-full h-full object-cover" alt={`Photo ${idx}`} />
                {photo.canDelete && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deletePhotoMutation.mutate(photo.id!);
                    }}
                    className="absolute top-1 right-1 p-1.5 rounded-full bg-red-500/80 text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
                    title="Delete photo"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-white/40">
          <ImageIcon className="w-16 h-16 mb-4 opacity-20" />
          <p>No photos yet. Upload your first memory!</p>
        </div>
      )}
    </div>
  );
}
