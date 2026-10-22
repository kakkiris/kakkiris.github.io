// One set of case content. The lenses in lenses.ts only change the order and which
// case study section opens first; they never duplicate copy.
// Facts and sources: ../00-content-outline.md and the public READMEs.

export type CaseSlug =
  | "cedar-peak"
  | "ap-automation"
  | "flexops-ai"
  | "audit-os"
  | "from-the-universe"
  | "teamforge";

export interface CaseSummary {
  slug: CaseSlug;
  title: string;
  /** Who it was for and the kind of work, shown above the title */
  context: string;
  summary: string;
  outcome: string;
  outcomeNote: string;
  /** Facts strip under the case study title */
  facts?: { label: string; value: string; href?: string }[];
}

export const CASES: Record<CaseSlug, CaseSummary> = {
  "cedar-peak": {
    slug: "cedar-peak",
    title: "Finance operations platform",
    context: "Multi-state real estate operator · Product, design",
    // README: "Deal cost sheets and closing packages arrive with errors that only surface when commissions are paid."
    summary:
      "Deal paperwork errors only surfaced when commissions were paid. I built the modules that catch them when the field submits.",
    outcome: "Signed six-figure build",
    outcomeNote: "My pipeline module is the first milestone",
    facts: [
      { label: "My part", value: "Field validation and sales pipeline modules, and the audit behind the suite" },
      { label: "Team", value: "Two builders, working with Claude Code" },
      { label: "Built", value: "In four days, 2026" },
      {
        label: "Code",
        value: "kakkiris/mhc-operations-ai-demo",
        href: "https://github.com/kakkiris/mhc-operations-ai-demo",
      },
    ],
  },
  "ap-automation": {
    slug: "ap-automation",
    title: "Accounts payable suite",
    context: "Property management company · Discovery, build",
    summary:
      "Two AP teams, four invoice channels, ten fields typed per invoice. One inbox that drafts, and a person who approves.",
    outcome: "8 modules, 30 screens",
    outcomeNote: "Live public demo",
    facts: [
      { label: "My part", value: "Demo specs, product calls, the Claude Code build and the validation demo" },
      { label: "Built", value: "September 2026, with parallel Claude Code agents" },
      { label: "Live demo", value: "ap-automation-demo", href: "https://ap-automation-demo.keremakkiris.workers.dev" },
      { label: "Code", value: "kakkiris/ap-automation-demo", href: "https://github.com/kakkiris/ap-automation-demo" },
    ],
  },
  "flexops-ai": {
    slug: "flexops-ai",
    title: "FlexOps AI",
    context: "Flex industrial operator · AI solutions",
    summary:
      "Leases and broker memoranda were re-keyed by hand. In the prototypes, every extracted field carries a confidence level, and answers cite the document they came from.",
    outcome: "5 prototypes",
    outcomeNote: "2 demos cut on client feedback",
    facts: [
      { label: "My part", value: "Specs from the discovery recordings, product calls, the Claude Code build and the validation walkthrough" },
      { label: "Team", value: "A colleague ran discovery and wrote the synthesis" },
      { label: "Built", value: "May to June 2026" },
      { label: "Code", value: "kakkiris/flex-industrial-ai-demo", href: "https://github.com/kakkiris/flex-industrial-ai-demo" },
    ],
  },
  "audit-os": {
    slug: "audit-os",
    title: "Audit OS",
    context: "Internal system design · Monk AI Group",
    summary:
      "One impact figure appeared as three ranges in three documents. A redesign where every quote and number traces to its source.",
    outcome: "Validated on two audits",
    outcomeNote: "Redesign planned, then cancelled",
    facts: [
      { label: "My part", value: "Built the first automated version; architect and owner of the redesign" },
      { label: "Users", value: "The audit team: a delivery lead, a sign-off reviewer and me" },
      { label: "When", value: "November 2025, then July to August 2026" },
      { label: "Status", value: "Cancelled after the first build sessions" },
    ],
  },
  "from-the-universe": {
    slug: "from-the-universe",
    title: "From the Universe",
    context: "Consumer iOS app · Solo build",
    summary: "A personalised daily message, built around a private journal that never leaves the device.",
    outcome: "Functionally complete",
    outcomeNote: "Pre-launch",
    facts: [
      { label: "My part", value: "Product, content, design and build, on my own" },
      { label: "Platform", value: "iOS 17 and up, SwiftUI, a widget and a stateless backend" },
      { label: "Built", value: "March to July 2026" },
      { label: "Status", value: "Functionally complete, not yet launched" },
    ],
  },
  teamforge: {
    slug: "teamforge",
    title: "TeamForge",
    context: "UCL group project · Technical Lead",
    summary: "A contribution tracker for university group projects.",
    outcome: "81.25%",
    outcomeNote: "Project grade",
    facts: [
      { label: "My part", value: "Technical Lead in a team of four" },
      { label: "Built with", value: "Lovable, Supabase and Claude Code" },
      { label: "When", value: "January to April 2026" },
      { label: "Grade", value: "81.25%" },
    ],
  },
};

export const FEATURED: CaseSlug[] = [
  "cedar-peak",
  "ap-automation",
  "flexops-ai",
  "audit-os",
  "from-the-universe",
];
