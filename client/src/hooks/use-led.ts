import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type UpdateLedStateRequest } from "@shared/routes";

export function useLedState() {
  return useQuery({
    queryKey: [api.led.get.path],
    queryFn: async () => {
      const res = await fetch(api.led.get.path);
      if (!res.ok) throw new Error("Failed to fetch LED state");
      return api.led.get.responses[200].parse(await res.json());
    },
  });
}

export function useUpdateLedState() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (updates: UpdateLedStateRequest) => {
      // API defines update as POST to /api/led with partial body
      const res = await fetch(api.led.update.path, {
        method: api.led.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update LED state");
      return api.led.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      // Optimistically update the cache or invalidate
      queryClient.setQueryData([api.led.get.path], data);
    },
  });
}
