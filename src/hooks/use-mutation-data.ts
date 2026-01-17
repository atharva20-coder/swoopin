import {
  MutationFunction,
  MutationKey,
  useMutation,
  useMutationState,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

export const useMutationData = (
  mutationKey: MutationKey,
  mutationFn: MutationFunction<any, any>,
  queryKey?: string,
  onSuccess?: () => void,
  toastOn: boolean = true,
) => {
  const client = useQueryClient();
  const { mutate, isPending } = useMutation({
    mutationKey,
    mutationFn,
    onSuccess: (data) => {
      if (onSuccess) onSuccess();

      // Handle different response formats - data.data can be a string or object
      const message =
        typeof data?.data === "string"
          ? data.data
          : data?.data?.name
            ? `Created: ${data.data.name}`
            : data?.success
              ? "Operation completed successfully"
              : "Operation completed";

      return toastOn
        ? toast(data?.status === 200 || data?.success ? "Success" : "Error", {
            description: message,
          })
        : undefined;
    },
    onSettled: async () => {
      if (queryKey) {
        await client.invalidateQueries({
          queryKey: [queryKey],
          refetchType: "active",
        });
      }
    },
  });

  return { mutate, isPending };
};

export const useMutationDataState = (mutationKey: MutationKey) => {
  const data = useMutationState({
    filters: { mutationKey },
    select: (mutation) => {
      return {
        variables: mutation.state.variables as any,
        status: mutation.state.status,
      };
    },
  });

  const latestVariable = data[data.length - 1];
  return { latestVariable };
};
