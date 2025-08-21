import { Contract, Signer } from 'ethers';
export declare function deployIdentityProxy(implementationAuthority: Contract['address'], managementKey: string, signer: Signer): Promise<import("../../../../../typechain-types").Identity>;
export declare function deployFullSuiteFixture(): Promise<{
    accounts: {
        deployer: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        tokenIssuer: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        tokenAgent: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        tokenAdmin: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        claimIssuer: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        claimIssuerSigningKey: import("ethers").Wallet;
        aliceActionKey: import("ethers").Wallet;
        aliceWallet: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        bobWallet: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        charlieWallet: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        davidWallet: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        anotherWallet: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
    };
    identities: {
        aliceIdentity: import("../../../../../typechain-types").Identity;
        bobIdentity: import("../../../../../typechain-types").Identity;
        charlieIdentity: import("../../../../../typechain-types").Identity;
    };
    suite: {
        claimIssuerContract: Contract;
        claimTopicsRegistry: import("../../../../../typechain-types").ClaimTopicsRegistry;
        trustedIssuersRegistry: import("../../../../../typechain-types").TrustedIssuersRegistry;
        identityRegistryStorage: import("../../../../../typechain-types").IdentityRegistryStorage;
        defaultCompliance: Contract;
        identityRegistry: import("../../../../../typechain-types").IdentityRegistry;
        tokenOID: import("../../../../../typechain-types").Identity;
    };
    authorities: {
        trexImplementationAuthority: Contract;
        identityImplementationAuthority: Contract;
    };
    factories: {
        trexFactory: Contract;
        identityFactory: Contract;
    };
    implementations: {
        identityImplementation: Contract;
        claimTopicsRegistryImplementation: Contract;
        trustedIssuersRegistryImplementation: Contract;
        identityRegistryStorageImplementation: Contract;
        identityRegistryImplementation: Contract;
        modularComplianceImplementation: Contract;
    };
}>;
export declare function deploySuiteWithModularCompliancesFixture(): Promise<{
    suite: {
        compliance: import("../../../../../typechain-types").ModularCompliance;
        complianceBeta: Contract;
        claimIssuerContract: Contract;
        claimTopicsRegistry: import("../../../../../typechain-types").ClaimTopicsRegistry;
        trustedIssuersRegistry: import("../../../../../typechain-types").TrustedIssuersRegistry;
        identityRegistryStorage: import("../../../../../typechain-types").IdentityRegistryStorage;
        defaultCompliance: Contract;
        identityRegistry: import("../../../../../typechain-types").IdentityRegistry;
        tokenOID: import("../../../../../typechain-types").Identity;
    };
    accounts: {
        deployer: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        tokenIssuer: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        tokenAgent: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        tokenAdmin: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        claimIssuer: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        claimIssuerSigningKey: import("ethers").Wallet;
        aliceActionKey: import("ethers").Wallet;
        aliceWallet: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        bobWallet: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        charlieWallet: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        davidWallet: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
        anotherWallet: import("@nomiclabs/hardhat-ethers/signers").SignerWithAddress;
    };
    identities: {
        aliceIdentity: import("../../../../../typechain-types").Identity;
        bobIdentity: import("../../../../../typechain-types").Identity;
        charlieIdentity: import("../../../../../typechain-types").Identity;
    };
    authorities: {
        trexImplementationAuthority: Contract;
        identityImplementationAuthority: Contract;
    };
    factories: {
        trexFactory: Contract;
        identityFactory: Contract;
    };
    implementations: {
        identityImplementation: Contract;
        claimTopicsRegistryImplementation: Contract;
        trustedIssuersRegistryImplementation: Contract;
        identityRegistryStorageImplementation: Contract;
        identityRegistryImplementation: Contract;
        modularComplianceImplementation: Contract;
    };
}>;
