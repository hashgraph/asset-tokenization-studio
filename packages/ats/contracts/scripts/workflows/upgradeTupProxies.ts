// SPDX-License-Identifier: Apache-2.0

/**
 * Upgrade TransparentUpgradeableProxy implementations workflow.
 *
 * Upgrades BLR (Business Logic Resolver) TUP to new implementations by:
 * 1. Validating ProxyAdmin address and permissions
 * 2. Deploying new implementations OR using provided addresses (two patterns)
 * 3. Verifying current vs target implementations
 * 4. Upgrading proxies via ProxyAdmin with continue-on-error pattern
 * 5. Verifying post-upgrade implementations match expected
 *
 * ## Architecture Context
 *
 * This workflow upgrades **TransparentUpgradeableProxy (TUP)** infrastructure contracts.
 * TUP uses EIP-1967 pattern with ProxyAdmin for centralized upgrade management.
 *
 * Factory is a ResolverProxy (Diamond pattern), not a TUP. Factory upgrades use different
 * mechanisms and are not handled by this workflow.
 * See CLAUDE.md for detailed proxy pattern comparison.
 *
 * ## Two Patterns
 *
 * ### Pattern A: Deploy New Implementation
 *
 * Deploy new implementation contract and upgrade proxy in one workflow:
 *
 * ```typescript
 * const result = await upgradeTupProxies(signer, 'hedera-testnet', {
 *   proxyAdminAddress: '0x...',
 *   blrProxyAddress: '0x...',
 *   deployNewBlrImpl: true,  // Deploy new implementation
 *   saveOutput: true,
 * });
 * ```
 *
 * ### Pattern B: Upgrade to Existing Implementation
 *
 * Upgrade to pre-deployed implementation address:
 *
 * ```typescript
 * const result = await upgradeTupProxies(signer, 'hedera-testnet', {
 *   proxyAdminAddress: '0x...',
 *   blrProxyAddress: '0x...',
 *   blrImplementationAddress: '0x...', // Use existing implementation
 *   saveOutput: true,
 * });
 * ```
 *
 * ## Upgrade Phases
 *
 * 1. **Validate**: ProxyAdmin exists, proxies specified, implementations provided
 * 2. **Deploy**: New implementations deployed (if requested)
 * 3. **Verify**: Implementation bytecode matches expected values
 * 4. **Upgrade**: ProxyAdmin.upgrade() called for each proxy
 * 5. **Verify**: Proxies now point to new implementations
 *
 * ## Resumable Upgrades
 *
 * Checkpoints enable resuming failed upgrades:
 *
 * - Saves state after each phase completes
 * - On failure, re-running same command resumes from last checkpoint
 * - Automatically cleans up checkpoints on success
 * - Progress tracked in `deployments/{network}/.checkpoints/` directory
 *
 * ## Environment Variables (CLI)
 *
 * - `PROXY_ADMIN` (required): ProxyAdmin contract address
 * - `BLR_PROXY` (optional): BLR proxy to upgrade
 * - `FACTORY_PROXY` (optional): Factory proxy to upgrade
 * - `DEPLOY_NEW_BLR_IMPL` (optional): Set to true to deploy new BLR implementation
 * - `DEPLOY_NEW_FACTORY_IMPL` (optional): Set to true to deploy new Factory implementation
 * - `BLR_IMPLEMENTATION` (optional): Existing BLR implementation address
 * - `FACTORY_IMPLEMENTATION` (optional): Existing Factory implementation address
 * - `HEDERA_TESTNET_PRIVATE_KEY` (required): Private key for transactions
 *
 * Note: For each proxy, either deployNewXImpl=true OR implementationAddress must be provided.
 *
 * ## Error Handling
 *
 * - Validation errors throw immediately (prevents invalid operations)
 * - Individual proxy upgrade failures don't stop the workflow
 * - All failures logged and returned in output
 * - Enable checkpoint resumption to retry failed phases
 *
 * ## Gas Estimation
 *
 * - Implementation deployment: ~2-3M gas
 * - Proxy upgrade: ~100-200K gas per proxy
 * - Verification: ~100K gas total
 * - Total for both BLR+Factory: ~5-6M gas
 *
 * @module workflows/upgradeTupProxies
 */

import { Signer } from "ethers";
import { z } from "zod";
import {
  upgradeProxy,
  deployContract,
  getProxyImplementation,
  success,
  info,
  warn,
  error as logError,
  section,
  CheckpointManager,
  NullCheckpointManager,
  type DeploymentCheckpoint,
  type ResumeOptions,
  type UpgradeTupProxiesOutputType,
  type UpgradeProxyResult,
  validateAddress,
  saveDeploymentOutput,
} from "@scripts/infrastructure";
import { ProxyAdmin__factory, BusinessLogicResolver__factory } from "@contract-types";

// ============================================================================
// Constants
// ============================================================================

const UPGRADE_TUP_WORKFLOW_STEPS = {
  VALIDATE: 0,
  DEPLOY_IMPLEMENTATIONS: 1,
  VERIFY_IMPLEMENTATIONS: 2,
  UPGRADE_PROXIES: 3,
  VERIFY_UPGRADES: 4,
  COMPLETE: 5,
} as const;

// ============================================================================
// Runtime Validation Schemas
// ============================================================================

const EthAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Invalid Ethereum address");

// Optional address schema that accepts empty strings and converts them to undefined
const OptionalEthAddressSchema = z
  .string()
  .optional()
  .transform((val) => (val === "" ? undefined : val))
  .pipe(z.union([z.undefined(), EthAddressSchema]));

const UpgradeTupProxiesOptionsSchema = z.object({
  proxyAdminAddress: EthAddressSchema,
  blrProxyAddress: OptionalEthAddressSchema,
  deployNewBlrImpl: z.boolean().optional(),
  blrImplementationAddress: OptionalEthAddressSchema,
  blrInitData: z.string().optional(),
  confirmations: z.number().int().nonnegative().optional(),
  enableRetry: z.boolean().optional(),
  verifyDeployment: z.boolean().optional(),
  saveOutput: z.boolean().optional().default(true),
  outputPath: z.string().optional(),
  deleteOnSuccess: z.boolean().optional().default(false),
  checkpointDir: z.string().optional(),
  resumeFrom: z.string().optional(),
  autoResume: z.boolean().optional(),
  ignoreCheckpoint: z.boolean().optional(),
});

// ============================================================================
// Types
// ============================================================================

export interface UpgradeTupProxiesOptions extends ResumeOptions {
  proxyAdminAddress: string;
  blrProxyAddress?: string;
  deployNewBlrImpl?: boolean;
  blrImplementationAddress?: string;
  blrInitData?: string;
  confirmations?: number;
  enableRetry?: boolean;
  verifyDeployment?: boolean;
  saveOutput?: boolean;
  outputPath?: string;
}

export interface DeployedContract {
  address: string;
  transactionHash: string;
  gasUsed?: number;
}

export type UpgradeTupProxiesOutput = UpgradeTupProxiesOutputType;

interface ImplementationData {
  name: "blr" | "factory";
  proxyAddress?: string;
  implementationAddress?: string;
  initData?: string;
}

interface UpgradePhaseContext {
  signer: Signer;
  network: string;
  options: UpgradeTupProxiesOptions;
  checkpoint: DeploymentCheckpoint;
  proxyAdminContract: ReturnType<typeof ProxyAdmin__factory.connect>;
  checkpointManager: CheckpointManager | NullCheckpointManager;
  startTime: number;
  totalGasUsed: number;
  upgradeResults: Map<string, UpgradeProxyResult>;
  deployedImplementations: Map<string, DeployedContract>;
}

// ============================================================================
// Phase Functions (Private)
// ============================================================================

async function validateAndInitialize(
  signer: Signer,
  network: string,
  options: z.infer<typeof UpgradeTupProxiesOptionsSchema>,
): Promise<UpgradePhaseContext> {
  const deployer = await signer.getAddress();

  validateAddress(options.proxyAdminAddress, "ProxyAdmin address");

  if (!options.blrProxyAddress) {
    throw new Error("BLR proxy address is required");
  }

  validateAddress(options.blrProxyAddress, "BLR proxy address");
  if (!options.deployNewBlrImpl && !options.blrImplementationAddress) {
    throw new Error("BLR proxy specified but neither deployNewBlrImpl=true nor blrImplementationAddress provided");
  }

  const proxyAdminContract = ProxyAdmin__factory.connect(options.proxyAdminAddress, signer);

  const checkpointManager = new CheckpointManager(network, options.checkpointDir);

  const checkpoint = checkpointManager.createCheckpoint({
    workflowType: "upgradeTupProxies",
    network,
    deployer,
    options: {},
  });

  info(`✓ ProxyAdmin validated: ${options.proxyAdminAddress}`);
  info(`✓ Checkpoint initialized: ${checkpoint.checkpointId}`);

  return {
    signer,
    network,
    options,
    checkpoint,
    proxyAdminContract,
    checkpointManager,
    startTime: Date.now(),
    totalGasUsed: 0,
    upgradeResults: new Map(),
    deployedImplementations: new Map(),
  };
}

async function deployImplementationsPhase(ctx: UpgradePhaseContext): Promise<void> {
  const { checkpoint, checkpointManager } = ctx;

  if (checkpoint.currentStep > UPGRADE_TUP_WORKFLOW_STEPS.DEPLOY_IMPLEMENTATIONS) {
    info("ℹ Skipping Phase 1 (already completed)");
    return;
  }

  section("Phase 1: Deploy Implementations");
  checkpoint.currentStep = UPGRADE_TUP_WORKFLOW_STEPS.DEPLOY_IMPLEMENTATIONS;

  try {
    if (ctx.options.deployNewBlrImpl && ctx.options.blrProxyAddress) {
      info("Deploying new BLR implementation...");

      const blrFactory = new BusinessLogicResolver__factory(ctx.signer);
      const result = await deployContract(blrFactory, { args: [] });

      if (!result.success || !result.address || !result.transactionHash) {
        throw new Error(`BLR implementation deployment failed: ${result.error || "Unknown error"}`);
      }

      const deployedBlr: DeployedContract = {
        address: result.address,
        transactionHash: result.transactionHash,
        gasUsed: result.gasUsed,
      };

      ctx.deployedImplementations.set("blr", deployedBlr);
      ctx.totalGasUsed += result.gasUsed || 0;
      success(`✓ BLR implementation deployed: ${result.address}`);
    }

    if (ctx.options.blrImplementationAddress && !ctx.options.deployNewBlrImpl) {
      validateAddress(ctx.options.blrImplementationAddress, "BLR implementation address");
      info(`✓ Using provided BLR implementation: ${ctx.options.blrImplementationAddress}`);
    }

    await checkpointManager.saveCheckpoint(checkpoint);
    success("Phase 1 complete");
  } catch (err) {
    logError(`Phase 1 failed: ${err instanceof Error ? err.message : String(err)}`);
    await checkpointManager.saveCheckpoint(checkpoint);
    throw err;
  }
}

async function verifyImplementationsPhase(ctx: UpgradePhaseContext): Promise<void> {
  const { signer, checkpoint, checkpointManager } = ctx;

  if (checkpoint.currentStep > UPGRADE_TUP_WORKFLOW_STEPS.VERIFY_IMPLEMENTATIONS) {
    info("ℹ Skipping Phase 2 (already completed)");
    return;
  }

  section("Phase 2: Verify Implementations");
  checkpoint.currentStep = UPGRADE_TUP_WORKFLOW_STEPS.VERIFY_IMPLEMENTATIONS;

  try {
    const provider = signer.provider;
    if (!provider) {
      throw new Error("Signer must have a provider");
    }

    if (ctx.options.blrProxyAddress) {
      const blrCurrentImpl = await getProxyImplementation(provider, ctx.options.blrProxyAddress);
      const blrTargetImpl = ctx.deployedImplementations.get("blr")?.address || ctx.options.blrImplementationAddress;

      if (!blrTargetImpl) {
        throw new Error("BLR target implementation not found");
      }

      if (blrCurrentImpl.toLowerCase() === blrTargetImpl.toLowerCase()) {
        warn(`⚠ BLR proxy already at target implementation: ${blrTargetImpl}`);
      } else {
        info(`BLR current: ${blrCurrentImpl}`);
        info(`BLR target:  ${blrTargetImpl}`);
      }
    }

    await checkpointManager.saveCheckpoint(checkpoint);
    success("Phase 2 complete");
  } catch (err) {
    logError(`Phase 2 failed: ${err instanceof Error ? err.message : String(err)}`);
    await checkpointManager.saveCheckpoint(checkpoint);
    throw err;
  }
}

async function upgradeProxiesPhase(ctx: UpgradePhaseContext): Promise<void> {
  const { checkpoint, checkpointManager, proxyAdminContract } = ctx;

  if (checkpoint.currentStep > UPGRADE_TUP_WORKFLOW_STEPS.UPGRADE_PROXIES) {
    info("ℹ Skipping Phase 3 (already completed)");
    return;
  }

  section("Phase 3: Upgrade Proxies");
  checkpoint.currentStep = UPGRADE_TUP_WORKFLOW_STEPS.UPGRADE_PROXIES;

  try {
    const implementations: ImplementationData[] = [];

    if (ctx.options.blrProxyAddress) {
      const blrImpl = ctx.deployedImplementations.get("blr")?.address || ctx.options.blrImplementationAddress;
      if (!blrImpl) {
        throw new Error("BLR implementation address not found");
      }

      implementations.push({
        name: "blr",
        proxyAddress: ctx.options.blrProxyAddress,
        implementationAddress: blrImpl,
        initData: ctx.options.blrInitData,
      });
    }

    for (const impl of implementations) {
      try {
        info(`Upgrading ${impl.name} proxy...`);

        const result = await upgradeProxy(proxyAdminContract, {
          proxyAddress: impl.proxyAddress!,
          newImplementationAddress: impl.implementationAddress!,
          initData: impl.initData,
          verify: ctx.options.verifyDeployment,
        });

        if (result.success) {
          ctx.upgradeResults.set(impl.proxyAddress!, result as UpgradeProxyResult);
          ctx.totalGasUsed += result.gasUsed || 0;

          if (result.upgraded) {
            success(`✓ ${impl.name} proxy upgraded successfully`);
          } else {
            warn(`⚠ ${impl.name} proxy already at target implementation`);
          }
        } else {
          logError(`✗ ${impl.name} proxy upgrade failed: ${result.error}`);
          ctx.upgradeResults.set(impl.proxyAddress!, result as UpgradeProxyResult);
        }
      } catch (err) {
        logError(`✗ ${impl.name} proxy upgrade failed: ${err instanceof Error ? err.message : String(err)}`);

        const errorResult: UpgradeProxyResult = {
          proxyAddress: impl.proxyAddress!,
          success: false,
          upgraded: false,
          oldImplementation: "unknown",
          newImplementation: impl.implementationAddress!,
          error: err instanceof Error ? err.message : String(err),
        };

        ctx.upgradeResults.set(impl.proxyAddress!, errorResult);
      }
    }

    await checkpointManager.saveCheckpoint(checkpoint);
    success("Phase 3 complete");
  } catch (err) {
    logError(`Phase 3 failed: ${err instanceof Error ? err.message : String(err)}`);
    await checkpointManager.saveCheckpoint(checkpoint);
    throw err;
  }
}

async function verifyUpgradesPhase(ctx: UpgradePhaseContext): Promise<void> {
  const { signer, checkpoint, checkpointManager } = ctx;

  if (checkpoint.currentStep > UPGRADE_TUP_WORKFLOW_STEPS.VERIFY_UPGRADES) {
    info("ℹ Skipping Phase 4 (already completed)");
    return;
  }

  section("Phase 4: Verify Upgrades");
  checkpoint.currentStep = UPGRADE_TUP_WORKFLOW_STEPS.VERIFY_UPGRADES;

  try {
    const provider = signer.provider;
    if (!provider) {
      throw new Error("Signer must have a provider");
    }

    for (const [proxyAddress, upgradeResult] of ctx.upgradeResults.entries()) {
      if (!upgradeResult.success || !upgradeResult.upgraded) {
        continue;
      }

      try {
        const currentImpl = await getProxyImplementation(provider, proxyAddress);
        const expectedImpl = upgradeResult.newImplementation;

        if (currentImpl.toLowerCase() === expectedImpl.toLowerCase()) {
          success(`✓ Upgrade verified for ${proxyAddress}`);
        } else {
          logError(`✗ Upgrade verification failed for ${proxyAddress}: expected ${expectedImpl}, found ${currentImpl}`);
        }
      } catch (err) {
        logError(`✗ Failed to verify ${proxyAddress}: ${err instanceof Error ? err.message : String(err)}`);
      }
    }

    await checkpointManager.saveCheckpoint(checkpoint);
    success("Phase 4 complete");
  } catch (err) {
    logError(`Phase 4 failed: ${err instanceof Error ? err.message : String(err)}`);
    await checkpointManager.saveCheckpoint(checkpoint);
    throw err;
  }
}

// ============================================================================
// Main Export Function

/**
 * Upgrade TransparentUpgradeableProxy implementations for BLR.
 *
 * Orchestrates a complete upgrade workflow for BLR TUP infrastructure contract:
 * 1. Validates all required addresses and configurations
 * 2. Deploys new implementations (if requested)
 * 3. Verifies implementations are bytecode-correct
 * 4. Upgrades BLR proxy via ProxyAdmin
 * 5. Verifies proxy now points to new implementation
 *
 * ## Pattern A: Deploy and Upgrade
 *
 * Deploy new implementation and upgrade BLR proxy:
 *
 * ```typescript
 * const result = await upgradeTupProxies(signer, 'hedera-testnet', {
 *   proxyAdminAddress: '0x1234...',
 *   blrProxyAddress: '0x5678...',
 *   deployNewBlrImpl: true,
 *   confirmations: 2,
 *   verifyDeployment: true,
 *   saveOutput: true,
 * });
 *
 * console.log(`Upgraded ${result.summary.proxiesUpgraded} proxies`);
 * console.log(`Gas used: ${result.summary.gasUsed}`);
 * ```
 *
 * ## Pattern B: Upgrade to Existing Implementation
 *
 * Upgrade to pre-deployed implementation:
 *
 * ```typescript
 * const result = await upgradeTupProxies(signer, 'hedera-testnet', {
 *   proxyAdminAddress: '0x1234...',
 *   blrProxyAddress: '0x5678...',
 *   blrImplementationAddress: '0xabcd...',  // Existing implementation
 *   confirmations: 2,
 *   saveOutput: true,
 * });
 * ```
 *
 * ## Resumable Upgrades
 *
 * If upgrade fails, re-run the same command to resume:
 *
 * ```typescript
 * // First attempt (may fail)
 * try {
 *   await upgradeTupProxies(signer, 'hedera-testnet', options);
 * } catch (err) {
 *   console.log('Upgrade failed, checkpoint saved');
 * }
 *
 * // Fix the issue, then retry
 * // Workflow automatically resumes from last checkpoint
 * const result = await upgradeTupProxies(signer, 'hedera-testnet', options);
 * ```
 *
 * @param signer - Ethers.js Signer for transaction signing (must have provider)
 * @param network - Network identifier (hedera-testnet, hedera-mainnet, etc.)
 * @param options - Upgrade configuration options
 * @param options.proxyAdminAddress - ProxyAdmin contract address (required)
 * @param options.blrProxyAddress - BLR proxy address to upgrade (optional)
 * @param options.deployNewBlrImpl - Deploy new BLR implementation (optional, default: false)
 * @param options.blrImplementationAddress - Existing BLR implementation address (optional)
 * @param options.blrInitData - Initialization data for BLR upgrade (optional)
 * @param options.confirmations - Block confirmations to wait (optional, default: 2)
 * @param options.enableRetry - Enable automatic retry with backoff (optional, default: true)
 * @param options.verifyDeployment - Verify bytecode after deployment (optional, default: true)
 * @param options.saveOutput - Save upgrade results to file (optional, default: true)
 * @param options.outputPath - Custom output file path (optional)
 * @param options.checkpointDir - Checkpoint directory (optional, default: deployments/{network}/.checkpoints)
 * @param options.resumeFrom - Resume from specific checkpoint ID (optional)
 * @param options.autoResume - Auto-resume if checkpoint found (optional, default: true)
 * @returns Promise resolving to upgrade output with results and summary
 * @throws Error if validation fails, deployments fail, or upgrades fail
 *
 * @example
 * // Upgrade BLR implementation
 * const signer = new ethers.Wallet(privateKey, provider);
 * const result = await upgradeTupProxies(signer, 'hedera-testnet', {
 *   proxyAdminAddress: '0x...',
 *   blrProxyAddress: '0x...',
 *   deployNewBlrImpl: true,
 *   saveOutput: true,
 * });
 * console.log(`Upgraded ${result.summary.proxiesUpgraded} proxy`);
 *
 * @example
 * // Upgrade to existing implementation
 * const result = await upgradeTupProxies(signer, 'hedera-testnet', {
 *   proxyAdminAddress: '0x...',
 *   blrProxyAddress: '0x...',
 *   blrImplementationAddress: '0x...', // Pre-deployed
 *   saveOutput: true,
 * });
 *
 * @example
 * // Resume failed upgrade
 * try {
 *   await upgradeTupProxies(signer, 'hedera-testnet', options);
 * } catch (e) {
 *   console.log('Upgrade failed');
 *   // Fix the issue (e.g., fund account)
 *   // Retry - automatically resumes from checkpoint
 *   const result = await upgradeTupProxies(signer, 'hedera-testnet', options);
 * }
 */

export async function upgradeTupProxies(
  signer: Signer,
  network: string,
  options: UpgradeTupProxiesOptions,
): Promise<UpgradeTupProxiesOutput> {
  let validatedOptions: z.infer<typeof UpgradeTupProxiesOptionsSchema>;
  try {
    validatedOptions = UpgradeTupProxiesOptionsSchema.parse(options);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => {
        const path = issue.path.join(".");
        return `${path}: ${issue.message}`;
      });
      throw new Error(`Invalid upgrade options:\n${issues.join("\n")}`);
    }
    throw error;
  }

  const { saveOutput = true, outputPath, deleteOnSuccess = false } = validatedOptions;
  const deployer = await signer.getAddress();

  section("BLR TUP Proxy Upgrade");
  info("═".repeat(60));
  info(`📡 Network: ${network}`);
  info(`👤 Deployer: ${deployer}`);
  info(`🔷 ProxyAdmin: ${validatedOptions.proxyAdminAddress}`);
  info(`🔗 BLR Proxy: ${validatedOptions.blrProxyAddress}`);
  info("═".repeat(60));

  let ctx: UpgradePhaseContext | undefined;

  try {
    info("\n🔍 Step 0: Validating ProxyAdmin address...");
    ctx = await validateAndInitialize(signer, network, validatedOptions);

    await deployImplementationsPhase(ctx);
    await verifyImplementationsPhase(ctx);
    await upgradeProxiesPhase(ctx);
    await verifyUpgradesPhase(ctx);

    ctx.checkpoint.currentStep = UPGRADE_TUP_WORKFLOW_STEPS.COMPLETE;

    const deploymentTime = Date.now() - ctx.startTime;

    const output: UpgradeTupProxiesOutput = {
      network,
      timestamp: new Date().toISOString(),
      deployer,
      proxyAdmin: { address: validatedOptions.proxyAdminAddress },
      implementations: ctx.deployedImplementations.size > 0 ? {} : undefined,
      summary: {
        proxiesUpgraded: Array.from(ctx.upgradeResults.values()).filter((r) => r.success && r.upgraded).length,
        proxiesFailed: Array.from(ctx.upgradeResults.values()).filter((r) => !r.success).length,
        deploymentTime,
        gasUsed: ctx.totalGasUsed.toString(),
        success: true,
      },
    };

    if (output.implementations) {
      const blrDeployed = ctx.deployedImplementations.get("blr");
      if (blrDeployed) {
        output.implementations.blr = blrDeployed;
      }
    }

    const blrUpgradeResult = ctx.upgradeResults.get(validatedOptions.blrProxyAddress || "");
    if (blrUpgradeResult) {
      output.blrUpgrade = blrUpgradeResult;
    }

    await ctx.checkpointManager.saveCheckpoint(ctx.checkpoint);

    if (saveOutput) {
      const result = await saveDeploymentOutput({
        network,
        workflow: "upgradeTupProxies",
        data: output,
        customPath: outputPath,
      });
      if (result.success) {
        info(`Upgrade output saved to: ${result.filepath}`);
      } else {
        warn(`Warning: Could not save upgrade output: ${result.error}`);
      }
    }

    if (deleteOnSuccess) {
      await ctx.checkpointManager.deleteCheckpoint(ctx.checkpoint.checkpointId);
      info("Checkpoint deleted after successful completion");
    }

    success("\n✓ Upgrade completed successfully!");
    info(`  Proxies upgraded: ${output.summary.proxiesUpgraded}`);
    info(`  Proxies failed: ${output.summary.proxiesFailed}`);
    info(`  Total time: ${(deploymentTime / 1000).toFixed(2)}s`);
    info(`  Total gas: ${output.summary.gasUsed}`);

    return output;
  } catch (err) {
    logError(`\n✗ Upgrade failed: ${err instanceof Error ? err.message : String(err)}`);

    if (ctx) {
      try {
        await ctx.checkpointManager.saveCheckpoint(ctx.checkpoint);
        info(`Resume with: npm run upgrade:tup -- --resumeFrom ${ctx.checkpoint.checkpointId}`);
      } catch (saveErr) {
        logError(`Failed to save checkpoint: ${saveErr instanceof Error ? saveErr.message : String(saveErr)}`);
      }
    }

    throw err;
  }
}
