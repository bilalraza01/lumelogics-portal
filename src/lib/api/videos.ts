import type { VideoSummary } from "./prospects";

type Fetcher = (path: string, init?: RequestInit) => Promise<Response>;

export interface ApiFailure extends Error {
  status?: number;
  error?: string;
  errors?: Record<string, string[]>;
}

async function parseOrThrow<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`request_failed_${res.status}`) as ApiFailure;
    err.status = res.status;
    err.error  = body?.error;
    err.errors = body?.errors;
    throw err;
  }
  return body as T;
}

export const videosApi = {
  get: (apiFetch: Fetcher, id: number) =>
    apiFetch(`/api/v1/admin/outreel/videos/${id}`).then(parseOrThrow<VideoSummary>),
  create: (
    apiFetch: Fetcher,
    prospectId: number,
    payload: { loom_url: string; batch_id?: number | null },
  ) =>
    apiFetch(`/api/v1/admin/outreel/prospects/${prospectId}/videos`, {
      method: "POST",
      body: JSON.stringify({ video: payload }),
    }).then(parseOrThrow<VideoSummary>),
};
