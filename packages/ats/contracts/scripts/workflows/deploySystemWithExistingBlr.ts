// SPDX-License-Identifier: Apache-2.0

/**
 * Deploy system components using an existing BLR.
 *
 * This workflow deploys facets, registers them, creates configurations, and deploys
 * Factory using an existing BusinessLogicResolver that was deployed separately
 * (e.g., in another system or environment).
 *
 * Use cases:
 * - Deploying to a system where BLR is shared across multiple applications
 * - Testing facet updates against a stable BLR instance
 * - Deploying new configurations to existing infrastructure
 *
 * @module workflows/deploySystemWithExistingBlr
 */

import { Signer, ContractFactory } from "ethers";
import { ProxyAdmin__factory } from "@contract-types";
import {
  deployFacets,
  registerFacets,
  deployProxyAdmin,
  validateAddress,
  fetchHederaContractId,
  info,
  warn,
  error as logError,
  getDeploymentConfig,
  CheckpointManager,
  NullCheckpointManager,
  saveDeploymentOutput,
  type DeploymentCheckpoint,
  type ResumeOptions,
  formatCheckpointStatus,
  getStepName,
  getTotalSteps,
  toConfigurationData,
  convertCheckpointFacets,
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

import { BusinessLogicResolver__factory } from "@contract-types";

/**
 * Deployment output structure (compatible with deployCompleteSystem).
 */
export interface DeploymentWithExistingBlrOutput {
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
      isExternal: true; // Marker to indicate BLR was not deployed here
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
    bondFixedRate: {
      configId: string;
      version: number;
      facetCount: number;
      facets: Array<{
        facetName: string;
        key: string;
        address: string;
      }>;
    };
    bondKpiLinkedRate: {
      configId: string;
      version: number;
      facetCount: number;
      facets: Array<{
        facetName: string;
        key: string;
        address: string;
      }>;
    };
    bondSustainabilityPerformanceTargetRate: {
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
    skippedSteps: string[]; // Steps that were skipped
  };
}

/**
 * Options for deploying with existing BLR.
 */
export interface DeploySystemWithExistingBlrOptions extends ResumeOptions {
  /** Whether to use TimeTravel variants for facets */
  useTimeTravel?: boolean;

  /** Whether to save deployment output to file */
  saveOutput?: boolean;

  /** Path to save deployment output (default: deployments/{network}-{timestamp}.json) */
  outputPath?: string;

  /** Whether to deploy new facets (default: true) */
  deployFacets?: boolean;

  /** Whether to deploy Factory (default: true) */
  deployFactory?: boolean;

  /** Whether to create configurations (default: true) */
  createConfigurations?: boolean;

  /** Number of facets per batch for configuration creation (default: DEFAULT_BATCH_SIZE) */
  batchSize?: number;

  /** Existing ProxyAdmin address (optional, will deploy new one if not provided) */
  existingProxyAdminAddress?: string;

  /** Number of confirmations to wait for each deployment (default: from network config) */
  confirmations?: number;

  /** Enable retry mechanism for failed deployments (default: from network config) */
  enableRetry?: boolean;

  /** Enable post-deployment bytecode verification (default: from network config) */
  verifyDeployment?: boolean;

  /** Existing BLR implementation address (optional, for documentation) */
  existingBlrImplementation?: string;
}

/**
 * Deploy system components using an existing BLR.
 *
 * This workflow skips BLR deployment and uses the provided BLR address for:
 * 1. Deploying facets (optional)
 * 2. Registering facets in BLR (optional)
 * 3. Creating Equity configuration (optional)
 * 4. Creating Bond configuration (optional)
 * 5. Deploying Factory (optional)
 *
 * @param signer - Ethers.js signer for deploying contracts
 * @param network - Network name (testnet, mainnet, etc.)
 * @param blrAddress - Address of existing BusinessLogicResolver
 * @param options - Deployment options
 * @returns Promise resolving to deployment output
 *
 * @example
 * ```typescript
 * import { ethers } from 'ethers'
 *
 * // Create signer
 * const provider = new ethers.providers.JsonRpcProvider('https://testnet.hashio.io/api')
 * const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider)
 *
 * // Deploy facets and Factory against existing BLR
 * const output = await deploySystemWithExistingBlr(
 *     signer,
 *     'hedera-testnet',
 *     '0x123...BLR...',
 *     {
 *         useTimeTravel: false,
 *         deployFacets: true,
 *         deployFactory: true,
 *         saveOutput: true
 *     }
 * )
 *
 * console.log(`Factory deployed: ${output.infrastructure.factory.proxy}`)
 * console.log(`Using BLR: ${output.infrastructure.blr.proxy}`)
 * ```
 */
export async function deploySystemWithExistingBlr(
  signer: Signer,
  network: string,
  blrAddress: string,
  options: DeploySystemWithExistingBlrOptions = {},
): Promise<DeploymentWithExistingBlrOutput> {
  // Get network-specific deployment configuration
  const networkConfig = getDeploymentConfig(network);

  const {
    useTimeTravel = false,
    saveOutput = true,
    outputPath,
    deployFacets: shouldDeployFacets = true,
    deployFactory: shouldDeployFactory = true,
    createConfigurations: shouldCreateConfigurations = true,
    batchSize, // Use defaults from createEquityConfiguration/createBondConfiguration if not provided
    existingProxyAdminAddress,
    confirmations = networkConfig.confirmations,
    enableRetry = networkConfig.retryOptions.maxRetries > 0,
    verifyDeployment = networkConfig.verifyDeployment,
    resumeFrom,
    autoResume = true,
    ignoreCheckpoint = false,
    deleteOnSuccess = false,
    checkpointDir,
  } = options;

  // Validate BLR address
  validateAddress(blrAddress, "BLR address");

  const startTime = Date.now();
  const deployer = await signer.getAddress();
  const totalSteps = getTotalSteps("existingBlr");

  info("🌟 ATS Deployment with Existing BLR");
  info("═".repeat(60));
  info(`📡 Network: ${network}`);
  info(`👤 Deployer: ${deployer}`);
  info(`🔷 BLR Address: ${blrAddress}`);
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
      const resolved = await resolveCheckpointForResume(checkpointManager, network, "existingBlr");
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
      workflowType: "existingBlr",
      options: {
        useTimeTravel,
        saveOutput,
        outputPath,
        deployFacets: shouldDeployFacets,
        deployFactory: shouldDeployFactory,
        createConfigurations: shouldCreateConfigurations,
        existingProxyAdminAddress,
      },
    });

    info(`\n📝 Created checkpoint: ${checkpoint.checkpointId}`);
    await checkpointManager.saveCheckpoint(checkpoint);
  }

  // Track total gas used
  let totalGasUsed = 0;
  const skippedSteps: string[] = [];

  try {
    // Step 0: ProxyAdmin (optional - can use existing)
    let proxyAdmin: Awaited<ReturnType<typeof deployProxyAdmin>>;

    if (checkpoint.steps.proxyAdmin && checkpoint.currentStep >= 0) {
      info(`\n✓ Step 1/${totalSteps}: ProxyAdmin already deployed (resuming)`);
      // Reconstruct ProxyAdmin from checkpoint - need to reconnect to contract
      proxyAdmin = ProxyAdmin__factory.connect(checkpoint.steps.proxyAdmin.address, signer);
      info(`✅ ProxyAdmin: ${proxyAdmin.target as string}`);
    } else if (existingProxyAdminAddress) {
      info(`\n📋 Step 1/${totalSteps}: Using existing ProxyAdmin...`);
      validateAddress(existingProxyAdminAddress, "ProxyAdmin address");
      proxyAdmin = ProxyAdmin__factory.connect(existingProxyAdminAddress, signer);
      info(`✅ ProxyAdmin: ${proxyAdmin.target as string}`);

      // Save checkpoint - mark as external
      checkpoint.steps.proxyAdmin = {
        address: proxyAdmin.target as string,
        txHash: "", // External ProxyAdmin has no tx hash
        deployedAt: new Date().toISOString(),
      };
      checkpoint.currentStep = 0;
      await checkpointManager.saveCheckpoint(checkpoint);
    } else {
      info(`\n📋 Step 1/${totalSteps}: Deploying ProxyAdmin...`);
      proxyAdmin = await deployProxyAdmin(signer);
      info(`✅ ProxyAdmin: ${proxyAdmin.target as string}`);

      // Save checkpoint (ProxyAdmin doesn't have contractId property)
      checkpoint.steps.proxyAdmin = {
        address: proxyAdmin.target as string,
        txHash: "",
        deployedAt: new Date().toISOString(),
      };
      checkpoint.currentStep = 0;
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    // BLR is always external in this workflow
    info(`\n🔷 Step 2/${totalSteps}: Using existing BLR...`);
    info(`✅ BLR Proxy: ${blrAddress}`);
    skippedSteps.push("BLR deployment");

    // Save BLR to checkpoint (for tracking only)
    if (!checkpoint.steps.blr) {
      checkpoint.steps.blr = {
        address: blrAddress,
        implementation: options.existingBlrImplementation || "N/A (External BLR)",
        proxy: blrAddress,
        txHash: "",
        deployedAt: new Date().toISOString(),
        isExternal: true,
      };
      await checkpointManager.saveCheckpoint(checkpoint);
    }

    // Step 1: Deploy facets (optional - controlled by deployFacets flag)
    let facetsResult: Awaited<ReturnType<typeof deployFacets>> | undefined;
    const facetAddresses: Record<string, string> = {};

    if (shouldDeployFacets) {
      if (checkpoint.steps.facets && checkpoint.currentStep >= 1) {
        info(`\n✓ Step 3/${totalSteps}: All facets already deployed (resuming)`);
        // Use converter to reconstruct facetsResult with proper DeploymentResult types
        facetsResult = {
          success: true,
          deployed: convertCheckpointFacets(checkpoint.steps.facets),
          failed: new Map(),
          skipped: new Map(), // No facets were skipped on resume
        };

        // Build facetAddresses map from checkpoint
        facetsResult.deployed.forEach((deploymentResult, facetName) => {
          if (deploymentResult.address) {
            facetAddresses[facetName] = deploymentResult.address;
          }
        });

        info(`✅ Loaded ${facetsResult.deployed.size} facets from checkpoint`);
      } else {
        info(`\n📦 Step 3/${totalSteps}: Deploying all facets...`);
        let allFacets = atsRegistry.getAllFacets();
        info(`   Found ${allFacets.length} facets in registry`);

        if (!useTimeTravel) {
          allFacets = allFacets.filter((f) => f.name !== "TimeTravelFacet");
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

          facetsResult = await deployFacets(facetFactories, {
            confirmations,
            enableRetry,
            verifyDeployment,
          });

          if (!facetsResult.success) {
            throw new Error("Facet deployment had failures");
          }

          // Save checkpoint after each facet deployment
          facetsResult.deployed.forEach((deploymentResult, facetName) => {
            checkpoint.steps.facets!.set(facetName, {
              address: deploymentResult.address!,
              txHash: deploymentResult.transactionHash || "",
              gasUsed: deploymentResult.gasUsed?.toString(),
              deployedAt: new Date().toISOString(),
            });

            totalGasUsed += parseInt(deploymentResult.gasUsed?.toString() || "0");
          });

          // Build facetAddresses map
          facetsResult.deployed.forEach((deploymentResult, facetName) => {
            if (deploymentResult.address) {
              facetAddresses[facetName] = deploymentResult.address;
            }
          });

          // Save checkpoint with all deployed facets
          checkpoint.currentStep = 1;
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

          // Build facetAddresses map from checkpoint
          facetsResult.deployed.forEach((deploymentResult, facetName) => {
            if (deploymentResult.address) {
              facetAddresses[facetName] = deploymentResult.address;
            }
          });
        }
      }
    } else {
      info(`\n📦 Step 3/${totalSteps}: Skipping facet deployment...`);
      skippedSteps.push("Facet deployment");
    }

    // Step 2: Register facets in BLR (conditional on facets being deployed)
    if (shouldDeployFacets && facetsResult) {
      // Get BLR contract instance
      const blrContract = BusinessLogicResolver__factory.connect(blrAddress, signer);

      if (checkpoint.steps.facetsRegistered && checkpoint.currentStep >= 2) {
        info(`\n✓ Step 4/${totalSteps}: Facets already registered in BLR (resuming)`);
      } else {
        info(`\n📝 Step 4/${totalSteps}: Registering facets in BLR...`);

        // Prepare facets with resolver keys from registry
        const facetsToRegister = Object.entries(facetAddresses).map(([facetName, facetAddress]) => {
          // Strip "TimeTravel" suffix to get canonical name
          const baseName = facetName.replace(/TimeTravel$/, "");

          // Look up resolver key from registry
          const definition = atsRegistry.getFacetDefinition(baseName);
          if (!definition || !definition.resolverKey?.value) {
            throw new Error(`Facet ${baseName} not found in registry or missing resolver key`);
          }

          return {
            name: facetName,
            address: facetAddress,
            resolverKey: definition.resolverKey.value,
          };
        });

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
        checkpoint.currentStep = 2;
        await checkpointManager.saveCheckpoint(checkpoint);
      }
    } else {
      info(`\n📝 Step 4/${totalSteps}: Skipping facet registration...`);
      skippedSteps.push("Facet registration");
    }

    // Steps 3 & 4: Create configurations (optional - controlled by createConfigurations flag)
    let equityConfig: Awaited<ReturnType<typeof createEquityConfiguration>> | undefined;
    let bondConfig: Awaited<ReturnType<typeof createBondConfiguration>> | undefined;
    let bondFixedRateConfig: Awaited<ReturnType<typeof createBondFixedRateConfiguration>> | undefined;
    let bondKpiLinkedRateConfig: Awaited<ReturnType<typeof createBondKpiLinkedRateConfiguration>> | undefined;
    let bondSustainabilityPerformanceTargetRateConfig:
      | Awaited<ReturnType<typeof createBondSustainabilityPerformanceTargetRateConfiguration>>
      | undefined;

    if (shouldCreateConfigurations) {
      if (Object.keys(facetAddresses).length === 0) {
        info(`\n⚠️  Step 5/${totalSteps}: Skipping configurations (no facets deployed)...`);
        skippedSteps.push(
          "Equity configuration",
          "Bond configuration",
          "Bond Fixed Rate configuration",
          "Bond Kpi Linked Rate configuration",
          "Bond Sustainability Performance Target Rate configuration",
        );
      } else {
        // Get BLR contract instance
        const blrContract = BusinessLogicResolver__factory.connect(blrAddress, signer);

        // Step 3: Create Equity Configuration
        if (checkpoint.steps.configurations?.equity && checkpoint.currentStep >= 3) {
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
            false,
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
            txHash: "",
          };
          checkpoint.currentStep = 3;
          await checkpointManager.saveCheckpoint(checkpoint);
        }

        // Step 4: Create Bond Configuration
        if (checkpoint.steps.configurations?.bond && checkpoint.currentStep >= 4) {
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
            false,
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
            txHash: "",
          };
          checkpoint.currentStep = 4;
          await checkpointManager.saveCheckpoint(checkpoint);
        }

        // Step 5: Create Bond Fixed Rate Configuration
        if (checkpoint.steps.configurations?.bondFixedRate && checkpoint.currentStep >= 5) {
          info(`\n✓ Step 6/${totalSteps}: Bond Fixed Rate configuration already created (resuming)`);
          const bondFixedRateConfigData = checkpoint.steps.configurations.bondFixedRate;
          info(`✅ Bond Fixed Rate Config ID: ${bondFixedRateConfigData.configId}`);
          info(`✅ Bond Fixed Rate Version: ${bondFixedRateConfigData.version}`);
          info(`✅ Bond Fixed Rate Facets: ${bondFixedRateConfigData.facetCount}`);

          // Use converter to reconstruct full ConfigurationData from checkpoint
          bondFixedRateConfig = toConfigurationData(bondFixedRateConfigData);
        } else {
          info(`\n🏦 Step 6/${totalSteps}: Creating Bond Fixed Rate configuration...`);

          bondFixedRateConfig = await createBondFixedRateConfiguration(
            blrContract,
            facetAddresses,
            useTimeTravel,
            false,
            batchSize,
            confirmations,
          );

          if (!bondFixedRateConfig.success) {
            throw new Error(
              `Bond Fixed Rate config creation failed: ${bondFixedRateConfig.error} - ${bondFixedRateConfig.message}`,
            );
          }

          info(`✅ Bond Fixed Rate Config ID: ${bondFixedRateConfig.data.configurationId}`);
          info(`✅ Bond Fixed Rate Version: ${bondFixedRateConfig.data.version}`);
          info(`✅ Bond Fixed Rate Facets: ${bondFixedRateConfig.data.facetKeys.length}`);

          // Save checkpoint
          checkpoint.steps.configurations!.bondFixedRate = {
            configId: bondFixedRateConfig.data.configurationId,
            version: bondFixedRateConfig.data.version,
            facetCount: bondFixedRateConfig.data.facetKeys.length,
            txHash: "",
          };
          checkpoint.currentStep = 5;
          await checkpointManager.saveCheckpoint(checkpoint);
        }

        // Step 6: Create Bond KpiLinked Rate Configuration
        if (checkpoint.steps.configurations?.bondKpiLinkedRate && checkpoint.currentStep >= 6) {
          info(`\n✓ Step 7/${totalSteps}: Bond KpiLinked Rate configuration already created (resuming)`);
          const bondKpiLinkedRateConfigData = checkpoint.steps.configurations.bondKpiLinkedRate;
          info(`✅ Bond KpiLinked Rate Config ID: ${bondKpiLinkedRateConfigData.configId}`);
          info(`✅ Bond KpiLinked Rate Version: ${bondKpiLinkedRateConfigData.version}`);
          info(`✅ Bond KpiLinked Rate Facets: ${bondKpiLinkedRateConfigData.facetCount}`);

          // Use converter to reconstruct full ConfigurationData from checkpoint
          bondKpiLinkedRateConfig = toConfigurationData(bondKpiLinkedRateConfigData);
        } else {
          info(`\n🏦 Step 7/${totalSteps}: Creating Bond KpiLinked Rate configuration...`);

          bondKpiLinkedRateConfig = await createBondKpiLinkedRateConfiguration(
            blrContract,
            facetAddresses,
            useTimeTravel,
            false,
            batchSize,
            confirmations,
          );

          if (!bondKpiLinkedRateConfig.success) {
            throw new Error(
              `Bond KpiLinked Rate config creation failed: ${bondKpiLinkedRateConfig.error} - ${bondKpiLinkedRateConfig.message}`,
            );
          }

          info(`✅ Bond KpiLinked Rate Config ID: ${bondKpiLinkedRateConfig.data.configurationId}`);
          info(`✅ Bond KpiLinked Rate Version: ${bondKpiLinkedRateConfig.data.version}`);
          info(`✅ Bond KpiLinked Rate Facets: ${bondKpiLinkedRateConfig.data.facetKeys.length}`);

          // Save checkpoint
          checkpoint.steps.configurations!.bondKpiLinkedRate = {
            configId: bondKpiLinkedRateConfig.data.configurationId,
            version: bondKpiLinkedRateConfig.data.version,
            facetCount: bondKpiLinkedRateConfig.data.facetKeys.length,
            txHash: "",
          };
          checkpoint.currentStep = 6;
          await checkpointManager.saveCheckpoint(checkpoint);
        }

        // Step 7: Create Bond Sustainability Performance Target Rate Configuration
        if (checkpoint.steps.configurations?.bondSustainabilityPerformanceTargetRate && checkpoint.currentStep >= 7) {
          info(
            `\n✓ Step 8/${totalSteps}: Bond Sustainability Performance Target Rate configuration already created (resuming)`,
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
          info(`\n🏦 Step 8/${totalSteps}: Creating Bond Sustainability Performance Target Rate configuration...`);

          bondSustainabilityPerformanceTargetRateConfig =
            await createBondSustainabilityPerformanceTargetRateConfiguration(
              blrContract,
              facetAddresses,
              useTimeTravel,
              false,
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
            txHash: "",
          };
          checkpoint.currentStep = 7;
          await checkpointManager.saveCheckpoint(checkpoint);
        }
      }
    } else {
      info(`\n💼 Step 4-8/${totalSteps}: Skipping configurations...`);
      skippedSteps.push(
        "Equity configuration",
        "Bond configuration",
        "Bond Fixed Rate configuration",
        "Bond KpiLinked Rate configuration",
        "Bond Sustainability Performance Target Rate configuration",
      );
    }

    // Step 5: Deploy Factory (optional - controlled by deployFactory flag)
    let factoryResult: Awaited<ReturnType<typeof deployFactory>> | undefined;

    if (shouldDeployFactory) {
      if (checkpoint.steps.factory && checkpoint.currentStep >= 8) {
        info(`\n✓ Step 9/${totalSteps}: Factory already deployed (resuming)`);
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
        info(`\n🏭 Step 9/${totalSteps}: Deploying Factory...`);
        factoryResult = await deployFactory(signer, {
          existingProxyAdmin: proxyAdmin,
        });

        if (!factoryResult.success) {
          throw new Error(`Factory deployment failed: ${factoryResult.error}`);
        }

        if (factoryResult) {
          info(`✅ Factory Implementation: ${factoryResult.implementationAddress}`);
          info(`✅ Factory Proxy: ${factoryResult.factoryAddress}`);
        }

        // Save checkpoint
        checkpoint.steps.factory = {
          address: factoryResult.factoryAddress,
          implementation: factoryResult.implementationAddress,
          proxy: factoryResult.factoryAddress,
          txHash: "",
          deployedAt: new Date().toISOString(),
        };
        checkpoint.currentStep = 8;
        await checkpointManager.saveCheckpoint(checkpoint);
      }
    } else {
      info(`\n🏭 Step 9/${totalSteps}: Skipping Factory deployment...`);
      skippedSteps.push("Factory deployment");
    }

    const endTime = Date.now();

    // Get Hedera Contract IDs if on Hedera network
    const getContractId = async (address: string) => {
      return network.toLowerCase().includes("hedera") ? await fetchHederaContractId(network, address) : undefined;
    };

    const output: DeploymentWithExistingBlrOutput = {
      network,
      timestamp: new Date().toISOString(),
      deployer,

      infrastructure: {
        proxyAdmin: {
          address: proxyAdmin.target as string,
          contractId: await getContractId(proxyAdmin.target as string),
        },
        blr: {
          implementation: options.existingBlrImplementation || "N/A (External BLR)",
          implementationContractId: options.existingBlrImplementation
            ? await getContractId(options.existingBlrImplementation)
            : undefined,
          proxy: blrAddress,
          proxyContractId: await getContractId(blrAddress),
          isExternal: true,
        },
        factory: factoryResult
          ? {
              implementation: factoryResult.implementationAddress,
              implementationContractId: await getContractId(factoryResult.implementationAddress),
              proxy: factoryResult.factoryAddress,
              proxyContractId: await getContractId(factoryResult.factoryAddress),
            }
          : {
              implementation: "N/A (Not deployed)",
              proxy: "N/A (Not deployed)",
            },
      },

      facets: facetsResult
        ? await Promise.all(
            Array.from(facetsResult.deployed.entries()).map(async ([facetName, deploymentResult]) => {
              const facetAddress = deploymentResult.address!;

              // Find matching key from config
              const equityFacet = equityConfig?.success
                ? equityConfig.data.facetKeys.find((ef) => ef.address === facetAddress)
                : undefined;
              const bondFacet = bondConfig?.success
                ? bondConfig.data.facetKeys.find((bf) => bf.address === facetAddress)
                : undefined;
              const bondFixedRateFacet = bondFixedRateConfig?.success
                ? bondFixedRateConfig.data.facetKeys.find((bf) => bf.address === facetAddress)
                : undefined;
              const bondKpiLinkedRateFacet = bondKpiLinkedRateConfig?.success
                ? bondKpiLinkedRateConfig.data.facetKeys.find((bf) => bf.address === facetAddress)
                : undefined;
              const bondSustainabilityPerformanceTargetRateFacet =
                bondSustainabilityPerformanceTargetRateConfig?.success
                  ? bondSustainabilityPerformanceTargetRateConfig.data.facetKeys.find(
                      (bf) => bf.address === facetAddress,
                    )
                  : undefined;

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
                  "",
              };
            }),
          )
        : [],

      configurations: {
        equity:
          equityConfig && equityConfig.success
            ? {
                configId: equityConfig.data.configurationId,
                version: equityConfig.data.version,
                facetCount: equityConfig.data.facetKeys.length,
                facets: equityConfig.data.facetKeys,
              }
            : {
                configId: "N/A (Not created)",
                version: 0,
                facetCount: 0,
                facets: [],
              },
        bond:
          bondConfig && bondConfig.success
            ? {
                configId: bondConfig.data.configurationId,
                version: bondConfig.data.version,
                facetCount: bondConfig.data.facetKeys.length,
                facets: bondConfig.data.facetKeys,
              }
            : {
                configId: "N/A (Not created)",
                version: 0,
                facetCount: 0,
                facets: [],
              },
        bondFixedRate:
          bondFixedRateConfig && bondFixedRateConfig.success
            ? {
                configId: bondFixedRateConfig.data.configurationId,
                version: bondFixedRateConfig.data.version,
                facetCount: bondFixedRateConfig.data.facetKeys.length,
                facets: bondFixedRateConfig.data.facetKeys,
              }
            : {
                configId: "N/A (Not created)",
                version: 0,
                facetCount: 0,
                facets: [],
              },
        bondKpiLinkedRate:
          bondKpiLinkedRateConfig && bondKpiLinkedRateConfig.success
            ? {
                configId: bondKpiLinkedRateConfig.data.configurationId,
                version: bondKpiLinkedRateConfig.data.version,
                facetCount: bondKpiLinkedRateConfig.data.facetKeys.length,
                facets: bondKpiLinkedRateConfig.data.facetKeys,
              }
            : {
                configId: "N/A (Not created)",
                version: 0,
                facetCount: 0,
                facets: [],
              },
        bondSustainabilityPerformanceTargetRate:
          bondSustainabilityPerformanceTargetRateConfig && bondSustainabilityPerformanceTargetRateConfig.success
            ? {
                configId: bondSustainabilityPerformanceTargetRateConfig.data.configurationId,
                version: bondSustainabilityPerformanceTargetRateConfig.data.version,
                facetCount: bondSustainabilityPerformanceTargetRateConfig.data.facetKeys.length,
                facets: bondSustainabilityPerformanceTargetRateConfig.data.facetKeys,
              }
            : {
                configId: "N/A (Not created)",
                version: 0,
                facetCount: 0,
                facets: [],
              },
      },

      summary: {
        totalContracts: 1 + (factoryResult ? 1 : 0), // ProxyAdmin + Factory (if deployed)
        totalFacets: facetsResult?.deployed.size || 0,
        totalConfigurations:
          (equityConfig ? 1 : 0) +
          (bondConfig ? 1 : 0) +
          (bondFixedRateConfig ? 1 : 0) +
          (bondKpiLinkedRateConfig ? 1 : 0) +
          (bondSustainabilityPerformanceTargetRateConfig ? 1 : 0),
        deploymentTime: endTime - startTime,
        gasUsed: totalGasUsed.toString(),
        success: true,
        skippedSteps,
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
        workflow: "existingBlr",
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
    if (skippedSteps.length > 0) {
      info(`⏭️  Skipped steps: ${skippedSteps.join(", ")}`);
    }
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
      stepName: getStepName(failedStep, "existingBlr"),
      error: errorMessage,
      timestamp: new Date().toISOString(),
      stackTrace,
    };

    try {
      await checkpointManager.saveCheckpoint(checkpoint);
      warn(`\n💾 Checkpoint saved with failure information: ${checkpoint.checkpointId}`);
      warn("   You can resume this deployment by running again with the same network and BLR address.");
    } catch (saveError) {
      warn(`   Warning: Could not save checkpoint: ${saveError}`);
    }

    throw error;
  }
}
