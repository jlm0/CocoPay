import { useMutation } from '@tanstack/react-query';
import { uploadJson, type UploadJsonOptions, type UploadResponse } from '@/lib/pinata';

interface UploadJsonParams<T extends Record<string, unknown>> {
  data: T;
  options?: UploadJsonOptions;
}

interface UsePinataUploadJsonResult<T extends Record<string, unknown>> {
  upload: (params: UploadJsonParams<T>) => Promise<UploadResponse>;
  isLoading: boolean;
  error: Error | null;
  data: UploadResponse | null;
  reset: () => void;
}

export function usePinataUploadJson<
  T extends Record<string, unknown>,
>(): UsePinataUploadJsonResult<T> {
  const mutation = useMutation({
    mutationFn: async (params: UploadJsonParams<T>) => {
      return uploadJson(params.data, params.options);
    },
  });

  return {
    upload: mutation.mutateAsync,
    isLoading: mutation.isPending,
    error: mutation.error as Error | null,
    data: mutation.data ?? null,
    reset: mutation.reset,
  };
}
