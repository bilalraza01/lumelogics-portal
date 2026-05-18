// Factory for an empty-but-valid AuditDocument (so every section renders in
// create mode), next-ref-id helper, and a cross-reference + copy validator.

import type { AuditDocument } from "@/lib/api/audits";

/** Next stable id in a series, e.g. nextRefId("PP", existing, 3) -> "PP-001". */
export function nextRefId(
  prefix: string,
  existing: string[],
  pad = 3,
): string {
  const re = new RegExp(`^${prefix}-(\\d+)$`);
  const max = existing.reduce((m, id) => {
    const hit = re.exec(id);
    return hit ? Math.max(m, parseInt(hit[1], 10)) : m;
  }, 0);
  return `${prefix}-${String(max + 1).padStart(pad, "0")}`;
}

export function defaultContent(): AuditDocument {
  return {
    schema_version: 1,
    hero: {
      eyebrow: "Business Operations Audit",
      client_name: "",
      audit_started_label: "",
      status_pill: { label: "In progress", tone: "active" },
    },
    ai_moment: {
      label: "The AI moment",
      heading: "",
      sub: "",
      analogy_callout: { title: "", body: "" },
      explainer: [],
      diagram: { silos: [], connected: [], caption: "" },
    },
    journey: { stages: [] },
    sessions: [],
    deliverables: [
      { key: "process-map", heading: "Your process map is ready", sub: "", state: "available", cta_label: "Open process map", locked_tooltip: null },
      { key: "findings", heading: "What we discussed", sub: "", state: "available", cta_label: "View findings", locked_tooltip: null },
      { key: "waste", heading: "Hidden costs uncovered", sub: "", state: "available", cta_label: "View hidden costs", locked_tooltip: null },
      { key: "blueprint", heading: "Your AI blueprint", sub: "", state: "available", cta_label: "View the blueprint", locked_tooltip: null },
      { key: "comprehensive-report", heading: "Full audit report", sub: "", state: "available", cta_label: "Open full report", locked_tooltip: null },
    ],
    downloads: [],
    prototype: {
      heading: "",
      sub: "",
      cta_label: "Open prototype",
      url: null,
      enabled: false,
    },
    footer: { note: "" },
    process_map: {
      intro: "",
      legend: [
        { type: "standard", label: "Standard step", description: "Routine work, running as intended." },
        { type: "decision", label: "Decision", description: "A judgement call or branch in the flow." },
        { type: "automation", label: "Automation candidate", description: "Repetitive and rules based." },
        { type: "pain_point", label: "Pain point", description: "Named by the team as slow or costly." },
      ],
      team: [],
      tools: [],
      stages: [],
    },
    categories: [],
    findings: { intro: "", pain_points: [], optimisations: [] },
    waste: {
      intro: "",
      kpi_summary: {
        total_opportunities: 0,
        recoverable_hours_per_week: 0,
        default_rate_label: "",
      },
      cost_formula:
        "Annual Cost = Weekly Hours x People Affected x Hourly Rate x 52",
      opportunities: [],
    },
    blueprint: {
      intro: "",
      exec_kpis: [],
      framework_layers: [],
      solution_types: [],
      domains: [],
      opportunities: [],
      priority_matrix: {
        x_axis_label: "Ease of implementation",
        y_axis_label: "Business impact",
        quadrants: [
          { id: "Q1", label: "Big swings", position: "tl" },
          { id: "Q2", label: "Future plans", position: "tr" },
          { id: "Q3", label: "Nice to haves", position: "bl" },
          { id: "Q4", label: "Quick wins", position: "br" },
        ],
      },
      video_gallery: [],
      roadmap: { intro: "", total_months: 9, initiatives: [] },
    },
    report: {
      title: "Business Operations Audit",
      subtitle: "",
      prepared_for: "",
      prepared_on: "",
      executive_summary: "",
      sections: [
        { anchor: "executive-summary", title: "Executive summary", include: true },
        { anchor: "process-map", title: "Process map", include: true },
        { anchor: "findings", title: "Findings", include: true },
        { anchor: "waste", title: "Opportunity analysis", include: true },
        { anchor: "solutions", title: "Solutions", include: true },
      ],
      closing_note: "",
    },
  };
}

/* ------------------------------ validation ------------------------------ */

const SMART = /[—–“”‘’]/; // em/en dash, curly quotes

function dupes(ids: string[]): string[] {
  const seen = new Set<string>();
  const dup = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) dup.add(id);
    seen.add(id);
  }
  return [...dup];
}

function countSmartChars(node: unknown): number {
  if (typeof node === "string") return SMART.test(node) ? 1 : 0;
  if (Array.isArray(node)) return node.reduce((s, v) => s + countSmartChars(v), 0);
  if (node && typeof node === "object")
    return Object.values(node).reduce((s, v) => s + countSmartChars(v), 0);
  return 0;
}

export function validateDoc(c: AuditDocument): {
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  const sessionIds = c.sessions.map((s) => s.id);
  const categoryIds = c.categories.map((x) => x.id);
  const painIds = c.findings.pain_points.map((p) => p.ref_id);
  const wasteIds = c.waste.opportunities.map((w) => w.ref_id);
  const domainIds = c.blueprint.domains.map((d) => d.id);
  const layerIds = c.blueprint.framework_layers.map((l) => l.id);
  const stIds = c.blueprint.solution_types.map((s) => s.id);
  const bpIds = c.blueprint.opportunities.map((o) => o.ref_id);
  const teamIds = c.process_map.team.map((t) => t.id);
  const toolIds = c.process_map.tools.map((t) => t.id);

  const has = (set: string[], v: string | null | undefined) =>
    !v || set.includes(v);

  for (const [grp, ids] of [
    ["sessions", sessionIds],
    ["categories", categoryIds],
    ["pain points", painIds],
    ["waste", wasteIds],
    ["domains", domainIds],
    ["blueprint", bpIds],
  ] as const) {
    const d = dupes(ids);
    if (d.length) errors.push(`Duplicate ${grp} ids: ${d.join(", ")}`);
  }

  const all = [...c.findings.pain_points, ...c.findings.optimisations];
  for (const f of all) {
    if (!has(categoryIds, f.category))
      errors.push(`${f.ref_id}: category "${f.category}" does not exist`);
    if (!has(sessionIds, f.source_session))
      errors.push(`${f.ref_id}: session "${f.source_session}" does not exist`);
  }
  for (const w of c.waste.opportunities) {
    if (!has(categoryIds, w.category))
      errors.push(`${w.ref_id}: category "${w.category}" does not exist`);
    if (w.pain_point_ref && !has(painIds, w.pain_point_ref))
      errors.push(`${w.ref_id}: pain point "${w.pain_point_ref}" does not exist`);
    if (w.quote && !has(sessionIds, w.quote.session_ref))
      errors.push(`${w.ref_id}: quote session "${w.quote.session_ref}" missing`);
  }
  for (const st of c.process_map.stages) {
    for (const step of st.steps) {
      for (const o of step.owners)
        if (!has(teamIds, o))
          errors.push(`${step.id}: owner "${o}" not in team`);
      for (const t of step.tools)
        if (!has(toolIds, t))
          errors.push(`${step.id}: tool "${t}" not in tools`);
      if (step.pain_point_ref && !has(painIds, step.pain_point_ref))
        errors.push(`${step.id}: pain point "${step.pain_point_ref}" missing`);
      if (step.quote && !has(sessionIds, step.quote.session_ref))
        errors.push(`${step.id}: quote session "${step.quote.session_ref}" missing`);
    }
  }
  for (const o of c.blueprint.opportunities) {
    if (!has(stIds, o.solution_type))
      errors.push(`${o.ref_id}: solution type "${o.solution_type}" missing`);
    for (const p of o.problems_solved)
      if (!has(painIds, p))
        errors.push(`${o.ref_id}: problem "${p}" not a pain point`);
    for (const w of o.waste_eliminated)
      if (!has(wasteIds, w))
        errors.push(`${o.ref_id}: waste "${w}" does not exist`);
    for (const d of o.domains)
      if (!has(domainIds, d))
        errors.push(`${o.ref_id}: domain "${d}" does not exist`);
    for (const l of o.layers)
      if (!has(layerIds, l))
        errors.push(`${o.ref_id}: layer "${l}" does not exist`);
  }
  for (const it of c.blueprint.roadmap.initiatives) {
    if (!has(bpIds, it.ref_id))
      errors.push(`Roadmap: initiative "${it.ref_id}" not a blueprint item`);
    if (!has(stIds, it.solution_type))
      errors.push(`Roadmap ${it.ref_id}: solution type missing`);
  }

  const smart = countSmartChars(c);
  if (smart > 0)
    warnings.push(
      `${smart} text field(s) contain an em dash or smart quote. House style is plain ASCII (no em dashes in customer-facing copy).`,
    );

  return { errors, warnings };
}
