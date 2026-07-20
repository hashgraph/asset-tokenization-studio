// SPDX-License-Identifier: Apache-2.0

/**
 * Operational tasks for issued tokens (ResolverProxy diamonds).
 *
 * Tokens are created by the Factory at runtime, so their addresses live outside
 * any Ignition module or journal. These tasks are the entry point for managing
 * their pinned (resolver, configurationId, version) — see DEPLOYMENT.md.
 */

import { task, types } from "hardhat/config";
import { GetSignerArgs, GetSignerResult } from "../lib/signer";

interface TokenInfoArgs {
  proxy: string;
}

interface TokenUpdateVersionArgs extends GetSignerArgs {
  proxy: string;
  newVersion: number;
}

interface TokenUpdateConfigArgs extends TokenUpdateVersionArgs {
  configId: string;
}

interface TokenUpdateResolverArgs extends TokenUpdateConfigArgs {
  resolver: string;
}

task("ats:token:info", "Read the pinned (resolver, configId, version) of an issued token")
  .addPositionalParam("proxy", "The token ResolverProxy address", undefined, types.string)
  .setAction(async (args: TokenInfoArgs, hre) => {
    const { getResolverProxyConfigInfo } = await import("@lib/operations");

    const info = await getResolverProxyConfigInfo(hre.ethers.provider, args.proxy);

    console.log(`Token ${args.proxy} on ${hre.network.name}:`);
    console.log(`  Resolver (BLR):        ${info.resolver}`);
    console.log(`  Configuration ID:      ${info.configurationId}`);
    console.log(`  Configuration version: ${info.configurationVersion}`);
    console.log(`  Replacement enabled:   ${info.replacementEnabled}`);
    return info;
  });

task("ats:token:update-version", "Update the pinned configuration version of an issued token")
  .addPositionalParam("proxy", "The token ResolverProxy address", undefined, types.string)
  .addPositionalParam("newVersion", "The configuration version to pin", undefined, types.int)
  .addOptionalParam("privateKey", "The private key of the account in raw hexadecimal format", undefined, types.string)
  .addOptionalParam(
    "signerAddress",
    "The address of the signer to select from the Hardhat signers array",
    undefined,
    types.string,
  )
  .addOptionalParam("signerPosition", "The index of the signer in the Hardhat signers array", undefined, types.int)
  .setAction(async (args: TokenUpdateVersionArgs, hre) => {
    const { updateResolverProxyVersion } = await import("@lib/operations");
    const { signer }: GetSignerResult = await hre.run("getSigner", {
      privateKey: args.privateKey,
      signerAddress: args.signerAddress,
      signerPosition: args.signerPosition,
    });

    const result = await updateResolverProxyVersion(signer, args.proxy, args.newVersion);
    console.log(
      `Token ${args.proxy}: version ${result.previousConfig?.configurationVersion} → ${result.newConfig?.configurationVersion}` +
        ` (tx ${result.transactionHash})`,
    );
    return result;
  });

task("ats:token:update-config", "Update the pinned configuration ID and version of an issued token")
  .addPositionalParam("proxy", "The token ResolverProxy address", undefined, types.string)
  .addPositionalParam("configId", "The configuration ID to pin (bytes32)", undefined, types.string)
  .addPositionalParam("newVersion", "The configuration version to pin", undefined, types.int)
  .addOptionalParam("privateKey", "The private key of the account in raw hexadecimal format", undefined, types.string)
  .addOptionalParam(
    "signerAddress",
    "The address of the signer to select from the Hardhat signers array",
    undefined,
    types.string,
  )
  .addOptionalParam("signerPosition", "The index of the signer in the Hardhat signers array", undefined, types.int)
  .setAction(async (args: TokenUpdateConfigArgs, hre) => {
    const { updateResolverProxyConfig } = await import("@lib/operations");
    const { signer }: GetSignerResult = await hre.run("getSigner", {
      privateKey: args.privateKey,
      signerAddress: args.signerAddress,
      signerPosition: args.signerPosition,
    });

    const result = await updateResolverProxyConfig(signer, args.proxy, args.configId, args.newVersion);
    console.log(
      `Token ${args.proxy}: config ${result.previousConfig?.configurationId} v${result.previousConfig?.configurationVersion}` +
        ` → ${result.newConfig?.configurationId} v${result.newConfig?.configurationVersion} (tx ${result.transactionHash})`,
    );
    return result;
  });

task("ats:token:update-resolver", "Re-point an issued token to another BLR, configuration ID and version")
  .addPositionalParam("proxy", "The token ResolverProxy address", undefined, types.string)
  .addPositionalParam("resolver", "The new BusinessLogicResolver address", undefined, types.string)
  .addPositionalParam("configId", "The configuration ID to pin (bytes32)", undefined, types.string)
  .addPositionalParam("newVersion", "The configuration version to pin", undefined, types.int)
  .addOptionalParam("privateKey", "The private key of the account in raw hexadecimal format", undefined, types.string)
  .addOptionalParam(
    "signerAddress",
    "The address of the signer to select from the Hardhat signers array",
    undefined,
    types.string,
  )
  .addOptionalParam("signerPosition", "The index of the signer in the Hardhat signers array", undefined, types.int)
  .setAction(async (args: TokenUpdateResolverArgs, hre) => {
    const { updateResolverProxyResolver } = await import("@lib/operations");
    const { signer }: GetSignerResult = await hre.run("getSigner", {
      privateKey: args.privateKey,
      signerAddress: args.signerAddress,
      signerPosition: args.signerPosition,
    });

    const result = await updateResolverProxyResolver(signer, args.proxy, args.resolver, args.configId, args.newVersion);
    console.log(
      `Token ${args.proxy}: resolver ${result.previousConfig?.resolver} → ${result.newConfig?.resolver}` +
        ` (config ${result.newConfig?.configurationId} v${result.newConfig?.configurationVersion}, tx ${result.transactionHash})`,
    );
    return result;
  });
