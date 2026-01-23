// SPDX-License-Identifier: Apache-2.0

import { task, types } from "hardhat/config";
import { GetProxyAdminConfigArgs, GetSignerResult, UpdateFactoryVersionArgs } from "@tasks";

task("updateProxyImplementation", "Update the proxy implementation")
  .addPositionalParam("proxyAdminAddress", "The proxy admin contract address")
  .addPositionalParam("transparentProxyAddress", "The transparent proxy contract address")
  .addPositionalParam("newImplementationAddress", "The new implementation contract address")
  .addOptionalParam("privateKey", "The private key of the account in raw hexadecimal format", undefined, types.string)
  .addOptionalParam(
    "signerAddress",
    "The address of the signer to select from the Hardhat signers array",
    undefined,
    types.string,
  )
  .addOptionalParam("signerPosition", "The index of the signer in the Hardhat signers array", undefined, types.int)
  .setAction(async (args: UpdateFactoryVersionArgs, hre) => {
    // Inlined import due to circular dependency
    const { upgradeProxyImplementation, UpgradeProxyImplementationCommand } = await import("@scripts");
    console.log(`Executing updateFactoryVersion on ${hre.network.name} ...`);
    const {
      privateKey,
      signerAddress,
      signerPosition,
      proxyAdminAddress,
      transparentProxyAddress,
      newImplementationAddress,
    } = args;
    const { signer }: GetSignerResult = await hre.run("getSigner", {
      privateKey: privateKey,
      signerAddress: signerAddress,
      signerPosition: signerPosition,
    });
    await upgradeProxyImplementation(
      new UpgradeProxyImplementationCommand({
        proxyAdminAddress,
        transparentProxyAddress,
        newImplementationAddress,
        signer,
      }),
    );

    console.log("Factory version updated");
  });

task("getProxyAdminConfig", "Get Proxy Admin owner and implementation")
  .addPositionalParam("proxyAdmin", "The proxy admin contract address", undefined, types.string)
  .addPositionalParam("proxy", "The proxy contract address", undefined, types.string)
  .setAction(async (args: GetProxyAdminConfigArgs, hre) => {
    console.log(`Executing getProxyAdminConfig on ${hre.network.name} ...`);
    const { ProxyAdmin__factory } = await import("@typechain");

    const proxyAdmin = ProxyAdmin__factory.connect(args.proxyAdmin, hre.ethers.provider);

    const owner = await proxyAdmin.owner();
    const implementation = await proxyAdmin.getProxyImplementation(args.proxy);

    console.log(`Owner: ${owner}, Implementation: ${implementation}`);
  });
