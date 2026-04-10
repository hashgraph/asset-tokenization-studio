#!/usr/bin/env node
// SPDX-License-Identifier: Apache-2.0

/**
 * CLI entry point for deploying a new equity token equity instance.
 *
 * Deploys a new equity token via an existing Factory contract, using the
 * BusinessLogicResolver to wire up the diamond proxy.
 *
 * Configuration via environment variables:
 *   NETWORK                       - Target network name (required)
 *   {NETWORK}_PRIVATE_KEY_0       - Private key for deployer account
 *   FACTORY_PROXY                 - Address of the deployed Factory proxy (required)
 *   BLR_PROXY                     - Address of the BusinessLogicResolver proxy (required)
 *
 *   Token metadata (positional CLI arguments, in order):
 *   <name>      - ERC20 token name (required)
 *   <symbol>    - ERC20 token symbol (required)
 *   <isin>      - ISIN identifier (required)
 *   [decimals]  - Token decimals (default: 18)
 *   [maxSupply] - Maximum supply in base units (default: 0 = unlimited)
 *
 *   Token features:
 *   IS_WHITELIST                  - Enable whitelist mode (default: false)
 *   IS_CONTROLLABLE               - Enable controllable transfers (default: false)
 *   IS_MULTI_PARTITION            - Enable multi-partition support (default: false)
 *   ARE_PARTITIONS_PROTECTED      - Protect partitions from unauthorized access (default: false)
 *   CLEARING_ACTIVE               - Enable clearing functionality (default: false)
 *   INTERNAL_KYC_ACTIVATED        - Activate internal KYC (default: false)
 *   ERC20_VOTES_ACTIVATED         - Activate ERC20 votes (default: false)
 *
 *   External integrations (optional, comma-separated addresses):
 *   EXTERNAL_PAUSES               - External pause contract addresses
 *   EXTERNAL_CONTROL_LISTS        - External control list contract addresses
 *   EXTERNAL_KYC_LISTS            - External KYC list contract addresses
 *   COMPLIANCE                    - Compliance contract address
 *   IDENTITY_REGISTRY             - Identity registry contract address
 *
 *   Equity details:
 *   VOTING_RIGHT                  - Voting right (default: false)
 *   INFORMATION_RIGHT             - Information right (default: false)
 *   LIQUIDATION_RIGHT             - Liquidation right (default: false)
 *   SUBSCRIPTION_RIGHT            - Subscription right (default: false)
 *   CONVERSION_RIGHT              - Conversion right (default: false)
 *   REDEMPTION_RIGHT              - Redemption right (default: false)
 *   PUT_RIGHT                     - Put right (default: false)
 *   DIVIDEND_RIGHT                - Dividend right (0=NONE, 1=PREFERRED, 2=COMMON, default: 0)
 *   CURRENCY                      - Currency code (required)
 *   NOMINAL_VALUE                 - Nominal value in base units (required)
 *   NOMINAL_VALUE_DECIMALS        - Nominal value decimals (default: 0)
 *
 *   Regulation:
 *   REGULATION_TYPE               - Regulation type (default: 0)
 *   REGULATION_SUB_TYPE           - Regulation sub-type (default: 0)
 *   COUNTRIES_CONTROL_LIST_TYPE   - true = whitelist, false = blacklist (default: false)
 *   LIST_OF_COUNTRIES             - Comma-separated country codes (default: '')
 *   REGULATION_INFO               - Additional regulation info (default: '')
 *
 * Usage:
 *   npm run deploy:equityInstance:hedera:testnet
 *
 * @module cli/deployEquityInstance
 */

import { ethers, MaxUint256 } from "ethers";
import { deployEquityInstance } from "../workflows/deployEquityInstance";
import { info, success, error } from "@scripts/infrastructure";
import { requireNetworkSigner, requireValidAddress } from "./shared";

// ============================================================================
// CLI argument parsing
// ============================================================================

interface TokenCliArgs {
  name: string;
  symbol: string;
  isin: string;
  decimals: number;
  maxSupply: bigint;
}

// ============================================================================
// Main
// ============================================================================

async function main() {
  const { network, signer, address } = await requireNetworkSigner();

  // Required addresses
  const factoryAddress = requireValidAddress(process.env.FACTORY_PROXY, "FACTORY_PROXY");
  const blrAddress = requireValidAddress(process.env.BLR_PROXY, "BLR_PROXY");

  const tokenName = "Fidelity Treasury Digital Fund ";
  const tokenSymbol = "FDIT";
  const tokenIsin = "US31617H8135";
  const tokenDecimals = 18;
  const maxSupply = MaxUint256;

  // Token features
  const isWhiteList = false;
  const isControllable = true;
  const isMultiPartition = false;
  const arePartitionsProtected = false;
  const clearingActive = false;
  const internalKycActivated = false;
  const erc20VotesActivated = false;

  // External integrations
  const externalPauses: string[] = [];
  const externalControlLists: string[] = [];
  const externalKycLists: string[] = [];
  const compliance = ethers.ZeroAddress;
  const identityRegistry = ethers.ZeroAddress;

  // Equity details
  const votingRight = false;
  const informationRight = false;
  const liquidationRight = false;
  const subscriptionRight = false;
  const conversionRight = false;
  const redemptionRight = false;
  const putRight = false;
  const dividendRight = 0;
  const currency = "0x555344";
  const nominalValue = BigInt("0");
  const nominalValueDecimals = 0;

  // Regulation
  const regulationType = 1;
  const regulationSubType = 0;
  const countriesControlListType = false;
  const listOfCountries = "";
  const regulationInfo = "";

  info(`🚀 Starting equity instance deployment`);
  info("---");
  info(`📡 Network: ${network}`);
  info(`👤 Deployer / Admin: ${address}`);
  info(`🏭 Factory: ${factoryAddress}`);
  info(`🔗 BLR: ${blrAddress}`);
  info(`🪙 Token Name: ${tokenName}`);
  info(`🪙 Token Symbol: ${tokenSymbol}`);
  info(`📋 Token ISIN: ${tokenIsin}`);
  info(`📋 Token Decimals: ${tokenDecimals}`);
  info(`📋 Token Max Supply: ${maxSupply}`);
  info("---");

  try {
    const output = await deployEquityInstance(signer, network, {
      factoryAddress,
      adminAccount: address,
      securityData: {
        resolver: blrAddress,
        isWhiteList,
        isControllable,
        isMultiPartition,
        arePartitionsProtected,
        maxSupply,
        erc20MetadataInfo: {
          name: tokenName,
          symbol: tokenSymbol,
          isin: tokenIsin,
          decimals: tokenDecimals,
        },
        clearingActive,
        internalKycActivated,
        erc20VotesActivated,
        externalPauses,
        externalControlLists,
        externalKycLists,
        compliance,
        identityRegistry,
        // resolverProxyConfiguration is overridden by deployEquityFromFactory internally
        resolverProxyConfiguration: { key: "", version: 0 },
        rbacs: [],
      },
      equityDetails: {
        votingRight,
        informationRight,
        liquidationRight,
        subscriptionRight,
        conversionRight,
        redemptionRight,
        putRight,
        dividendRight,
        currency,
        nominalValue,
        nominalValueDecimals,
      },
      regulationData: {
        regulationType,
        regulationSubType,
        additionalSecurityData: {
          countriesControlListType,
          listOfCountries,
          info: regulationInfo,
        },
      },
      saveOutput: true,
    });

    info("---");
    success("✅ Equity instance deployment completed successfully!");
    info("---");
    info("📋 Deployment Summary:");
    info(`   Network: ${output.network}`);
    info(`   Deployer: ${output.deployer}`);
    info(`   Token Address: ${output.equity.address}`);
    info(`   BLR Address: ${blrAddress}`);
    info(`   Factory Address: ${factoryAddress}`);
    process.exit(0);
  } catch (err) {
    error("❌ Deployment failed:", err);
    process.exit(1);
  }
}

export { main };

if (require.main === module) {
  main().catch((err) => {
    error("❌ Fatal error:", err);
    process.exit(1);
  });
}
