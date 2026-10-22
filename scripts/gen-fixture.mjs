#!/usr/bin/env node
// Generate a repeatable graph with more than 500 nodes for framerate and loading checks.
// Values come from node indices, with no randomness, so regeneration is byte-identical.
// The graph is synthetic and contains no copied application data.

import { writeFileSync } from "node:fs";

const N = 600;
const TYPES = ["PROJECT", "PARTY", "INTERFACE", "RECORD", "PROCESS", "FUNCTION", "AGENT", "DATA", "FILE", "ENDPOINT"];
const PREFIXES = ["DEKA", "BASE", "DECI", "CENTI", "MILLI"];
const RELATIONS = ["CONTAINS", "PRECEDES", "REFERENCES", "DEPENDS_ON", "GUIDED_BY"];

const nodes = [];
const edges = [];

for (let i = 0; i < N; i++) {
  const type = TYPES[i % TYPES.length];
  const prefix = PREFIXES[Math.min(PREFIXES.length - 1, Math.floor(Math.log2(i + 1)))];
  // Tree-ish parent: node i's parent is floor((i-1)/4) → a 4-ary hierarchy (root = node 0).
  const parentIdx = i === 0 ? null : Math.floor((i - 1) / 4);
  nodes.push({
    id: `n${i}`,
    type,
    properties: { operation: type === "FUNCTION" ? "VALIDATE" : undefined, index: i },
    parent_id: parentIdx === null ? null : `n${parentIdx}`,
    contains: [],
    metric_level: `${prefix}_${type}`,
    dimension: "system",
  });
  if (parentIdx !== null) {
    nodes[parentIdx].contains.push(`n${i}`);
    edges.push({ from_id: `n${parentIdx}`, to_id: `n${i}`, relation: "CONTAINS" });
  }
  // A deterministic cross-edge to spread the layout (skip the first few to avoid self/dupes).
  if (i > 10) {
    const tgt = (i * 7) % i; // deterministic, always < i
    edges.push({ from_id: `n${i}`, to_id: `n${tgt}`, relation: RELATIONS[i % RELATIONS.length] });
  }
}

const envelope = {
  name: "representative_graph",
  version: "1.0.0",
  type: "PROJECT",
  dimension: "system",
  dimensions: { system: { description: `synthetic representative graph, ${N} nodes` } },
  nodes,
  edges,
};

writeFileSync("test/fixtures/representative_graph.trug.json", JSON.stringify(envelope, null, 1) + "\n");
console.log(`Wrote test/fixtures/representative_graph.trug.json — ${nodes.length} nodes, ${edges.length} edges.`);
