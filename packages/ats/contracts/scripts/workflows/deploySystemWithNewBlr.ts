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
  success,
  info,
  warn,
  error as logError,
  fetchHederaContractId,
  getDeploymentConfig,
  DEFAULT_BATCH_SIZE,
  CheckpointManager,
  NullCheckpointManager,
  type DeploymentCheckpoint,
  type ResumeOptions,
  formatCheckpointStatus,
  getStepName,
  toDeployBlrResult,
  toConfigurationData,
  convertCheckpointFacets,
  isSuccess,
} from "@scripts/infrastructure";
import { atsRegistry, deployFactory, createEquityConfiguration, createBondConfiguration } from "@scripts/domain";

import { promises as fs } from "fs";
import { dirname } from "path";
import { BusinessLogicResolver__factory, IStaticFunctionSelectors__factory } from "@contract-types";

/**
 * Complete deployment output structure.
 */
export interface DeploymentOutput {
  /** Network name (testnet, mainnet, etc.) */
  network: string;

  /** ISO timestamp of deployment */
  timestamp: string;

  /** Deployer address */
  deployer: string;

  /** Infrastructure contracts */
  infrastructure: {
    proxyAdmin: {
      address: string;
      contractId?: string;
    };
    blr: {
      implementation: string;
      implementationContractId?: string;
      proxy: string;
      proxyContractId?: string;
    };
    factory: {
      implementation: string;
      implementationContractId?: string;
      proxy: string;
      proxyContractId?: string;
    };
  };

  /** Deployed facets */
  facets: Array<{
    name: string;
    address: string;
    contractId?: string;
    key: string;
  }>;

  /** Token configurations */
  configurations: {
    equity: {
      configId: string;
      version: number;
      facetCount: number;
      facets: Array<{
        facetName: string;
        key: string;
        address: string;
      }>;
    };
    bond: {
      configId: string;
      version: number;
      facetCount: number;
      facets: Array<{
        facetName: string;
        key: string;
        address: string;
      }>;
    };
  };

  /** Deployment summary */
  summary: {
    totalContracts: number;
    totalFacets: number;
    totalConfigurations: number;
    deploymentTime: number;
    gasUsed: string;
    success: boolean;
  };

  /** Convenience helpers for testing */
  helpers: {
    /** Get only equity-specific facets for testing */
    getEquityFacets(): Array<{
      name: string;
      address: string;
      contractId?: string;
      key: string;
    }>;

    /** Get only bond-specific facets for testing */
    getBondFacets(): Array<{
      name: string;
      address: string;
      contractId?: string;
      key: string;
    }>;
  };
}

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

  /** Path to save deployment output (default: deployments/{network}-{timestamp}.json) */
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
): Promise<DeploymentOutput> {
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
    ? new NullCheckpointManager(checkpointDir)
    : new CheckpointManager(checkpointDir);
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
      // Auto-detect incomplete deployments
      const incompleteCheckpoints = await checkpointManager.findCheckpoints(network, "in-progress");

      if (incompleteCheckpoints.length > 0) {
        const latestCheckpoint = incompleteCheckpoints[0];
        info(`\n🔍 Found incomplete deployment: ${latestCheckpoint.checkpointId}`);
        info(formatCheckpointStatus(latestCheckpoint));

        // In TTY mode, this would prompt user. In CI, auto-resume.
        // For now, we'll auto-resume (proper prompt implementation would use readline or similar)
        info("🔄 Resuming from checkpoint...");
        checkpoint = latestCheckpoint;
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
      info("\n✓ Step 1/7: ProxyAdmin already deployed (resuming)");
      // Reconstruct ProxyAdmin from checkpoint - need to reconnect to contract
      const ProxyAdmin__factory = (await import("@contract-types")).ProxyAdmin__factory;
      proxyAdmin = ProxyAdmin__factory.connect(checkpoint.steps.proxyAdmin.address, signer);
      info(`✅ ProxyAdmin: ${proxyAdmin.address}`);
    } else {
      info("\n📋 Step 1/7: Deploying ProxyAdmin...");
      proxyAdmin = await deployProxyAdmin(signer);

      info(`✅ ProxyAdmin: ${proxyAdmin.address}`);

      // Save checkpoint (ProxyAdmin doesn't have contractId property)
      checkpoint.steps.proxyAdmin = {
        address: proxyAdmin.address,
        txHash: "", // ProxyAdmin doesn't return tx hash currently
        deployedAt: new Date().toISOString(),
      };
      checkpoint.currentStep = 0;
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    // Step 1: Deploy BusinessLogicResolver
    let blrResult: Awaited<ReturnType<typeof deployBlr>>;

    if (checkpoint.steps.blr && checkpoint.currentStep >= 1) {
      info("\n✓ Step 2/7: BLR already deployed (resuming)");
      // Use converter to reconstruct full DeployBlrResult from checkpoint
      blrResult = toDeployBlrResult(checkpoint.steps.blr, checkpoint.steps.proxyAdmin?.address);
      info(`✅ BLR Implementation: ${blrResult.implementationAddress}`);
      info(`✅ BLR Proxy: ${blrResult.blrAddress}`);
    } else {
      info("\n🔷 Step 2/7: Deploying BusinessLogicResolver...");
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

    // Step 2: Deploy all facets (with incremental checkpoint saves)
    let facetsResult: Awaited<ReturnType<typeof deployFacets>>;

    if (checkpoint.steps.facets && checkpoint.currentStep >= 2) {
      info("\n✓ Step 3/7: All facets already deployed (resuming)");
      // Use converter to reconstruct facetsResult with proper DeploymentResult types
      facetsResult = {
        success: true,
        deployed: convertCheckpointFacets(checkpoint.steps.facets),
        failed: new Map(),
        skipped: new Map(), // No facets were skipped on resume
      };
      info(`✅ Loaded ${facetsResult.deployed.size} facets from checkpoint`);
    } else {
      info("\n📦 Step 3/7: Deploying all facets...");
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
      const facetFactories: Record<string, ContractFactory> = {};
      for (const facet of allFacets) {
        if (!facet.factory) {
          throw new Error(`No factory found for facet: ${facet.name}`);
        }

        // Get factory (regular or TimeTravel variant based on useTimeTravel flag)
        const factory = facet.factory(signer, useTimeTravel);
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

        if (!facetsResult.success) {
          throw new Error("Facet deployment had failures");
        }

        // Save checkpoint after EACH facet deployment
        facetsResult.deployed.forEach((deploymentResult, facetName) => {
          checkpoint.steps.facets!.set(facetName, {
            address: deploymentResult.address!,
            txHash: deploymentResult.transactionHash || "",
            gasUsed: deploymentResult.gasUsed?.toString(),
            deployedAt: new Date().toISOString(),
          });

          totalGasUsed += parseInt(deploymentResult.gasUsed?.toString() || "0");
        });

        // Save checkpoint with all deployed facets
        checkpoint.currentStep = 2;
        await checkpointManager.saveCheckpoint(checkpoint);

        info(`✅ Deployed ${facetsResult.deployed.size} facets successfully`);
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

    // Step 3: Register facets in BLR
    // Get BLR contract instance
    const blrContract = BusinessLogicResolver__factory.connect(blrResult.blrAddress, signer);

    if (checkpoint.steps.facetsRegistered && checkpoint.currentStep >= 3) {
      info("\n✓ Step 4/7: Facets already registered in BLR (resuming)");
    } else {
      info("\n📝 Step 4/7: Registering facets in BLR...");

      // Prepare facets with resolver keys from registry
      const facetsToRegister = Array.from(facetsResult.deployed.entries()).map(([facetName, deploymentResult]) => {
        if (!deploymentResult.address) {
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
          address: deploymentResult.address,
          resolverKey: definition.resolverKey.value,
        };
      });

      const registerResult = await registerFacets(blrContract, {
        facets: facetsToRegister,
      });

      if (!registerResult.success) {
        throw new Error(`Facet registration failed: ${registerResult.error}`);
      }

      totalGasUsed += registerResult.gasUsed || 0;
      info(`✅ Registered ${registerResult.registered.length} facets in BLR`);

      if (registerResult.failed.length > 0) {
        warn(`⚠️  ${registerResult.failed.length} facets failed registration`);
      }

      // Save checkpoint
      checkpoint.steps.facetsRegistered = true;
      checkpoint.currentStep = 3;
      await checkpointManager.saveCheckpoint(checkpoint);
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
      info("\n✓ Step 5/7: Equity configuration already created (resuming)");
      const equityConfigData = checkpoint.steps.configurations.equity;
      info(`✅ Equity Config ID: ${equityConfigData.configId}`);
      info(`✅ Equity Version: ${equityConfigData.version}`);
      info(`✅ Equity Facets: ${equityConfigData.facetCount}`);

      // Use converter to reconstruct full ConfigurationData from checkpoint
      equityConfig = toConfigurationData(equityConfigData);
    } else {
      info("\n💼 Step 5/7: Creating Equity configuration...");

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

    // Step 5: Create Bond configuration
    let bondConfig: Awaited<ReturnType<typeof createBondConfiguration>>;

    if (checkpoint.steps.configurations?.bond && checkpoint.currentStep >= 5) {
      info("\n✓ Step 6/7: Bond configuration already created (resuming)");
      const bondConfigData = checkpoint.steps.configurations.bond;
      info(`✅ Bond Config ID: ${bondConfigData.configId}`);
      info(`✅ Bond Version: ${bondConfigData.version}`);
      info(`✅ Bond Facets: ${bondConfigData.facetCount}`);

      // Use converter to reconstruct full ConfigurationData from checkpoint
      bondConfig = toConfigurationData(bondConfigData);
    } else {
      info("\n🏦 Step 6/7: Creating Bond configuration...");

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

    // Step 6: Deploy Factory
    let factoryResult: Awaited<ReturnType<typeof deployFactory>>;

    if (checkpoint.steps.factory && checkpoint.currentStep >= 6) {
      info("\n✓ Step 7/7: Factory already deployed (resuming)");
      // Reconstruct DeployFactoryResult from checkpoint (with placeholder proxyResult)
      const proxyAdminAddr = checkpoint.steps.proxyAdmin?.address || proxyAdmin.address;
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
      info("\n🏭 Step 7/7: Deploying Factory...");
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
      checkpoint.currentStep = 6;
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    // Get Hedera Contract IDs if on Hedera network
    const getContractId = async (address: string) => {
      return network.toLowerCase().includes("hedera") ? await fetchHederaContractId(network, address) : undefined;
    };

    const output: DeploymentOutput = {
      network,
      timestamp: new Date().toISOString(),
      deployer,

      infrastructure: {
        proxyAdmin: {
          address: proxyAdmin.address,
          contractId: await getContractId(proxyAdmin.address),
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

          const staticFunctionSelectors = IStaticFunctionSelectors__factory.connect(facetAddress, signer);
          return {
            name: facetName,
            address: facetAddress,
            contractId: await getContractId(facetAddress),
            key: await staticFunctionSelectors.getStaticResolverKey(),
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
      },

      summary: {
        totalContracts: 3, // ProxyAdmin, BLR, Factory
        totalFacets: facetsResult.deployed.size,
        totalConfigurations: 2, // Equity + Bond
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
      // Generate human-readable timestamp: network_yyyy-mm-dd_hh-mm-ss.json
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      const timestamp = `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;

      const finalOutputPath = outputPath || `deployments/${network}_${timestamp}.json`;

      await saveDeploymentOutput(output, finalOutputPath);
      info(`\n💾 Deployment output saved: ${finalOutputPath}`);
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
    checkpoint.status = "failed";
    checkpoint.failure = {
      step: checkpoint.currentStep,
      stepName: getStepName(checkpoint.currentStep, "newBlr"),
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

/**
 * Save deployment output to JSON file.
 *
 * @param output - Deployment output
 * @param filePath - File path to save to
 */
async function saveDeploymentOutput(output: DeploymentOutput, filePath: string): Promise<void> {
  try {
    // Ensure directory exists
    const dir = dirname(filePath);
    await fs.mkdir(dir, { recursive: true });

    // Write JSON file with pretty formatting
    await fs.writeFile(filePath, JSON.stringify(output, null, 2), "utf-8");

    success("Deployment output saved", { path: filePath });
  } catch (error) {
    warn(`Warning: Could not save deployment output: ${error}`);
  }
}
