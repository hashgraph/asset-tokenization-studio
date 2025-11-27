// SPDX-License-Identifier: Apache-2.0

/**
 * Global type definitions for Hardhat tasks environment.
 *
 * This file ensures that TypeScript recognizes the type extensions
 * provided by Hardhat plugins when working with tasks.
 *
 * The triple-slash directives load type definitions from:
 * - @nomiclabs/hardhat-ethers: Adds ethers to HardhatRuntimeEnvironment
 * - @nomicfoundation/hardhat-chai-matchers: Adds Chai matchers for Ethereum testing
 * - @typechain/hardhat: Adds typechain configuration to HardhatConfig
 */

/// <reference types="@nomiclabs/hardhat-ethers" />
/// <reference types="@nomicfoundation/hardhat-chai-matchers" />
/// <reference types="@typechain/hardhat" />
