// SPDX-License-Identifier: Apache-2.0

/**
 * Global type definitions for Hardhat test environment.
 *
 * This file ensures that TypeScript recognizes the type extensions
 * provided by Hardhat plugins, even when hardhat.config.ts is excluded
 * from compilation or in monorepo setups.
 *
 * The triple-slash directives load type definitions from:
 * - @nomiclabs/hardhat-ethers: Adds ethers to HardhatRuntimeEnvironment
 * - @nomicfoundation/hardhat-chai-matchers: Adds Chai matchers for Ethereum testing
 */

/// <reference types="@nomiclabs/hardhat-ethers" />
/// <reference types="@nomicfoundation/hardhat-chai-matchers" />
