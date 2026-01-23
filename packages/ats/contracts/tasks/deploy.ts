// SPDX-License-Identifier: Apache-2.0

import { task, types } from "hardhat/config";
import { CONTRACT_NAMES, ContractName, Network } from "@configuration";
import { DeployAllArgs, DeployArgs, DeployTrexFactoryArgs, GetSignerResult } from "./Arguments";
import * as fs from "fs";
import { TREXImplementationAuthority } from "@contract-types";

task(
  "deployAll",
  "Deploy new factory, new facet implementation, new resolver and initialize it with the new facet implementations",
)
  .addOptionalParam("useDeployed", "Use already deployed contracts", true, types.boolean)
  .addOptionalParam("privateKey", "The private key of the account in raw hexadecimal format", undefined, types.string)
  .addOptionalParam(
    "signerAddress",
    "The address of the signer to select from the Hardhat signers array",
    undefined,
    types.string,
  )
  .addOptionalParam("signerPosition", "The index of the signer in the Hardhat signers array", undefined, types.int)
  .addOptionalParam("fileName", "The output file name", "deployed-contracts", types.string)
  .setAction(async (args: DeployAllArgs, hre) => {
    // Inlined to avoid circular dependency
    const { deployAtsFullInfrastructure, DeployAtsFullInfrastructureCommand, addresstoHederaId } = await import(
      "@scripts"
    );
    const network = hre.network.name as Network;
    console.log(`Executing deployAll on ${hre.network.name} ...`);
    const { signer }: GetSignerResult = await hre.run("getSigner", {
      privateKey: args.privateKey,
      signerAddress: args.signerAddress,
      signerPosition: args.signerPosition,
    });

    // * Deploy the full infrastructure
    const {
      factory,
      businessLogicResolver,
      accessControlFacet,
      capFacet,
      controlListFacet,
      kycFacet,
      ssiManagementFacet,
      pauseFacet,
      erc20Facet,
      erc1410ReadFacet,
      erc1410ManagementFacet,
      erc1410IssuerFacet,
      erc1410TokenHolderFacet,
      erc1594Facet,
      erc1643Facet,
      erc1644Facet,
      snapshotsFacet,
      diamondFacet,
      equityUsaFacet,
      bondUsaFacet,
      bondUsaRead,
      scheduledSnapshotsFacet,
      scheduledBalanceAdjustmentsFacet,
      scheduledCrossOrderedTasksFacet,
      scheduledCouponListingFacet,
      corporateActionsFacet,
      lockFacet,
      holdReadFacet,
      holdManagementFacet,
      holdTokenHolderFacet,
      transferAndLockFacet,
      adjustBalancesFacet,
      clearingActionsFacet,
      clearingTransferFacet,
      clearingRedeemFacet,
      clearingHoldCreationFacet,
      clearingReadFacet,
      externalPauseManagementFacet,
      proceedRecipientsFacet,
      externalControlListManagementFacet,
      externalKycListManagementFacet,
      protectedPartitionsFacet,
      erc3643ManagementFacet,
      erc3643OperationsFacet,
      erc3643ReadFacet,
      erc3643BatchFacet,
      freezeFacet,
      erc20PermitFacet,
    } = await deployAtsFullInfrastructure(
      new DeployAtsFullInfrastructureCommand({
        signer: signer,
        network: hre.network.name as Network,
        useDeployed: args.useDeployed,
        useEnvironment: false,
      }),
    );

    // * Display the deployed addresses
    const addressList = {
      "Business Logic Resolver Proxy": businessLogicResolver.proxyAddress,
      "Business Logic Resolver Proxy Admin": businessLogicResolver.proxyAdminAddress,
      "Business Logic Resolver": businessLogicResolver.address,
      "Factory Proxy": factory.proxyAddress,
      "Factory Proxy Admin": factory.proxyAdminAddress,
      Factory: factory.address,
      "Access Control Facet": accessControlFacet.address,
      "Cap Facet": capFacet.address,
      "Control List Facet": controlListFacet.address,
      "Kyc Facet": kycFacet.address,
      "SsiManagement Facet": ssiManagementFacet.address,
      "Pause Facet": pauseFacet.address,
      "ERC20 Facet": erc20Facet.address,
      "ERC1410 Read Facet": erc1410ReadFacet.address,
      "ERC1410 Management Facet": erc1410ManagementFacet.address,
      "ERC1410 Issuer Facet": erc1410IssuerFacet.address,
      "ERC1410 TokenHolder Facet": erc1410TokenHolderFacet.address,
      "ERC1594 Facet": erc1594Facet.address,
      "ERC1643 Facet": erc1643Facet.address,
      "ERC1644 Facet": erc1644Facet.address,
      "Snapshots Facet": snapshotsFacet.address,
      "Diamond Facet": diamondFacet.address,
      "Equity Facet": equityUsaFacet.address,
      "Bond Facet": bondUsaFacet.address,
      BondRead: bondUsaRead.address,
      "Scheduled Snapshots Facet": scheduledSnapshotsFacet.address,
      "Scheduled Balance Adjustments Facet": scheduledBalanceAdjustmentsFacet.address,
      "Scheduled Cross Ordered Tasks Facet": scheduledCrossOrderedTasksFacet.address,
      "Scheduled Coupon Listing Facet": scheduledCouponListingFacet.address,
      "Corporate Actions Facet": corporateActionsFacet.address,
      "Lock Facet": lockFacet.address,
      "Hold Read Facet": holdReadFacet.address,
      "Hold Management Facet": holdManagementFacet.address,
      "Hold TokenHolder Facet": holdTokenHolderFacet.address,
      "Transfer and Lock Facet": transferAndLockFacet.address,
      "Adjust Balances Facet": adjustBalancesFacet.address,
      "Clearing Action Facet": clearingActionsFacet.address,
      "Clearing Transfer Facet": clearingTransferFacet.address,
      "Clearing Redeem Facet": clearingRedeemFacet.address,
      "Clearing Hold Creation Facet": clearingHoldCreationFacet.address,
      "Clearing Read Facet": clearingReadFacet.address,
      "Proceed Recipients Facet": proceedRecipientsFacet.address,
      "External Pause Management Facet": externalPauseManagementFacet.address,
      "External Control List Management Facet": externalControlListManagementFacet.address,
      "External Kyc List Management Facet": externalKycListManagementFacet.address,
      "Protected Partitions Facet": protectedPartitionsFacet.address,
      "ERC3643 Management Facet": erc3643ManagementFacet.address,
      "ERC3643 Operations Facet": erc3643OperationsFacet.address,
      "ERC3643 Read Facet": erc3643ReadFacet.address,
      "ERC3643 Batch Facet": erc3643BatchFacet.address,
      "Freeze Facet": freezeFacet.address,
      "ERC20Permit Facet": erc20PermitFacet.address,
    };

    const contractAddress = [];

    console.log("\n 🟢 Deployed ATS Contract List:");
    for (const [key, address] of Object.entries(addressList)) {
      if (!address) {
        continue;
      }
      let contractId = "";
      try {
        contractId = await addresstoHederaId({
          address,
          network,
        });
        console.log(`   --> ${key}: ${address} (${contractId})`);
      } catch (e: unknown) {
        console.log((e as Error).message);
      } finally {
        contractAddress.push({
          name: key,
          address: address,
          contractId: contractId,
        });
      }
    }
    if (args.fileName) {
      console.log("File saved: " + args.fileName + ".json");
      fs.writeFileSync(args.fileName + ".json", JSON.stringify(contractAddress, null, 2), "utf8");
    }
  });

task("deploy", "Deploy new contract")
  .addPositionalParam("contractName", "The name of the contract to deploy", undefined, types.string)
  .addOptionalParam("privateKey", "The private key of the account in raw hexadecimal format", undefined, types.string)
  .addOptionalParam(
    "signerAddress",
    "The address of the signer to select from the Hardhat signers array",
    undefined,
    types.string,
  )
  .addOptionalParam("signerPosition", "The index of the signer in the Hardhat signers array", undefined, types.int)
  .setAction(async (args: DeployArgs, hre) => {
    // Inlined to avoid circular dependency
    const { deployContract, DeployContractCommand, addressListToHederaIdList } = await import("@scripts");
    const network = hre.network.name as Network;
    console.log(`Executing deploy on ${network} ...`);
    if (!CONTRACT_NAMES.includes(args.contractName as ContractName)) {
      throw new Error(`Contract name ${args.contractName} is not in the list of deployable contracts`);
    }
    const contractName = args.contractName as ContractName;
    const { signer }: GetSignerResult = await hre.run("getSigner", {
      privateKey: args.privateKey,
      signerAddress: args.signerAddress,
      signerPosition: args.signerPosition,
    });
    console.log(`Using signer: ${signer.address}`);
    // * Deploy the contract
    const { proxyAdminAddress, proxyAddress, address } = await deployContract(
      new DeployContractCommand({
        name: contractName,
        signer,
      }),
    );

    const [contractId, proxyContractId, proxyAdminContractId] = await addressListToHederaIdList({
      addressList: [address, proxyAddress, proxyAdminAddress].filter((addr): addr is string => !!addr),
      network,
    });

    console.log("\n 🟢 Deployed Contract:");
    if (proxyAdminAddress) {
      console.log(`Proxy Admin: ${proxyAdminAddress} (${proxyAdminContractId})`);
    }
    if (proxyAddress) {
      console.log(`Proxy: ${proxyAddress} (${proxyContractId})`);
    }
    console.log(`Implementation: ${address} (${contractId}) for ${contractName}`);
  });

task("deployTrexFactory", "Deploys ATS adapted TREX factory")
  .addOptionalParam("atsFactory", "Address of the ATS factory", undefined, types.string)
  .addOptionalParam(
    "implementationAuthority",
    "Address of the implementation authority (defaults to zero address)",
    undefined,
    types.string,
  )
  .addOptionalParam("idFactory", "Address of the identity factory (defaults to zero address)", undefined, types.string)
  .addOptionalParam("privateKey", "The private key of the account in raw hexadecimal format", undefined, types.string)
  .addOptionalParam(
    "signerAddress",
    "The address of the signer to select from the Hardhat signers array",
    undefined,
    types.string,
  )
  .addOptionalParam("signerPosition", "The index of the signer in the Hardhat signers array", undefined, types.int)
  .setAction(async (args: DeployTrexFactoryArgs, hre) => {
    const {
      deployContractWithLibraries,
      DeployContractWithLibraryCommand,
      deployContract,
      DeployContractCommand,
      addressListToHederaIdList,
      ADDRESS_ZERO,
    } = await import("@scripts");

    const { signer }: GetSignerResult = await hre.run("getSigner", {
      privateKey: args.privateKey,
      signerAddress: args.signerAddress,
      signerPosition: args.signerPosition,
    });

    // Import validation utilities
    const { validateDeploymentParams } = await import("./utils/errorHandling");

    let implementationAuthority = args.implementationAuthority ?? ADDRESS_ZERO;
    let idFactory = args.idFactory ?? ADDRESS_ZERO;
    const atsFactory =
      args.atsFactory ??
      (
        await deployContract(
          new DeployContractCommand({
            name: "Factory",
            signer,
          }),
        )
      ).address;

    if (idFactory == ADDRESS_ZERO) {
      const identityImplementation = (
        await deployContract(
          new DeployContractCommand({
            name: "Identity",
            signer,
            args: [signer.address, false],
          }),
        )
      ).address;
      const identityIa = (
        await deployContract(
          new DeployContractCommand({
            name: "ImplementationAuthority",
            signer,
            args: [identityImplementation],
          }),
        )
      ).address;
      idFactory = (
        await deployContract(
          new DeployContractCommand({
            name: "IdFactory",
            signer,
            args: [identityIa],
          }),
        )
      ).address;
    }

    if (implementationAuthority == ADDRESS_ZERO) {
      const ctrImplementation = (
        await deployContract(
          new DeployContractCommand({
            name: "ClaimTopicsRegistry",
            signer,
          }),
        )
      ).address;

      const tirImplementation = (
        await deployContract(
          new DeployContractCommand({
            name: "TrustedIssuersRegistry",
            signer,
          }),
        )
      ).address;
      const irsImplementation = (
        await deployContract(
          new DeployContractCommand({
            name: "IdentityRegistryStorage",
            signer,
          }),
        )
      ).address;
      const irImplementation = (
        await deployContract(
          new DeployContractCommand({
            name: "IdentityRegistry",
            signer,
          }),
        )
      ).address;
      const mcImplementation = (
        await deployContract(
          new DeployContractCommand({
            name: "ModularCompliance",
            signer,
          }),
        )
      ).address;

      const implementationAuthorityContract = (
        await deployContract(
          new DeployContractCommand({
            name: "TREXImplementationAuthority",
            signer,
            args: [true, ADDRESS_ZERO, ADDRESS_ZERO],
          }),
        )
      ).contract as TREXImplementationAuthority;
      implementationAuthority = implementationAuthorityContract.address;
      const versionStruct = {
        major: 4,
        minor: 0,
        patch: 0,
      };
      const contractsStruct = {
        tokenImplementation: "0x0000000000000000000000000000000000000001", // Any non-zero address will do
        ctrImplementation,
        irImplementation,
        irsImplementation,
        tirImplementation,
        mcImplementation,
      };

      await implementationAuthorityContract.addAndUseTREXVersion(versionStruct, contractsStruct);
    }

    // Comprehensive parameter validation with warnings
    validateDeploymentParams(
      {
        implementationAuthority,
        idFactory,
        atsFactory,
      },
      hre,
      {
        allowZeroAddress: false,
        warnOnZeroAddress: true,
        strict: false, // Set to true for production deployments
      },
    );

    console.log(`Signer: ${signer.address}`);

    const result = await deployContractWithLibraries(
      new DeployContractWithLibraryCommand({
        name: `TREXFactoryAts`,
        signer,
        args: [implementationAuthority, idFactory, atsFactory],
        libraries: ["TREXBondDeploymentLib", "TREXEquityDeploymentLib"],
      }),
    );

    const { IIdFactory__factory } = await import("@typechain");
    await IIdFactory__factory.connect(idFactory, signer).addTokenFactory(result.address);

    const [trexFactoryId] = await addressListToHederaIdList({
      addressList: [result.address].filter((addr): addr is string => !!addr),
      network: hre.network.name as Network,
    });

    console.log(`TREXFactoryAts deployed at ${trexFactoryId}`);
  });
