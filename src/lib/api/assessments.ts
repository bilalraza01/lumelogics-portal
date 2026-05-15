export const ARCHETYPES = [
  "wishful_thinker",
  "aspirational_operator",
  "coordinated_operator",
  "build_ready_operator",
  "optimization_operator",
] as const;
export type Archetype = (typeof ARCHETYPES)[number];

export interface DimensionScore {
  raw: number;
  scaled: number;
  max: number;
}

export interface AssessmentSummary {
  id: string;
  email: string;
  total_score: number;
  archetype: Archetype;
  dimension_scores: Record<string, DimensionScore>;
  referral_source: string | null;
  result_token: string;
  created_at: string;
}

export interface AssessmentDetail extends AssessmentSummary {
  answers: Record<string, number>;
  ip_address: string | null;
  user_agent: string | null;
  email_sent_at: string | null;
}

export interface AssessmentIndexResponse {
  data: AssessmentSummary[];
  pagination: { page: number; per_page: number; total: number };
}

export interface AssessmentListFilters {
  archetype?: Archetype;
  from?: string;
  to?: string;
  page?: number;
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

export const assessmentsApi = {
  list: (apiFetch: Fetcher, filters: AssessmentListFilters = {}) => {
    const p = new URLSearchParams();
    if (filters.archetype) p.set("archetype", filters.archetype);
    if (filters.from) p.set("from", filters.from);
    if (filters.to) p.set("to", filters.to);
    if (filters.page) p.set("page", String(filters.page));
    const qs = p.toString();
    return apiFetch(`/api/v1/admin/assessments${qs ? `?${qs}` : ""}`).then(
      parseOrThrow<AssessmentIndexResponse>,
    );
  },
  get: (apiFetch: Fetcher, id: string) =>
    apiFetch(`/api/v1/admin/assessments/${id}`).then(parseOrThrow<AssessmentDetail>),
};
