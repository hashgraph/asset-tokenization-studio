// SPDX-License-Identifier: Apache-2.0

/**
 * Complete ATS system deployment workflow.
 *
 * Orchestrates the deployment of the entire Asset Tokenization Studio infrastructure:
 * - ProxyAdmin for upgrade management
 * - BusinessLogicResolver (BLR) with proxy
 * - All facets (46 total, with optional TimeTravel variants)
 * - Facet registration in BLR
 * - Equity and Bond configurations
 * - Factory contract with proxy
 *
 * Provides comprehensive deployment output including all addresses, keys, config IDs,
 * versions, and optional Hedera Contract IDs.
 *
 * @module workflows/deploySystemWithNewBlr
 */
import { Signer, ContractFactory } from "ethers";
import {
  deployProxyAdmin,
  deployBlr,
  deployFacets,
  registerFacets,
  info,
  warn,
  error as logError,
  fetchHederaContractId,
  getDeploymentConfig,
  DEFAULT_BATCH_SIZE,
  GAS_LIMIT,
  isInstantMiningNetwork,
  CheckpointManager,
  NullCheckpointManager,
  saveDeploymentOutput,
  type DeploymentCheckpoint,
  type ResumeOptions,
  type DeploymentOutputType,
  formatCheckpointStatus,
  getStepName,
  getTotalSteps,
  toDeployBlrResult,
  toConfigurationData,
  convertCheckpointFacets,
  isSuccess,
  err,
  resolveCheckpointForResume,
} from "@scripts/infrastructure";
import {
  atsRegistry,
  deployFactory,
  createEquityConfiguration,
  createBondConfiguration,
  createBondFixedRateConfiguration,
  createBondKpiLinkedRateConfiguration,
  createLoanConfiguration,
  createLoansPortfolioConfiguration,
  createFactoryConfiguration,
  deployOrchestratorLibraries,
  hasOrchestratorLibraryAddresses,
  getFacetDefinition,
  // TEST-ONLY: InitializeMock domain — pulled in unconditionally; only used
  // when `useTimeTravel` is enabled (see "InitializeMock Configurations" step).
  createInitializeMockConfiguration,
  getAllMockFacets,
  getMockFacetDefinition,
  INITIALIZE_MOCK_CONFIG_ID,
} from "@scripts/domain";
import {
  BusinessLogicResolver__factory,
  IStaticFunctionSelectors__factory,
  ProxyAdmin__factory,
} from "@contract-types";
import { shouldFailAtStep, createTestFailureMessage } from "../infrastructure/testing/failureInjection";

/**
 * Options for complete system deployment.
 */
export interface DeploySystemWithNewBlrOptions extends ResumeOptions {
  /** Whether to use TimeTravel variants for facets */
  useTimeTravel?: boolean;

  /** Whether to save deployment output to file */
  saveOutput?: boolean;

  /** Whether to deploy facets in partial batches to avoid gas limits */
  partialBatchDeploy?: boolean;

  /** Batch size for partial deployments */
  batchSize?: number;

  /** Path to save deployment output (default: deployments/{network}/{network}-deployment-{timestamp}.json) */
  outputPath?: string;

  /** Number of confirmations for contract transactions */
  confirmations?: number;

  /** Enable retry mechanism for failed deployments (default: true) */
  enableRetry?: boolean;

  /** Enable post-deployment bytecode verification (default: true) */
  verifyDeployment?: boolean;

  /**
   * When true, only the Bond configuration is created.
   * Equity, Bond Fixed Rate, Bond KPI Linked Rate, Bond Sustainability Performance Target Rate,
   * Loan, and Loans Portfolio configurations are skipped.
   * Factory configuration and deployment are unaffected.
   */
  deployOnlyBondConfig?: boolean;

  /**
   * Submit facet deploy transactions in parallel chunks (size: `concurrency`).
   * Intended for pipeline runs against external nodes (e.g. Besu) where the
   * per-block wait dominates wall time.
   *
   * Implies `ignoreCheckpoint = true`: a fresh deployment per pipeline run, no
   * filesystem checkpoint I/O. Also disables facet-deploy retries internally
   * (NonceManager + retries leave permanent nonce gaps on failure).
   */
  parallelFacetDeployment?: boolean;

  /** Max in-flight deploy transactions when `parallelFacetDeployment` is on. Default: 20 */
  concurrency?: number;
}

/**
 * Deploy ATS system with new BLR.
 *
 * Executes the full deployment workflow:
 * 1. Deploy ProxyAdmin
 * 2. Deploy BusinessLogicResolver with proxy
 * 3. Deploy all facets (46 total)
 * 4. Register facets in BLR
 * 5. Create Equity configuration
 * 6. Create Bond configuration
 * 7. Deploy Factory with proxy
 *
 * Returns comprehensive deployment output with all addresses, keys, versions, and IDs.
 *
 * @param signer - Ethers.js signer for deploying contracts
 * @param network - Network name (testnet, mainnet, etc.)
 * @param options - Deployment options
 * @returns Promise resolving to complete deployment output
 *
 * @example
 * ```typescript
 * import { ethers } from 'ethers'
 *
 * // Create signer
 * const provider = new ethers.providers.JsonRpcProvider('https://testnet.hashio.io/api')
 * const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)
 *
 * // Deploy system with new BLR to testnet
 * const output = await deploySystemWithNewBlr(signer, 'hedera-testnet', {
 *     useTimeTravel: false,
 *     saveOutput: true
 * })
 *
 * info(`BLR Proxy: ${output.infrastructure.blr.proxy}`)
 * info(`Factory Proxy: ${output.infrastructure.factory.proxy}`)
 * info(`Equity Config Version: ${output.configurations.equity.version}`)
 * info(`Bond Config Version: ${output.configurations.bond.version}`)
 *
 * // For testing - get only equity or bond facets
 * const equityFacets = output.helpers.getEquityFacets()
 * const bondFacets = output.helpers.getBondFacets()
 * info(`Equity facets for testing: ${equityFacets.length}`)
 * info(`Bond facets for testing: ${bondFacets.length}`)
 * ```
 */
export async function deploySystemWithNewBlr(
  signer: Signer,
  network: string,
  options: DeploySystemWithNewBlrOptions = {},
): Promise<DeploymentOutputType> {
  // Get network-specific deployment configuration
  const networkConfig = getDeploymentConfig(network);

  const {
    useTimeTravel = false,
    saveOutput = true,
    partialBatchDeploy = false,
    batchSize = DEFAULT_BATCH_SIZE,
    outputPath,
    confirmations = networkConfig.confirmations,
    enableRetry = networkConfig.retryOptions.maxRetries > 0,
    verifyDeployment = networkConfig.verifyDeployment,
    deployOnlyBondConfig = false,
    parallelFacetDeployment = false,
    concurrency = 20,
    resumeFrom,
    autoResume = true,
    ignoreCheckpoint: rawIgnoreCheckpoint = false,
    deleteOnSuccess = false,
    checkpointDir,
  } = options;

  // Parallel facet deployment is meant for pipeline use — skip checkpoint I/O
  // so each run is a clean slate.
  const ignoreCheckpoint = parallelFacetDeployment ? true : rawIgnoreCheckpoint;

  const startTime = Date.now();
  const deployer = await signer.getAddress();
  const totalSteps = getTotalSteps("newBlr");

  info("🌟 ATS Complete System Deployment");
  info("═".repeat(60));
  info(`📡 Network: ${network}`);
  info(`👤 Deployer: ${deployer}`);
  info(`🔄 TimeTravel: ${useTimeTravel ? "Enabled" : "Disabled"}`);
  info(`⏱️  Confirmations (deploy): ${confirmations}`);
  info(`🔁 Retry: ${enableRetry ? "Enabled" : "Disabled"}`);
  info(`✅ Verification: ${verifyDeployment ? "Enabled" : "Disabled"}`);
  if (deployOnlyBondConfig) info(`⚡ Mode: Bond-only (Equity, Bond variants, Loan, LoansPortfolio skipped)`);
  if (parallelFacetDeployment) {
    info(`⚡ Parallel facet deployment: concurrency=${concurrency} (retries off, checkpoint skipped)`);
  }
  info("═".repeat(60));

  // Initialize checkpoint manager
  // Use NullCheckpointManager for tests to eliminate filesystem I/O overhead
  const checkpointManager = ignoreCheckpoint
    ? new NullCheckpointManager(network, checkpointDir)
    : new CheckpointManager(network, checkpointDir);
  let checkpoint: DeploymentCheckpoint | null = null;

  // Check for existing checkpoints if not explicitly ignoring
  if (!ignoreCheckpoint) {
    if (resumeFrom) {
      // Explicit checkpoint ID provided
      info(`\n🔄 Loading checkpoint: ${resumeFrom}`);
      checkpoint = await checkpointManager.loadCheckpoint(resumeFrom);

      if (!checkpoint) {
        throw new Error(`Checkpoint not found: ${resumeFrom}`);
      }

      info(`✅ Loaded checkpoint from ${checkpoint.startTime}`);
      info(formatCheckpointStatus(checkpoint));
    } else if (autoResume) {
      const resolved = await resolveCheckpointForResume(checkpointManager, network, "newBlr");
      if (resolved) {
        info(`\n🔍 Found resumable deployment: ${resolved.checkpointId}`);
        info(formatCheckpointStatus(resolved));
        info("🔄 Resuming from checkpoint...");
        checkpoint = resolved;
      }
    }
  }

  // Create new checkpoint if not resuming
  if (!checkpoint) {
    checkpoint = checkpointManager.createCheckpoint({
      network,
      deployer,
      workflowType: "newBlr",
      options: {
        useTimeTravel,
        confirmations,
        enableRetry,
        verifyDeployment,
        deployOnlyBondConfig,
        saveOutput,
        outputPath,
        partialBatchDeploy,
        batchSize,
        parallelFacetDeployment,
        concurrency,
      },
    });

    info(`\n📝 Created checkpoint: ${checkpoint.checkpointId}`);
    await checkpointManager.saveCheckpoint(checkpoint);
  }

  // Track total gas used
  let totalGasUsed = 0;

  try {
    // Step 0: Deploy ProxyAdmin
    let proxyAdmin: Awaited<ReturnType<typeof deployProxyAdmin>>;

    if (checkpoint.steps.proxyAdmin && checkpoint.currentStep >= 0) {
      info(`\n✓ Step 1/${totalSteps}: ProxyAdmin already deployed (resuming)`);
      // Reconstruct ProxyAdmin from checkpoint - need to reconnect to contract
      proxyAdmin = ProxyAdmin__factory.connect(checkpoint.steps.proxyAdmin.address, signer);
      info(`✅ ProxyAdmin: ${proxyAdmin.target as string}`);
    } else {
      info(`\n📋 Step 1/${totalSteps}: Deploying ProxyAdmin...`);
      proxyAdmin = await deployProxyAdmin(signer);

      info(`✅ ProxyAdmin: ${proxyAdmin.target as string}`);

      // Save checkpoint (ProxyAdmin doesn't have contractId property)
      checkpoint.steps.proxyAdmin = {
        address: proxyAdmin.target as string,
        txHash: "", // ProxyAdmin doesn't return tx hash currently
        deployedAt: new Date().toISOString(),
      };
      checkpoint.currentStep = 0;
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    // Testing hook: Step-level failure injection for checkpoint testing
    if (shouldFailAtStep("proxyAdmin")) {
      throw new Error(createTestFailureMessage("step", "proxyAdmin"));
    }

    // Step 1: Deploy BusinessLogicResolver
    let blrResult: Awaited<ReturnType<typeof deployBlr>>;

    if (checkpoint.steps.blr && checkpoint.currentStep >= 1) {
      info(`\n✓ Step 2/${totalSteps}: BLR already deployed (resuming)`);
      // Use converter to reconstruct full DeployBlrResult from checkpoint
      blrResult = toDeployBlrResult(checkpoint.steps.blr, checkpoint.steps.proxyAdmin?.address);
      info(`✅ BLR Implementation: ${blrResult.implementationAddress}`);
      info(`✅ BLR Proxy: ${blrResult.blrAddress}`);
    } else {
      info(`\n🔷 Step 2/${totalSteps}: Deploying BusinessLogicResolver...`);
      blrResult = await deployBlr(signer, {
        existingProxyAdmin: proxyAdmin,
      });

      if (!blrResult.success) {
        throw new Error(`BLR deployment failed: ${blrResult.error}`);
      }

      // BLR gas is tracked in proxyResult receipts
      info(`✅ BLR Implementation: ${blrResult.implementationAddress}`);
      info(`✅ BLR Proxy: ${blrResult.blrAddress}`);

      // Save checkpoint
      checkpoint.steps.blr = {
        address: blrResult.blrAddress,
        implementation: blrResult.implementationAddress,
        proxy: blrResult.blrAddress,
        txHash: "", // deployBlr doesn't return tx hash currently
        deployedAt: new Date().toISOString(),
      };
      checkpoint.currentStep = 1;
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    // Testing hook: Step-level failure injection for checkpoint testing
    if (shouldFailAtStep("blr")) {
      throw new Error(createTestFailureMessage("step", "blr"));
    }

    // Step 2a: Deploy orchestrator libraries (required for facet factory linking)
    if (!hasOrchestratorLibraryAddresses()) {
      info("\n📚 Deploying orchestrator libraries (required for facet linking)...");
      await deployOrchestratorLibraries(signer);
    } else {
      info("\n✓ Orchestrator library addresses already set");
    }

    // Step 2: Deploy all facets (with incremental checkpoint saves)
    let facetsResult: Awaited<ReturnType<typeof deployFacets>>;

    // Determine expected facet count for complete deployment check
    let expectedFacets = atsRegistry.getAllFacets();
    if (!useTimeTravel) {
      expectedFacets = expectedFacets.filter((f) => f.name !== "TimeTravelFacet");
    }
    const expectedFacetCount = expectedFacets.length;

    // Check if ALL facets are deployed (not just if some facets exist)
    // This fixes the partial resume bug where checkpoint.steps.facets could have
    // partial deployment (e.g., 50 facets) but code would skip to "all deployed"
    const allFacetsDeployed =
      checkpoint.steps.facets && checkpoint.steps.facets.size >= expectedFacetCount && checkpoint.currentStep >= 2;

    if (allFacetsDeployed && checkpoint.steps.facets) {
      info(`\n✓ Step 3/${totalSteps}: All facets already deployed (resuming)`);
      // Use converter to reconstruct facetsResult with proper DeploymentResult types
      facetsResult = {
        success: true,
        deployed: convertCheckpointFacets(checkpoint.steps.facets),
        failed: new Map(),
        skipped: new Map(), // No facets were skipped on resume
      };
      info(`✅ Loaded ${facetsResult.deployed.size} facets from checkpoint`);
    } else {
      info(`\n📦 Step 3/${totalSteps}: Deploying all facets...`);
      let allFacets = atsRegistry.getAllFacets();
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
      // When useTimeTravel=true, deploy TimeTravel variant facets instead of production ones
      // Skip facets without factories (abstract contracts like LockFacet)
      const facetFactories: Record<string, ContractFactory> = {};
      for (const facet of allFacets) {
        // Select factory: TimeTravel variant when available and enabled, else production
        const selectedFactory = useTimeTravel && facet.timeTravelFactory ? facet.timeTravelFactory : facet.factory;

        if (!selectedFactory) {
          info(`   Skipping ${facet.name} (abstract contract, no factory)`);
          continue;
        }

        const factory = selectedFactory(signer) as ContractFactory;
        // Use the actual contract name from the factory
        const contractName = factory.constructor.name.replace("__factory", "");

        // Skip if already deployed
        if (checkpoint.steps.facets.has(contractName)) {
          info(`   ✓ ${contractName} already deployed (skipping)`);
          continue;
        }

        facetFactories[contractName] = factory;
      }

      // TEST-ONLY: when `useTimeTravel` is enabled, also queue MockFacet1/2/3 for
      // deployment. They live outside the auto-generated atsRegistry (see
      // `scripts/domain/initializeMock/mockFacetsRegistry.ts`) so we add them here
      // alongside the production facets.
      if (useTimeTravel) {
        for (const mockFacet of getAllMockFacets()) {
          if (!mockFacet.factory) continue;
          const factory = mockFacet.factory(signer) as ContractFactory;
          const contractName = factory.constructor.name.replace("__factory", "");
          if (checkpoint.steps.facets.has(contractName)) {
            info(`   ✓ ${contractName} already deployed (skipping)`);
            continue;
          }
          facetFactories[contractName] = factory;
        }
      }

      // Deploy remaining facets
      if (Object.keys(facetFactories).length > 0) {
        info(`   Deploying ${Object.keys(facetFactories).length} remaining facets...`);

        // On real networks (Hedera) provide explicit gasLimit to skip eth_estimateGas.
        // On instant-mining networks (Hardhat/local) let ethers auto-estimate so large
        // contracts like TimeTravel facets get the gas they actually need.
        const facetOverrides = isInstantMiningNetwork(network) ? {} : { gasLimit: GAS_LIMIT.max };

        facetsResult = await deployFacets(facetFactories, {
          confirmations,
          enableRetry,
          verifyDeployment,
          overrides: facetOverrides,
          parallelFacetDeployment,
          concurrency,
        });

        // Always save deployed facets to checkpoint (even if some failed)
        // This enables resume from partial deployment
        facetsResult.deployed.forEach((deploymentResult, facetName) => {
          checkpoint.steps.facets!.set(facetName, {
            address: deploymentResult.address!,
            txHash: deploymentResult.transactionHash || "",
            gasUsed: deploymentResult.gasUsed?.toString(),
            deployedAt: new Date().toISOString(),
          });

          totalGasUsed += parseInt(deploymentResult.gasUsed?.toString() || "0");
        });

        // Save checkpoint with deployed facets before checking for failures
        checkpoint.currentStep = 2;
        await checkpointManager.saveCheckpoint(checkpoint);

        // Now check for failures - checkpoint already saved with partial progress
        if (!facetsResult.success) {
          const failedNames = Array.from(facetsResult.failed.keys()).join(", ");
          throw new Error(`Facet deployment had failures: ${failedNames}`);
        }

        // Merge checkpoint facets with newly deployed facets for complete result
        // This ensures the final facetsResult contains ALL deployed facets (both
        // from checkpoint and from this deployment batch)
        const checkpointFacets = checkpoint.steps.facets ? convertCheckpointFacets(checkpoint.steps.facets) : new Map();
        const mergedDeployed = new Map(checkpointFacets);
        facetsResult.deployed.forEach((result, name) => {
          mergedDeployed.set(name, result);
        });

        const newlyDeployedCount = facetsResult.deployed.size;
        facetsResult = {
          success: true,
          deployed: mergedDeployed,
          failed: new Map(),
          skipped: new Map(),
        };

        info(`✅ Deployed ${newlyDeployedCount} new facets (${mergedDeployed.size} total)`);
      } else {
        info("   All facets already deployed from previous checkpoint");
        // Use converter to reconstruct existing facets from checkpoint
        facetsResult = {
          success: true,
          deployed: convertCheckpointFacets(checkpoint.steps.facets),
          failed: new Map(),
          skipped: new Map(), // No facets were skipped
        };
      }
    }

    // Testing hook: Step-level failure injection for checkpoint testing
    if (shouldFailAtStep("facets")) {
      throw new Error(createTestFailureMessage("step", "facets"));
    }

    // Step 3: Register facets in BLR
    // Get BLR contract instance
    const blrContract = BusinessLogicResolver__factory.connect(blrResult.blrAddress, signer);

    if (checkpoint.steps.facetsRegistered && checkpoint.currentStep >= 3) {
      info(`\n✓ Step 4/${totalSteps}: Facets already registered in BLR (resuming)`);
    } else {
      info(`\n📝 Step 4/${totalSteps}: Registering facets in BLR...`);

      // Prepare facets with resolver keys from offline registry (avoids 101 parallel eth_call)
      const facetsToRegister = Array.from(facetsResult.deployed.entries()).map(([facetName, deploymentResult]) => {
        if (!deploymentResult.address) {
          throw new Error(`No address for facet: ${facetName}`);
        }

        // Strip "TimeTravel" suffix to get canonical name
        const baseName = facetName.replace(/TimeTravel$/, "");
        // TEST-ONLY: fall back to the mock registry so the three MockFacets
        // (deployed only under `useTimeTravel`) can be registered alongside
        // production facets.
        const facetDef = getFacetDefinition(baseName) ?? getMockFacetDefinition(baseName);

        if (!facetDef?.resolverKey?.value) {
          throw new Error(`Facet ${baseName} not found in registry or missing resolver key`);
        }

        return {
          name: facetName,
          address: deploymentResult.address,
          resolverKey: facetDef.resolverKey.value,
        };
      });

      const registerResult = await registerFacets(blrContract, {
        facets: facetsToRegister,
        // Besu/parallel-deploy nodes can fit a larger registration batch under
        // their block gas limit; raise from the default 10 to 25
        ...(parallelFacetDeployment ? { batchSize: 25 } : {}),
      });

      if (!registerResult.success) {
        throw new Error(`Facet registration failed: ${registerResult.error}`);
      }

      totalGasUsed += registerResult.transactionGas?.reduce((sum, gas) => sum + gas, 0) ?? 0;
      info(`✅ Registered ${registerResult.registered.length} facets in BLR`);

      if (registerResult.failed.length > 0) {
        warn(`⚠️  ${registerResult.failed.length} facets failed registration`);
      }

      // Save checkpoint
      checkpoint.steps.facetsRegistered = true;
      checkpoint.currentStep = 3;
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    // Testing hook: Step-level failure injection for checkpoint testing
    if (shouldFailAtStep("register")) {
      throw new Error(createTestFailureMessage("step", "register"));
    }

    // Build facetAddresses map for configuration creation
    const facetAddresses: Record<string, string> = {};
    facetsResult.deployed.forEach((deploymentResult, facetName) => {
      if (deploymentResult.address) {
        facetAddresses[facetName] = deploymentResult.address;
      }
    });

    // Step 4: Create Equity configuration
    let equityConfig: Awaited<ReturnType<typeof createEquityConfiguration>>;

    if (checkpoint.steps.configurations?.equity && checkpoint.currentStep >= 4) {
      info(`\n✓ Step 5/${totalSteps}: Equity configuration already created (resuming)`);
      const equityConfigData = checkpoint.steps.configurations.equity;
      info(`✅ Equity Config ID: ${equityConfigData.configId}`);
      info(`✅ Equity Version: ${equityConfigData.version}`);
      info(`✅ Equity Facets: ${equityConfigData.facetCount}`);

      // Use converter to reconstruct full ConfigurationData from checkpoint
      equityConfig = toConfigurationData(equityConfigData);
    } else if (deployOnlyBondConfig) {
      info(`\n⏭️  Step 5/${totalSteps}: Equity configuration skipped (deployOnlyBondConfig)`);
      equityConfig = err("SKIPPED", "Skipped by deployOnlyBondConfig");
      checkpoint.currentStep = 4;
      await checkpointManager.saveCheckpoint(checkpoint);
    } else {
      info(`\n💼 Step 5/${totalSteps}: Creating Equity configuration...`);

      equityConfig = await createEquityConfiguration(
        blrContract,
        facetAddresses,
        useTimeTravel,
        partialBatchDeploy,
        batchSize,
        confirmations,
      );

      if (!equityConfig.success) {
        throw new Error(`Equity config creation failed: ${equityConfig.error} - ${equityConfig.message}`);
      }

      info(`✅ Equity Config ID: ${equityConfig.data.configurationId}`);
      info(`✅ Equity Version: ${equityConfig.data.version}`);
      info(`✅ Equity Facets: ${equityConfig.data.facetKeys.length}`);

      // Save checkpoint
      if (!checkpoint.steps.configurations) {
        checkpoint.steps.configurations = {};
      }
      checkpoint.steps.configurations.equity = {
        configId: equityConfig.data.configurationId,
        version: equityConfig.data.version,
        facetCount: equityConfig.data.facetKeys.length,
        txHash: "", // createEquityConfiguration doesn't return tx hash currently
      };
      checkpoint.currentStep = 4;
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    // Testing hook: Step-level failure injection for checkpoint testing
    if (shouldFailAtStep("equity")) {
      throw new Error(createTestFailureMessage("step", "equity"));
    }

    // Step 5: Create Bond configuration
    let bondConfig: Awaited<ReturnType<typeof createBondConfiguration>>;

    if (checkpoint.steps.configurations?.bond && checkpoint.currentStep >= 5) {
      info(`\n✓ Step 6/${totalSteps}: Bond configuration already created (resuming)`);
      const bondConfigData = checkpoint.steps.configurations.bond;
      info(`✅ Bond Config ID: ${bondConfigData.configId}`);
      info(`✅ Bond Version: ${bondConfigData.version}`);
      info(`✅ Bond Facets: ${bondConfigData.facetCount}`);

      // Use converter to reconstruct full ConfigurationData from checkpoint
      bondConfig = toConfigurationData(bondConfigData);
    } else {
      info(`\n🏦 Step 6/${totalSteps}: Creating Bond configuration...`);

      bondConfig = await createBondConfiguration(
        blrContract,
        facetAddresses,
        useTimeTravel,
        partialBatchDeploy,
        batchSize,
        confirmations,
      );

      if (!bondConfig.success) {
        throw new Error(`Bond config creation failed: ${bondConfig.error} - ${bondConfig.message}`);
      }

      info(`✅ Bond Config ID: ${bondConfig.data.configurationId}`);
      info(`✅ Bond Version: ${bondConfig.data.version}`);
      info(`✅ Bond Facets: ${bondConfig.data.facetKeys.length}`);

      // Save checkpoint
      if (!checkpoint.steps.configurations) checkpoint.steps.configurations = {};
      checkpoint.steps.configurations.bond = {
        configId: bondConfig.data.configurationId,
        version: bondConfig.data.version,
        facetCount: bondConfig.data.facetKeys.length,
        txHash: "", // createBondConfiguration doesn't return tx hash currently
      };
      checkpoint.currentStep = 5;
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    // Testing hook: Step-level failure injection for checkpoint testing
    if (shouldFailAtStep("bond")) {
      throw new Error(createTestFailureMessage("step", "bond"));
    }

    // Step 6: Create Bond Fixed Rate configuration
    let bondFixedRateConfig: Awaited<ReturnType<typeof createBondFixedRateConfiguration>>;

    if (checkpoint.steps.configurations?.bondFixedRate && checkpoint.currentStep >= 6) {
      info(`\n✓ Step 7/${totalSteps}: Bond FixedRate configuration already created (resuming)`);
      const bondFixedRateConfigData = checkpoint.steps.configurations.bondFixedRate;
      info(`✅ Bond FixedRate Config ID: ${bondFixedRateConfigData.configId}`);
      info(`✅ Bond FixedRate Version: ${bondFixedRateConfigData.version}`);
      info(`✅ Bond FixedRate Facets: ${bondFixedRateConfigData.facetCount}`);

      // Use converter to reconstruct full ConfigurationData from checkpoint
      bondFixedRateConfig = toConfigurationData(bondFixedRateConfigData);
    } else if (deployOnlyBondConfig) {
      info(`\n⏭️  Step 7/${totalSteps}: Bond FixedRate configuration skipped (deployOnlyBondConfig)`);
      bondFixedRateConfig = err("SKIPPED", "Skipped by deployOnlyBondConfig");
      checkpoint.currentStep = 6;
      await checkpointManager.saveCheckpoint(checkpoint);
    } else {
      info(`\n🏦 Step 7/${totalSteps}: Creating Bond FixedRate configuration...`);

      bondFixedRateConfig = await createBondFixedRateConfiguration(
        blrContract,
        facetAddresses,
        useTimeTravel,
        partialBatchDeploy,
        batchSize,
        confirmations,
      );

      if (!bondFixedRateConfig.success) {
        throw new Error(
          `Bond FixedRate config creation failed: ${bondFixedRateConfig.error} - ${bondFixedRateConfig.message}`,
        );
      }

      info(`✅ Bond FixedRate Config ID: ${bondFixedRateConfig.data.configurationId}`);
      info(`✅ Bond FixedRate Version: ${bondFixedRateConfig.data.version}`);
      info(`✅ Bond FixedRate Facets: ${bondFixedRateConfig.data.facetKeys.length}`);

      // Save checkpoint
      checkpoint.steps.configurations!.bondFixedRate = {
        configId: bondFixedRateConfig.data.configurationId,
        version: bondFixedRateConfig.data.version,
        facetCount: bondFixedRateConfig.data.facetKeys.length,
        txHash: "", // createBondFixedRateConfiguration doesn't return tx hash currently
      };
      checkpoint.currentStep = 6;
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    // Testing hook: Step-level failure injection for checkpoint testing
    if (shouldFailAtStep("bondFixedRate")) {
      throw new Error(createTestFailureMessage("step", "bondFixedRate"));
    }

    // Step 7: Create Bond KpiLinked Rate configuration
    let bondKpiLinkedRateConfig: Awaited<ReturnType<typeof createBondKpiLinkedRateConfiguration>>;

    if (checkpoint.steps.configurations?.bondKpiLinkedRate && checkpoint.currentStep >= 7) {
      info(`\n✓ Step 8/${totalSteps}: Bond KpiLinkedRate configuration already created (resuming)`);
      const bondKpiLinkedRateConfigData = checkpoint.steps.configurations.bondKpiLinkedRate;
      info(`✅ Bond KpiLinkedRate Config ID: ${bondKpiLinkedRateConfigData.configId}`);
      info(`✅ Bond KpiLinkedRate Version: ${bondKpiLinkedRateConfigData.version}`);
      info(`✅ Bond KpiLinkedRate Facets: ${bondKpiLinkedRateConfigData.facetCount}`);

      // Use converter to reconstruct full ConfigurationData from checkpoint
      bondKpiLinkedRateConfig = toConfigurationData(bondKpiLinkedRateConfigData);
    } else if (deployOnlyBondConfig) {
      info(`\n⏭️  Step 8/${totalSteps}: Bond KpiLinkedRate configuration skipped (deployOnlyBondConfig)`);
      bondKpiLinkedRateConfig = err("SKIPPED", "Skipped by deployOnlyBondConfig");
      checkpoint.currentStep = 7;
      await checkpointManager.saveCheckpoint(checkpoint);
    } else {
      info(`\n🏦 Step 8/${totalSteps}: Creating Bond KpiLinkedRate configuration...`);

      bondKpiLinkedRateConfig = await createBondKpiLinkedRateConfiguration(
        blrContract,
        facetAddresses,
        useTimeTravel,
        partialBatchDeploy,
        batchSize,
        confirmations,
      );

      if (!bondKpiLinkedRateConfig.success) {
        throw new Error(
          `Bond KpiLinkedRate config creation failed: ${bondKpiLinkedRateConfig.error} - ${bondKpiLinkedRateConfig.message}`,
        );
      }

      info(`✅ Bond KpiLinkedRate Config ID: ${bondKpiLinkedRateConfig.data.configurationId}`);
      info(`✅ Bond KpiLinkedRate Version: ${bondKpiLinkedRateConfig.data.version}`);
      info(`✅ Bond KpiLinkedRate Facets: ${bondKpiLinkedRateConfig.data.facetKeys.length}`);

      // Save checkpoint
      checkpoint.steps.configurations!.bondKpiLinkedRate = {
        configId: bondKpiLinkedRateConfig.data.configurationId,
        version: bondKpiLinkedRateConfig.data.version,
        facetCount: bondKpiLinkedRateConfig.data.facetKeys.length,
        txHash: "", // createBondKpiLinkedRateConfiguration doesn't return tx hash currently
      };
      checkpoint.currentStep = 7;
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    // Testing hook: Step-level failure injection for checkpoint testing
    if (shouldFailAtStep("bondKpiLinkedRate")) {
      throw new Error(createTestFailureMessage("step", "bondKpiLinkedRate"));
    }

    // Step 8: Create Loan configuration
    let loanConfig: Awaited<ReturnType<typeof createLoanConfiguration>>;

    if (checkpoint.steps.configurations?.loan && checkpoint.currentStep >= 8) {
      info(`\n✓ Step 9/${totalSteps}: Loan configuration already created (resuming)`);
      const loanConfigData = checkpoint.steps.configurations.loan;
      info(`✅ Loan Config ID: ${loanConfigData.configId}`);
      info(`✅ Loan Version: ${loanConfigData.version}`);
      info(`✅ Loan Facets: ${loanConfigData.facetCount}`);

      loanConfig = toConfigurationData(loanConfigData);
    } else if (deployOnlyBondConfig) {
      info(`\n⏭️  Step 10/${totalSteps}: Loan configuration skipped (deployOnlyBondConfig)`);
      loanConfig = err("SKIPPED", "Skipped by deployOnlyBondConfig");
      checkpoint.currentStep = 9;
      await checkpointManager.saveCheckpoint(checkpoint);
    } else {
      info(`\n📄 Step 9/${totalSteps}: Creating Loan configuration...`);

      loanConfig = await createLoanConfiguration(
        blrContract,
        facetAddresses,
        useTimeTravel,
        partialBatchDeploy,
        batchSize,
        confirmations,
      );

      if (!loanConfig.success) {
        throw new Error(`Loan config creation failed: ${loanConfig.error} - ${loanConfig.message}`);
      }

      info(`✅ Loan Config ID: ${loanConfig.data.configurationId}`);
      info(`✅ Loan Version: ${loanConfig.data.version}`);
      info(`✅ Loan Facets: ${loanConfig.data.facetKeys.length}`);

      if (!checkpoint.steps.configurations) {
        checkpoint.steps.configurations = {};
      }
      checkpoint.steps.configurations.loan = {
        configId: loanConfig.data.configurationId,
        version: loanConfig.data.version,
        facetCount: loanConfig.data.facetKeys.length,
        txHash: "",
      };
      checkpoint.currentStep = 8;
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    if (shouldFailAtStep("loan")) {
      throw new Error(createTestFailureMessage("step", "loan"));
    }

    // Step 9: Create Loans Portfolio configuration
    let loansPortfolioConfig: Awaited<ReturnType<typeof createLoansPortfolioConfiguration>>;

    if (checkpoint.steps.configurations?.loansPortfolio && checkpoint.currentStep >= 9) {
      info(`\n✓ Step 10/${totalSteps}: Loans Portfolio configuration already created (resuming)`);
      const loansPortfolioConfigData = checkpoint.steps.configurations.loansPortfolio;
      info(`✅ Loans Portfolio Config ID: ${loansPortfolioConfigData.configId}`);
      info(`✅ Loans Portfolio Version: ${loansPortfolioConfigData.version}`);
      info(`✅ Loans Portfolio Facets: ${loansPortfolioConfigData.facetCount}`);

      loansPortfolioConfig = toConfigurationData(loansPortfolioConfigData);
    } else if (deployOnlyBondConfig) {
      info(`\n⏭️  Step 11/${totalSteps}: Loans Portfolio configuration skipped (deployOnlyBondConfig)`);
      loansPortfolioConfig = err("SKIPPED", "Skipped by deployOnlyBondConfig");
      checkpoint.currentStep = 10;
      await checkpointManager.saveCheckpoint(checkpoint);
    } else {
      info(`\n📄 Step 10/${totalSteps}: Creating Loans Portfolio configuration...`);

      loansPortfolioConfig = await createLoansPortfolioConfiguration(
        blrContract,
        facetAddresses,
        useTimeTravel,
        partialBatchDeploy,
        batchSize,
        confirmations,
      );

      if (!loansPortfolioConfig.success) {
        throw new Error(
          `Loans Portfolio config creation failed: ${loansPortfolioConfig.error} - ${loansPortfolioConfig.message}`,
        );
      }

      info(`✅ Loans Portfolio Config ID: ${loansPortfolioConfig.data.configurationId}`);
      info(`✅ Loans Portfolio Version: ${loansPortfolioConfig.data.version}`);
      info(`✅ Loans Portfolio Facets: ${loansPortfolioConfig.data.facetKeys.length}`);

      if (!checkpoint.steps.configurations) {
        checkpoint.steps.configurations = {};
      }
      checkpoint.steps.configurations.loansPortfolio = {
        configId: loansPortfolioConfig.data.configurationId,
        version: loansPortfolioConfig.data.version,
        facetCount: loansPortfolioConfig.data.facetKeys.length,
        txHash: "",
      };
      checkpoint.currentStep = 9;
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    if (shouldFailAtStep("loansPortfolio")) {
      throw new Error(createTestFailureMessage("step", "loansPortfolio"));
    }

    // ====================================================================
    // TEST-ONLY: Step 12 — InitializeMock Configurations.
    //
    // Sets up the InitializeMock domain in the BLR so the
    // initializer-versioning tests can deploy a ResolverProxy that combines
    // different per-facet versions.
    //
    // Step 2/3 already deployed and registered v1 of `InitializerFacet`,
    // `MockFacet1`, `MockFacet2` and `MockFacet3`. Here we additionally:
    //   - deploy two extra fresh copies of each of `MockFacet1`, `MockFacet2`
    //     and `MockFacet3` and register them in the BLR. Each registration
    //     bumps the facet's BLR version, so after this loop the BLR holds
    //     three distinct versions of every MockFacet, all backed by identical
    //     bytecode but different addresses. `InitializerFacet` stays at v1
    //     (no other config references higher versions of it).
    //   - mint two versions of `INITIALIZE_MOCK_CONFIG_ID`, each pinning an
    //     explicit per-facet version map:
    //       v1: { InitializerFacet:1, MockFacet1:1, MockFacet2:2, MockFacet3:1 }
    //       v2: { InitializerFacet:1, MockFacet1:3, MockFacet2:3, MockFacet3:3 }
    //
    // Only executed under `useTimeTravel`; skipped (but the step slot is still
    // advanced) otherwise so Factory's step index stays stable across runs.
    //
    // Idempotency: before redeploying extra MockFacet copies we read the
    // current BLR version for each. If it is already >= 3 we skip the deploys
    // (e.g. when a previous failed run already minted them) — this prevents
    // version drift that would break the pinned 1/2/3 mapping.
    // ====================================================================
    let initializeMockVersions: number[] = [];

    // TEST-ONLY: per-version facet-version maps. Order matters — index `i` is
    // configId version `i + 1`. `MockDiamondCut` is pinned at v1 in both
    // versions: it is only registered once in Step 3 and is included so the
    // resulting ResolverProxy exposes `updateConfigVersion` / `getConfigInfo`
    // through its mock variant of `DiamondFacet`.
    const INITIALIZE_MOCK_VERSION_MAPS: Array<Record<string, number>> = [
      { InitializerFacet: 1, MockDiamondCut: 1, MockFacet1: 1, MockFacet2: 2, MockFacet3: 1 },
      { InitializerFacet: 1, MockDiamondCut: 1, MockFacet1: 3, MockFacet2: 3, MockFacet3: 3 },
    ];
    // TEST-ONLY: target BLR version count for the three MockFacets (v1 minted
    // in Step 3, so we add v2 and v3 here). InitializerFacet is intentionally
    // excluded — only its v1 is referenced by either configId version.
    const MOCK_FACET_TARGET_VERSIONS = 3;
    const MOCK_FACET_NAMES_TO_MULTIPLY = ["MockFacet1", "MockFacet2", "MockFacet3"] as const;

    if (checkpoint.steps.configurations?.initializeMock && checkpoint.currentStep >= 11) {
      info(`\n✓ Step 12/${totalSteps}: InitializeMock configurations already created (resuming)`);
      const data = checkpoint.steps.configurations.initializeMock;
      initializeMockVersions = data.versions;
      info(`✅ InitializeMock Config ID: ${data.configId}`);
      info(`✅ InitializeMock Versions: [${data.versions.join(", ")}]`);
      info(`✅ InitializeMock Facets: ${data.facetCount}`);
    } else if (useTimeTravel) {
      info(`\n🧪 Step 12/${totalSteps}: Creating InitializeMock domain (3 MockFacet versions + 2 configIds)...`);

      // TEST-ONLY: bring each MockFacet's BLR version count up to 3 by
      // deploying and registering additional copies. Query current versions
      // first so a partial retry does not over-bump.
      const mockFacetDefs = MOCK_FACET_NAMES_TO_MULTIPLY.map((name) => {
        const facetDef = getMockFacetDefinition(name);
        if (!facetDef?.factory || !facetDef?.resolverKey?.value) {
          throw new Error(`Mock facet ${name} missing factory or resolver key`);
        }
        return { name, factory: facetDef.factory, resolverKey: facetDef.resolverKey.value };
      });

      const currentVersionsRaw = await blrContract.getLatestVersions(mockFacetDefs.map((f) => f.resolverKey));
      const currentVersions = currentVersionsRaw.map((v) => Number(v));

      for (let idx = 0; idx < mockFacetDefs.length; idx++) {
        const { name, factory, resolverKey } = mockFacetDefs[idx];
        const startVersion = currentVersions[idx];

        if (startVersion >= MOCK_FACET_TARGET_VERSIONS) {
          info(`   ✓ ${name} already at v${startVersion} in BLR (skipping extra deploys)`);
          continue;
        }

        for (let nextVersion = startVersion + 1; nextVersion <= MOCK_FACET_TARGET_VERSIONS; nextVersion++) {
          info(`   📦 Deploying ${name} v${nextVersion} (extra copy)...`);
          const factoriesForRound: Record<string, ContractFactory> = {
            [`${name}@v${nextVersion}`]: factory(signer) as ContractFactory,
          };
          const deployResult = await deployFacets(factoriesForRound, {
            confirmations,
            enableRetry,
            verifyDeployment,
          });
          if (!deployResult.success) {
            const failedNames = Array.from(deployResult.failed.keys()).join(", ");
            throw new Error(`InitializeMock extra deploy failed for: ${failedNames}`);
          }
          const deployed = deployResult.deployed.get(`${name}@v${nextVersion}`);
          if (!deployed?.address) {
            throw new Error(`InitializeMock extra deploy returned no address for ${name} v${nextVersion}`);
          }

          info(`   📝 Registering ${name} v${nextVersion} (${deployed.address}) in BLR...`);
          const registerResult = await registerFacets(blrContract, {
            facets: [{ name: `${name}@v${nextVersion}`, address: deployed.address, resolverKey }],
          });
          if (!registerResult.success) {
            throw new Error(
              `InitializeMock extra register failed for ${name} v${nextVersion}: ${registerResult.error}`,
            );
          }
          totalGasUsed += registerResult.transactionGas?.reduce((sum, gas) => sum + gas, 0) ?? 0;
        }
      }

      // TEST-ONLY: mint configId versions in order, each pinning its own
      // facet-version map.
      let lastFacetCount = 0;
      for (let i = 0; i < INITIALIZE_MOCK_VERSION_MAPS.length; i++) {
        const facetVersions = INITIALIZE_MOCK_VERSION_MAPS[i];
        const result = await createInitializeMockConfiguration(
          blrContract,
          facetAddresses,
          facetVersions,
          partialBatchDeploy,
          batchSize,
          confirmations,
        );

        if (!result.success) {
          throw new Error(`InitializeMock config (run ${i + 1}) failed: ${result.error} - ${result.message}`);
        }

        initializeMockVersions.push(result.data.version);
        lastFacetCount = result.data.facetKeys.length;
        const pinned = Object.entries(facetVersions)
          .map(([n, v]) => `${n}=v${v}`)
          .join(", ");
        info(
          `   ✅ Run ${i + 1}/${INITIALIZE_MOCK_VERSION_MAPS.length} → configId v${result.data.version} [${pinned}]`,
        );
      }

      info(`✅ InitializeMock Config ID: ${INITIALIZE_MOCK_CONFIG_ID}`);
      info(`✅ InitializeMock Versions: [${initializeMockVersions.join(", ")}]`);
      info(`✅ InitializeMock Facets: ${lastFacetCount}`);

      if (!checkpoint.steps.configurations) {
        checkpoint.steps.configurations = {};
      }
      checkpoint.steps.configurations.initializeMock = {
        configId: INITIALIZE_MOCK_CONFIG_ID,
        facetCount: lastFacetCount,
        versions: initializeMockVersions,
      };
      checkpoint.currentStep = 11;
      await checkpointManager.saveCheckpoint(checkpoint);
    } else {
      // TEST-ONLY: still advance currentStep so Factory's index stays stable
      // when running without `useTimeTravel`.
      info(`\n⏭️  Step 12/${totalSteps}: InitializeMock skipped (useTimeTravel disabled)`);
      checkpoint.currentStep = 11;
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    // TEST-ONLY: failure injection hook for checkpoint testing of the mock step.
    if (shouldFailAtStep("initializeMock")) {
      throw new Error(createTestFailureMessage("step", "initializeMock"));
    }

    // Step 11: Create Factory configuration (MUST precede FactoryProxy construction)
    let factoryConfig: Awaited<ReturnType<typeof createFactoryConfiguration>>;

    if (checkpoint.steps.configurations?.factory && checkpoint.currentStep >= 10) {
      info(`\n✓ Step 11/${totalSteps}: Factory configuration already created (resuming)`);
      const factoryConfigData = checkpoint.steps.configurations.factory;
      info(`✅ Factory Config ID: ${factoryConfigData.configId}`);
      info(`✅ Factory Version: ${factoryConfigData.version}`);
      info(`✅ Factory Facets: ${factoryConfigData.facetCount}`);
      factoryConfig = toConfigurationData(factoryConfigData);
    } else {
      info(`\n🏭 Step 11/${totalSteps}: Creating Factory configuration...`);
      factoryConfig = await createFactoryConfiguration(
        blrContract,
        facetAddresses,
        useTimeTravel,
        partialBatchDeploy,
        batchSize,
        confirmations,
      );

      if (!factoryConfig.success) {
        throw new Error(`Factory config creation failed: ${factoryConfig.error} - ${factoryConfig.message}`);
      }

      info(`✅ Factory Config ID: ${factoryConfig.data.configurationId}`);
      info(`✅ Factory Version: ${factoryConfig.data.version}`);
      info(`✅ Factory Facets: ${factoryConfig.data.facetKeys.length}`);
      info(`Registered FactoryConfig v${factoryConfig.data.version} before constructing FactoryProxy`);

      if (!checkpoint.steps.configurations) {
        checkpoint.steps.configurations = {};
      }
      checkpoint.steps.configurations.factory = {
        configId: factoryConfig.data.configurationId,
        version: factoryConfig.data.version,
        facetCount: factoryConfig.data.facetKeys.length,
        txHash: "",
      };
      checkpoint.currentStep = 10;
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    if (shouldFailAtStep("factoryConfig")) {
      throw new Error(createTestFailureMessage("step", "factoryConfig"));
    }

    // Step 11: Deploy Factory as ResolverProxy
    let factoryResult: Awaited<ReturnType<typeof deployFactory>>;
    const factoryFacetAddress = facetAddresses["FactoryFacet"];
    const factoryVersion = factoryConfig && isSuccess(factoryConfig) ? factoryConfig.data.version : 1;

    if (checkpoint.steps.factory && checkpoint.currentStep >= 11) {
      info(`\n✓ Step 12/${totalSteps}: Factory already deployed (resuming)`);
      factoryResult = {
        success: true,
        factoryAddress: checkpoint.steps.factory.proxy,
      };
      info(`✅ Factory Implementation: ${checkpoint.steps.factory.implementation}`);
      info(`✅ Factory Proxy: ${checkpoint.steps.factory.proxy}`);
    } else {
      info(`\n🏭 Step 12/${totalSteps}: Deploying Factory (ResolverProxy)...`);
      factoryResult = await deployFactory(signer, {
        blrAddress: blrResult.blrAddress,
        factoryVersion,
      });

      if (!factoryResult.success) {
        throw new Error(`Factory deployment failed: ${factoryResult.error}`);
      }

      info(`✅ Factory Implementation: ${factoryFacetAddress}`);
      info(`✅ Factory Proxy: ${factoryResult.factoryAddress}`);

      // Save checkpoint
      checkpoint.steps.factory = {
        address: factoryResult.factoryAddress,
        implementation: factoryFacetAddress,
        proxy: factoryResult.factoryAddress,
        txHash: "",
        deployedAt: new Date().toISOString(),
      };
      checkpoint.currentStep = 11;
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    // Testing hook: Step-level failure injection for checkpoint testing
    if (shouldFailAtStep("factory")) {
      throw new Error(createTestFailureMessage("step", "factory"));
    }

    // Get Hedera Contract IDs if on Hedera network
    const getContractId = async (address: string) => {
      return network.toLowerCase().includes("hedera") ? await fetchHederaContractId(network, address) : undefined;
    };

    const output: DeploymentOutputType = {
      network,
      timestamp: new Date().toISOString(),
      deployer,

      infrastructure: {
        proxyAdmin: {
          address: proxyAdmin.target as string,
          contractId: await getContractId(proxyAdmin.target as string),
        },
        blr: {
          implementation: blrResult.implementationAddress,
          implementationContractId: await getContractId(blrResult.implementationAddress),
          proxy: blrResult.blrAddress,
          proxyContractId: await getContractId(blrResult.blrAddress),
        },
        factory: {
          implementation: facetAddresses["FactoryFacet"],
          implementationContractId: await getContractId(facetAddresses["FactoryFacet"]),
          proxy: factoryResult.factoryAddress,
          proxyContractId: await getContractId(factoryResult.factoryAddress),
        },
      },

      facets: await (async () => {
        // Pass 1: resolve keys in parallel (some require an on-chain call)
        const facetEntries = await Promise.all(
          Array.from(facetsResult.deployed.entries()).map(async ([facetName, deploymentResult]) => {
            const facetAddress = deploymentResult.address!;

            // Find matching key from config (use type guard to access .data property)
            const equityFacet = isSuccess(equityConfig)
              ? equityConfig.data.facetKeys.find((ef) => ef.address === facetAddress)
              : undefined;
            const bondFacet = isSuccess(bondConfig)
              ? bondConfig.data.facetKeys.find((bf) => bf.address === facetAddress)
              : undefined;
            const bondFixedRateFacet = isSuccess(bondFixedRateConfig)
              ? bondFixedRateConfig.data.facetKeys.find((bf) => bf.address === facetAddress)
              : undefined;
            const bondKpiLinkedRateFacet = isSuccess(bondKpiLinkedRateConfig)
              ? bondKpiLinkedRateConfig.data.facetKeys.find((bf) => bf.address === facetAddress)
              : undefined;
            const staticFunctionSelectors = IStaticFunctionSelectors__factory.connect(facetAddress, signer);
            const key =
              equityFacet?.key ||
              bondFacet?.key ||
              bondFixedRateFacet?.key ||
              bondKpiLinkedRateFacet?.key ||
              (await staticFunctionSelectors.getStaticResolverKey());

            return { facetName, facetAddress, key };
          }),
        );

        // Pass 2: single batch call to fetch all registered versions from BLR
        const allKeys = facetEntries.map((e) => e.key);
        const rawVersions = await blrContract.getLatestVersions(allKeys);
        const versionByKey = new Map(allKeys.map((k, i) => [k, Number(rawVersions[i])]));

        // Pass 3: assemble final output with contractId (parallel) and version
        return Promise.all(
          facetEntries.map(async ({ facetName, facetAddress, key }) => ({
            name: facetName,
            address: facetAddress,
            contractId: await getContractId(facetAddress),
            key,
            version: versionByKey.get(key) ?? undefined,
          })),
        );
      })(),

      configurations: {
        equity: isSuccess(equityConfig)
          ? {
              configId: equityConfig.data.configurationId,
              version: equityConfig.data.version,
              facetCount: equityConfig.data.facetKeys.length,
              facets: equityConfig.data.facetKeys,
            }
          : {
              configId: "",
              version: 0,
              facetCount: 0,
              facets: [],
            },
        bond: isSuccess(bondConfig)
          ? {
              configId: bondConfig.data.configurationId,
              version: bondConfig.data.version,
              facetCount: bondConfig.data.facetKeys.length,
              facets: bondConfig.data.facetKeys,
            }
          : {
              configId: "",
              version: 0,
              facetCount: 0,
              facets: [],
            },
        bondFixedRate: isSuccess(bondFixedRateConfig)
          ? {
              configId: bondFixedRateConfig.data.configurationId,
              version: bondFixedRateConfig.data.version,
              facetCount: bondFixedRateConfig.data.facetKeys.length,
              facets: bondFixedRateConfig.data.facetKeys,
            }
          : {
              configId: "",
              version: 0,
              facetCount: 0,
              facets: [],
            },
        bondKpiLinkedRate: isSuccess(bondKpiLinkedRateConfig)
          ? {
              configId: bondKpiLinkedRateConfig.data.configurationId,
              version: bondKpiLinkedRateConfig.data.version,
              facetCount: bondKpiLinkedRateConfig.data.facetKeys.length,
              facets: bondKpiLinkedRateConfig.data.facetKeys,
            }
          : {
              configId: "",
              version: 0,
              facetCount: 0,
              facets: [],
            },
      },

      summary: {
        totalContracts: 3, // ProxyAdmin, BLR, Factory
        totalFacets: facetsResult.deployed.size,
        // Bond + Factory (bond-only) or Equity + Bond + BondFixedRate + BondKpiLinkedRate + Loan + LoansPortfolio + Factory
        totalConfigurations: deployOnlyBondConfig ? 2 : 7,
        deploymentTime: Date.now() - startTime,
        gasUsed: totalGasUsed.toString(),
        success: true,
      },

      helpers: {
        getEquityFacets() {
          // Use type guard to safely access .data property
          if (!isSuccess(equityConfig)) return [];
          const equityKeys = new Set(equityConfig.data.facetKeys.map((f) => f.key));
          return output.facets.filter((facet) => equityKeys.has(facet.key));
        },
        getBondFacets() {
          // Use type guard to safely access .data property
          if (!isSuccess(bondConfig)) return [];
          const bondKeys = new Set(bondConfig.data.facetKeys.map((f) => f.key));
          return output.facets.filter((facet) => bondKeys.has(facet.key));
        },
        getBondFixedRateFacets() {
          // Use type guard to safely access .data property
          if (!isSuccess(bondFixedRateConfig)) return [];
          const bondFixedRateKeys = new Set(bondFixedRateConfig.data.facetKeys.map((f) => f.key));
          return output.facets.filter((facet) => bondFixedRateKeys.has(facet.key));
        },
        getBondKpiLinkedRateFacets() {
          // Use type guard to safely access .data property
          if (!isSuccess(bondKpiLinkedRateConfig)) return [];
          const bondKpiLinkedRateKeys = new Set(bondKpiLinkedRateConfig.data.facetKeys.map((f) => f.key));
          return output.facets.filter((facet) => bondKpiLinkedRateKeys.has(facet.key));
        },
        getLoanFacets() {
          // Use type guard to safely access .data property
          if (!isSuccess(loanConfig)) return [];
          const loanKeys = new Set(loanConfig.data.facetKeys.map((f) => f.key));
          return output.facets.filter((facet) => loanKeys.has(facet.key));
        },
        getLoansPortfolioFacets() {
          // Use type guard to safely access .data property
          if (!isSuccess(loansPortfolioConfig)) return [];
          const loansPortfolioKeys = new Set(loansPortfolioConfig.data.facetKeys.map((f) => f.key));
          return output.facets.filter((facet) => loansPortfolioKeys.has(facet.key));
        },
        getFactoryFacets() {
          // Use type guard to safely access .data property
          if (!isSuccess(factoryConfig)) return [];
          const factoryKeys = new Set(factoryConfig.data.facetKeys.map((f) => f.key));
          return output.facets.filter((facet) => factoryKeys.has(facet.key));
        },
      },
    };

    // Mark checkpoint as completed
    checkpoint.status = "completed";
    await checkpointManager.saveCheckpoint(checkpoint);
    info("\n✅ Checkpoint marked as completed");

    // Optionally delete checkpoint after successful deployment
    if (deleteOnSuccess) {
      await checkpointManager.deleteCheckpoint(checkpoint.checkpointId);
      info(`🗑️  Checkpoint deleted: ${checkpoint.checkpointId}`);
    }

    if (saveOutput) {
      const result = await saveDeploymentOutput({
        network,
        workflow: "newBlr",
        data: output,
        customPath: outputPath,
      });

      if (result.success) {
        info(`\n💾 Deployment output saved: ${result.filepath}`);
      } else {
        warn(`\n⚠️  Warning: Could not save deployment output: ${result.error}`);
      }
    }

    info("\n" + "═".repeat(60));
    info("✨ DEPLOYMENT COMPLETE");
    info("═".repeat(60));
    info(`⏱️  Total time: ${(output.summary.deploymentTime / 1000).toFixed(2)}s`);
    info(`⛽ Total gas: ${output.summary.gasUsed}`);
    info(`📦 Facets deployed: ${output.summary.totalFacets}`);
    info(`⚙️  Configurations created: ${output.summary.totalConfigurations}`);
    info("═".repeat(60));

    return output;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stackTrace = error instanceof Error ? error.stack : undefined;

    logError("\n❌ Deployment failed:", errorMessage);

    // Mark checkpoint as failed
    // Note: currentStep tracks the last COMPLETED step, so the failed step is currentStep + 1
    const failedStep = checkpoint.currentStep + 1;
    checkpoint.status = "failed";
    checkpoint.failure = {
      step: failedStep,
      stepName: getStepName(failedStep, "newBlr"),
      error: errorMessage,
      timestamp: new Date().toISOString(),
      stackTrace,
    };

    try {
      await checkpointManager.saveCheckpoint(checkpoint);
      warn(`\n💾 Checkpoint saved with failure information: ${checkpoint.checkpointId}`);
      warn("   You can resume this deployment by running again with the same network.");
    } catch (saveError) {
      warn(`   Warning: Could not save checkpoint: ${saveError}`);
    }

    throw error;
  }
}
