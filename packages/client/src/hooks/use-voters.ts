import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { type Voter } from "@/types";
import { toast } from "sonner";
import { useContext } from "react";
import { AuthContext } from "@/context/auth";
import axios from "axios";

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
  const authContext = useContext(AuthContext);
  const authLogout = authContext?.logout;

  return useMutation({
    mutationFn: (newVoter: Omit<Voter, "id">) =>
      api.post<Voter>("/voters", newVoter),
    onSuccess: () => {
      void toast.success("Voter created successfully!");
      void queryClient.invalidateQueries({ queryKey: ["voters"] });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        if (authLogout) {
          authLogout();
          void toast.error("Session expired. Please log in again.");
        } else {
          // Fallback if logout is not available, though unlikely
          void toast.error("Session expired. Auth context not available.");
        }
      } else {
        const message =
          (error as { response: { data: { message: string } } })?.response?.data
            ?.message || "Failed to create voter.";
        void toast.error(message);
      }
    },
  });
}

export function useUpdateVoterNotes() {
  const queryClient = useQueryClient();
  const authContext = useContext(AuthContext);
  const authLogout = authContext?.logout;

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      api.patch<Voter>(`/voters/${id}`, { notes }),
    onSuccess: () => {
      void toast.success("Voter notes updated!");
      void queryClient.invalidateQueries({ queryKey: ["voters"] });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        if (authLogout) {
          authLogout();
          void toast.error("Session expired. Please log in again.");
        } else {
          void toast.error("Session expired. Auth context not available.");
        }
      } else {
        const message =
          (error as { response: { data: { message: string } } })?.response?.data
            ?.message || "Failed to update notes.";
        void toast.error(message);
      }
    },
  });
}
