// SPDX-License-Identifier: Apache-2.0

/**
 * Complete ATS system deployment workflow.
 *
 * Orchestrates the deployment of the entire Asset Tokenization Studio infrastructure:
 * - ProxyAdmin for upgrade management
 * - BusinessLogicResolver (BLR) with proxy
 * - All facets (46 total, with optional TimeTravelFacet inclusion)
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
  resolveCheckpointForResume,
} from "@scripts/infrastructure";
import {
  atsRegistry,
  deployFactory,
  createEquityConfiguration,
  createBondConfiguration,
  createBondFixedRateConfiguration,
  createBondKpiLinkedRateConfiguration,
  createBondSustainabilityPerformanceTargetRateConfiguration,
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
  /** Whether to include TimeTravelFacet in deployment */
  useTimeTravel?: boolean;

  /** Whether to save deployment output to file */
  saveOutput?: boolean;

  /** Whether to deploy facets in partial batches to avoid gas limits */
  partialBatchDeploy?: boolean;

  /** Batch size for partial deployments */
  batchSize?: number;

  /** Path to save deployment output (default: deployments/{network}/{network}-deployment-{timestamp}.json) */
  outputPath?: string;

  /** Number of confirmations to wait for each deployment (default: 2 for Hedera reliability) */
  confirmations?: number;

  /** Enable retry mechanism for failed deployments (default: true) */
  enableRetry?: boolean;

  /** Enable post-deployment bytecode verification (default: true) */
  verifyDeployment?: boolean;
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
    resumeFrom,
    autoResume = true,
    ignoreCheckpoint = false,
    deleteOnSuccess = false,
    checkpointDir,
  } = options;

  const startTime = Date.now();
  const deployer = await signer.getAddress();
  const totalSteps = getTotalSteps("newBlr");

  info("🌟 ATS Complete System Deployment");
  info("═".repeat(60));
  info(`📡 Network: ${network}`);
  info(`👤 Deployer: ${deployer}`);
  info(`🔄 TimeTravel: ${useTimeTravel ? "Enabled" : "Disabled"}`);
  info(`⏱️  Confirmations: ${confirmations}`);
  info(`🔁 Retry: ${enableRetry ? "Enabled" : "Disabled"}`);
  info(`✅ Verification: ${verifyDeployment ? "Enabled" : "Disabled"}`);
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
        saveOutput,
        outputPath,
        partialBatchDeploy,
        batchSize,
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
      const facetFactories: Record<string, ContractFactory> = {};
      for (const facet of allFacets) {
        // Select factory: TimeTravel variant when available and enabled, else production
        const selectedFactory = useTimeTravel && facet.timeTravelFactory ? facet.timeTravelFactory : facet.factory;

        if (!selectedFactory) {
          throw new Error(`No factory found for facet: ${facet.name}`);
        }

        // Get factory
        const factory = selectedFactory(signer);
        // Use the actual contract name from the factory
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

        facetsResult = await deployFacets(facetFactories, {
          confirmations,
          enableRetry,
          verifyDeployment,
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

      // Prepare facets with resolver keys from registry
      const facetsToRegister = await Promise.all(
        Array.from(facetsResult.deployed.entries()).map(async ([facetName, deploymentResult]) => {
          if (!deploymentResult.address) {
            throw new Error(`No address for facet: ${facetName}`);
          }

          // Strip "TimeTravel" suffix to get canonical name
          const baseName = facetName.replace(/TimeTravel$/, "");
          // deploymentResult.address
          const staticSelector = IStaticFunctionSelectors__factory.connect(deploymentResult.address, signer);
          const resolverKey = await staticSelector.getStaticResolverKey();
          // Look up resolver key from registry

          if (!resolverKey) {
            throw new Error(`Facet ${baseName} not found in registry or missing resolver key`);
          }

          return {
            name: facetName,
            address: deploymentResult.address,
            resolverKey: resolverKey,
          };
        }),
      );

      const registerResult = await registerFacets(blrContract, {
        facets: facetsToRegister,
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
      checkpoint.steps.configurations!.bond = {
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

    // Step 8: Create Bond Sustainability Performance Target Rate configuration
    let bondSustainabilityPerformanceTargetRateConfig: Awaited<
      ReturnType<typeof createBondSustainabilityPerformanceTargetRateConfiguration>
    >;

    if (checkpoint.steps.configurations?.bondSustainabilityPerformanceTargetRate && checkpoint.currentStep >= 8) {
      info(
        `\n✓ Step 9/${totalSteps}: Bond Sustainability Performance Target Rate configuration already created (resuming)`,
      );
      const bondSustainabilityPerformanceTargetRateConfigData =
        checkpoint.steps.configurations.bondSustainabilityPerformanceTargetRate;
      info(
        `✅ Bond Sustainability Performance Target Rate Config ID: ${bondSustainabilityPerformanceTargetRateConfigData.configId}`,
      );
      info(
        `✅ Bond Sustainability Performance Target Rate Version: ${bondSustainabilityPerformanceTargetRateConfigData.version}`,
      );
      info(
        `✅ Bond Sustainability Performance Target Rate Facets: ${bondSustainabilityPerformanceTargetRateConfigData.facetCount}`,
      );

      // Use converter to reconstruct full ConfigurationData from checkpoint
      bondSustainabilityPerformanceTargetRateConfig = toConfigurationData(
        bondSustainabilityPerformanceTargetRateConfigData,
      );
    } else {
      info(`\n🏦 Step 9/${totalSteps}: Creating Bond Sustainability Performance Target Rate configuration...`);

      bondSustainabilityPerformanceTargetRateConfig = await createBondSustainabilityPerformanceTargetRateConfiguration(
        blrContract,
        facetAddresses,
        useTimeTravel,
        partialBatchDeploy,
        batchSize,
        confirmations,
      );

      if (!bondSustainabilityPerformanceTargetRateConfig.success) {
        throw new Error(
          `Bond Sustainability Performance Target Rate config creation failed: ${bondSustainabilityPerformanceTargetRateConfig.error} - ${bondSustainabilityPerformanceTargetRateConfig.message}`,
        );
      }

      info(
        `✅ Bond Sustainability Performance Target Rate Config ID: ${bondSustainabilityPerformanceTargetRateConfig.data.configurationId}`,
      );
      info(
        `✅ Bond Sustainability Performance Target Rate Version: ${bondSustainabilityPerformanceTargetRateConfig.data.version}`,
      );
      info(
        `✅ Bond Sustainability Performance Target Rate Facets: ${bondSustainabilityPerformanceTargetRateConfig.data.facetKeys.length}`,
      );

      // Save checkpoint
      checkpoint.steps.configurations!.bondSustainabilityPerformanceTargetRate = {
        configId: bondSustainabilityPerformanceTargetRateConfig.data.configurationId,
        version: bondSustainabilityPerformanceTargetRateConfig.data.version,
        facetCount: bondSustainabilityPerformanceTargetRateConfig.data.facetKeys.length,
        txHash: "", // createBondSustainabilityPerformanceTargetRateConfiguration doesn't return tx hash currently
      };
      checkpoint.currentStep = 8;
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    // Testing hook: Step-level failure injection for checkpoint testing
    if (shouldFailAtStep("bondSustainabilityPerformanceTargetRate")) {
      throw new Error(createTestFailureMessage("step", "bondSustainabilityPerformanceTargetRate"));
    }

    // Step 8: Deploy Factory
    let factoryResult: Awaited<ReturnType<typeof deployFactory>>;

    if (checkpoint.steps.factory && checkpoint.currentStep >= 9) {
      info(`\n✓ Step 10/${totalSteps}: Factory already deployed (resuming)`);
      // Reconstruct DeployFactoryResult from checkpoint (with placeholder proxyResult)
      const proxyAdminAddr = checkpoint.steps.proxyAdmin?.address || (proxyAdmin.target as string);
      factoryResult = {
        success: true,
        proxyResult: {
          implementation: { address: checkpoint.steps.factory.implementation } as any,
          implementationAddress: checkpoint.steps.factory.implementation,
          proxy: { address: checkpoint.steps.factory.proxy } as any,
          proxyAddress: checkpoint.steps.factory.proxy,
          proxyAdmin: { address: proxyAdminAddr } as any,
          proxyAdminAddress: proxyAdminAddr,
          receipts: {},
        },
        factoryAddress: checkpoint.steps.factory.proxy,
        implementationAddress: checkpoint.steps.factory.implementation,
        proxyAdminAddress: proxyAdminAddr,
        initialized: true, // Assume initialized if checkpoint exists
      };
      info(`✅ Factory Implementation: ${checkpoint.steps.factory.implementation}`);
      info(`✅ Factory Proxy: ${checkpoint.steps.factory.proxy}`);
    } else {
      info(`\n🏭 Step 10/${totalSteps}: Deploying Factory...`);
      factoryResult = await deployFactory(signer, {
        existingProxyAdmin: proxyAdmin,
      });

      if (!factoryResult.success) {
        throw new Error(`Factory deployment failed: ${factoryResult.error}`);
      }

      // Factory gas is tracked in proxyResult receipts
      info(`✅ Factory Implementation: ${factoryResult.implementationAddress}`);
      info(`✅ Factory Proxy: ${factoryResult.factoryAddress}`);

      // Save checkpoint
      checkpoint.steps.factory = {
        address: factoryResult.factoryAddress,
        implementation: factoryResult.implementationAddress,
        proxy: factoryResult.factoryAddress,
        txHash: "", // deployFactory doesn't return tx hash currently
        deployedAt: new Date().toISOString(),
      };
      checkpoint.currentStep = 9;
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
          implementation: factoryResult.implementationAddress,
          implementationContractId: await getContractId(factoryResult.implementationAddress),
          proxy: factoryResult.factoryAddress,
          proxyContractId: await getContractId(factoryResult.factoryAddress),
        },
      },

      facets: await Promise.all(
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
          const bondSustainabilityPerformanceTargetRateFacet = isSuccess(bondSustainabilityPerformanceTargetRateConfig)
            ? bondSustainabilityPerformanceTargetRateConfig.data.facetKeys.find((bf) => bf.address === facetAddress)
            : undefined;

          const staticFunctionSelectors = IStaticFunctionSelectors__factory.connect(facetAddress, signer);
          return {
            name: facetName,
            address: facetAddress,
            contractId: await getContractId(facetAddress),
            key:
              equityFacet?.key ||
              bondFacet?.key ||
              bondFixedRateFacet?.key ||
              bondKpiLinkedRateFacet?.key ||
              bondSustainabilityPerformanceTargetRateFacet?.key ||
              (await staticFunctionSelectors.getStaticResolverKey()),
          };
        }),
      ),

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
        bondSustainabilityPerformanceTargetRate: isSuccess(bondSustainabilityPerformanceTargetRateConfig)
          ? {
              configId: bondSustainabilityPerformanceTargetRateConfig.data.configurationId,
              version: bondSustainabilityPerformanceTargetRateConfig.data.version,
              facetCount: bondSustainabilityPerformanceTargetRateConfig.data.facetKeys.length,
              facets: bondSustainabilityPerformanceTargetRateConfig.data.facetKeys,
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
        totalConfigurations: 5, // Equity + Bond + BondFixedRate + BondKpiLinkedRate + BondSustainabilityPerformanceTargetRate
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
        getBondSustainabilityPerformanceTargetRateFacets() {
          // Use type guard to safely access .data property
          if (!isSuccess(bondSustainabilityPerformanceTargetRateConfig)) return [];
          const bondSustainabilityPerformanceTargetRateKeys = new Set(
            bondSustainabilityPerformanceTargetRateConfig.data.facetKeys.map((f) => f.key),
          );
          return output.facets.filter((facet) => bondSustainabilityPerformanceTargetRateKeys.has(facet.key));
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
