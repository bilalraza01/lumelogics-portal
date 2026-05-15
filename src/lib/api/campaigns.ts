export interface SmartleadCampaign {
  id: number;
  smartlead_id: number;
  name: string;
  status: string | null;
  last_synced_at: string | null;
}

export interface PreflightResult {
  ready: number[];
  blocked: { prospect_id: number; reasons: string[] }[];
}

export interface PushSummary {
  pushed: number[];
  blocked: { prospect_id: number; reasons: string[] }[];
  errors: { campaign_id: number; chunk: number[]; error: string }[];
  smartlead_campaign_id: number;
  smartlead_campaign_name: string | null;
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

export const campaignsApi = {
  list: (apiFetch: Fetcher) =>
    apiFetch("/api/v1/admin/outreel/smartlead/campaigns").then(
      parseOrThrow<SmartleadCampaign[]>,
    ),
  sync: (apiFetch: Fetcher) =>
    apiFetch("/api/v1/admin/outreel/smartlead/campaigns/sync", { method: "POST" }).then(
      parseOrThrow<SmartleadCampaign[]>,
    ),
  analytics: (apiFetch: Fetcher, id: number) =>
    apiFetch(`/api/v1/admin/outreel/smartlead/campaigns/${id}/analytics`).then(
      parseOrThrow<unknown>,
    ),
  preflight: (apiFetch: Fetcher, id: number, prospectIds: number[]) =>
    apiFetch(`/api/v1/admin/outreel/smartlead/campaigns/${id}/preflight`, {
      method: "POST",
      body: JSON.stringify({ prospect_ids: prospectIds }),
    }).then(parseOrThrow<PreflightResult>),
  push: (apiFetch: Fetcher, id: number, prospectIds: number[]) =>
    apiFetch(`/api/v1/admin/outreel/smartlead/campaigns/${id}/push`, {
      method: "POST",
      body: JSON.stringify({ prospect_ids: prospectIds }),
    }).then(parseOrThrow<PushSummary>),
};
