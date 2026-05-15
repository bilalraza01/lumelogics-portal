export type ResourceType = "pdf" | "google_doc" | "external_url" | "file";

export const UPLOAD_TYPES: ResourceType[] = ["pdf", "file"];
export const LINK_TYPES: ResourceType[] = ["google_doc", "external_url"];

export interface AdminLeadMagnet {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  resource_type: ResourceType;
  resource_url: string | null;
  resource_file_url: string | null;
  resource_file_name: string | null;
  email_subject: string;
  email_intro: string | null;
  vsl_video_url: string | null;
  vsl_headline: string | null;
  vsl_body: string | null;
  calendly_url: string | null;
  request_count: number;
  created_at: string;
  updated_at: string;
}

export interface MagnetFormPayload {
  slug: string;
  title: string;
  description?: string;
  resource_type: ResourceType;
  /** Only for google_doc / external_url types. */
  resource_url?: string;
  /** Only for pdf / file types — the newly chosen upload, if any. */
  resource_file?: File;
  email_subject: string;
  email_intro?: string;
  vsl_video_url?: string;
  vsl_headline?: string;
  vsl_body?: string;
  calendly_url?: string;
}

export interface MagnetIndexResponse {
  data: AdminLeadMagnet[];
  pagination: { page: number; per_page: number; total: number };
}

export type ApiError = { errors?: Record<string, string[]>; error?: string };

type Fetcher = (path: string, init?: RequestInit) => Promise<Response>;

async function parseOrThrow<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`request_failed_${res.status}`) as Error & ApiError;
    err.errors = body.errors;
    err.error = body.error;
    throw err;
  }
  return body as T;
}

// Builds multipart/form-data so the optional File rides along. apiFetch
// deliberately omits Content-Type for FormData so the browser sets the
// multipart boundary. Rails strong-params reads these as flat keys.
function toFormData(payload: Partial<MagnetFormPayload>): FormData {
  const fd = new FormData();
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined || value === null) continue;
    if (value instanceof File) fd.append(key, value);
    else fd.append(key, String(value));
  }
  return fd;
}

export const leadMagnetsApi = {
  list: (apiFetch: Fetcher) =>
    apiFetch("/api/v1/admin/lead-magnets").then(parseOrThrow<MagnetIndexResponse>),
  get: (apiFetch: Fetcher, id: string) =>
    apiFetch(`/api/v1/admin/lead-magnets/${id}`).then(parseOrThrow<AdminLeadMagnet>),
  create: (apiFetch: Fetcher, payload: MagnetFormPayload) =>
    apiFetch("/api/v1/admin/lead-magnets", {
      method: "POST",
      body: toFormData(payload),
    }).then(parseOrThrow<AdminLeadMagnet>),
  update: (apiFetch: Fetcher, id: string, payload: Partial<MagnetFormPayload>) =>
    apiFetch(`/api/v1/admin/lead-magnets/${id}`, {
      method: "PATCH",
      body: toFormData(payload),
    }).then(parseOrThrow<AdminLeadMagnet>),
  destroy: async (apiFetch: Fetcher, id: string) => {
    const res = await apiFetch(`/api/v1/admin/lead-magnets/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`delete_failed_${res.status}`);
  },
};
