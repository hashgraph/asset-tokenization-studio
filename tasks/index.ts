// SPDX-License-Identifier: Apache-2.0

// Registers every Hardhat task. See DEPLOYMENT.md for the layering standard.
//
// - lib/  shared helpers (signer resolution)
// - ops/  the operator's console: ats:<object>:<verb> over live contracts
// - dev/  development tooling that never signs on a real network

// * Shared helpers
export * from "./lib/signer";

// * Operations (see the responsibility table in DEPLOYMENT.md)
export * from "./ops/token";
export * from "./ops/blr";
export * from "./ops/proxy";
export * from "./ops/factory";

// * Development tooling
export * from "./dev/hash";
export * from "./dev/selectors";
export * from "./dev/keccak";
export * from "./dev/vc";

// System deployment lives in Hardhat Ignition (ignition/modules/), not in tasks.
