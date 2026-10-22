#!/usr/bin/env node
// Reject dependencies with licenses outside the permissive allowlist.
//
// Two modes, one code path:
//   - default            : scan the installed node_modules tree (scripts/license-report.mjs).
//   - --lockfile <path>  : read a license report fixture (same { "name@ver": {licenses} } shape)
//                          instead of node_modules.
//
// Exit 0 iff every package resolves to a permissive (Apache-2.0-compatible) SPDX license.
// Exit 1 (and list offenders) on any disallowed or unknown license.
//
// The copyleft fixture uses --lockfile to check that disallowed licenses are rejected.

import { readFileSync } from "node:fs";
import process from "node:process";
import { collectReport, licenseOf } from "./license-report.mjs";

// Apache-2.0-compatible permissive SPDX identifiers. No copyleft (GPL/LGPL/MPL/EPL/CDDL),
// and no content licenses (CC-BY-*) — software-permissive only.
const ALLOWLIST = new Set([
  "MIT",
  "MIT-0",
  "ISC",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "BSD-3-Clause-Clear",
  "0BSD",
  "Zlib", // postprocessing is Zlib, not MIT
  "Unlicense",
  "CC0-1.0",
  "BlueOak-1.0.0",
  "Python-2.0",
  "WTFPL",
]);

function termAllowed(term) {
  const s = term.trim().replace(/^\(+|\)+$/g, "").replace(/\+$/, "");
  return ALLOWLIST.has(s);
}

// Evaluate an SPDX expression: OR passes if any term passes; AND requires all terms.
function licenseAllowed(expr) {
  if (!expr) return false;
  const clean = String(expr).replace(/[()]/g, " ").trim();
  if (clean === "" || /^UNKNOWN$/i.test(clean) || /custom/i.test(clean)) return false;
  if (/\bOR\b/i.test(clean)) return clean.split(/\bOR\b/i).some(termAllowed);
  if (/\bAND\b/i.test(clean)) return clean.split(/\bAND\b/i).every(termAllowed);
  return termAllowed(clean);
}

function getReport(lockfile) {
  return lockfile ? JSON.parse(readFileSync(lockfile, "utf8")) : collectReport();
}

function main() {
  const args = process.argv.slice(2);
  const idx = args.indexOf("--lockfile");
  const lockfile = idx >= 0 ? args[idx + 1] : null;

  const report = getReport(lockfile);
  const offenders = [];
  for (const [name, info] of Object.entries(report)) {
    const licStr = licenseOf(info);
    if (!licenseAllowed(licStr)) offenders.push(`${name}: ${licStr}`);
  }

  const total = Object.keys(report).length;
  if (offenders.length > 0) {
    console.error(`License gate FAILED — ${offenders.length}/${total} package(s) carry a disallowed or unknown license:`);
    for (const o of offenders) console.error("  ✗ " + o);
    process.exit(1);
  }
  console.log(`License gate PASSED — all ${total} package(s) carry a permissive, Apache-2.0-compatible license.`);
  process.exit(0);
}

main();
