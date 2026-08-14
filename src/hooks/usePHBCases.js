import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { phbCasesApi } from "../api/phbCasesApi";
import { queryKeys } from "../api/queryKey";

export function usePHBCases() {
  return useQuery({
    queryKey: queryKeys.phbCases,
    queryFn: async () => {
      console.log("usePHBCases -Fetching PHB cases...");
      return phbCasesApi.getAll();
    },
  });
}

export function useCreatePHBCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: phbCasesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.phbCases,
      });
    },
  });
}

export function useUpdatePHBCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => phbCasesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.phbCases,
      });
    },
  });
}
