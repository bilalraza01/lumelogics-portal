// Admin CRUD for client audit deliverables. Hits the Rails admin API at
// /api/v1/admin/audits. Mirrors lib/api/lead-magnets.ts.
//
// IMPORTANT: the AuditDocument type tree below is a verbatim port of
// lumelogics-web/src/lib/api/audits.ts. The two apps do not share a package;
// keep them in sync (the create -> preview round-trip is the guard).

/* ----------------------------- shared bits ----------------------------- */

export interface Quote {
  text: string;
  speaker: string;
  session_ref: string;
  recording_timestamp: string | null;
  recording_url: string | null;
}

export interface TimeEstimate {
  qty: number;
  unit: "minutes" | "hours" | "days";
  frequency: string;
}

export interface Hero {
  eyebrow: string;
  client_name: string;
  audit_started_label: string;
  status_pill: { label: string; tone: "success" | "active" | "neutral" };
}

export interface AiMoment {
  label: string;
  heading: string;
  sub: string;
  analogy_callout: { title: string; body: string };
  explainer: { icon: string; title: string; body: string }[];
  diagram: {
    silos: { label: string }[];
    connected: { label: string }[];
    caption: string;
  };
}

export interface JourneyStage {
  id: string;
  label: string;
  state: "done" | "active" | "upcoming";
  sub: string;
}

export interface Session {
  id: string;
  badge: string;
  complete: boolean;
  date: string;
  title: string;
  summary: string;
  stage_tags: string[];
}

export type DeliverableKey =
  | "process-map"
  | "findings"
  | "waste"
  | "blueprint"
  | "comprehensive-report";

export interface DeliverableCardData {
  key: DeliverableKey;
  heading: string;
  sub: string;
  state: "available" | "locked";
  cta_label: string;
  locked_tooltip: string | null;
}

export interface DownloadItem {
  title: string;
  description: string;
  deliverable_key: DeliverableKey;
  format_label: string;
}

export interface PrototypeCta {
  heading: string;
  sub: string;
  cta_label: string;
  url: string | null;
  enabled: boolean;
}

export type StepType = "standard" | "decision" | "automation" | "pain_point";

export interface ProcessStep {
  id: string;
  title: string;
  description: string;
  type: StepType;
  confidence: "high" | "medium" | "low";
  owners: string[];
  tools: string[];
  time_estimate: TimeEstimate;
  pain_point_ref?: string | null;
  quote?: Quote | null;
}

export interface ProcessMap {
  intro: string;
  legend: { type: StepType; label: string; description: string }[];
  team: { id: string; name: string; role: string }[];
  tools: { id: string; name: string; category: string }[];
  stages: {
    id: string;
    title: string;
    summary: string;
    steps: ProcessStep[];
  }[];
}

export interface Category {
  id: string;
  label: string;
  description: string;
}

export interface FindingItem {
  ref_id: string;
  title: string;
  severity: "HIGH" | "MEDIUM";
  category: string;
  source_session: string;
  description: string;
}

export interface Findings {
  intro: string;
  pain_points: FindingItem[];
  optimisations: FindingItem[];
}

export interface WasteOpportunity {
  ref_id: string;
  title: string;
  category: string;
  description: string;
  annual_cost: number;
  weekly_hours: number;
  hourly_rate: number;
  people_affected: number;
  priority: "high" | "medium" | "low";
  pain_point_ref?: string | null;
  quote?: Quote | null;
}

export interface Waste {
  intro: string;
  kpi_summary: {
    total_opportunities: number;
    recoverable_hours_per_week: number;
    default_rate_label: string;
  };
  cost_formula: string;
  opportunities: WasteOpportunity[];
}

export interface BlueprintOpportunity {
  ref_id: string;
  title: string;
  summary: string;
  annual_value: number;
  build_cost_min: number;
  build_cost_max: number;
  payback_months: number;
  timeline_weeks: number;
  solution_type: string;
  risk_level: "low" | "medium" | "high";
  risk_description: string;
  problems_solved: string[];
  waste_eliminated: string[];
  methodology: string;
  dev_hours: number;
  pm_hours: number;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  domains: string[];
  layers: string[];
  quote?: Quote | null;
}

export interface Blueprint {
  intro: string;
  exec_kpis: { label: string; value: string; sub: string }[];
  framework_layers: { id: string; label: string; description: string }[];
  solution_types: {
    id: string;
    label: string;
    description: string;
    typical_timeline: string;
    color_token: string;
  }[];
  domains: { id: string; label: string }[];
  opportunities: BlueprintOpportunity[];
  priority_matrix: {
    x_axis_label: string;
    y_axis_label: string;
    quadrants: {
      id: string;
      label: string;
      position: "tl" | "tr" | "bl" | "br";
    }[];
  };
  video_gallery: { title: string; url: string; session_ref: string }[];
  roadmap: {
    intro: string;
    total_months: number;
    initiatives: {
      ref_id: string;
      label: string;
      start_month: number;
      duration_weeks: number;
      solution_type: string;
      tooltip: string;
    }[];
  };
}

export interface ReportDoc {
  title: string;
  subtitle: string;
  prepared_for: string;
  prepared_on: string;
  executive_summary: string;
  sections: { anchor: string; title: string; include: boolean }[];
  closing_note: string;
}

export interface AuditDocument {
  schema_version: number;
  hero: Hero;
  ai_moment: AiMoment;
  journey: { stages: JourneyStage[] };
  sessions: Session[];
  deliverables: DeliverableCardData[];
  downloads: DownloadItem[];
  prototype: PrototypeCta;
  footer: { note: string };
  process_map: ProcessMap;
  categories: Category[];
  findings: Findings;
  waste: Waste;
  blueprint: Blueprint;
  report: ReportDoc;
}

/* ------------------------------ admin API ------------------------------- */

export const AUDIT_STATUSES = [
  "in_progress",
  "in_review",
  "delivered",
  "archived",
] as const;
export type AuditStatus = (typeof AUDIT_STATUSES)[number];

export interface AdminAuditListItem {
  id: number;
  slug: string;
  client_name: string;
  industry: string | null;
  status: AuditStatus;
  started_on: string | null;
  completed_on: string | null;
  updated_at: string;
}

export interface AdminAudit extends AdminAuditListItem {
  content: AuditDocument;
  created_at: string;
}

export interface AuditFormPayload {
  slug: string;
  client_name: string;
  industry?: string | null;
  status: AuditStatus;
  started_on?: string | null;
  completed_on?: string | null;
  content: AuditDocument;
}

export interface AuditIndexResponse {
  data: AdminAuditListItem[];
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

export const auditsApi = {
  list: (apiFetch: Fetcher) =>
    apiFetch("/api/v1/admin/audits").then(parseOrThrow<AuditIndexResponse>),
  get: (apiFetch: Fetcher, id: string | number) =>
    apiFetch(`/api/v1/admin/audits/${id}`).then(parseOrThrow<AdminAudit>),
  create: (apiFetch: Fetcher, payload: AuditFormPayload) =>
    apiFetch("/api/v1/admin/audits", {
      method: "POST",
      body: JSON.stringify({ audit: payload }),
    }).then(parseOrThrow<AdminAudit>),
  update: (
    apiFetch: Fetcher,
    id: string | number,
    payload: AuditFormPayload,
  ) =>
    apiFetch(`/api/v1/admin/audits/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ audit: payload }),
    }).then(parseOrThrow<AdminAudit>),
  destroy: async (apiFetch: Fetcher, id: string | number) => {
    const res = await apiFetch(`/api/v1/admin/audits/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) throw new Error(`delete_failed_${res.status}`);
  },
};
