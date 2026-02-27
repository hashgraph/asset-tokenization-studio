// SPDX-License-Identifier: Apache-2.0

/**
 * Global type definitions for Hardhat test environment.
 *
 * This file ensures that TypeScript recognizes the type extensions
 * provided by Hardhat plugins, even when hardhat.config.ts is excluded
 * from compilation or in monorepo setups.
 *
 * The triple-slash directives load type definitions from:
 * - @nomicfoundation/hardhat-ethers: Adds ethers to HardhatRuntimeEnvironment
 * - @nomicfoundation/hardhat-chai-matchers: Adds Chai matchers for Ethereum testing
 * - @typechain/hardhat: Adds typechain configuration to HardhatConfig
 */

/// <reference types="@nomicfoundation/hardhat-ethers" />
/// <reference types="@nomicfoundation/hardhat-chai-matchers" />
/// <reference types="@typechain/hardhat" />
