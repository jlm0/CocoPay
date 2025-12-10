import type { UploadResponse } from 'pinata';
import { getPinataClient } from './client';

export interface UploadJsonOptions {
  name?: string;
  keyvalues?: Record<string, string>;
}

export interface UploadFileOptions {
  name?: string;
  keyvalues?: Record<string, string>;
}

export async function uploadJson<T extends object>(
  data: T,
  options?: UploadJsonOptions
): Promise<UploadResponse> {
  const client = getPinataClient();

  let builder = client.upload.public.json(data);

  if (options?.name) {
    builder = builder.name(options.name);
  }

  if (options?.keyvalues) {
    builder = builder.keyvalues(options.keyvalues);
  }

  return builder;
}

export async function uploadFile(file: File, options?: UploadFileOptions): Promise<UploadResponse> {
  const client = getPinataClient();

  let builder = client.upload.public.file(file);

  if (options?.name) {
    builder = builder.name(options.name);
  }

  if (options?.keyvalues) {
    builder = builder.keyvalues(options.keyvalues);
  }

  return builder;
}

export async function uploadBase64(
  base64String: string,
  options?: UploadFileOptions
): Promise<UploadResponse> {
  const client = getPinataClient();

  let builder = client.upload.public.base64(base64String);

  if (options?.name) {
    builder = builder.name(options.name);
  }

  if (options?.keyvalues) {
    builder = builder.keyvalues(options.keyvalues);
  }

  return builder;
}
