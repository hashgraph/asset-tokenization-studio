// SPDX-License-Identifier: Apache-2.0

/**
 * TUP (TransparentUpgradeableProxy) management: check, prepare and execute
 * implementation upgrades via the ProxyAdmin — including the BLR's own proxy.
 * See the responsibility table in DEPLOYMENT.md.
 */

import { task, types } from "hardhat/config";
import { GetSignerArgs, GetSignerResult } from "../lib/signer";

interface ProxyUpgradeArgs extends GetSignerArgs {
  proxy: string;
  proxyAdmin: string;
  impl?: string;
  contract?: string;
  check: boolean;
  prepareOnly: boolean;
}

task("ats:proxy:upgrade", "Upgrade a TransparentUpgradeableProxy implementation via its ProxyAdmin")
  .addPositionalParam("proxy", "The TransparentUpgradeableProxy address", undefined, types.string)
  .addPositionalParam("proxyAdmin", "The ProxyAdmin address", undefined, types.string)
  .addOptionalParam("impl", "Address of an already deployed implementation", undefined, types.string)
  .addOptionalParam("contract", "Contract name to deploy as the new implementation", undefined, types.string)
  .addFlag("check", "Only check whether the proxy needs upgrading to --impl (no transaction)")
  .addFlag("prepareOnly", "Only deploy the new implementation (--contract) without upgrading the proxy")
  .addOptionalParam("privateKey", "The private key of the account in raw hexadecimal format", undefined, types.string)
  .addOptionalParam(
    "signerAddress",
    "The address of the signer to select from the Hardhat signers array",
    undefined,
    types.string,
  )
  .addOptionalParam("signerPosition", "The index of the signer in the Hardhat signers array", undefined, types.int)
  .setAction(async (args: ProxyUpgradeArgs, hre) => {
    const { upgradeProxy, proxyNeedsUpgrade, prepareUpgrade } = await import("@lib/operations");
    const { ProxyAdmin__factory } = await import("@contract-types");

    if (args.check) {
      if (!args.impl) {
        throw new Error("--check requires --impl <address> to compare against");
      }
      const needsUpgrade = await proxyNeedsUpgrade(hre.ethers.provider, args.proxy, args.impl);
      console.log(
        needsUpgrade
          ? `Proxy ${args.proxy} needs upgrading to ${args.impl}`
          : `Proxy ${args.proxy} is already at ${args.impl}`,
      );
      return { needsUpgrade };
    }

    const { signer }: GetSignerResult = await hre.run("getSigner", {
      privateKey: args.privateKey,
      signerAddress: args.signerAddress,
      signerPosition: args.signerPosition,
    });

    if (args.prepareOnly) {
      if (!args.contract) {
        throw new Error("--prepare-only requires --contract <name> to deploy");
      }
      const factory = await hre.ethers.getContractFactory(args.contract, signer);
      const implAddress = await prepareUpgrade(factory);
      console.log(`New ${args.contract} implementation deployed at ${implAddress} (proxy NOT upgraded)`);
      return { implAddress };
    }

    if (!args.impl && !args.contract) {
      throw new Error("Provide either --impl <address> or --contract <name> for the new implementation");
    }

    const proxyAdmin = ProxyAdmin__factory.connect(args.proxyAdmin, signer);
    const result = await upgradeProxy(proxyAdmin, {
      proxyAddress: args.proxy,
      ...(args.impl
        ? { newImplementationAddress: args.impl }
        : { newImplementationFactory: await hre.ethers.getContractFactory(args.contract!, signer) }),
    });
    console.log(`Proxy ${args.proxy}: implementation ${result.oldImplementation} → ${result.newImplementation}`);
    return result;
  });
