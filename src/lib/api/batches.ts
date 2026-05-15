export interface BatchInfo {
  batch_id: number;
  slots_used: number;
  slots_total: number;
}

type Fetcher = (path: string, init?: RequestInit) => Promise<Response>;

async function parseOrThrow<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`request_failed_${res.status}`);
  return body as T;
}

export const batchesApi = {
  current: (apiFetch: Fetcher) =>
    apiFetch("/api/v1/admin/outreel/batches/current").then(parseOrThrow<BatchInfo>),
  create: (apiFetch: Fetcher) =>
    apiFetch("/api/v1/admin/outreel/batches/new", { method: "POST" }).then(
      parseOrThrow<BatchInfo>,
    ),
};
