"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deployIdentityProxy = deployIdentityProxy;
exports.deployFullSuiteFixture = deployFullSuiteFixture;
exports.deploySuiteWithModularCompliancesFixture = deploySuiteWithModularCompliancesFixture;
const tslib_1 = require("tslib");
const hardhat_1 = require("hardhat");
const solidity_1 = tslib_1.__importDefault(require("@onchain-id/solidity"));
const hardhat_network_helpers_1 = require("@nomicfoundation/hardhat-network-helpers");
async function deployIdentityProxy(implementationAuthority, managementKey, signer) {
    const identity = await new hardhat_1.ethers.ContractFactory(solidity_1.default.contracts.IdentityProxy.abi, solidity_1.default.contracts.IdentityProxy.bytecode, signer).deploy(implementationAuthority, managementKey);
    return hardhat_1.ethers.getContractAt('Identity', identity.address, signer);
}
async function deployFullSuiteFixture() {
    const [deployer, tokenIssuer, tokenAgent, tokenAdmin, claimIssuer, aliceWallet, bobWallet, charlieWallet, davidWallet, anotherWallet,] = await hardhat_1.ethers.getSigners();
    const claimIssuerSigningKey = hardhat_1.ethers.Wallet.createRandom();
    const aliceActionKey = hardhat_1.ethers.Wallet.createRandom();
    // Deploy implementations
    const claimTopicsRegistryImplementation = await hardhat_1.ethers.deployContract('ClaimTopicsRegistry', deployer);
    const trustedIssuersRegistryImplementation = await hardhat_1.ethers.deployContract('TrustedIssuersRegistry', deployer);
    const identityRegistryStorageImplementation = await hardhat_1.ethers.deployContract('IdentityRegistryStorage', deployer);
    const identityRegistryImplementation = await hardhat_1.ethers.deployContract('IdentityRegistry', deployer);
    const modularComplianceImplementation = await hardhat_1.ethers.deployContract('ModularCompliance', deployer);
    const identityImplementation = await new hardhat_1.ethers.ContractFactory(solidity_1.default.contracts.Identity.abi, solidity_1.default.contracts.Identity.bytecode, deployer).deploy(deployer.address, true);
    const identityImplementationAuthority = await new hardhat_1.ethers.ContractFactory(solidity_1.default.contracts.ImplementationAuthority.abi, solidity_1.default.contracts.ImplementationAuthority.bytecode, deployer).deploy(identityImplementation.address);
    const identityFactory = await new hardhat_1.ethers.ContractFactory(solidity_1.default.contracts.Factory.abi, solidity_1.default.contracts.Factory.bytecode, deployer).deploy(identityImplementationAuthority.address);
    const trexImplementationAuthority = await hardhat_1.ethers.deployContract('TREXImplementationAuthority', [true, hardhat_1.ethers.constants.AddressZero, hardhat_1.ethers.constants.AddressZero], deployer);
    const versionStruct = {
        major: 4,
        minor: 0,
        patch: 0,
    };
    const contractsStruct = {
        tokenImplementation: hardhat_1.ethers.Wallet.createRandom().address,
        ctrImplementation: claimTopicsRegistryImplementation.address,
        irImplementation: identityRegistryImplementation.address,
        irsImplementation: identityRegistryStorageImplementation.address,
        tirImplementation: trustedIssuersRegistryImplementation.address,
        mcImplementation: modularComplianceImplementation.address,
    };
    await trexImplementationAuthority
        .connect(deployer)
        .addAndUseTREXVersion(versionStruct, contractsStruct);
    const trexFactory = await hardhat_1.ethers.deployContract('TREXFactory', [trexImplementationAuthority.address, identityFactory.address], deployer);
    await identityFactory.connect(deployer).addTokenFactory(trexFactory.address);
    const claimTopicsRegistry = await hardhat_1.ethers
        .deployContract('ClaimTopicsRegistryProxy', [trexImplementationAuthority.address], deployer)
        .then(async (proxy) => hardhat_1.ethers.getContractAt('ClaimTopicsRegistry', proxy.address));
    const trustedIssuersRegistry = await hardhat_1.ethers
        .deployContract('TrustedIssuersRegistryProxy', [trexImplementationAuthority.address], deployer)
        .then(async (proxy) => hardhat_1.ethers.getContractAt('TrustedIssuersRegistry', proxy.address));
    const identityRegistryStorage = await hardhat_1.ethers
        .deployContract('IdentityRegistryStorageProxy', [trexImplementationAuthority.address], deployer)
        .then(async (proxy) => hardhat_1.ethers.getContractAt('IdentityRegistryStorage', proxy.address));
    const defaultCompliance = await hardhat_1.ethers.deployContract('DefaultCompliance', deployer);
    const identityRegistry = await hardhat_1.ethers
        .deployContract('IdentityRegistryProxy', [
        trexImplementationAuthority.address,
        trustedIssuersRegistry.address,
        claimTopicsRegistry.address,
        identityRegistryStorage.address,
    ], deployer)
        .then(async (proxy) => hardhat_1.ethers.getContractAt('IdentityRegistry', proxy.address));
    const tokenOID = await deployIdentityProxy(identityImplementationAuthority.address, tokenIssuer.address, deployer);
    await identityRegistryStorage
        .connect(deployer)
        .bindIdentityRegistry(identityRegistry.address);
    const claimTopics = [hardhat_1.ethers.utils.id('CLAIM_TOPIC')];
    await claimTopicsRegistry.connect(deployer).addClaimTopic(claimTopics[0]);
    const claimIssuerContract = await hardhat_1.ethers.deployContract('ClaimIssuer', [claimIssuer.address], claimIssuer);
    await claimIssuerContract
        .connect(claimIssuer)
        .addKey(hardhat_1.ethers.utils.keccak256(hardhat_1.ethers.utils.defaultAbiCoder.encode(['address'], [claimIssuerSigningKey.address])), 3, 1);
    await trustedIssuersRegistry
        .connect(deployer)
        .addTrustedIssuer(claimIssuerContract.address, claimTopics);
    const aliceIdentity = await deployIdentityProxy(identityImplementationAuthority.address, aliceWallet.address, deployer);
    await aliceIdentity
        .connect(aliceWallet)
        .addKey(hardhat_1.ethers.utils.keccak256(hardhat_1.ethers.utils.defaultAbiCoder.encode(['address'], [aliceActionKey.address])), 2, 1);
    const bobIdentity = await deployIdentityProxy(identityImplementationAuthority.address, bobWallet.address, deployer);
    const charlieIdentity = await deployIdentityProxy(identityImplementationAuthority.address, charlieWallet.address, deployer);
    await identityRegistry.connect(deployer).addAgent(tokenAgent.address);
    await identityRegistry
        .connect(tokenAgent)
        .batchRegisterIdentity([aliceWallet.address, bobWallet.address], [aliceIdentity.address, bobIdentity.address], [42, 666]);
    const claimForAlice = {
        data: hardhat_1.ethers.utils.hexlify(hardhat_1.ethers.utils.toUtf8Bytes('Some claim public data.')),
        issuer: claimIssuerContract.address,
        topic: claimTopics[0],
        scheme: 1,
        identity: aliceIdentity.address,
        signature: '',
    };
    claimForAlice.signature = await claimIssuerSigningKey.signMessage(hardhat_1.ethers.utils.arrayify(hardhat_1.ethers.utils.keccak256(hardhat_1.ethers.utils.defaultAbiCoder.encode(['address', 'uint256', 'bytes'], [
        claimForAlice.identity,
        claimForAlice.topic,
        claimForAlice.data,
    ]))));
    await aliceIdentity
        .connect(aliceWallet)
        .addClaim(claimForAlice.topic, claimForAlice.scheme, claimForAlice.issuer, claimForAlice.signature, claimForAlice.data, '');
    const claimForBob = {
        data: hardhat_1.ethers.utils.hexlify(hardhat_1.ethers.utils.toUtf8Bytes('Some claim public data.')),
        issuer: claimIssuerContract.address,
        topic: claimTopics[0],
        scheme: 1,
        identity: bobIdentity.address,
        signature: '',
    };
    claimForBob.signature = await claimIssuerSigningKey.signMessage(hardhat_1.ethers.utils.arrayify(hardhat_1.ethers.utils.keccak256(hardhat_1.ethers.utils.defaultAbiCoder.encode(['address', 'uint256', 'bytes'], [claimForBob.identity, claimForBob.topic, claimForBob.data]))));
    await bobIdentity
        .connect(bobWallet)
        .addClaim(claimForBob.topic, claimForBob.scheme, claimForBob.issuer, claimForBob.signature, claimForBob.data, '');
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
async function deploySuiteWithModularCompliancesFixture() {
    const context = await (0, hardhat_network_helpers_1.loadFixture)(deployFullSuiteFixture);
    const complianceProxy = await hardhat_1.ethers.deployContract('ModularComplianceProxy', [context.authorities.trexImplementationAuthority.address]);
    const compliance = await hardhat_1.ethers.getContractAt('ModularCompliance', complianceProxy.address);
    const complianceBeta = await hardhat_1.ethers.deployContract('ModularCompliance');
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
