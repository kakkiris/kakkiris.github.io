import type { CaseSlug } from "./cases";

export type LensId = "product" | "design" | "consulting" | "ai";

export const DEFAULT_LENS: LensId = "product";

export interface Lens {
  id: LensId;
  label: string;
  /** Featured cases in order (outline lens map) */
  order: CaseSlug[];
  /** Shown under the switch so the reader knows what changed */
  note: string;
  /** Case study sections expanded by default (1-based, template order) */
  openSections: number[];
}

export const LENSES: Lens[] = [
  {
    id: "product",
    label: "Product",
    order: ["cedar-peak", "ap-automation", "flexops-ai", "from-the-universe"],
    note: "Ordered for product roles. Case studies open on the key decisions and trade-offs.",
    openSections: [4],
  },
  {
    id: "design",
    label: "Design",
    order: ["ap-automation", "cedar-peak", "from-the-universe", "flexops-ai"],
    note: "Ordered for design roles. Case studies open on the annotated screens.",
    openSections: [5],
  },
  {
    id: "consulting",
    label: "Consulting",
    order: ["cedar-peak", "audit-os", "flexops-ai", "ap-automation"],
    note: "Ordered for consulting roles. Case studies open on the problem evidence and research.",
    openSections: [2, 3],
  },
  {
    id: "ai",
    label: "AI Solutions",
    order: ["audit-os", "flexops-ai", "ap-automation", "cedar-peak"],
    note: "Ordered for AI solutions roles. Case studies open on the solution and how it was built.",
    openSections: [5],
  },
];

export const LENS_IDS = LENSES.map((l) => l.id);
