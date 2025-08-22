import { Contract, Signer } from 'ethers'
import { ethers } from 'hardhat'
import OnchainID from '@onchain-id/solidity'
import { loadFixture } from '@nomicfoundation/hardhat-network-helpers'

export async function deployIdentityProxy(
    implementationAuthority: Contract['address'],
    managementKey: string,
    signer: Signer
) {
    const identity = await new ethers.ContractFactory(
        OnchainID.contracts.IdentityProxy.abi,
        OnchainID.contracts.IdentityProxy.bytecode,
        signer
    ).deploy(implementationAuthority, managementKey)

    return ethers.getContractAt('Identity', identity.address, signer)
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
    ] = await ethers.getSigners()
    const claimIssuerSigningKey = ethers.Wallet.createRandom()
    const aliceActionKey = ethers.Wallet.createRandom()

    // Deploy implementations
    const claimTopicsRegistryImplementation = await ethers.deployContract(
        'ClaimTopicsRegistry',
        deployer
    )
    const trustedIssuersRegistryImplementation = await ethers.deployContract(
        'TrustedIssuersRegistry',
        deployer
    )
    const identityRegistryStorageImplementation = await ethers.deployContract(
        'IdentityRegistryStorage',
        deployer
    )
    const identityRegistryImplementation = await ethers.deployContract(
        'IdentityRegistry',
        deployer
    )
    const modularComplianceImplementation = await ethers.deployContract(
        'ModularCompliance',
        deployer
    )
    const identityImplementation = await new ethers.ContractFactory(
        OnchainID.contracts.Identity.abi,
        OnchainID.contracts.Identity.bytecode,
        deployer
    ).deploy(deployer.address, true)

    const identityImplementationAuthority = await new ethers.ContractFactory(
        OnchainID.contracts.ImplementationAuthority.abi,
        OnchainID.contracts.ImplementationAuthority.bytecode,
        deployer
    ).deploy(identityImplementation.address)

    const identityFactory = await new ethers.ContractFactory(
        OnchainID.contracts.Factory.abi,
        OnchainID.contracts.Factory.bytecode,
        deployer
    ).deploy(identityImplementationAuthority.address)

    const trexImplementationAuthority = await ethers.deployContract(
        'TREXImplementationAuthority',
        [true, ethers.constants.AddressZero, ethers.constants.AddressZero],
        deployer
    )
    const versionStruct = {
        major: 4,
        minor: 0,
        patch: 0,
    }
    const contractsStruct = {
        tokenImplementation: ethers.Wallet.createRandom().address,
        ctrImplementation: claimTopicsRegistryImplementation.address,
        irImplementation: identityRegistryImplementation.address,
        irsImplementation: identityRegistryStorageImplementation.address,
        tirImplementation: trustedIssuersRegistryImplementation.address,
        mcImplementation: modularComplianceImplementation.address,
    }

    await trexImplementationAuthority
        .connect(deployer)
        .addAndUseTREXVersion(versionStruct, contractsStruct)

    const trexFactory = await ethers.deployContract(
        'TREXFactory',
        [trexImplementationAuthority.address, identityFactory.address],
        deployer
    )
    await identityFactory.connect(deployer).addTokenFactory(trexFactory.address)

    const claimTopicsRegistry = await ethers
        .deployContract(
            'ClaimTopicsRegistryProxy',
            [trexImplementationAuthority.address],
            deployer
        )
        .then(async (proxy) =>
            ethers.getContractAt('ClaimTopicsRegistry', proxy.address)
        )

    const trustedIssuersRegistry = await ethers
        .deployContract(
            'TrustedIssuersRegistryProxy',
            [trexImplementationAuthority.address],
            deployer
        )
        .then(async (proxy) =>
            ethers.getContractAt('TrustedIssuersRegistry', proxy.address)
        )

    const identityRegistryStorage = await ethers
        .deployContract(
            'IdentityRegistryStorageProxy',
            [trexImplementationAuthority.address],
            deployer
        )
        .then(async (proxy) =>
            ethers.getContractAt('IdentityRegistryStorage', proxy.address)
        )

    const defaultCompliance = await ethers.deployContract(
        'DefaultCompliance',
        deployer
    )

    const identityRegistry = await ethers
        .deployContract(
            'IdentityRegistryProxy',
            [
                trexImplementationAuthority.address,
                trustedIssuersRegistry.address,
                claimTopicsRegistry.address,
                identityRegistryStorage.address,
            ],
            deployer
        )
        .then(async (proxy) =>
            ethers.getContractAt('IdentityRegistry', proxy.address)
        )

    const tokenOID = await deployIdentityProxy(
        identityImplementationAuthority.address,
        tokenIssuer.address,
        deployer
    )

    await identityRegistryStorage
        .connect(deployer)
        .bindIdentityRegistry(identityRegistry.address)

    const claimTopics = [ethers.utils.id('CLAIM_TOPIC')]
    await claimTopicsRegistry.connect(deployer).addClaimTopic(claimTopics[0])

    const claimIssuerContract = await ethers.deployContract(
        'ClaimIssuer',
        [claimIssuer.address],
        claimIssuer
    )
    await claimIssuerContract
        .connect(claimIssuer)
        .addKey(
            ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(
                    ['address'],
                    [claimIssuerSigningKey.address]
                )
            ),
            3,
            1
        )

    await trustedIssuersRegistry
        .connect(deployer)
        .addTrustedIssuer(claimIssuerContract.address, claimTopics)

    const aliceIdentity = await deployIdentityProxy(
        identityImplementationAuthority.address,
        aliceWallet.address,
        deployer
    )
    await aliceIdentity
        .connect(aliceWallet)
        .addKey(
            ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(
                    ['address'],
                    [aliceActionKey.address]
                )
            ),
            2,
            1
        )
    const bobIdentity = await deployIdentityProxy(
        identityImplementationAuthority.address,
        bobWallet.address,
        deployer
    )
    const charlieIdentity = await deployIdentityProxy(
        identityImplementationAuthority.address,
        charlieWallet.address,
        deployer
    )

    await identityRegistry.connect(deployer).addAgent(tokenAgent.address)

    await identityRegistry
        .connect(tokenAgent)
        .batchRegisterIdentity(
            [aliceWallet.address, bobWallet.address],
            [aliceIdentity.address, bobIdentity.address],
            [42, 666]
        )

    const claimForAlice = {
        data: ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes('Some claim public data.')
        ),
        issuer: claimIssuerContract.address,
        topic: claimTopics[0],
        scheme: 1,
        identity: aliceIdentity.address,
        signature: '',
    }
    claimForAlice.signature = await claimIssuerSigningKey.signMessage(
        ethers.utils.arrayify(
            ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(
                    ['address', 'uint256', 'bytes'],
                    [
                        claimForAlice.identity,
                        claimForAlice.topic,
                        claimForAlice.data,
                    ]
                )
            )
        )
    )

    await aliceIdentity
        .connect(aliceWallet)
        .addClaim(
            claimForAlice.topic,
            claimForAlice.scheme,
            claimForAlice.issuer,
            claimForAlice.signature,
            claimForAlice.data,
            ''
        )

    const claimForBob = {
        data: ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes('Some claim public data.')
        ),
        issuer: claimIssuerContract.address,
        topic: claimTopics[0],
        scheme: 1,
        identity: bobIdentity.address,
        signature: '',
    }
    claimForBob.signature = await claimIssuerSigningKey.signMessage(
        ethers.utils.arrayify(
            ethers.utils.keccak256(
                ethers.utils.defaultAbiCoder.encode(
                    ['address', 'uint256', 'bytes'],
                    [claimForBob.identity, claimForBob.topic, claimForBob.data]
                )
            )
        )
    )

    await bobIdentity
        .connect(bobWallet)
        .addClaim(
            claimForBob.topic,
            claimForBob.scheme,
            claimForBob.issuer,
            claimForBob.signature,
            claimForBob.data,
            ''
        )

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
    }
}

export async function deploySuiteWithModularCompliancesFixture() {
    const context = await loadFixture(deployFullSuiteFixture)

    const complianceProxy = await ethers.deployContract(
        'ModularComplianceProxy',
        [context.authorities.trexImplementationAuthority.address]
    )
    const compliance = await ethers.getContractAt(
        'ModularCompliance',
        complianceProxy.address
    )

    const complianceBeta = await ethers.deployContract('ModularCompliance')
    await complianceBeta.init()

    return {
        ...context,
        suite: {
            ...context.suite,
            compliance,
            complianceBeta,
        },
    }
}
