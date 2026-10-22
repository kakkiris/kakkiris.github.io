// The case study template: every case uses these eight sections, in this order.
export const SECTIONS = [
  { n: 1, id: "context", title: "Context and users" },
  { n: 2, id: "problem", title: "The problem" },
  { n: 3, id: "research", title: "Research" },
  { n: 4, id: "decisions", title: "Key decisions and trade-offs" },
  { n: 5, id: "solution", title: "The solution" },
  { n: 6, id: "outcome", title: "Outcome" },
  { n: 7, id: "learned", title: "What I learned" },
  { n: 8, id: "role", title: "My role and the team" },
] as const;

export type SectionId = (typeof SECTIONS)[number]["id"];
