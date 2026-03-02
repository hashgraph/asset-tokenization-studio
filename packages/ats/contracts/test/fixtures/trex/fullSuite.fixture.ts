// SPDX-License-Identifier: Apache-2.0

import { ContractRunner, ZeroAddress, id, keccak256, AbiCoder, hexlify, toUtf8Bytes, getBytes } from "ethers";
import { ethers } from "hardhat";
import OnchainID from "@onchain-id/solidity";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";

export async function deployIdentityProxy(
  implementationAuthority: string,
  managementKey: string,
  signer: ContractRunner,
) {
  const identity = await new ethers.ContractFactory(
    OnchainID.contracts.IdentityProxy.abi,
    OnchainID.contracts.IdentityProxy.bytecode,
    signer as any, // @onchain-id/solidity uses ethers v5 Signer type
  ).deploy(implementationAuthority, managementKey);

  return ethers.getContractAt("Identity", await identity.getAddress(), signer as any);
}

export async function deployFullSuiteFixture() {
  const [
    deployer,
    tokenIssuer,
    tokenAgent,
    tokenAdmin,
    claimIssuer,
    aliceWallet,
    bobWallet,
    charlieWallet,
    davidWallet,
    anotherWallet,
  ] = await ethers.getSigners();
  const claimIssuerSigningKey = ethers.Wallet.createRandom();
  const aliceActionKey = ethers.Wallet.createRandom();

  // Deploy implementations
  const claimTopicsRegistryImplementation = await ethers.deployContract("ClaimTopicsRegistry", deployer);
  const trustedIssuersRegistryImplementation = await ethers.deployContract("TrustedIssuersRegistry", deployer);
  const identityRegistryStorageImplementation = await ethers.deployContract("IdentityRegistryStorage", deployer);
  const identityRegistryImplementation = await ethers.deployContract("IdentityRegistry", deployer);
  const modularComplianceImplementation = await ethers.deployContract("ModularCompliance", deployer);
  const identityImplementation = await new ethers.ContractFactory(
    OnchainID.contracts.Identity.abi,
    OnchainID.contracts.Identity.bytecode,
    deployer as any, // @onchain-id/solidity uses ethers v5 Signer type
  ).deploy(deployer.address, true);

  const identityImplementationAuthority = await new ethers.ContractFactory(
    OnchainID.contracts.ImplementationAuthority.abi,
    OnchainID.contracts.ImplementationAuthority.bytecode,
    deployer as any, // @onchain-id/solidity uses ethers v5 Signer type
  ).deploy(identityImplementation.target);

  const identityFactory = await new ethers.ContractFactory(
    OnchainID.contracts.Factory.abi,
    OnchainID.contracts.Factory.bytecode,
    deployer as any, // @onchain-id/solidity uses ethers v5 Signer type
  ).deploy(identityImplementationAuthority.target);

  const trexImplementationAuthority = await ethers.deployContract(
    "TREXImplementationAuthority",
    [true, ZeroAddress, ZeroAddress],
    deployer,
  );
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
    mcImplementation: modularComplianceImplementation.target,
  };

  await trexImplementationAuthority.connect(deployer).addAndUseTREXVersion(versionStruct, contractsStruct);

  const trexFactory = await ethers.deployContract(
    "TREXFactory",
    [trexImplementationAuthority.target, identityFactory.target],
    deployer,
  );
  await (
    identityFactory.connect(deployer as any) as unknown as { addTokenFactory: (address: string) => Promise<void> }
  ).addTokenFactory(String(trexFactory.target));

  const claimTopicsRegistry = await ethers
    .deployContract("ClaimTopicsRegistryProxy", [trexImplementationAuthority.target], deployer)
    .then(async (proxy) => ethers.getContractAt("ClaimTopicsRegistry", proxy.target));

  const trustedIssuersRegistry = await ethers
    .deployContract("TrustedIssuersRegistryProxy", [trexImplementationAuthority.target], deployer)
    .then(async (proxy) => ethers.getContractAt("TrustedIssuersRegistry", proxy.target));

  const identityRegistryStorage = await ethers
    .deployContract("IdentityRegistryStorageProxy", [trexImplementationAuthority.target], deployer)
    .then(async (proxy) => ethers.getContractAt("IdentityRegistryStorage", proxy.target));

  const defaultCompliance = await ethers.deployContract("DefaultCompliance", deployer);

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

  const tokenOID = await deployIdentityProxy(
    String(identityImplementationAuthority.target),
    tokenIssuer.address,
    deployer,
  );

  await identityRegistryStorage.connect(deployer).bindIdentityRegistry(identityRegistry.target);

  const claimTopics = [id("CLAIM_TOPIC")];
  await claimTopicsRegistry.connect(deployer).addClaimTopic(claimTopics[0]);

  const claimIssuerContract = await ethers.deployContract("ClaimIssuer", [claimIssuer.address], claimIssuer);
  await claimIssuerContract
    .connect(claimIssuer)
    .addKey(keccak256(AbiCoder.defaultAbiCoder().encode(["address"], [claimIssuerSigningKey.address])), 3, 1);

  await trustedIssuersRegistry.connect(deployer).addTrustedIssuer(claimIssuerContract.target, claimTopics);

  const aliceIdentity = await deployIdentityProxy(
    String(identityImplementationAuthority.target),
    aliceWallet.address,
    deployer,
  );
  await aliceIdentity
    .connect(aliceWallet)
    .addKey(keccak256(AbiCoder.defaultAbiCoder().encode(["address"], [aliceActionKey.address])), 2, 1);
  const bobIdentity = await deployIdentityProxy(
    String(identityImplementationAuthority.target),
    bobWallet.address,
    deployer,
  );
  const charlieIdentity = await deployIdentityProxy(
    String(identityImplementationAuthority.target),
    charlieWallet.address,
    deployer,
  );

  await identityRegistry.connect(deployer).addAgent(tokenAgent.address);

  await identityRegistry
    .connect(tokenAgent)
    .batchRegisterIdentity(
      [aliceWallet.address, bobWallet.address],
      [aliceIdentity.target, bobIdentity.target],
      [42, 666],
    );

  const claimForAlice = {
    data: hexlify(toUtf8Bytes("Some claim public data.")),
    issuer: claimIssuerContract.target,
    topic: claimTopics[0],
    scheme: 1,
    identity: aliceIdentity.target,
    signature: "",
  };
  claimForAlice.signature = await claimIssuerSigningKey.signMessage(
    getBytes(
      keccak256(
        AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256", "bytes"],
          [claimForAlice.identity, claimForAlice.topic, claimForAlice.data],
        ),
      ),
    ),
  );

  await aliceIdentity
    .connect(aliceWallet)
    .addClaim(
      claimForAlice.topic,
      claimForAlice.scheme,
      claimForAlice.issuer,
      claimForAlice.signature,
      claimForAlice.data,
      "",
    );

  const claimForBob = {
    data: hexlify(toUtf8Bytes("Some claim public data.")),
    issuer: claimIssuerContract.target,
    topic: claimTopics[0],
    scheme: 1,
    identity: bobIdentity.target,
    signature: "",
  };
  claimForBob.signature = await claimIssuerSigningKey.signMessage(
    getBytes(
      keccak256(
        AbiCoder.defaultAbiCoder().encode(
          ["address", "uint256", "bytes"],
          [claimForBob.identity, claimForBob.topic, claimForBob.data],
        ),
      ),
    ),
  );

  await bobIdentity
    .connect(bobWallet)
    .addClaim(claimForBob.topic, claimForBob.scheme, claimForBob.issuer, claimForBob.signature, claimForBob.data, "");

  return {
    accounts: {
      deployer,
      tokenIssuer,
      tokenAgent,
      tokenAdmin,
      claimIssuer,
      claimIssuerSigningKey,
      aliceActionKey,
      aliceWallet,
      bobWallet,
      charlieWallet,
      davidWallet,
      anotherWallet,
    },
    identities: {
      aliceIdentity,
      bobIdentity,
      charlieIdentity,
    },
    suite: {
      claimIssuerContract,
      claimTopicsRegistry,
      trustedIssuersRegistry,
      identityRegistryStorage,
      defaultCompliance,
      identityRegistry,
      tokenOID,
    },
    authorities: {
      trexImplementationAuthority,
      identityImplementationAuthority,
    },
    factories: {
      trexFactory,
      identityFactory,
    },
    implementations: {
      identityImplementation,
      claimTopicsRegistryImplementation,
      trustedIssuersRegistryImplementation,
      identityRegistryStorageImplementation,
      identityRegistryImplementation,
      modularComplianceImplementation,
    },
  };
}

export async function deploySuiteWithModularCompliancesFixture() {
  const context = await loadFixture(deployFullSuiteFixture);

  const complianceProxy = await ethers.deployContract("ModularComplianceProxy", [
    context.authorities.trexImplementationAuthority.target,
  ]);
  const compliance = await ethers.getContractAt("ModularCompliance", complianceProxy.target);

  const complianceBeta = await ethers.deployContract("ModularCompliance");
  await complianceBeta.init();

  return {
    ...context,
    suite: {
      ...context.suite,
      compliance,
      complianceBeta,
    },
  };
}
