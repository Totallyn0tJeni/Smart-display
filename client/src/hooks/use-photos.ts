import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertPhoto } from "@shared/routes";

export function usePhotos() {
  return useQuery({
    queryKey: [api.photos.list.path],
    queryFn: async () => {
      const res = await fetch(api.photos.list.path);
      if (!res.ok) throw new Error("Failed to fetch photos");
      return api.photos.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreatePhoto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (photo: InsertPhoto) => {
      const res = await fetch(api.photos.create.path, {
        method: api.photos.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(photo),
      });
      if (!res.ok) throw new Error("Failed to upload photo");
      return api.photos.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.photos.list.path] });
    },
  });
}
