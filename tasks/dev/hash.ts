// SPDX-License-Identifier: Apache-2.0

import { task, types } from "hardhat/config";
import { HASHES, HASH_KINDS, canonicalIdentifier, isCanonicalPascalArg, isHashKind } from "../../lib/codegen/hashGen";

interface AtsHashArgs {
  kind: string;
  name: string;
}

task(
  "ats:hash",
  "Compute a hash literal from the canonical hashGen formula, to paste by hand into a .sol constant and its TS mirror",
)
  .addPositionalParam("kind", `Hash kind: ${HASH_KINDS.join(" | ")}`, undefined, types.string)
  .addPositionalParam("name", "PascalCase argument (e.g. BondFixedRate)", undefined, types.string)
  .setAction(async ({ kind, name }: AtsHashArgs) => {
    if (!isHashKind(kind)) {
      throw new Error(`Unknown hash kind "${kind}". Valid kinds: ${HASH_KINDS.join(", ")}`);
    }

    if (!isCanonicalPascalArg(name)) {
      throw new Error(
        `"${name}" is not a canonical PascalCase argument (start with an upper-case letter, letters/digits ` +
          `only, no ambiguous casing — e.g. "Kyc" not "KYC", "Erc1410" not "ERC1410"). ` +
          `Fix the argument and re-run: npx hardhat ats:hash ${kind} <PascalName>`,
      );
    }

    const hex = HASHES[kind](name);
    const identifier = canonicalIdentifier(kind, name);

    console.log(hex);
    console.log(`Suggested Solidity identifier: bytes32 constant ${identifier} = ${hex};`);
  });
