import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Upload, Plus, Trash2, Image as ImageIcon, ExternalLink } from "lucide-react";
import { api } from "@shared/routes";
import { GlassCard } from "@/components/GlassCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PhotosAppProps {
  onClose: () => void;
}

export function PhotosApp({ onClose }: PhotosAppProps) {
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newCaption, setNewCaption] = useState("");
  const [source, setSource] = useState<"local" | "vsco">("local");
  const { toast } = useToast();

  const { data: photos, isLoading } = useQuery({
    queryKey: [api.photos.list.path],
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!newPhotoUrl) throw new Error("URL is required");
      return apiRequest("POST", api.photos.create.path, {
        url: newPhotoUrl,
        caption: newCaption,
        source
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.photos.list.path] });
      setNewPhotoUrl("");
      setNewCaption("");
      toast({ title: "Photo added successfully" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add photo", description: error.message, variant: "destructive" });
    }
  });

  const vscoImportMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("POST", "/api/vsco/import", { url: newPhotoUrl });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.photos.list.path] });
      setNewPhotoUrl("");
      toast({ title: "Imported from VSCO" });
    }
  });

  return (
    <div className="flex-1 p-8 flex flex-col gap-8 overflow-y-auto">
      <div className="flex flex-col gap-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ImageIcon className="w-6 h-6" /> Gallery Manager
        </h2>

        <GlassCard className="p-6 bg-white/5 border-white/10 flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/50">Image URL</label>
              <Input 
                value={newPhotoUrl} 
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://..." 
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-white/50">Caption</label>
              <Input 
                value={newCaption} 
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="A beautiful memory..." 
                className="bg-white/5 border-white/10 text-white"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <Button 
              onClick={() => createMutation.mutate()} 
              disabled={createMutation.isPending}
              className="flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Photo
            </Button>
            <Button 
              variant="outline"
              onClick={() => vscoImportMutation.mutate()}
              disabled={vscoImportMutation.isPending}
              className="flex-1 border-white/10 bg-black/20 text-white hover:bg-black/40"
            >
              <ExternalLink className="w-4 h-4 mr-2" /> Import VSCO
            </Button>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {photos?.map((photo: any) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="group relative aspect-square rounded-xl overflow-hidden border border-white/10"
          >
            <img src={photo.url} alt={photo.caption} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
              <p className="text-xs text-white font-medium truncate">{photo.caption || "No caption"}</p>
              <span className="text-[10px] text-white/50 uppercase tracking-tighter">{photo.source}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
