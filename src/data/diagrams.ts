// Diagrams redrawn from planning documents (sources noted per diagram).
export type Side = "l" | "r" | "t" | "b";
export type Point = [number, number];

export interface Diagram {
  title: string;
  /** Text alternative read by screen readers */
  description: string;
  nodes: { id: string; label: string; sub?: string[]; kind?: "person" | "store" | "doc" | "optional"; key?: boolean }[];
  edges: { from: string; to: string; fs: Side; ts: Side; key?: boolean; soft?: boolean; label?: string; labelDx?: number; labelDy?: number }[];
  layouts: { wide: Layout; tall: Layout };
}

export interface Layout {
  w: number;
  h: number;
  nodes: Record<string, { x: number; y: number; w: number; h?: number }>;
  lanes?: { y: number; label: string }[];
  /** Per-layout overrides keyed "from>to": sides, anchor positions, explicit waypoints */
  edges?: Record<string, { fs?: Side; ts?: Side; fa?: number; ta?: number; via?: Point[]; noLabel?: boolean }>;
}

// The first automated version, an n8n pipeline (November 2025).
// Source: n8n-agent-prompts/final-architecture-summary.md and the agent prompt files.
export const firstVersion: Diagram = {
  title: "The first automated audit pipeline",
  description:
    "Before the discovery call, an intake form feeds a client intake agent that writes discovery questions for the team. The team runs the call by hand and uploads the transcript. After the call, four agents run in order: problem and KPIs, analysis, market research, and solution ideation. Market research pauses for a person to approve its sources. An optional consolidation step turns the four outputs into a copy-paste summary.",
  nodes: [
    { id: "form", label: "Intake form", sub: ["filled in by the client"], kind: "doc" },
    { id: "intake", label: "Client intake agent", sub: ["writes discovery questions"] },
    { id: "call", label: "Discovery call", sub: ["run and transcribed by the team"], kind: "person" },
    { id: "pk", label: "Problems and KPIs", sub: ["root causes, impact"], key: true },
    { id: "an", label: "Analysis", sub: ["workflows, tools, gaps"], key: true },
    { id: "mr", label: "Market research", sub: ["searches, then waits"], key: true },
    { id: "review", label: "A person approves", sub: ["each source, before use"], kind: "person", key: true },
    { id: "si", label: "Solution ideation", sub: ["approaches, roadmap, ROI"], key: true },
    { id: "cons", label: "Consolidation", sub: ["optional summary"], kind: "optional" },
  ],
  edges: [
    { from: "form", to: "intake", fs: "r", ts: "l" },
    { from: "intake", to: "call", fs: "r", ts: "l", label: "questions" },
    { from: "call", to: "pk", fs: "b", ts: "t", label: "transcript" },
    { from: "pk", to: "an", fs: "r", ts: "l", key: true },
    { from: "an", to: "mr", fs: "r", ts: "l", key: true },
    { from: "mr", to: "review", fs: "b", ts: "t", key: true },
    { from: "review", to: "si", fs: "r", ts: "b", key: true },
    { from: "si", to: "cons", fs: "b", ts: "t", soft: true },
  ],
  layouts: {
    wide: {
      w: 1000,
      h: 420,
      lanes: [
        { y: 0, label: "Before the call" },
        { y: 110, label: "On the call" },
        { y: 214, label: "After the call" },
      ],
      nodes: {
        form: { x: 130, y: 30, w: 170 },
        intake: { x: 340, y: 30, w: 190 },
        call: { x: 570, y: 136, w: 220 },
        pk: { x: 130, y: 244, w: 170 },
        an: { x: 340, y: 244, w: 170 },
        mr: { x: 550, y: 244, w: 170 },
        review: { x: 550, y: 346, w: 170 },
        si: { x: 790, y: 244, w: 190 },
        cons: { x: 790, y: 346, w: 190 },
      },
      edges: {
        "intake>call": { fs: "r", ts: "t", via: [[680, 59]] },
        "call>pk": { fs: "b", ts: "t", via: [[680, 214], [215, 214]] },
        "review>si": { fs: "r", ts: "b", via: [[750, 375], [750, 316], [850, 316]], ta: 0.3 },
      },
    },
    tall: {
      w: 340,
      h: 900,
      lanes: [
        { y: 0, label: "Before the call" },
        { y: 186, label: "On the call" },
        { y: 300, label: "After the call" },
      ],
      nodes: {
        form: { x: 20, y: 28, w: 300 },
        intake: { x: 20, y: 110, w: 300 },
        call: { x: 20, y: 214, w: 300 },
        pk: { x: 20, y: 328, w: 300 },
        an: { x: 20, y: 410, w: 300 },
        mr: { x: 20, y: 492, w: 300 },
        review: { x: 20, y: 574, w: 300 },
        si: { x: 20, y: 656, w: 300 },
        cons: { x: 20, y: 760, w: 300 },
      },
      edges: {
        "form>intake": { fs: "b", ts: "t" },
        "intake>call": { fs: "b", ts: "t" },
        "call>pk": { fs: "b", ts: "t" },
        "pk>an": { fs: "b", ts: "t" },
        "an>mr": { fs: "b", ts: "t" },
        "mr>review": { fs: "b", ts: "t" },
        "review>si": { fs: "b", ts: "t" },
      },
    },
  },
};

// The redesign (July 2026). Source: Monk-Audit-OS-Build-Plan-v1.1.md, sections 5 and 6.
export const redesign: Diagram = {
  title: "The redesigned audit system",
  description:
    "New material enters as one batch. A source cleaner fixes who said what, a fact extractor pulls quotes and numbers, and an independent fact checker confirms each quote is verbatim and each number was said by the client. An update matcher compares new facts with existing ones; when a new number contradicts one the client confirmed, a person decides. Facts live in an audit graph with a ledger, and an update runner regenerates only what depends on the change. Writers, rankers and an ROI calculator draft from verified facts, people approve at review gates, and rendered documents come out. A freshness checker scans the graph and the documents and files tasks when anything is out of date. ROI figures, rankings and client documents are never approved automatically.",
  nodes: [
    { id: "src", label: "Sources in", sub: ["calls, files, feedback"], kind: "doc", key: true },
    { id: "clean", label: "Source Cleaner", sub: ["who said what"], key: true },
    { id: "ext", label: "Fact Extractor", sub: ["quotes, numbers, findings"], key: true },
    { id: "chk", label: "Fact Checker", sub: ["quotes verbatim, numbers", "said by the client"], key: true },
    { id: "match", label: "Update Matcher", sub: ["new, update, contradicts"], key: true },
    { id: "person", label: "A person decides", sub: ["new number contradicts", "a confirmed one"], kind: "person" },
    { id: "graph", label: "Audit graph", sub: ["ledger and Update Runner:", "redo only what changed"], kind: "store", key: true },
    { id: "write", label: "Writers and calculators", sub: ["draft from verified facts"], key: true },
    { id: "gates", label: "Human review gates", sub: ["ROI and client documents", "never auto-approved"], kind: "person", key: true },
    { id: "docs", label: "Rendered documents", sub: ["report, deck, SOW, specs"], kind: "doc", key: true },
    { id: "fresh", label: "Freshness Checker", sub: ["flags outdated citations, blocks stale exports"] },
  ],
  edges: [
    { from: "src", to: "clean", fs: "r", ts: "l", key: true },
    { from: "clean", to: "ext", fs: "r", ts: "l", key: true },
    { from: "ext", to: "chk", fs: "r", ts: "l", key: true },
    { from: "chk", to: "match", fs: "r", ts: "l", key: true },
    { from: "match", to: "person", fs: "t", ts: "b", label: "contradicts" },
    { from: "person", to: "graph", fs: "r", ts: "r" },
    { from: "match", to: "graph", fs: "b", ts: "t", key: true },
    { from: "graph", to: "write", fs: "l", ts: "r", key: true },
    { from: "write", to: "gates", fs: "l", ts: "r", key: true },
    { from: "gates", to: "docs", fs: "l", ts: "r", key: true },
    { from: "graph", to: "fresh", fs: "b", ts: "r", soft: true },
    { from: "docs", to: "fresh", fs: "b", ts: "l", soft: true },
    { from: "fresh", to: "gates", fs: "t", ts: "b", soft: true, label: "files tasks" },
  ],
  layouts: {
    wide: {
      w: 1000,
      h: 430,
      nodes: {
        person: { x: 812, y: 10, w: 168, h: 62 },
        src: { x: 20, y: 128, w: 168 },
        clean: { x: 218, y: 128, w: 168 },
        ext: { x: 416, y: 128, w: 168 },
        chk: { x: 614, y: 128, w: 168 },
        match: { x: 812, y: 128, w: 168 },
        graph: { x: 812, y: 250, w: 168, h: 62 },
        write: { x: 614, y: 250, w: 168 },
        gates: { x: 416, y: 250, w: 168, h: 62 },
        docs: { x: 218, y: 250, w: 168 },
        fresh: { x: 218, y: 366, w: 564, h: 50 },
      },
      edges: {
        "person>graph": { fs: "r", ts: "r", via: [[992, 41], [992, 281]] },
        "graph>fresh": { fs: "b", ts: "r", via: [[896, 391]] },
        "docs>fresh": { fs: "l", ts: "l", via: [[204, 279], [204, 391]] },
        "fresh>gates": { fs: "t", ts: "b", fa: 0.35 },
      },
    },
    tall: {
      w: 340,
      h: 1010,
      nodes: {
        src: { x: 30, y: 10, w: 290 },
        clean: { x: 30, y: 96, w: 290 },
        ext: { x: 30, y: 182, w: 290 },
        chk: { x: 30, y: 268, w: 290 },
        match: { x: 30, y: 354, w: 290 },
        person: { x: 90, y: 440, w: 230, h: 62 },
        graph: { x: 30, y: 532, w: 290, h: 62 },
        write: { x: 30, y: 622, w: 290 },
        gates: { x: 30, y: 708, w: 290, h: 62 },
        docs: { x: 30, y: 798, w: 290 },
        fresh: { x: 30, y: 900, w: 290, h: 62 },
      },
      edges: {
        "src>clean": { fs: "b", ts: "t" },
        "clean>ext": { fs: "b", ts: "t" },
        "ext>chk": { fs: "b", ts: "t" },
        "chk>match": { fs: "b", ts: "t" },
        "match>person": { fs: "b", ts: "t", fa: 0.6, ta: 0.5 },
        "person>graph": { fs: "b", ts: "t", fa: 0.5, ta: 0.6 },
        "match>graph": { fs: "l", ts: "l", via: [[14, 383], [14, 563]] },
        "graph>write": { fs: "b", ts: "t" },
        "write>gates": { fs: "b", ts: "t" },
        "gates>docs": { fs: "b", ts: "t" },
        "graph>fresh": { fs: "r", ts: "r", via: [[334, 563], [334, 931]] },
        "docs>fresh": { fs: "b", ts: "t" },
        "fresh>gates": { fs: "l", ts: "l", via: [[14, 931], [14, 739]], noLabel: true },
      },
    },
  },
};
