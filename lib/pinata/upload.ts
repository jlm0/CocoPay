import { getPinataConfig } from './client';
import type { UploadOptions, UploadResponse } from './types';

export type { UploadOptions as UploadJsonOptions };
export type { UploadOptions as UploadFileOptions };

interface ReactNativeFileObject {
  uri: string;
  type: string;
  name: string;
}

export async function uploadJson<T extends object>(
  data: T,
  options?: UploadOptions
): Promise<UploadResponse> {
  const config = getPinataConfig();

  const json = JSON.stringify(data);
  const base64 = btoa(json);

  const fileObject: ReactNativeFileObject = {
    uri: `data:application/json;base64,${base64}`,
    type: 'application/json',
    name: options?.name ?? 'data.json',
  };

  const formData = new FormData();
  formData.append('file', fileObject as unknown as Blob);
  formData.append('network', 'public');

  if (options?.name) {
    formData.append('name', options.name);
  }

  if (options?.keyvalues) {
    formData.append('keyvalues', JSON.stringify(options.keyvalues));
  }

  if (options?.groupId) {
    formData.append('group_id', options.groupId);
  }

  const response = await fetch(config.uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.jwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata upload failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result.data as UploadResponse;
}

export async function uploadFile(
  file: File | ReactNativeFileObject,
  options?: UploadOptions
): Promise<UploadResponse> {
  const config = getPinataConfig();

  const formData = new FormData();
  formData.append('file', file as unknown as Blob);
  formData.append('network', 'public');

  if (options?.name) {
    formData.append('name', options.name);
  }

  if (options?.keyvalues) {
    formData.append('keyvalues', JSON.stringify(options.keyvalues));
  }

  if (options?.groupId) {
    formData.append('group_id', options.groupId);
  }

  const response = await fetch(config.uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.jwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata upload failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result.data as UploadResponse;
}

export async function uploadBase64(
  base64String: string,
  mimeType: string = 'application/octet-stream',
  options?: UploadOptions
): Promise<UploadResponse> {
  const config = getPinataConfig();

  const fileObject: ReactNativeFileObject = {
    uri: `data:${mimeType};base64,${base64String}`,
    type: mimeType,
    name: options?.name ?? 'file',
  };

  const formData = new FormData();
  formData.append('file', fileObject as unknown as Blob);
  formData.append('network', 'public');

  if (options?.name) {
    formData.append('name', options.name);
  }

  if (options?.keyvalues) {
    formData.append('keyvalues', JSON.stringify(options.keyvalues));
  }

  if (options?.groupId) {
    formData.append('group_id', options.groupId);
  }

  const response = await fetch(config.uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.jwt}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Pinata upload failed (${response.status}): ${errorText}`);
  }

  const result = await response.json();
  return result.data as UploadResponse;
}
