import { useMutation } from '@tanstack/react-query';
import type { UploadResponse } from 'pinata';
import { uploadFile, type UploadFileOptions } from '@/lib/pinata';

interface UploadFileParams {
  file: File;
  options?: UploadFileOptions;
}

interface UsePinataUploadFileResult {
  upload: (params: UploadFileParams) => Promise<UploadResponse>;
  isLoading: boolean;
  error: Error | null;
  data: UploadResponse | null;
  reset: () => void;
}

export function usePinataUploadFile(): UsePinataUploadFileResult {
  const mutation = useMutation({
    mutationFn: async (params: UploadFileParams) => {
      return uploadFile(params.file, params.options);
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
