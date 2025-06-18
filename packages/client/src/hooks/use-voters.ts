import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/api";
import { type Voter } from "@/types";
import { toast } from "sonner";
import axios from "axios";

interface VoterHooksOptions {
  onAuthError?: () => void;
}

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

export function useCreateVoter({ onAuthError }: VoterHooksOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newVoter: Omit<Voter, "id">) =>
      api.post<Voter>("/voters", newVoter),
    onSuccess: () => {
      void toast.success("Voter created successfully!");
      void queryClient.invalidateQueries({ queryKey: ["voters"] });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        if (onAuthError) {
          onAuthError();
          void toast.error("Session expired. Please log in again.");
        } else {
          void toast.error("Authentication error. Please log in again.");
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

export function useUpdateVoterNotes({ onAuthError }: VoterHooksOptions = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: number; notes: string }) =>
      api.patch<Voter>(`/voters/${id}`, { notes }, {
      headers: {
        'Content-Type': 'application/json',
      },
    }),
    onSuccess: () => {
      void toast.success("Voter notes updated!");
      void queryClient.invalidateQueries({ queryKey: ["voters"] });
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        if (onAuthError) {
          onAuthError();
          void toast.error("Session expired. Please log in again.");
        } else {
          void toast.error("Authentication error. Please log in again.");
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
