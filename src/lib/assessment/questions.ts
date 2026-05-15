// Local copy of the assessment question catalog (used by the admin
// `/assessments/[id]` detail view to render each prompt + the option the
// respondent picked). Mirror of
// [lumelogics-web/src/lib/assessment/questions.ts]. If a question changes
// there, update here too. Backend doesn't ship prompts because they're not
// stored on the row — just the q-id → value mapping in `answers`.

export const DIMENSION_LABELS: Record<string, string> = {
  process_clarity:        "Process clarity",
  workflow_discipline:    "Workflow discipline",
  operational_visibility: "Operational visibility",
  change_readiness:       "Change readiness",
};

export const ARCHETYPE_LABELS: Record<string, string> = {
  wishful_thinker:       "Wishful Thinker",
  aspirational_operator: "Aspirational Operator",
  coordinated_operator:  "Coordinated Operator",
  build_ready_operator:  "Build-Ready Operator",
  optimization_operator: "Optimization Operator",
};

export interface QuestionOption {
  label: string;
  value: number;
}

export interface Question {
  id: string;
  dimension: string;
  prompt: string;
  options: QuestionOption[];
}

export const QUESTIONS: Question[] = [
  {
    id: "q1",
    dimension: "process_clarity",
    prompt:
      "Do you have written documentation (SOPs, playbooks, or runbooks) for your top 3 recurring workflows?",
    options: [
      { label: "Yes, all 3 are documented and current.", value: 5 },
      { label: "Yes, but they're outdated.", value: 3 },
      { label: "For 1 or 2 of them, not all.", value: 2 },
      { label: "No, none of them are documented.", value: 0 },
    ],
  },
  {
    id: "q2",
    dimension: "workflow_discipline",
    prompt: "How often do different team members handle the same task differently?",
    options: [
      { label: "Rarely. We have consistent processes.", value: 5 },
      { label: "Sometimes, on edge cases.", value: 3 },
      { label: "Often. Everyone has their own way.", value: 1 },
      { label: "Almost always. There's no standard.", value: 0 },
    ],
  },
  {
    id: "q3",
    dimension: "operational_visibility",
    prompt:
      "Can you tell me, within 10% accuracy, how many hours per week your team spends on your single most repetitive task?",
    options: [
      { label: "Yes", value: 5 },
      { label: "No", value: 0 },
    ],
  },
  {
    id: "q4",
    dimension: "process_clarity",
    prompt:
      "When a new hire joins, how do they learn how your most important workflow runs?",
    options: [
      { label: "From written docs, then shadowing.", value: 5 },
      { label: "Mostly shadowing one person.", value: 3 },
      { label: "By picking up bits from a few people.", value: 1 },
      { label: "Trial and error.", value: 0 },
    ],
  },
  {
    id: "q5",
    dimension: "operational_visibility",
    prompt:
      "Are the inputs and outputs of your top workflows captured in structured data (vs only in emails, chat threads, or people's heads)?",
    options: [
      { label: "Yes, structured in a tool we trust.", value: 5 },
      { label: "Mostly, with some gaps.", value: 3 },
      { label: "About half and half.", value: 1 },
      { label: "Mostly unstructured.", value: 0 },
    ],
  },
  {
    id: "q6",
    dimension: "change_readiness",
    prompt:
      "How does your team typically react when you introduce a new tool or process?",
    options: [
      { label: "They engage and give honest feedback.", value: 5 },
      { label: "Some adopt quickly, others lag.", value: 3 },
      { label: "Polite nods, then back to the old way.", value: 1 },
      { label: "Open resistance.", value: 0 },
    ],
  },
  {
    id: "q7",
    dimension: "workflow_discipline",
    prompt:
      "When something goes wrong in a workflow, do you have a way to know *which step* failed?",
    options: [
      { label: "Yes, every time.", value: 5 },
      { label: "Most of the time.", value: 3 },
      { label: "Only after digging.", value: 1 },
      { label: "Rarely.", value: 0 },
    ],
  },
  {
    id: "q8",
    dimension: "operational_visibility",
    prompt:
      "Can you produce, on demand, the volume your top workflow processes per week?",
    options: [
      { label: "Yes, instantly from a dashboard.", value: 5 },
      { label: "Yes, with a bit of pulling.", value: 3 },
      { label: "Roughly, from memory.", value: 1 },
      { label: "Not really.", value: 0 },
    ],
  },
  {
    id: "q9",
    dimension: "process_clarity",
    prompt:
      "If I asked three of your team members to describe your sales (or fulfillment) process, how similar would the answers be?",
    options: [
      { label: "Nearly identical.", value: 5 },
      { label: "Same backbone, different details.", value: 3 },
      { label: "Noticeably different.", value: 1 },
      { label: "Three completely different answers.", value: 0 },
    ],
  },
  {
    id: "q10",
    dimension: "change_readiness",
    prompt:
      "When you decide a workflow needs to change, how quickly can you actually roll the change out?",
    options: [
      { label: "Days.", value: 5 },
      { label: "A couple of weeks.", value: 3 },
      { label: "A month or two.", value: 1 },
      { label: "Quarters.", value: 0 },
    ],
  },
  {
    id: "q11",
    dimension: "workflow_discipline",
    prompt:
      "How well-defined is the 'finished' state for your most common deliverable to clients?",
    options: [
      { label: "Crystal clear. Same definition every time.", value: 5 },
      { label: "Mostly clear, with some variation.", value: 3 },
      { label: "Varies by client or by team member.", value: 1 },
      { label: "It's whatever the client says is finished.", value: 0 },
    ],
  },
  {
    id: "q12",
    dimension: "operational_visibility",
    prompt:
      "Where do you go to see the current status of work in flight?",
    options: [
      { label: "One trusted dashboard everyone uses.", value: 5 },
      { label: "A few tools, but consistent.", value: 3 },
      { label: "Status meetings + Slack threads.", value: 1 },
      { label: "Mostly by asking people directly.", value: 0 },
    ],
  },
  {
    id: "q13",
    dimension: "change_readiness",
    prompt:
      "Have you successfully rolled out a meaningful workflow or tool change in the last 6 months?",
    options: [
      { label: "Yes, more than one.", value: 5 },
      { label: "Yes, one.", value: 3 },
      { label: "Started something, didn't stick.", value: 1 },
      { label: "Not really.", value: 0 },
    ],
  },
  {
    id: "q14",
    dimension: "process_clarity",
    prompt:
      "Who is responsible for keeping your process documentation current?",
    options: [
      { label: "A named person, with time allocated to it.", value: 5 },
      { label: "A named person, but it's not their priority.", value: 3 },
      { label: "Whoever has time.", value: 1 },
      { label: "Nobody. It's not documented or maintained.", value: 0 },
    ],
  },
  {
    id: "q15",
    dimension: "operational_visibility",
    prompt:
      "Can you trace any single recent deliverable back to which inputs it came from?",
    options: [
      { label: "Yes, easily.", value: 5 },
      { label: "Yes, with some legwork.", value: 3 },
      { label: "Only for recent ones.", value: 1 },
      { label: "No.", value: 0 },
    ],
  },
  {
    id: "q16",
    dimension: "change_readiness",
    prompt:
      "Do you have someone on your team, yourself or otherwise, who can dedicate at least 4 hours per week to an AI implementation project for 3 months?",
    options: [
      { label: "Yes", value: 5 },
      { label: "No", value: 0 },
    ],
  },
  {
    id: "q17",
    dimension: "process_clarity",
    prompt:
      "How is sensitive client data (PII, financial records, etc.) currently handled in your top workflows?",
    options: [
      { label: "Clear policies, restricted access, audited.", value: 5 },
      { label: "Clear policies but not strictly enforced.", value: 3 },
      { label: "Informal. People are careful.", value: 1 },
      { label: "Hasn't been thought about.", value: 0 },
    ],
  },
  {
    id: "q18",
    dimension: "workflow_discipline",
    prompt:
      "How would you rate your team's ability to follow a defined process under pressure (e.g. an end-of-quarter rush)?",
    options: [
      { label: "Process holds. We rely on it.", value: 5 },
      { label: "Mostly holds, some shortcuts.", value: 3 },
      { label: "Process gets dropped to get things done.", value: 1 },
      { label: "We don't really have a process to drop.", value: 0 },
    ],
  },
];

export const QUESTIONS_BY_ID = QUESTIONS.reduce<Record<string, Question>>(
  (acc, q) => {
    acc[q.id] = q;
    return acc;
  },
  {},
);
