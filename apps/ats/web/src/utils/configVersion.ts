// SPDX-License-Identifier: Apache-2.0

import { ResolveLatestConfigVersionRequest } from "@hashgraph/asset-tokenization-sdk";
import { SDKService } from "../services/SDKService";

/**
 * Resolves the configuration version to pin when creating a security.
 *
 * - If `envVersion` parses to an integer >= 1, that value is returned as-is
 *   (explicit pin from the deployment environment).
 * - Otherwise — a `'0'` value, an empty string, or an unset variable — the
 *   function calls the SDK's `resolveLatestConfigVersion` to fetch the latest
 *   registered version from the on-chain diamond cut manager and returns it.
 *
 * The on-chain `DiamondCutManager` rejects `version == 0` with a `VersionZero`
 * revert, so this helper guarantees the caller always supplies a `>= 1` value.
 */
export const resolveConfigVersion = async (
  envVersion: string | undefined,
  configurationId: string,
): Promise<number> => {
  // Number() (not parseInt) so malformed values like "2x" or "1.9" become NaN
  // and fall through to auto-resolve, rather than being silently truncated to a pin.
  const parsed = Number(envVersion);
  if (Number.isInteger(parsed) && parsed >= 1) {
    return parsed;
  }
  return SDKService.resolveLatestConfigVersion(
    new ResolveLatestConfigVersionRequest({
      resolverAddress: SDKService.testnetResolverAddress,
      configurationId,
    }),
  );
};
