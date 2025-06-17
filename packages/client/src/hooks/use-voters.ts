import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { type Voter } from "@/types";
import { toast } from "sonner";

export function useVoters(searchTerm?: string) {
  return useQuery<Voter[]>({
    queryKey: ["voters", searchTerm || ""], // Add searchTerm to queryKey, use empty string if undefined
    queryFn: async () => {
      const endpoint = searchTerm
        ? `/voters?search=${encodeURIComponent(searchTerm)}`
        : "/voters";
      const { data } = await api.get<Voter[]>(endpoint);
      return data;
    },
    // Keep previous data while new data is fetching for a smoother UX
    placeholderData: (previousData) => previousData,
  });
}

export function useCreateVoter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (newVoter: Omit<Voter, "id">) =>
      api.post<Voter>("/voters", newVoter),
    onSuccess: () => {
      void toast.success("Voter created successfully!");
      // Invalidate the voters query to refetch the list
      void queryClient.invalidateQueries({ queryKey: ["voters"] });
    },
    onError: (error: unknown) => {
      const message =
        (error as { response: { data: { message: string } } })?.response?.data
          ?.message || "Failed to create voter.";
      void toast.error(message);
    },
  });
}

export function useUpdateVoterNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      api.patch<Voter>(`/voters/${id}`, { notes }),
    onSuccess: () => {
      void toast.success("Voter notes updated!");
      void queryClient.invalidateQueries({ queryKey: ["voters"] });
    },
    onError: (error: unknown) => {
      const message =
        (error as { response: { data: { message: string } } })?.response?.data
          ?.message || "Failed to update notes.";
      void toast.error(message);
    },
  });
}
