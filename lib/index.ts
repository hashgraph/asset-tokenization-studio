// SPDX-License-Identifier: Apache-2.0

/**
 * Main entry point for the ATS contracts library
 * (published as `@hashgraph/asset-tokenization-contracts/lib`).
 *
 * NOTE: system deployment/upgrade orchestration lives in Hardhat Ignition
 * (see DEPLOYMENT.md and ignition/). This barrel keeps the library:
 * domain data (facet sets, config ids, registry) and operations for
 * managing live contracts.
 *
 * This file only composes the layer barrels — add new exports in
 * `operations/index.ts` or `domain/index.ts`, never here.
 */

// Operations (generic — what you can do to deployed contracts)
export * from "./operations";

// Domain (ATS-specific — what ATS is)
export * from "./domain";
