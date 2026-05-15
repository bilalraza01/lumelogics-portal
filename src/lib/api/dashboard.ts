export interface DashboardData {
  lead_funnel: {
    assessments_total: number;
    assessments_this_week: number;
    assessments_by_archetype: Record<string, number>;
    magnet_requests_total: number;
    magnet_requests_this_week: number;
    magnet_requests_verified: number;
    leads_total: number;
    leads_this_week: number;
  };
  outreach_pipeline: {
    prospects_total: number;
    prospects_by_status: Record<string, number>;
    videos_in_flight: number;
    videos_failed: number;
    videos_ready: number;
  };
  smartlead_activity: {
    pushes_this_week: number;
    pushes_by_status: Record<string, number>;
    campaigns_synced_total: number;
  };
  recent_assessments: {
    id: string;
    email: string;
    archetype: string;
    total_score: number;
    created_at: string;
  }[];
  recent_magnet_requests: {
    id: string;
    email: string;
    magnet: { slug: string; title: string };
    verified_at: string | null;
    created_at: string;
  }[];
  recent_activity: {
    id: number;
    event_type: string;
    prospect: { id: number; email: string };
    metadata: Record<string, unknown>;
    occurred_at: string;
  }[];
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

export const dashboardApi = {
  get: (apiFetch: Fetcher) =>
    apiFetch("/api/v1/admin/dashboard").then(parseOrThrow<DashboardData>),
};
