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

// Gate bounds from RULES.txt: UTF-8 text, 1-120 characters, not only
// whitespace. Named constants so the bounds are stated once and reused by
// both the pre-write check and the post-write verification.
const GATE_MIN_CHARS = 1;
const GATE_MAX_CHARS = 120;

// Collect every gate violation and report them together, instead of
// throwing on the first one: a single run now shows the whole failure
// (e.g. too long AND trailing whitespace) rather than one fix at a time.
function gateViolations(text: string): string[] {
  const violations: string[] = [];
  const chars = [...text].length;
  if (chars < GATE_MIN_CHARS || chars > GATE_MAX_CHARS) {
    violations.push(
      `length is ${chars} characters, must be ${GATE_MIN_CHARS}-${GATE_MAX_CHARS}`,
    );
  }
  if (text.trim().length === 0) {
    violations.push("must not be only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    violations.push("must be a single line");
  }
  if (text !== text.trim()) {
    violations.push("must not start or end with whitespace");
  }
  return violations;
}

function gateCheck(text: string): void {
  const violations = gateViolations(text);
  if (violations.length > 0) {
    throw new Error(`gate: ${violations.join("; ")}`);
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
  // Compare raw bytes, not just the decoded string, so a UTF-8 encoding
  // slip (e.g. a mojibake replacement character) is caught too: the
  // decoded string comparison alone could pass while the file on disk
  // differs byte-for-byte from LINE.
  const writtenBytes = readFileSync(outPath);
  if (!writtenBytes.equals(Buffer.from(LINE, "utf8"))) {
    throw new Error("verify: read-back bytes differ from line");
  }
  gateCheck(writtenBytes.toString("utf8"));
}

main();
