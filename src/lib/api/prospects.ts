export const PROSPECT_STATUSES = [
  "not_contacted",
  "sent",
  "viewed",
  "replied",
  "call_booked",
  "won",
  "lost",
] as const;
export type ProspectStatus = (typeof PROSPECT_STATUSES)[number];

export interface VideoSummary {
  id: number;
  slug: string;
  loom_url: string;
  status: string;
  mp4_url: string | null;
  gif_url: string | null;
  player_url: string | null;
  error_message: string | null;
  batch_id: number | null;
  duration_seconds: number | null;
  created_at: string;
  updated_at: string;
}

export interface ActivityRow {
  id: number;
  event_type: string;
  metadata: Record<string, unknown>;
  occurred_at: string;
  created_at: string;
}

export interface Prospect {
  id: number;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  linkedin_url: string | null;
  website: string | null;
  notes: string | null;
  status: ProspectStatus;
  batch_id: number | null;
  created_at: string;
  updated_at: string;
  view_count: number;
  last_viewed_at: string | null;
  active_video?: VideoSummary | null;
  latest_video?: VideoSummary | null;
  activities?: ActivityRow[];
}

export interface ProspectFormPayload {
  email: string;
  first_name?: string;
  last_name?: string;
  company_name?: string;
  linkedin_url?: string;
  website?: string;
  notes?: string;
  status?: ProspectStatus;
  batch_id?: number | null;
}

export interface ProspectListFilters {
  q?: string;
  status?: ProspectStatus;
  batch_id?: number;
  has_video?: boolean;
  pushed_to_campaign_id?: number;
}

type Fetcher = (path: string, init?: RequestInit) => Promise<Response>;

async function parseOrThrow<T>(res: Response): Promise<T> {
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(`request_failed_${res.status}`) as Error & {
      errors?: Record<string, string[]>;
      error?: string;
    };
    err.errors = body.errors;
    err.error = body.error;
    throw err;
  }
  return body as T;
}

export const prospectsApi = {
  list: (apiFetch: Fetcher, filters: ProspectListFilters = {}) => {
    const p = new URLSearchParams();
    if (filters.q) p.set("q", filters.q);
    if (filters.status) p.set("status", filters.status);
    if (filters.batch_id) p.set("batch_id", String(filters.batch_id));
    if (filters.has_video !== undefined) p.set("has_video", String(filters.has_video));
    if (filters.pushed_to_campaign_id) p.set("pushed_to_campaign_id", String(filters.pushed_to_campaign_id));
    const qs = p.toString();
    return apiFetch(`/api/v1/admin/outreel/prospects${qs ? `?${qs}` : ""}`).then(
      parseOrThrow<Prospect[]>,
    );
  },
  get: (apiFetch: Fetcher, id: number) =>
    apiFetch(`/api/v1/admin/outreel/prospects/${id}`).then(parseOrThrow<Prospect>),
  create: (apiFetch: Fetcher, payload: ProspectFormPayload) =>
    apiFetch("/api/v1/admin/outreel/prospects", {
      method: "POST",
      body: JSON.stringify({ prospect: payload }),
    }).then(parseOrThrow<Prospect>),
  update: (apiFetch: Fetcher, id: number, payload: Partial<ProspectFormPayload>) =>
    apiFetch(`/api/v1/admin/outreel/prospects/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ prospect: payload }),
    }).then(parseOrThrow<Prospect>),
  destroy: async (apiFetch: Fetcher, id: number) => {
    const res = await apiFetch(`/api/v1/admin/outreel/prospects/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`delete_failed_${res.status}`);
  },
  listActivities: (apiFetch: Fetcher, id: number) =>
    apiFetch(`/api/v1/admin/outreel/prospects/${id}/activities`).then(
      parseOrThrow<ActivityRow[]>,
    ),
};
