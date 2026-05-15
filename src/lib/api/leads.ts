export interface LeadSummary {
  email: string;
  request_count: number;
  verified_count: number;
  first_seen_at: string;
  last_seen_at: string;
}

export interface LeadDetailRequest {
  id: string;
  magnet: { id: string; slug: string; title: string };
  referral_source: string | null;
  verified_at: string | null;
  created_at: string;
}

export interface LeadDetail extends LeadSummary {
  requests: LeadDetailRequest[];
}

export interface LeadIndexResponse {
  data: LeadSummary[];
  pagination: { page: number; per_page: number; total: number };
}

type Fetcher = (path: string, init?: RequestInit) => Promise<Response>;

async function parseOrThrow<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`request_failed_${res.status}`) as Error & {
      error?: string;
    };
    err.error = body.error;
    throw err;
  }
  return body as T;
}

export const leadsApi = {
  list: (apiFetch: Fetcher, opts: { q?: string; page?: number } = {}) => {
    const params = new URLSearchParams();
    if (opts.q) params.set("q", opts.q);
    if (opts.page) params.set("page", String(opts.page));
    const qs = params.toString();
    return apiFetch(`/api/v1/admin/leads${qs ? `?${qs}` : ""}`).then(
      parseOrThrow<LeadIndexResponse>,
    );
  },
  get: (apiFetch: Fetcher, email: string) =>
    apiFetch(
      `/api/v1/admin/leads/${encodeURIComponent(email)}`,
    ).then(parseOrThrow<LeadDetail>),
};
