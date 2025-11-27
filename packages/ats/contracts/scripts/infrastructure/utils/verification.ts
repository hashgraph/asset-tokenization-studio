// SPDX-License-Identifier: Apache-2.0

/**
 * Contract verification utilities for ATS deployment system.
 *
 * Provides functions to verify contract deployments are successful
 * by checking bytecode existence and interface validation.
 *
 * @module core/utils/verification
 */

import { providers, Contract, utils } from "ethers";
import { retryTransaction, RetryOptions } from "./transaction";
import { debug } from "./logging";

/**
 * Options for contract verification.
 */
export interface VerificationOptions {
  /** Whether to retry verification if it fails (default: true) */
  enableRetry?: boolean;
  /** Retry options for verification attempts */
  retryOptions?: RetryOptions;
  /** Whether to log verification steps (default: true) */
  verbose?: boolean;
}

/**
 * Default verification options.
 */
export const DEFAULT_VERIFICATION_OPTIONS: Required<VerificationOptions> = {
  enableRetry: true,
  retryOptions: {
    maxRetries: 3,
    baseDelay: 1000, // Shorter delay for verification checks
    maxDelay: 8000,
    logRetries: false, // Don't spam logs for verification retries
  },
  verbose: true,
};

/**
 * Result of contract verification.
 */
export interface VerificationResult {
  /** Whether verification was successful */
  success: boolean;
  /** Error message if verification failed */
  error?: string;
  /** Bytecode size in bytes (if code check was performed) */
  codeSize?: number;
  /** Function selectors found (if interface check was performed) */
  selectors?: string[];
}

/**
 * Verify that a contract has been deployed by checking for bytecode at the address.
 *
 * @param provider - Ethereum provider
 * @param address - Contract address to verify
 * @param options - Verification options
 * @returns Promise resolving to verification result
 *
 * @example
 * ```typescript
 * const result = await verifyContractCode(provider, "0x123...", { verbose: true })
 * if (result.success) {
 *   console.log(`Contract deployed with ${result.codeSize} bytes of code`)
 * }
 * ```
 */
export async function verifyContractCode(
  provider: providers.Provider,
  address: string,
  options: VerificationOptions = {},
): Promise<VerificationResult> {
  const { enableRetry, retryOptions, verbose } = { ...DEFAULT_VERIFICATION_OPTIONS, ...options };

  try {
    const checkCode = async (): Promise<VerificationResult> => {
      if (verbose) {
        debug(`Verifying bytecode at ${address}...`);
      }

      // Get code at address
      const code = await provider.getCode(address);

      // Check if code exists (not "0x" or "0x0")
      if (!code || code === "0x" || code === "0x0") {
        return {
          success: false,
          error: `No bytecode found at address ${address}`,
          codeSize: 0,
        };
      }

      const codeSize = (code.length - 2) / 2; // Remove "0x" prefix and divide by 2 (hex encoding)

      if (verbose) {
        debug(`✓ Bytecode verified: ${codeSize} bytes`);
      }

      return {
        success: true,
        codeSize,
      };
    };

    // Use retry mechanism if enabled
    if (enableRetry) {
      return await retryTransaction(checkCode, retryOptions);
    }

    return await checkCode();
  } catch (error) {
    return {
      success: false,
      error: `Verification failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Verify that a contract implements expected interface by checking function selectors.
 *
 * @param contract - Contract instance with connected provider
 * @param expectedSelectors - Array of expected function selectors (e.g., ["0x12345678"])
 * @param options - Verification options
 * @returns Promise resolving to verification result
 *
 * @example
 * ```typescript
 * const contract = new Contract(address, abi, provider)
 * const result = await verifyContractInterface(
 *   contract,
 *   ["0x01ffc9a7"], // supportsInterface selector
 *   { verbose: true }
 * )
 * ```
 */
export async function verifyContractInterface(
  contract: Contract,
  expectedSelectors: string[],
  options: VerificationOptions = {},
): Promise<VerificationResult> {
  const { enableRetry, retryOptions, verbose } = { ...DEFAULT_VERIFICATION_OPTIONS, ...options };

  try {
    const checkInterface = async (): Promise<VerificationResult> => {
      if (verbose) {
        debug(`Verifying interface at ${contract.address}...`);
      }

      const foundSelectors: string[] = [];
      const missingSelectors: string[] = [];

      // Check each expected selector
      for (const selector of expectedSelectors) {
        try {
          // Try to call the function with selector (static call)
          await contract.provider.call({
            to: contract.address,
            data: selector + "0".repeat(56), // Pad selector to full function call
          });

          foundSelectors.push(selector);
        } catch (error) {
          // Function doesn't exist or reverted
          missingSelectors.push(selector);
        }
      }

      if (missingSelectors.length > 0) {
        return {
          success: false,
          error: `Missing function selectors: ${missingSelectors.join(", ")}`,
          selectors: foundSelectors,
        };
      }

      if (verbose) {
        debug(`✓ Interface verified: ${foundSelectors.length} functions found`);
      }

      return {
        success: true,
        selectors: foundSelectors,
      };
    };

    // Use retry mechanism if enabled
    if (enableRetry) {
      return await retryTransaction(checkInterface, retryOptions);
    }

    return await checkInterface();
  } catch (error) {
    return {
      success: false,
      error: `Interface verification failed: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Comprehensive contract verification combining code and interface checks.
 *
 * @param provider - Ethereum provider
 * @param address - Contract address to verify
 * @param contractInterface - Optional contract interface for function selector validation
 * @param options - Verification options
 * @returns Promise resolving to verification result
 *
 * @example
 * ```typescript
 * const facetInterface = new utils.Interface(FacetABI)
 * const result = await verifyContract(
 *   provider,
 *   "0x123...",
 *   facetInterface,
 *   { verbose: true }
 * )
 * ```
 */
export async function verifyContract(
  provider: providers.Provider,
  address: string,
  contractInterface?: utils.Interface,
  options: VerificationOptions = {},
): Promise<VerificationResult> {
  // First, verify bytecode exists
  const codeResult = await verifyContractCode(provider, address, options);

  if (!codeResult.success) {
    return codeResult;
  }

  // If interface provided, verify function selectors
  if (contractInterface) {
    const selectors = Object.keys(contractInterface.functions).map((sig) => contractInterface.getSighash(sig));

    const contract = new Contract(address, contractInterface, provider);
    const interfaceResult = await verifyContractInterface(contract, selectors.slice(0, 3), options); // Check first 3 functions as sample

    if (!interfaceResult.success) {
      return {
        ...interfaceResult,
        codeSize: codeResult.codeSize,
      };
    }

    return {
      success: true,
      codeSize: codeResult.codeSize,
      selectors: interfaceResult.selectors,
    };
  }

  return codeResult;
}
