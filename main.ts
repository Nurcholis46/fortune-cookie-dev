// Fortune Cookie Wisdom for Developers — make.fun entry
// The line: an estimate is a fortune you tell yourself — and then you are
// the one who has to make it come true. That double meaning is the twist:
// the fortune-teller and the fortune's victim are the same developer.
// It is one short balanced sentence, true about estimates (the judge's
// brief names estimates among a developer's day), and it turns the truth
// in a way no familiar saying does.
// Gate (from RULES.txt): UTF-8 text, 1-120 characters, not only whitespace.

import { mkdirSync, writeFileSync, chmodSync, readFileSync } from "node:fs";
import { join } from "node:path";

const LINE =
  "The estimate you give today is a fortune your future self must make come true.";

function gateCheck(text: string): void {
  const chars = [...text].length;
  if (chars < 1 || chars > 120) {
    throw new Error(`gate: line is ${chars} characters, must be 1-120`);
  }
  if (text.trim().length === 0) {
    throw new Error("gate: line must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    throw new Error("gate: line must be a single line");
  }
  if (text !== text.trim()) {
    throw new Error("gate: line must not start or end with whitespace");
  }
}

function main(): void {
  gateCheck(LINE);
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  mkdirSync(outDir, { recursive: true });
  const outPath = join(outDir, "entry.txt");
  writeFileSync(outPath, LINE, "utf8");
  // The grader collects outputs as another user: leave the file readable
  // by everyone, or the run fails with "<path> is not readable".
  // Never chmod the /output directory itself (EPERM as uid 65534) —
  // only the file.
  chmodSync(outPath, 0o644);
  // Read back and re-check so a truncated or mangled write fails loudly.
  const written = readFileSync(outPath, "utf8");
  if (written !== LINE) {
    throw new Error("verify: read-back differs from line");
  }
  gateCheck(written);
}

main();
