// SPDX-License-Identifier: Apache-2.0

import { ethers } from "hardhat";

import DeployContractCommand from "./commands/DeployContractCommand";
import DeployContractResult from "./results/DeployContractResult";
import { HEDERA_PRECOMPILED_ADDRESS } from "./constants";

const SuccessStatus = 22;

/**
 * Deploys a smart contract and optionally its proxy and proxy admin.
 *
 * @param {DeployContractCommand} params - The deployment parameters.
 * @param {ContractName} params.name - The name of the contract to deploy.
 * @param {Signer} params.signer - The signer to use for the deployment.
 * @param {Array<any>} params.args - The arguments to pass to the contract constructor.
 * @returns {Promise<DeployContractResult>} A promise that resolves to the deployment result.
 *
 * @example
 * const result = await deployContract({
 *   name: 'MyContract',
 *   signer: mySigner,
 *   args: [arg1, arg2],
 * });
 */
export async function deployLifeCycleCashFlowContracts({
  name,
  signer,
  args,
}: DeployContractCommand): Promise<DeployContractResult> {
  console.log(`Deploying ${name}. please wait...`);

  const contractResult = await deployContract(
    new DeployContractCommand({
      name,
      signer,
      args: [],
    }),
  );

  console.log(`${name} deployed at ${contractResult.address}`);

  console.log(`Deploying ${name} Proxy Admin. please wait...`);

  const proxyAdminContractResult = await deployContract(
    new DeployContractCommand({
      name: "ProxyAdmin",
      signer,
      args: [await signer.getAddress()],
    }),
  );

  console.log(`${name} Proxy Admin deployed at ${proxyAdminContractResult.address}`);

  console.log(`Deploying ${name} Proxy. please wait...`);

  const proxyContractResult = await deployContract(
    new DeployContractCommand({
      name: "TransparentUpgradeableProxy",
      signer,
      args: [contractResult.address, proxyAdminContractResult.address, "0x"],
    }),
  );

  console.log(`${name} Proxy deployed at ${proxyContractResult.address}`);

  let lifeCycleCashFlow = await ethers.getContractAt(name, proxyContractResult.address);

  lifeCycleCashFlow = lifeCycleCashFlow.connect(signer);

  const tx = await lifeCycleCashFlow.initialize(...(args as [string, string, []]));
  const receipt = await tx.wait(); // wait for execution & revert to be caught
  console.log(`${name} initialize function was successfully executed`);

  return new DeployContractResult({
    name,
    address: contractResult.address,
    contract: contractResult.contract,
    proxyAddress: proxyContractResult.address,
    proxyAdminAddress: proxyAdminContractResult.address,
    receipt: await proxyContractResult.receipt,
  });
}

export async function deployContract({ name, signer, args }: DeployContractCommand): Promise<DeployContractResult> {
  const contractFactory = await ethers.getContractFactory(name, signer);
  const contract = await contractFactory.deploy(...args);
  const receipt = await contract.deploymentTransaction().wait();

  return new DeployContractResult({
    name,
    contract,
    address: await contract.getAddress(),
    receipt,
  });
}

export async function deployPrecompiledMock() {
  const PrecompiledMockContract = await ethers.getContractFactory("PrecompiledMock");

  const deployed = await PrecompiledMockContract.deploy();

  const runtimeBytecode = await ethers.provider.getCode(await deployed.getAddress());
  await ethers.provider.send("hardhat_setCode", [HEDERA_PRECOMPILED_ADDRESS, runtimeBytecode]);
  const mockPrecompiled = await ethers.getContractAt("PrecompiledMock", HEDERA_PRECOMPILED_ADDRESS);
}
