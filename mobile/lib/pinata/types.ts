export interface PinataConfig {
  jwt: string;
  gateway: string;
  uploadUrl: string;
}

export interface UploadOptions {
  name?: string;
  keyvalues?: Record<string, string>;
  groupId?: string;
}

export interface UploadResponse {
  id: string;
  name: string;
  cid: string;
  created_at: string;
  size: number;
  number_of_files: number;
  mime_type: string;
  user_id: string;
  group_id: string | null;
  is_duplicate: boolean;
}

export interface FetchResponse<T = unknown> {
  data: T;
  contentType: string;
}
