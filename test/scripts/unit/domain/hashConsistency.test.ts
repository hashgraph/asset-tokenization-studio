// SPDX-License-Identifier: Apache-2.0

/**
 * Comparator for the hand-pasted hash literals: TS literal vs .sol literal vs
 * hashGen formula, for resolver keys and roles. On failure, regenerate with
 * `npx hardhat ats:hash <kind> <Arg>`.
 *
 * @module test/scripts/unit/domain/hashConsistency.test
 */

import fs from "fs";
import path from "path";
import { sync as globSync } from "glob";
import { expect } from "chai";
import { HASHES, pascalToUpperSnake } from "../../../../lib/codegen/hashGen";
import { FACET_KEY_ARGS, RESOLVER_KEYS_BY_FACET } from "../../../../lib/domain/facetKeys";
import { ROLES } from "../../../../lib/domain/roles";

const ROOT = path.resolve(__dirname, "../../../..");
const SCAN_GLOB = "contracts/**/*.sol";
const EXCLUDES = ["contracts/hardhat-dependency-compiler/**", "contracts/test/**", "contracts/**/test/**"];

const CONSTANT = /^\s*bytes32\s+constant\s+(\w+)\s*=\s*(0x[0-9a-fA-F]{64})\s*;/;
const ANNOTATION = /^\s*\/\/\/\s*@custom:hash\s+role\s+(\S+)\s*$/;

interface ConstantHit {
  identifier: string;
  hex: string;
  file: string;
  line: number;
}

interface RoleAnnotationHit {
  identifier: string;
  arg: string;
  hex: string;
  file: string;
  line: number;
}

/** Every `bytes32 constant <NAME> = 0x<64hex>;` declaration in scan scope. */
function scanConstants(): ConstantHit[] {
  const files = globSync(SCAN_GLOB, { cwd: ROOT, ignore: EXCLUDES, absolute: true });
  const hits: ConstantHit[] = [];
  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split(/\r\n|\n/);
    const rel = path.relative(ROOT, file);
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(CONSTANT);
      if (!match) continue;
      hits.push({ identifier: match[1], hex: match[2], file: rel, line: i + 1 });
    }
  }
  return hits;
}

/**
 * Every `role` annotation paired with the `bytes32 constant ROLE_*` within
 * the next few lines.
 */
function scanRoleAnnotations(): RoleAnnotationHit[] {
  const files = globSync(SCAN_GLOB, { cwd: ROOT, ignore: EXCLUDES, absolute: true });
  const hits: RoleAnnotationHit[] = [];
  for (const file of files) {
    const lines = fs.readFileSync(file, "utf8").split(/\r\n|\n/);
    const rel = path.relative(ROOT, file);
    for (let i = 0; i < lines.length; i++) {
      const annotationMatch = lines[i].match(ANNOTATION);
      if (!annotationMatch) continue;
      const arg = annotationMatch[1];
      for (let j = i + 1; j < Math.min(i + 5, lines.length); j++) {
        const constantMatch = lines[j].match(CONSTANT);
        if (!constantMatch) continue;
        hits.push({ identifier: constantMatch[1], arg, hex: constantMatch[2], file: rel, line: j + 1 });
        break;
      }
    }
  }
  return hits;
}

describe("hashConsistency — TS literal vs .sol literal vs hashGen formula", () => {
  const allConstants = scanConstants();
  const constantsByIdentifier = new Map<string, ConstantHit>();
  for (const hit of allConstants) {
    const existing = constantsByIdentifier.get(hit.identifier);
    if (existing && existing.hex !== hit.hex) {
      throw new Error(
        `Duplicate, disagreeing '${hit.identifier}' constants: ${existing.file}:${existing.line} = ` +
          `${existing.hex} vs ${hit.file}:${hit.line} = ${hit.hex}.`,
      );
    }
    constantsByIdentifier.set(hit.identifier, hit);
  }

  describe("(a) resolver keys — TS RESOLVER_KEYS_BY_FACET vs .sol RESOLVER_KEY_<ARG>", () => {
    // TimeTravelFacet and IDiamondFacet have a null arg (legacy literal / no
    // key at all, respectively) and are covered separately by
    // facetKeys.test.ts, block (b).
    const entries = (Object.entries(FACET_KEY_ARGS) as [string, string | null][]).filter(
      (entry): entry is [string, string] => entry[1] !== null,
    );

    for (const [facetName, arg] of entries) {
      const identifier = `RESOLVER_KEY_${pascalToUpperSnake(arg)}`;

      it(`${facetName}: TS literal matches contracts/**/*.sol's ${identifier}`, () => {
        const hit = constantsByIdentifier.get(identifier);
        expect(
          hit,
          `'${identifier}' not found in contracts/**/*.sol (outside contracts/test/**). Either the facet's ` +
            `interface is missing the constant, or FACET_KEY_ARGS['${facetName}'] in lib/domain/facetKeys.ts ` +
            `has the wrong arg. Recompute with: npx hardhat ats:hash resolverKey ${arg}`,
        ).to.not.be.undefined;

        expect(
          RESOLVER_KEYS_BY_FACET[facetName],
          `RESOLVER_KEYS_BY_FACET['${facetName}'] in lib/domain/facetKeys.ts does not match ${identifier} in ` +
            `${hit!.file}:${hit!.line}. Recompute with: npx hardhat ats:hash resolverKey ${arg}, then paste the ` +
            `hex into both places.`,
        ).to.equal(hit!.hex);
      });
    }
  });

  describe("(b) roles — TS ROLES (lib/domain/roles.ts) vs .sol ROLE_* (contracts/constants/roles.sol)", () => {
    // DEFAULT_ADMIN_ROLE is the hand-written OpenZeppelin sentinel (`0x00`),
    // outside the @custom:hash system on both sides — never annotated, never
    // 64-hex, so it never enters `constantsByIdentifier`.
    const tsRoleNames = Object.keys(ROLES).filter((name) => name !== "DEFAULT_ADMIN_ROLE");
    const solRoleIdentifiers = [...constantsByIdentifier.keys()].filter((name) => name.startsWith("ROLE_"));

    for (const name of tsRoleNames) {
      it(`ROLES.${name} matches the .sol constant of the same name`, () => {
        const hit = constantsByIdentifier.get(name);
        expect(
          hit,
          `'${name}' not found in contracts/**/*.sol (outside contracts/test/**). Either roles.sol is missing ` +
            `the constant, or ROLES.${name} in lib/domain/roles.ts is stale and should be removed.`,
        ).to.not.be.undefined;

        expect(
          (ROLES as Record<string, string>)[name],
          `ROLES.${name} in lib/domain/roles.ts does not match ${name} in ${hit!.file}:${hit!.line}. Recompute ` +
            `with: npx hardhat ats:hash role <Arg> (see the @custom:hash annotation above the .sol constant), ` +
            `then paste the hex into both places.`,
        ).to.equal(hit!.hex);
      });
    }

    it("no .sol ROLE_* constant is missing its ROLES.* copy in lib/domain/roles.ts", () => {
      const missing = solRoleIdentifiers.filter((name) => !tsRoleNames.includes(name));
      expect(
        missing,
        missing.length > 0
          ? `Add ROLES.${missing.join(", ROLES.")} to lib/domain/roles.ts (found in contracts/constants/roles.sol ` +
              `but not mirrored in TS).`
          : undefined,
      ).to.be.empty;
    });
  });

  describe("(c) formula — literal equals HASHES.resolverKey()/HASHES.role() recomputed from its own argument", () => {
    // Resolver keys: (a) already proved the TS literal equals the .sol
    // literal, so recomputing from FACET_KEY_ARGS's arg and comparing against
    // either copy catches a pasted-from-the-wrong-argument value that
    // happens to match on both sides.
    const resolverKeyEntries = (Object.entries(FACET_KEY_ARGS) as [string, string | null][]).filter(
      (entry): entry is [string, string] => entry[1] !== null,
    );

    for (const [facetName, arg] of resolverKeyEntries) {
      it(`${facetName}: literal equals HASHES.resolverKey("${arg}")`, () => {
        expect(RESOLVER_KEYS_BY_FACET[facetName]).to.equal(HASHES.resolverKey(arg));
      });
    }

    it("TimeTravelFacet is exempt (legacy pre-formula literal, see facetKeys.ts)", () => {
      expect(FACET_KEY_ARGS.TimeTravelFacet).to.be.null;
    });

    // Roles: the annotation gives the argument the identifier doesn't encode
    // reversibly (case-sensitivity is lost going upper-snake -> Pascal), so
    // this reads it straight from the .sol annotation rather than guessing.
    const roleAnnotations = scanRoleAnnotations();

    it("every ROLES entry (except DEFAULT_ADMIN_ROLE) has a matching @custom:hash role annotation", () => {
      const annotated = new Set(roleAnnotations.map((hit) => hit.identifier));
      const missing = Object.keys(ROLES).filter((name) => name !== "DEFAULT_ADMIN_ROLE" && !annotated.has(name));
      expect(
        missing,
        missing.length > 0
          ? `No @custom:hash role annotation found for: ${missing.join(", ")}. Add ` +
              `\`/// @custom:hash role <Arg>\` above the constant in contracts/constants/roles.sol.`
          : undefined,
      ).to.be.empty;
    });

    for (const hit of roleAnnotations) {
      it(`${hit.identifier}: literal equals HASHES.role("${hit.arg}")`, () => {
        expect(hit.hex).to.equal(HASHES.role(hit.arg));
      });
    }
  });
});
