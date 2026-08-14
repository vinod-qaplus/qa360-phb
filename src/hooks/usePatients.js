import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { patientApi } from "../api/patientApi";
import { queryKeys } from "../api/queryKey";

export function usePatients() {
  return useQuery({
    queryKey: queryKeys.patients,
    queryFn: async () => {
      console.log("Fetching patients...");
      return patientApi.getAll();
    },
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: patientApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.patients,
      });
    },
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    /**
     * @param {{ id: string | number, data: any }} variables
     */
    mutationFn: (variables) =>
      patientApi.update(variables?.id, variables?.data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.patients,
      });
    },
  });
}
