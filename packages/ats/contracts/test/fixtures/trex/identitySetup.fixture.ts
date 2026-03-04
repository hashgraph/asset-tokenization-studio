// SPDX-License-Identifier: Apache-2.0

/**
 * T-REX Identity Infrastructure Setup Fixture
 *
 * Provides minimal T-REX identity setup for bond and equity token testing.
 * Creates ClaimTopicsRegistry, TrustedIssuersRegistry, IdentityRegistry,
 * and registers the deployer's identity for token operations.
 *
 * This is a lightweight alternative to deployFullSuiteFixture when you only
 * need basic identity verification without the full T-REX compliance suite.
 */

import { Signer, ZeroAddress, id, keccak256, AbiCoder, hexlify, toUtf8Bytes, getBytes } from "ethers";
import { ethers } from "hardhat";
import OnchainID from "@onchain-id/solidity";

/**
 * Deploy a single OnchainID identity proxy for an investor
 */
export async function deployIdentityProxy(implementationAuthority: string, managementKey: string, signer: Signer) {
  const identity = await new ethers.ContractFactory(
    OnchainID.contracts.IdentityProxy.abi,
    OnchainID.contracts.IdentityProxy.bytecode,
    signer,
  ).deploy(implementationAuthority, managementKey);

  return ethers.getContractAt("Identity", await identity.getAddress(), signer);
}

/**
 * Minimal T-REX identity infrastructure fixture
 *
 * Deploys and configures T-REX identity components with a single claim topic
 * and trusted issuer. Registers the deployer's identity for immediate token operations.
 *
 * @param deployer - Signer who will deploy and own the infrastructure
 * @returns T-REX identity infrastructure contracts and deployer's identity
 */
export async function deployMinimalTrexIdentityFixture(deployer: Signer) {
  // Deploy OnchainID implementation and authority
  const identityImplementation = await new ethers.ContractFactory(
    OnchainID.contracts.Identity.abi,
    OnchainID.contracts.Identity.bytecode,
    deployer,
  ).deploy(await deployer.getAddress(), true);

  const identityImplementationAuthority = await new ethers.ContractFactory(
    OnchainID.contracts.ImplementationAuthority.abi,
    OnchainID.contracts.ImplementationAuthority.bytecode,
    deployer,
  ).deploy(identityImplementation.target);

  // Deploy T-REX registry implementations
  const claimTopicsRegistryImplementation = await ethers.deployContract("ClaimTopicsRegistry", deployer);
  const trustedIssuersRegistryImplementation = await ethers.deployContract("TrustedIssuersRegistry", deployer);
  const identityRegistryStorageImplementation = await ethers.deployContract("IdentityRegistryStorage", deployer);
  const identityRegistryImplementation = await ethers.deployContract("IdentityRegistry", deployer);

  // Deploy T-REX Implementation Authority
  const trexImplementationAuthority = await ethers.deployContract(
    "TREXImplementationAuthority",
    [true, ZeroAddress, ZeroAddress],
    deployer,
  );

  // Register T-REX version with implementations
  const versionStruct = {
    major: 4,
    minor: 0,
    patch: 0,
  };
  const contractsStruct = {
    tokenImplementation: ethers.Wallet.createRandom().address,
    ctrImplementation: claimTopicsRegistryImplementation.target,
    irImplementation: identityRegistryImplementation.target,
    irsImplementation: identityRegistryStorageImplementation.target,
    tirImplementation: trustedIssuersRegistryImplementation.target,
    mcImplementation: ethers.Wallet.createRandom().address,
  };
  const trexAuth = trexImplementationAuthority as any;
  await trexAuth.connect(deployer).addAndUseTREXVersion(versionStruct, contractsStruct);

  // Deploy registry proxies
  const claimTopicsRegistry = await ethers
    .deployContract("ClaimTopicsRegistryProxy", [trexImplementationAuthority.target], deployer)
    .then(async (proxy) => ethers.getContractAt("ClaimTopicsRegistry", proxy.target));

  const trustedIssuersRegistry = await ethers
    .deployContract("TrustedIssuersRegistryProxy", [trexImplementationAuthority.target], deployer)
    .then(async (proxy) => ethers.getContractAt("TrustedIssuersRegistry", proxy.target));

  const identityRegistryStorage = await ethers
    .deployContract("IdentityRegistryStorageProxy", [trexImplementationAuthority.target], deployer)
    .then(async (proxy) => ethers.getContractAt("IdentityRegistryStorage", proxy.target));

  const identityRegistry = await ethers
    .deployContract(
      "IdentityRegistryProxy",
      [
        trexImplementationAuthority.target,
        trustedIssuersRegistry.target,
        claimTopicsRegistry.target,
        identityRegistryStorage.target,
      ],
      deployer,
    )
    .then(async (proxy) => ethers.getContractAt("IdentityRegistry", proxy.target));

  // Bind storage to registry
  const storage = identityRegistryStorage as any;
  await storage.connect(deployer).bindIdentityRegistry(identityRegistry.target);

  // Configure single claim topic (KYC)
  const claimTopic = id("CLAIM_TOPIC_KYC");
  const claimTopics = claimTopicsRegistry as any;
  await claimTopics.connect(deployer).addClaimTopic(claimTopic);

  // Deploy claim issuer and add signing key
  const claimIssuerWallet = ethers.Wallet.createRandom().connect(ethers.provider);
  const claimIssuerSigningKey = ethers.Wallet.createRandom();

  // Fund claim issuer wallet for transactions
  await deployer.sendTransaction({
    to: claimIssuerWallet.address,
    value: ethers.parseEther("1.0"),
  });

  const claimIssuerContract = await ethers.deployContract(
    "ClaimIssuer",
    [claimIssuerWallet.address],
    claimIssuerWallet,
  );

  const claimIssuer = claimIssuerContract as any;
  await claimIssuer
    .connect(claimIssuerWallet)
    .addKey(keccak256(AbiCoder.defaultAbiCoder().encode(["address"], [claimIssuerSigningKey.address])), 3, 1);

  // Register trusted issuer
  const trustedIssuers = trustedIssuersRegistry as any;
  await trustedIssuers.connect(deployer).addTrustedIssuer(claimIssuerContract.target, [claimTopic]);

  // Create deployer identity
  const deployerIdentity = await deployIdentityProxy(
    String(identityImplementationAuthority.target),
    await deployer.getAddress(),
    deployer,
  );

  // Register deployer identity in registry (country code 840 = USA)
  const identityReg = identityRegistry as any;
  await identityReg.connect(deployer).addAgent(await deployer.getAddress());
  await identityReg.connect(deployer).registerIdentity(await deployer.getAddress(), deployerIdentity.target, 840);

  // Issue KYC claim to deployer identity
  const claimData = hexlify(toUtf8Bytes("KYC passed for deployer"));
  const claimForDeployer = {
    data: claimData,
    issuer: claimIssuerContract.target,
    topic: claimTopic,
    scheme: 1,
    identity: deployerIdentity.target,
    signature: "",
  };

  claimForDeployer.signature = await claimIssuerSigningKey.signMessage(
    getBytes(
      keccak256(
        AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256", "bytes"],
          [claimForDeployer.identity, claimForDeployer.topic, claimForDeployer.data],
        ),
      ),
    ),
  );

  const deployerIdent = deployerIdentity as any;
  await deployerIdent
    .connect(deployer)
    .addClaim(
      claimForDeployer.topic,
      claimForDeployer.scheme,
      claimForDeployer.issuer,
      claimForDeployer.signature,
      claimForDeployer.data,
      "",
    );

  return {
    identityRegistry,
    identityRegistryStorage,
    claimTopicsRegistry,
    trustedIssuersRegistry,
    claimIssuerContract,
    deployerIdentity,
    identityImplementationAuthority,
    trexImplementationAuthority,
    claimTopic,
    claimIssuerWallet,
    claimIssuerSigningKey,
  };
}

/**
 * Register additional user identity in an existing T-REX identity infrastructure
 *
 * @param user - Signer to register
 * @param identityInfra - Existing T-REX identity infrastructure from deployMinimalTrexIdentityFixture
 * @returns User's OnchainID identity
 */
export async function registerUserIdentity(
  user: Signer,
  identityInfra: Awaited<ReturnType<typeof deployMinimalTrexIdentityFixture>>,
) {
  const { identityRegistry, identityImplementationAuthority, claimIssuerContract, claimIssuerSigningKey, claimTopic } =
    identityInfra;

  // Create user identity
  const userAddress = await user.getAddress();
  const userIdentity = await deployIdentityProxy(String(identityImplementationAuthority.target), userAddress, user);

  // Register user identity in registry (country code 840 = USA)
  await identityRegistry.registerIdentity(userAddress, userIdentity.target, 840);

  // Issue KYC claim to user identity
  const claimData = hexlify(toUtf8Bytes(`KYC passed for ${userAddress}`));
  const claimForUser = {
    data: claimData,
    issuer: claimIssuerContract.target,
    topic: claimTopic,
    scheme: 1,
    identity: userIdentity.target,
    signature: "",
  };

  claimForUser.signature = await claimIssuerSigningKey.signMessage(
    getBytes(
      keccak256(
        AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256", "bytes"],
          [claimForUser.identity, claimForUser.topic, claimForUser.data],
        ),
      ),
    ),
  );

  const userIdent = userIdentity as any;
  await userIdent
    .connect(user)
    .addClaim(
      claimForUser.topic,
      claimForUser.scheme,
      claimForUser.issuer,
      claimForUser.signature,
      claimForUser.data,
      "",
    );

  return userIdentity;
}
