// Shared license reporter with no third-party dependencies.
//
// Walks node_modules directly and reads each package's own `license`/`licenses` field.
// Deliberately depends on NOTHING third-party so the license gate cannot itself drag in
// a package whose license it would have to vouch for (the reason license-checker was
// dropped: it transitively pulled CC-BY-3.0 SPDX-data packages + a critical-severity dep).

import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";

function normalizeLicense(pj) {
  if (typeof pj.license === "string") return pj.license;
  if (pj.license && typeof pj.license === "object" && pj.license.type) return pj.license.type;
  if (Array.isArray(pj.licenses)) {
    return pj.licenses.map((l) => (typeof l === "string" ? l : l.type)).filter(Boolean).join(" OR ");
  }
  if (typeof pj.licenses === "string") return pj.licenses;
  return "UNKNOWN";
}

// Fallback for packages that omit the license field in package.json (sloppy publishing):
// detect the SPDX id from the actual LICENSE/COPYING file text. Reading the real license
// file is more honest than trusting absent metadata.
const LICENSE_FILENAMES = ["LICENSE", "LICENSE.md", "LICENSE.txt", "LICENCE", "COPYING", "license"];
function detectLicenseFromFile(pkgDir) {
  for (const fn of LICENSE_FILENAMES) {
    const p = join(pkgDir, fn);
    if (!existsSync(p)) continue;
    let text;
    try {
      text = readFileSync(p, "utf8");
    } catch {
      continue;
    }
    const t = text.toLowerCase();
    if (t.includes("apache license") && t.includes("version 2.0")) return "Apache-2.0";
    if (t.includes("mit license") || t.includes("permission is hereby granted, free of charge")) return "MIT";
    if (t.includes("zlib license") || t.includes("altered source versions must be plainly marked")) return "Zlib";
    if (t.includes("isc license") || t.includes("permission to use, copy, modify, and/or distribute")) return "ISC";
    if (t.includes("redistribution and use in source and binary forms")) {
      return t.includes("neither the name") ? "BSD-3-Clause" : "BSD-2-Clause";
    }
  }
  return "UNKNOWN";
}

function repoOf(pj) {
  const r = pj.repository;
  if (!r) return "";
  return typeof r === "string" ? r : r.url || "";
}

// The set of node_modules PATHS that are production (non-dev) dependencies, read from
// package-lock.json. The license obligations that ride with the code are about
// what we DISTRIBUTE — the runtime bundle — not dev-only build tooling (vite, vitest) or its
// data deps (caniuse-lite is CC-BY-4.0 browser-compat data, never linked into the artifact).
function productionPaths() {
  if (!existsSync("package-lock.json")) return null; // fall back to "all installed"
  const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
  const pkgs = lock.packages ?? {};
  const prod = new Set();
  for (const [path, entry] of Object.entries(pkgs)) {
    if (path === "" || entry.link) continue; // skip root + workspace links
    if (entry.dev || entry.devOptional) continue; // dev-only → not distributed
    prod.add(path);
  }
  return prod;
}

// Build { "name@version": { licenses, repository } } from the node_modules tree (recursively,
// scoped packages + nested node_modules). With { productionOnly: true } (default), restricts to
// the production dependency set from package-lock.json.
export function collectReport({ root = "node_modules", productionOnly = true } = {}) {
  const report = {};
  const prod = productionOnly ? productionPaths() : null;

  function addPkg(pkgDir) {
    const pjPath = join(pkgDir, "package.json");
    if (existsSync(pjPath)) {
      // pkgDir is like "node_modules/foo" or "node_modules/foo/node_modules/@scope/bar".
      const lockPath = pkgDir.split("\\").join("/");
      if (!prod || prod.has(lockPath)) {
        try {
          const pj = JSON.parse(readFileSync(pjPath, "utf8"));
          if (pj.name && pj.version) {
            let lic = normalizeLicense(pj);
            if (lic === "UNKNOWN") lic = detectLicenseFromFile(pkgDir); // read the actual file
            report[`${pj.name}@${pj.version}`] = {
              licenses: lic,
              repository: repoOf(pj),
            };
          }
        } catch {
          /* skip unreadable/!json package.json */
        }
      }
    }
    scanDir(join(pkgDir, "node_modules"));
  }

  function scanDir(nmDir) {
    if (!existsSync(nmDir)) return;
    for (const entry of readdirSync(nmDir)) {
      if (entry.startsWith(".")) continue;
      const full = join(nmDir, entry);
      if (entry.startsWith("@")) {
        for (const sub of readdirSync(full)) addPkg(join(full, sub));
      } else {
        addPkg(full);
      }
    }
  }

  scanDir(root);
  return report;
}

export function licenseOf(info) {
  const lic = info.licenses ?? info.license ?? "UNKNOWN";
  return Array.isArray(lic) ? lic.join(" AND ") : String(lic);
}
