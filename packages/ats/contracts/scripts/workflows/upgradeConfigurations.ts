// SPDX-License-Identifier: Apache-2.0

/**
 * Upgrade ATS configurations workflow.
 *
 * Upgrades existing BusinessLogicResolver configurations to a new version by:
 * 1. Deploying all facets (48-49 total, with optional TimeTravel variants)
 * 2. Registering facets in existing BLR (creates new global version)
 * 3. Creating new configuration versions for Equity and/or Bond
 * 4. Optionally updating existing ResolverProxy tokens to use the new version
 *
 * This workflow enables upgrading facet implementations without redeploying
 * infrastructure (BLR, ProxyAdmin, Factory).
 *
 * @module workflows/upgradeConfigurations
 */

import { ContractFactory, Signer } from "ethers";
import { z } from "zod";
import {
  deployFacets,
  registerFacets,
  updateResolverProxyConfig,
  getResolverProxyConfigInfo,
  success,
  info,
  warn,
  error as logError,
  section,
  fetchHederaContractId,
  getDeploymentConfig,
  DEFAULT_BATCH_SIZE,
  CheckpointManager,
  NullCheckpointManager,
  type DeploymentCheckpoint,
  type ResumeOptions,
  formatCheckpointStatus,
  getStepName,
  validateAddress,
} from "@scripts/infrastructure";
import { atsRegistry, createEquityConfiguration, createBondConfiguration } from "@scripts/domain";

import { promises as fs } from "fs";
import { dirname } from "path";
import { BusinessLogicResolver__factory } from "@contract-types";

// ============================================================================
// Constants
// ============================================================================

/**
 * Workflow step constants for checkpoint management.
 * Each step represents a phase in the upgrade configurations workflow.
 */
const UPGRADE_WORKFLOW_STEPS = {
  DEPLOY_FACETS: 0,
  REGISTER_FACETS: 1,
  CREATE_EQUITY_CONFIG: 2,
  CREATE_BOND_CONFIG: 3,
  UPDATE_PROXIES: 4,
  COMPLETE: 5,
} as const;

/**
 * Pagination configuration for BusinessLogicResolver queries.
 * BLR returns facet keys in pages to avoid gas limits.
 */
const BLR_PAGINATION_PAGE_SIZE = 100;

/**
 * Number of hexadecimal characters to display for truncated keys/addresses.
 * Shows "0x" + first 10 hex chars for readability in logs.
 */
const TRUNCATED_KEY_DISPLAY_LENGTH = 10;

// ============================================================================
// Runtime Validation Schemas
// ============================================================================

/**
 * Zod schema for runtime validation of UpgradeConfigurationsOptions.
 *
 * Provides helpful error messages at runtime and ensures type safety
 * beyond TypeScript's compile-time checks.
 */
const UpgradeConfigurationsOptionsSchema = z.object({
  // Required fields
  // Note: blrAddress validation is handled by validateAndInitialize() for better error messages
  blrAddress: z.string().min(1, "BLR address is required"),

  // Optional fields with defaults
  useTimeTravel: z.boolean().optional().default(false),
  configurations: z.enum(["equity", "bond", "both"]).optional().default("both"),
  proxyAddresses: z
    .array(z.string().regex(/^0x[a-fA-F0-9]{40}$/))
    .optional()
    .default([]),
  batchSize: z.number().int().positive().optional().default(DEFAULT_BATCH_SIZE),
  confirmations: z.number().int().nonnegative().optional(),
  enableRetry: z.boolean().optional(),
  verifyDeployment: z.boolean().optional(),
  saveOutput: z.boolean().optional().default(true),
  outputPath: z.string().optional(),
  deleteOnSuccess: z.boolean().optional().default(false),

  // Checkpoint-related options
  checkpointDir: z.string().optional(),
  resumeFrom: z.string().optional(),
  autoResume: z.boolean().optional(),
  ignoreCheckpoint: z.boolean().optional(),
});

// ============================================================================
// Types
// ============================================================================

/**
 * Options for upgrading configurations.
 */
export interface UpgradeConfigurationsOptions extends ResumeOptions {
  /** Address of existing BLR proxy (required) */
  blrAddress: string;

  /** Whether to use TimeTravel variants for facets (default: false) */
  useTimeTravel?: boolean;

  /** Which configurations to create: 'equity', 'bond', or 'both' (default: 'both') */
  configurations?: "equity" | "bond" | "both";

  /** Optional list of ResolverProxy addresses to update to new version */
  proxyAddresses?: readonly string[];

  /** Number of facets per batch for configuration creation (default: DEFAULT_BATCH_SIZE) */
  batchSize?: number;

  /** Number of confirmations to wait for each deployment (default: from network config) */
  confirmations?: number;

  /** Enable retry mechanism for failed deployments (default: from network config) */
  enableRetry?: boolean;

  /** Enable post-deployment bytecode verification (default: from network config) */
  verifyDeployment?: boolean;

  /** Whether to save deployment output to file (default: true) */
  saveOutput?: boolean;

  /** Path to save deployment output */
  outputPath?: string;
}

/**
 * Result of a proxy update operation.
 */
export interface ProxyUpdateResult {
  /** Proxy address that was updated */
  proxyAddress: string;

  /** Whether update succeeded */
  success: boolean;

  /** Previous version before update */
  previousVersion?: number;

  /** New version after update */
  newVersion?: number;

  /** Type of update performed */
  updateType: "version" | "config" | "resolver";

  /** Error message if failed */
  error?: string;

  /** Transaction hash of the update */
  transactionHash?: string;

  /** Gas used for the update */
  gasUsed?: number;
}

/**
 * Output of the upgrade configurations workflow.
 */
export interface UpgradeConfigurationsOutput {
  /** Network name */
  network: string;

  /** ISO timestamp */
  timestamp: string;

  /** Deployer address */
  deployer: string;

  /** BLR information (external) */
  blr: {
    address: string;
    isExternal: true;
  };

  /** Newly deployed facets */
  facets: Array<{
    name: string;
    address: string;
    contractId?: string;
    key: string;
  }>;

  /** New configuration versions */
  configurations: {
    equity?: {
      configId: string;
      version: number;
      facetCount: number;
    };
    bond?: {
      configId: string;
      version: number;
      facetCount: number;
    };
  };

  /** Proxy update results (if proxyAddresses provided) */
  proxyUpdates?: ProxyUpdateResult[];

  /** Summary statistics */
  summary: {
    totalFacetsDeployed: number;
    configurationsCreated: number;
    proxiesUpdated: number;
    proxiesFailed: number;
    deploymentTime: number;
    gasUsed: string;
    success: boolean;
  };
}

// ============================================================================
// Types (Internal)
// ============================================================================

/**
 * Facet data for registration in BLR.
 */
interface FacetRegistrationData {
  /** Facet name (for logging/error messages) */
  name: string;

  /** Deployed facet address */
  address: string;

  /** Resolver key (bytes32) for the facet */
  resolverKey: string;
}

/**
 * Internal context object passed between phase functions.
 * Not exported - used only within this module.
 */
interface UpgradePhaseContext {
  /** Ethers signer for transactions */
  signer: Signer;

  /** Network name */
  network: string;

  /** User options */
  options: UpgradeConfigurationsOptions;

  /** Deployment checkpoint */
  checkpoint: DeploymentCheckpoint;

  /** ATS registry for facet definitions */
  atsRegistry: typeof atsRegistry;

  /** BLR contract instance */
  blrContract: ReturnType<typeof BusinessLogicResolver__factory.connect>;

  /** Checkpoint manager for persistence */
  checkpointManager: CheckpointManager | NullCheckpointManager;

  /** Starting time for duration calculation */
  startTime: number;

  /** Accumulated gas usage across all phases */
  totalGasUsed: number;
}

// ============================================================================
// Phase Functions (Private)
// ============================================================================

/**
 * Phase 1: Validate BLR address and initialize context.
 *
 * Validates that the BLR address is valid and exists on-chain, then
 * initializes the checkpoint manager and loads or creates a checkpoint.
 *
 * @param signer - Ethers signer
 * @param network - Network name
 * @param options - Upgrade options
 * @returns Context object for subsequent phases
 * @throws If BLR address is invalid or doesn't exist on-chain
 */
async function validateAndInitialize(
  signer: Signer,
  network: string,
  options: UpgradeConfigurationsOptions,
): Promise<UpgradePhaseContext> {
  const { blrAddress, confirmations, checkpointDir, resumeFrom, autoResume, ignoreCheckpoint } = options;

  // Validate BLR address format
  try {
    validateAddress(blrAddress, "BLR address");
  } catch (err) {
    throw new Error(`Invalid BLR address format: ${blrAddress}`);
  }

  // Verify BLR exists on-chain
  const provider = signer.provider;
  if (!provider) {
    throw new Error("Signer must be connected to a provider");
  }

  const blrCode = await provider.getCode(blrAddress);
  if (blrCode === "0x") {
    throw new Error(`No contract found at BLR address: ${blrAddress}`);
  }

  info(`✅ BLR validated: ${blrAddress}`);

  // Initialize checkpoint manager
  const checkpointManager = ignoreCheckpoint
    ? new NullCheckpointManager(checkpointDir)
    : new CheckpointManager(checkpointDir);

  let checkpoint: DeploymentCheckpoint | null = null;

  // Check for existing checkpoints if not explicitly ignoring
  if (!ignoreCheckpoint) {
    if (resumeFrom) {
      info(`\n🔄 Loading checkpoint: ${resumeFrom}`);
      checkpoint = await checkpointManager.loadCheckpoint(resumeFrom);

      if (!checkpoint) {
        throw new Error(`Checkpoint not found: ${resumeFrom}`);
      }

      info(`✅ Loaded checkpoint from ${checkpoint.startTime}`);
      info(formatCheckpointStatus(checkpoint));
    } else if (autoResume) {
      const incompleteCheckpoints = await checkpointManager.findCheckpoints(network, "in-progress");
      const upgradeCheckpoints = incompleteCheckpoints.filter((cp) => cp.workflowType === "upgradeConfigurations");

      if (upgradeCheckpoints.length > 0) {
        const latestCheckpoint = upgradeCheckpoints[0];
        info(`\n🔍 Found incomplete upgrade: ${latestCheckpoint.checkpointId}`);
        info(formatCheckpointStatus(latestCheckpoint));
        info("🔄 Resuming from checkpoint...");
        checkpoint = latestCheckpoint;
      }
    }
  }

  // Create new checkpoint if not resuming
  if (!checkpoint) {
    const signerAddress = await signer.getAddress();

    const networkConfigForCheckpoint = getDeploymentConfig(network);
    const finalConfirmations = confirmations || networkConfigForCheckpoint.confirmations;

    checkpoint = checkpointManager.createCheckpoint({
      network,
      deployer: signerAddress,
      workflowType: "upgradeConfigurations",
      options: {
        useTimeTravel: options.useTimeTravel,
        confirmations: finalConfirmations,
        enableRetry: options.enableRetry,
        verifyDeployment: options.verifyDeployment,
        saveOutput: options.saveOutput,
        outputPath: options.outputPath,
        batchSize: options.batchSize,
        blrAddress,
        configurations: options.configurations,
        proxyAddresses: options.proxyAddresses,
      },
    });

    info(`\n📝 Created checkpoint: ${checkpoint.checkpointId}`);
    await checkpointManager.saveCheckpoint(checkpoint);
  }

  const blrContract = BusinessLogicResolver__factory.connect(blrAddress, signer);

  return {
    signer,
    network,
    options,
    checkpoint,
    atsRegistry,
    blrContract,
    checkpointManager,
    startTime: Date.now(),
    totalGasUsed: 0,
  };
}

/**
 * Phase 2: Deploy all facets.
 *
 * Deploys all facet contracts (48 without TimeTravel, 49 with TimeTravel variants).
 * Skips facets that were already deployed in previous checkpoint runs.
 *
 * @param ctx - Upgrade phase context
 * @throws If facet deployment fails
 */
async function deployFacetsPhase(ctx: UpgradePhaseContext): Promise<void> {
  const { signer, checkpoint, options, checkpointManager, atsRegistry: registry, network } = ctx;
  const { useTimeTravel = false } = options;

  // CRITICAL FIX: Get confirmations from options or fall back to network config
  // Passing undefined confirmations to deployFacets causes it to hang on Hardhat
  const networkConfig = getDeploymentConfig(network);
  const confirmations = options.confirmations ?? networkConfig.confirmations;

  // Check if already deployed
  if (checkpoint.steps.facets && checkpoint.currentStep >= UPGRADE_WORKFLOW_STEPS.DEPLOY_FACETS) {
    info("\n✓ Step 1/5: All facets already deployed (resuming)");
    info(`✅ Loaded ${checkpoint.steps.facets.size} facets from checkpoint`);
    return;
  }

  info("\n📦 Step 1/5: Deploying all facets...");

  let allFacets = registry.getAllFacets();
  info(`   Found ${allFacets.length} facets in registry`);

  if (!useTimeTravel) {
    allFacets = allFacets.filter((f) => f.name !== "TimeTravelFacet");
    info("   TimeTravelFacet removed from deployment list");
  }

  // Initialize facets Map if not exists
  if (!checkpoint.steps.facets) {
    checkpoint.steps.facets = new Map();
  }

  // Create factories from registry
  const facetFactories: Record<string, ContractFactory> = {};
  for (const facet of allFacets) {
    if (!facet.factory) {
      throw new Error(`No factory found for facet: ${facet.name}`);
    }

    const factory = facet.factory(signer, useTimeTravel);
    const contractName = factory.constructor.name.replace("__factory", "");

    // Skip if already deployed
    if (checkpoint.steps.facets.has(contractName)) {
      info(`   ✓ ${contractName} already deployed (skipping)`);
      continue;
    }

    facetFactories[contractName] = factory;
  }

  // Deploy remaining facets
  if (Object.keys(facetFactories).length > 0) {
    info(`   Deploying ${Object.keys(facetFactories).length} remaining facets...`);

    const facetsResult = await deployFacets(facetFactories, {
      confirmations,
      enableRetry: options.enableRetry,
      verifyDeployment: options.verifyDeployment,
    });

    if (!facetsResult.success) {
      throw new Error("Facet deployment had failures");
    }

    // Save checkpoint after EACH facet deployment
    facetsResult.deployed.forEach((deploymentResult, facetName) => {
      if (!deploymentResult.address) {
        throw new Error(`Facet deployment failed: no address for ${facetName}`);
      }

      checkpoint.steps.facets!.set(facetName, {
        address: deploymentResult.address,
        txHash: deploymentResult.transactionHash || "",
        gasUsed: deploymentResult.gasUsed?.toString(),
        deployedAt: new Date().toISOString(),
      });

      ctx.totalGasUsed += parseInt(deploymentResult.gasUsed?.toString() || "0");
    });

    checkpoint.currentStep = UPGRADE_WORKFLOW_STEPS.DEPLOY_FACETS;
    await checkpointManager.saveCheckpoint(checkpoint);

    info(`✅ Deployed ${facetsResult.deployed.size} facets successfully`);
  } else {
    info("   All facets already deployed from previous checkpoint");
  }
}

/**
 * Phase 3: Register facets in BLR.
 *
 * Fetches existing facets from BLR, merges with newly deployed facets,
 * and registers all facets in BLR to create a new global version.
 *
 * @param ctx - Upgrade phase context
 * @throws If facet registration fails
 */
async function registerFacetsPhase(ctx: UpgradePhaseContext): Promise<void> {
  const { blrContract, checkpoint, checkpointManager } = ctx;

  if (checkpoint.steps.facetsRegistered && checkpoint.currentStep >= UPGRADE_WORKFLOW_STEPS.REGISTER_FACETS) {
    info("\n✓ Step 2/5: Facets already registered in BLR (resuming)");
    return;
  }

  info("\n📝 Step 2/5: Registering facets in BLR...");

  // Fetch existing business logics from BLR
  info("   Fetching existing business logics from BLR...");
  const existingCount = await blrContract.getBusinessLogicCount();
  info(`   Found ${existingCount.toString()} existing business logics`);

  const existingFacets: FacetRegistrationData[] = [];
  const existingCountNum = existingCount.toNumber();

  if (existingCountNum > 0) {
    // Fetch all existing keys (using pagination if needed)
    const pageSize = BLR_PAGINATION_PAGE_SIZE;
    const pageCount = Math.ceil(existingCountNum / pageSize);

    // Precompute facet map ONCE before loops - O(n) instead of O(n²)
    const allFacets = atsRegistry.getAllFacets();
    const facetsByKey = new Map(
      allFacets
        .filter((f) => f.resolverKey?.value !== undefined)
        .map((f) => {
          const key = f.resolverKey?.value;
          if (!key) {
            throw new Error(`Facet ${f.name} has no resolver key value after filter`);
          }
          return [key, f];
        }),
    );

    info(`   Precomputed facet registry map with ${facetsByKey.size} entries`);

    for (let page = 0; page < pageCount; page++) {
      try {
        const keys = await blrContract.getBusinessLogicKeys(page, pageSize);

        for (const key of keys) {
          try {
            // Get current address for this key
            const address = await blrContract.resolveLatestBusinessLogic(key);

            // Look up facet definition from precomputed map - O(1) instead of O(n) find
            const facetDef = facetsByKey.get(key);

            if (!facetDef) {
              warn(`⚠️  Unknown facet key in BLR: ${key.slice(0, TRUNCATED_KEY_DISPLAY_LENGTH)}...`);
              continue; // Skip unknown keys
            }

            const name = facetDef.name;

            existingFacets.push({
              name,
              address,
              resolverKey: key,
            });
          } catch (keyError) {
            // Handle individual key resolution failures
            const keyErrorMsg = keyError instanceof Error ? keyError.message : String(keyError);
            warn(`⚠️  Failed to process key ${key.slice(0, TRUNCATED_KEY_DISPLAY_LENGTH)}...: ${keyErrorMsg}`);
            // Continue with next key instead of crashing
          }
        }
      } catch (pageError) {
        // Handle page fetch failures
        const pageErrorMsg = pageError instanceof Error ? pageError.message : String(pageError);
        warn(`⚠️  Failed to fetch page ${page}/${pageCount}: ${pageErrorMsg}`);
        // Continue with next page instead of crashing
      }
    }

    info(`   Loaded ${existingFacets.length} existing facets from BLR`);
  }

  // Prepare NEW facets with resolver keys from registry
  const newFacets = Array.from(checkpoint.steps.facets!.entries()).map(([facetName, facetData]) => {
    if (!facetData.address) {
      throw new Error(`No address for facet: ${facetName}`);
    }

    // Strip "TimeTravel" suffix to get canonical name
    const baseName = facetName.replace(/TimeTravel$/, "");

    // Look up resolver key from registry
    const definition = atsRegistry.getFacetDefinition(baseName);
    if (!definition || !definition.resolverKey?.value) {
      throw new Error(`Facet ${baseName} not found in registry or missing resolver key`);
    }

    return {
      name: facetName,
      address: facetData.address,
      resolverKey: definition.resolverKey.value,
    };
  });

  // Combine existing and new facets
  const facetMap = new Map<string, FacetRegistrationData>();

  // Add existing facets first
  for (const facet of existingFacets) {
    facetMap.set(facet.resolverKey, facet);
  }

  // Override with new facets (updates existing ones)
  for (const facet of newFacets) {
    facetMap.set(facet.resolverKey, facet);
  }

  const facetsToRegister = Array.from(facetMap.values());
  info(
    `   Total facets to register: ${facetsToRegister.length} (${existingFacets.length} existing + ${newFacets.length} new)`,
  );

  const registerResult = await registerFacets(blrContract, {
    facets: facetsToRegister,
  });

  if (!registerResult.success) {
    throw new Error(`Facet registration failed: ${registerResult.error}`);
  }

  ctx.totalGasUsed += registerResult.gasUsed || 0;
  info(`✅ Registered ${registerResult.registered.length} facets in BLR`);

  if (registerResult.failed.length > 0) {
    warn(`⚠️  ${registerResult.failed.length} facets failed registration`);
  }

  // Save checkpoint
  checkpoint.steps.facetsRegistered = true;
  checkpoint.currentStep = UPGRADE_WORKFLOW_STEPS.REGISTER_FACETS;
  await checkpointManager.saveCheckpoint(checkpoint);
}

/**
 * Generic helper to create or resume a token configuration (equity or bond).
 *
 * Handles checkpoint resumption and state management for both equity and bond
 * configurations, eliminating code duplication.
 *
 * @param params - Configuration parameters
 * @param params.type - Configuration type ('equity' or 'bond')
 * @param params.stepNumber - Checkpoint step number for this configuration
 * @param params.checkpoint - Deployment checkpoint for resumption tracking
 * @param params.checkpointKey - Key in checkpoint.steps.configurations to store result
 * @param params.creator - Async function that creates the configuration
 * @param params.logPrefix - Prefix for log messages
 * @returns Configuration ID string, or undefined if skipped
 * @throws If configuration creation fails
 */
async function createOrResumeConfiguration(params: {
  type: "equity" | "bond";
  stepNumber: number;
  checkpoint: DeploymentCheckpoint;
  checkpointKey: "equity" | "bond";
  creator: () => ReturnType<typeof createEquityConfiguration> | ReturnType<typeof createBondConfiguration>;
  logPrefix: string;
}): Promise<string | undefined> {
  const { type, stepNumber, checkpoint, checkpointKey, creator, logPrefix } = params;

  // Check if already created
  if (checkpoint.steps.configurations?.[checkpointKey] && checkpoint.currentStep >= stepNumber) {
    info(
      `\n✓ Step ${stepNumber === UPGRADE_WORKFLOW_STEPS.CREATE_EQUITY_CONFIG ? "3" : "4"}/5 (${type}): Configuration already created (resuming)`,
    );
    const configData = checkpoint.steps.configurations[checkpointKey];
    info(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} Config ID: ${configData.configId}`);
    info(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} Version: ${configData.version}`);
    return configData.configId;
  }

  // Create configuration
  const stepDisplay = stepNumber === UPGRADE_WORKFLOW_STEPS.CREATE_EQUITY_CONFIG ? "3" : "4";
  info(`\n${type === "equity" ? "💼" : "🏦"} Step ${stepDisplay}/5: ${logPrefix}...`);

  const result = await creator();

  if (!result.success) {
    throw new Error(`${type} config creation failed: ${result.error} - ${result.message}`);
  }

  info(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} Config ID: ${result.data.configurationId}`);
  info(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} Version: ${result.data.version}`);

  // Save checkpoint
  if (!checkpoint.steps.configurations) {
    checkpoint.steps.configurations = {};
  }
  checkpoint.steps.configurations[checkpointKey] = {
    configId: result.data.configurationId,
    version: result.data.version,
    facetCount: result.data.facetKeys.length,
    txHash: "",
  };
  checkpoint.currentStep = stepNumber;

  return result.data.configurationId;
}

/**
 * Phase 4: Create configuration versions.
 *
 * Creates new Equity and/or Bond configuration versions based on the
 * options.configurations setting.
 *
 * @param ctx - Upgrade phase context
 * @returns Configuration addresses (equity and/or bond)
 * @throws If configuration creation fails
 */
async function createConfigurationsPhase(ctx: UpgradePhaseContext): Promise<{
  equity?: string;
  bond?: string;
}> {
  const { blrContract, checkpoint, checkpointManager, options, network } = ctx;
  const { useTimeTravel = false, batchSize = DEFAULT_BATCH_SIZE } = options;
  const { configurations = "both" } = options;

  // CRITICAL FIX: Get confirmations from options or fall back to network config
  const networkConfig = getDeploymentConfig(network);
  const confirmations = options.confirmations ?? networkConfig.confirmations;

  // Build facet addresses from checkpoint
  const facetAddresses: Record<string, string> = {};
  if (checkpoint.steps.facets) {
    for (const [name, data] of checkpoint.steps.facets.entries()) {
      facetAddresses[name] = data.address;
    }
  }

  const createEquity = configurations === "equity" || configurations === "both";
  const createBond = configurations === "bond" || configurations === "both";

  const result: { equity?: string; bond?: string } = {};

  // Create Equity configuration if requested
  if (createEquity) {
    result.equity = await createOrResumeConfiguration({
      type: "equity",
      stepNumber: UPGRADE_WORKFLOW_STEPS.CREATE_EQUITY_CONFIG,
      checkpoint,
      checkpointKey: "equity",
      creator: () =>
        createEquityConfiguration(
          blrContract,
          facetAddresses,
          useTimeTravel,
          false, // partialBatchDeploy
          batchSize,
          confirmations,
        ),
      logPrefix: "Creating Equity configuration",
    });

    // Save checkpoint after helper completes
    await checkpointManager.saveCheckpoint(checkpoint);
  }

  // Create Bond configuration if requested
  if (createBond) {
    result.bond = await createOrResumeConfiguration({
      type: "bond",
      stepNumber: UPGRADE_WORKFLOW_STEPS.CREATE_BOND_CONFIG,
      checkpoint,
      checkpointKey: "bond",
      creator: () =>
        createBondConfiguration(
          blrContract,
          facetAddresses,
          useTimeTravel,
          false, // partialBatchDeploy
          batchSize,
          confirmations,
        ),
      logPrefix: "Creating Bond configuration",
    });

    // Save checkpoint after helper completes
    await checkpointManager.saveCheckpoint(checkpoint);
  }

  return result;
}

/**
 * Phase 5: Update ResolverProxy tokens.
 *
 * Updates existing ResolverProxy tokens to use the new configuration version.
 * Skips proxies that were already updated in previous checkpoint runs.
 *
 * @param ctx - Upgrade phase context
 * @returns Array of proxy update results
 */
async function updateProxiesPhase(ctx: UpgradePhaseContext): Promise<ProxyUpdateResult[]> {
  const { signer, checkpoint, checkpointManager, options, network } = ctx;
  const { proxyAddresses = [] } = options;

  // CRITICAL FIX: Get confirmations from options or fall back to network config
  const networkConfig = getDeploymentConfig(network);
  const confirmations = options.confirmations ?? networkConfig.confirmations;

  const proxyResults: ProxyUpdateResult[] = [];

  if (proxyAddresses.length === 0) {
    info("\n⏭️ Step 5/5: No proxy addresses provided (skipping proxy updates)");
    return proxyResults;
  }

  info(`\n🔗 Step 5/5: Updating ${proxyAddresses.length} ResolverProxy tokens...`);

  // Initialize proxy updates tracking if not exists
  if (!checkpoint.steps.proxyUpdates) {
    checkpoint.steps.proxyUpdates = new Map();
  }

  // Determine which version to update to based on configurations created
  const newVersion = checkpoint.steps.configurations?.equity?.version || checkpoint.steps.configurations?.bond?.version;

  if (!newVersion) {
    throw new Error("No configuration version available for proxy updates");
  }

  info(`   Target version: ${newVersion}`);

  for (const proxyAddress of proxyAddresses) {
    // Skip if already processed in checkpoint
    const existingUpdate = checkpoint.steps.proxyUpdates.get(proxyAddress);
    if (existingUpdate?.success) {
      info(`   ✓ ${proxyAddress} already updated (skipping)`);
      proxyResults.push({
        proxyAddress,
        success: true,
        previousVersion: existingUpdate.previousVersion,
        newVersion: existingUpdate.newVersion,
        updateType: "version",
        transactionHash: existingUpdate.transactionHash,
      });
      continue;
    }

    try {
      info(`   Updating ${proxyAddress}...`);

      // Get current config before update
      let previousVersion: number | undefined;
      try {
        const currentConfig = await getResolverProxyConfigInfo(signer, proxyAddress);
        previousVersion = currentConfig.version;
      } catch {
        // Unable to get current config, continue anyway
      }

      const result = await updateResolverProxyConfig(signer, {
        proxyAddress,
        newVersion,
        confirmations,
      });

      const updateResult: ProxyUpdateResult = {
        proxyAddress,
        success: result.success,
        previousVersion: result.previousConfig?.version,
        newVersion: result.newConfig?.version,
        updateType: result.updateType,
        error: result.error,
        transactionHash: result.transactionHash,
        gasUsed: result.gasUsed,
      };

      proxyResults.push(updateResult);

      // Save checkpoint after each proxy update
      checkpoint.steps.proxyUpdates.set(proxyAddress, {
        success: result.success,
        transactionHash: result.transactionHash,
        error: result.error,
        previousVersion: result.previousConfig?.version,
        newVersion: result.newConfig?.version,
      });
      checkpoint.currentStep = UPGRADE_WORKFLOW_STEPS.UPDATE_PROXIES;
      await checkpointManager.saveCheckpoint(checkpoint);

      if (result.success) {
        info(`   ✅ ${proxyAddress}: v${previousVersion} → v${result.newConfig?.version}`);
        ctx.totalGasUsed += result.gasUsed || 0;
      } else {
        warn(`   ⚠️ ${proxyAddress}: Update failed - ${result.error}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      warn(`   ❌ ${proxyAddress}: Unexpected error - ${errorMessage}`);

      proxyResults.push({
        proxyAddress,
        success: false,
        updateType: "version",
        error: errorMessage,
      });

      // Save failure to checkpoint
      checkpoint.steps.proxyUpdates.set(proxyAddress, {
        success: false,
        error: errorMessage,
      });
      checkpoint.currentStep = UPGRADE_WORKFLOW_STEPS.UPDATE_PROXIES;
      await checkpointManager.saveCheckpoint(checkpoint);
    }
  }

  const successCount = proxyResults.filter((r) => r.success).length;
  const failCount = proxyResults.filter((r) => !r.success).length;

  info(`\n   Proxy Update Summary:`);
  info(`   ✅ Successful: ${successCount}`);
  if (failCount > 0) {
    warn(`   ❌ Failed: ${failCount}`);
  }

  return proxyResults;
}

/**
 * Build final output from phase results.
 *
 * Constructs the UpgradeConfigurationsOutput object with all deployment
 * information and summary statistics.
 *
 * @param ctx - Upgrade phase context
 * @param proxyResults - Proxy update results from phase 5
 * @returns Fully populated output object
 */
async function buildOutput(
  ctx: UpgradePhaseContext,
  proxyResults: ProxyUpdateResult[],
): Promise<UpgradeConfigurationsOutput> {
  const { network, checkpoint, options, startTime } = ctx;
  const deployer = await ctx.signer.getAddress();
  const { blrAddress } = options;

  const createEquity = (options.configurations || "both") === "equity" || (options.configurations || "both") === "both";
  const createBond = (options.configurations || "both") === "bond" || (options.configurations || "both") === "both";

  // Get Hedera Contract IDs if on Hedera network
  const getContractId = async (address: string) => {
    return network.toLowerCase().includes("hedera") ? await fetchHederaContractId(network, address) : undefined;
  };

  // Build facets array with contract IDs
  const facets = await Promise.all(
    Array.from(checkpoint.steps.facets?.entries() || []).map(async ([facetName, facetData]) => {
      const facetAddress = facetData.address;

      return {
        name: facetName,
        address: facetAddress,
        contractId: await getContractId(facetAddress),
        key: "", // Key information not needed in output
      };
    }),
  );

  const output: UpgradeConfigurationsOutput = {
    network,
    timestamp: new Date().toISOString(),
    deployer,

    blr: {
      address: blrAddress,
      isExternal: true,
    },

    facets,

    configurations: {
      ...(checkpoint.steps.configurations?.equity && {
        equity: {
          configId: checkpoint.steps.configurations.equity.configId,
          version: checkpoint.steps.configurations.equity.version,
          facetCount: checkpoint.steps.configurations.equity.facetCount,
        },
      }),
      ...(checkpoint.steps.configurations?.bond && {
        bond: {
          configId: checkpoint.steps.configurations.bond.configId,
          version: checkpoint.steps.configurations.bond.version,
          facetCount: checkpoint.steps.configurations.bond.facetCount,
        },
      }),
    },

    ...(proxyResults.length > 0 && { proxyUpdates: proxyResults }),

    summary: {
      totalFacetsDeployed: checkpoint.steps.facets?.size || 0,
      configurationsCreated: (createEquity ? 1 : 0) + (createBond ? 1 : 0),
      proxiesUpdated: proxyResults.filter((r) => r.success).length,
      proxiesFailed: proxyResults.filter((r) => !r.success).length,
      deploymentTime: Date.now() - startTime,
      gasUsed: ctx.totalGasUsed.toString(),
      success: true,
    },
  };

  return output;
}

// ============================================================================
// Main Workflow
// ============================================================================

/**
 * Upgrade ATS configurations to a new version.
 *
 * Executes the upgrade workflow:
 * 1. Validate BLR address exists
 * 2. Deploy all facets (48-49 total depending on TimeTravel mode)
 * 3. Register facets in BLR (creates new version)
 * 4. Create new Equity and/or Bond configuration versions
 * 5. Optionally update ResolverProxy tokens to new version
 *
 * @param signer - Ethers.js signer for deploying contracts
 * @param network - Network name. Use `KNOWN_NETWORKS` constant for autocomplete,
 *                  or pass any custom string for forks/custom networks.
 * @param options - Upgrade options
 * @returns Promise resolving to upgrade output
 *
 * @example
 * ```typescript
 * import { ethers } from 'ethers'
 * import { upgradeConfigurations, KNOWN_NETWORKS } from '@hashgraph/asset-tokenization-contracts/scripts'
 *
 * const provider = new ethers.providers.JsonRpcProvider('https://testnet.hashio.io/api')
 * const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)
 *
 * // With autocomplete (recommended):
 * const output = await upgradeConfigurations(signer, KNOWN_NETWORKS.HEDERA_TESTNET, {
 *   blrAddress: '0x123...',
 *   configurations: 'both'
 * })
 *
 * console.log(`New Equity Version: ${output.configurations.equity?.version}`)
 * console.log(`New Bond Version: ${output.configurations.bond?.version}`)
 *
 * // Custom network (still supported):
 * const output2 = await upgradeConfigurations(signer, 'my-custom-fork', {
 *   blrAddress: '0x123...',
 *   configurations: 'equity',
 *   proxyAddresses: ['0xToken1...', '0xToken2...']
 * })
 *
 * console.log(`Updated ${output2.summary.proxiesUpdated} proxies`)
 * ```
 */
export async function upgradeConfigurations(
  signer: Signer,
  network: string,
  options: UpgradeConfigurationsOptions,
): Promise<UpgradeConfigurationsOutput> {
  // Validate options with Zod schema for runtime safety
  let validatedOptions: z.infer<typeof UpgradeConfigurationsOptionsSchema>;
  try {
    validatedOptions = UpgradeConfigurationsOptionsSchema.parse(options);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Transform Zod validation errors into user-friendly messages
      const issues = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return `${path}: ${issue.message}`;
      });
      throw new Error(`Invalid upgrade options:\n${issues.join("\n")}`);
    }
    throw error;
  }

  // Get network-specific deployment configuration
  const networkConfig = getDeploymentConfig(network);

  const { saveOutput = true, outputPath, deleteOnSuccess = false } = validatedOptions;

  const deployer = await signer.getAddress();

  section("ATS Configuration Upgrade");
  info("═".repeat(60));
  info(`📡 Network: ${network}`);
  info(`👤 Deployer: ${deployer}`);
  info(`🔷 BLR Address: ${validatedOptions.blrAddress}`);
  info(`🔄 TimeTravel: ${validatedOptions.useTimeTravel ? "Enabled" : "Disabled"}`);
  info(`📋 Configurations: ${validatedOptions.configurations || "both"}`);
  info(`🔗 Proxies to Update: ${(validatedOptions.proxyAddresses || []).length}`);
  info(`⏱️  Confirmations: ${validatedOptions.confirmations || networkConfig.confirmations}`);
  info("═".repeat(60));

  let ctx: UpgradePhaseContext | undefined;

  try {
    // =========================================================================
    // Phase 1: Validate and Initialize
    // =========================================================================
    info("\n🔍 Step 0: Validating BLR address...");
    ctx = await validateAndInitialize(signer, network, validatedOptions);

    // =========================================================================
    // Phase 2: Deploy Facets
    // =========================================================================
    await deployFacetsPhase(ctx);

    // =========================================================================
    // Phase 3: Register Facets in BLR
    // =========================================================================
    await registerFacetsPhase(ctx);

    // =========================================================================
    // Phase 4: Create Configurations
    // =========================================================================
    await createConfigurationsPhase(ctx);

    // =========================================================================
    // Phase 5: Update Proxies
    // =========================================================================
    const proxyResults = await updateProxiesPhase(ctx);

    // =========================================================================
    // Build Output and Save
    // =========================================================================
    const output = await buildOutput(ctx, proxyResults);

    // Mark final step
    ctx.checkpoint.currentStep = UPGRADE_WORKFLOW_STEPS.COMPLETE;

    // Mark checkpoint as completed
    ctx.checkpoint.status = "completed";
    await ctx.checkpointManager.saveCheckpoint(ctx.checkpoint);
    info("\n✅ Checkpoint marked as completed");

    // Optionally delete checkpoint after successful deployment
    if (deleteOnSuccess) {
      await ctx.checkpointManager.deleteCheckpoint(ctx.checkpoint.checkpointId);
      info(`🗑️  Checkpoint deleted: ${ctx.checkpoint.checkpointId}`);
    }

    // Save output to file if requested
    if (saveOutput) {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

      const finalOutputPath = outputPath || `deployments/upgrade_${network}_${timestamp}.json`;

      await saveUpgradeOutput(output, finalOutputPath);
      info(`\n💾 Upgrade output saved: ${finalOutputPath}`);
    }

    // Print summary
    info("\n" + "═".repeat(60));
    info("✨ UPGRADE COMPLETE");
    info("═".repeat(60));
    info(`⏱️  Total time: ${(output.summary.deploymentTime / 1000).toFixed(2)}s`);
    info(`⛽ Total gas: ${output.summary.gasUsed}`);
    info(`📦 Facets deployed: ${output.summary.totalFacetsDeployed}`);
    info(`⚙️  Configurations created: ${output.summary.configurationsCreated}`);
    if (proxyResults.length > 0) {
      info(`🔗 Proxies updated: ${output.summary.proxiesUpdated}/${proxyResults.length}`);
    }
    info("═".repeat(60));

    return output;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stackTrace = error instanceof Error ? error.stack : undefined;

    logError("\n❌ Upgrade failed:", errorMessage);

    // Mark checkpoint as failed if context was initialized
    if (ctx) {
      ctx.checkpoint.status = "failed";
      ctx.checkpoint.failure = {
        step: ctx.checkpoint.currentStep,
        stepName: getStepName(ctx.checkpoint.currentStep, "upgradeConfigurations"),
        error: errorMessage,
        timestamp: new Date().toISOString(),
        stackTrace,
      };

      try {
        await ctx.checkpointManager.saveCheckpoint(ctx.checkpoint);
        warn(`\n💾 Checkpoint saved with failure information: ${ctx.checkpoint.checkpointId}`);
        warn("   You can resume this upgrade by running again with the same network.");
      } catch (saveError) {
        warn(`   Warning: Could not save checkpoint: ${saveError}`);
      }
    }

    throw error;
  }
}

// ============================================================================
// Helpers
// ============================================================================

/**
 * Save upgrade output to JSON file.
 *
 * @param output - Upgrade output
 * @param filePath - File path to save to
 */
async function saveUpgradeOutput(output: UpgradeConfigurationsOutput, filePath: string): Promise<void> {
  try {
    const dir = dirname(filePath);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(output, null, 2), "utf-8");
    success("Upgrade output saved", { path: filePath });
  } catch (error) {
    warn(`Warning: Could not save upgrade output: ${error}`);
  }
}
