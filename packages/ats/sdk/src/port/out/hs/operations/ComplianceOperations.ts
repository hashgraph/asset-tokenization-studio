// SPDX-License-Identifier: Apache-2.0

import { ContractId } from "@hiero-ledger/sdk";
import { ethers } from "ethers";
import {
  KycFacet__factory,
  SsiManagementFacet__factory,
  ERC3643ManagementFacet__factory,
  ExternalKycListManagementFacet__factory,
  MockedExternalKycList__factory,
} from "@hashgraph/asset-tokenization-contracts";
import { GAS } from "@core/Constants";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import LogService from "@service/log/LogService";
import { TransactionExecutor } from "../TransactionExecutor";

export class ComplianceOperations {
  constructor(private readonly executor: TransactionExecutor) {}

  async grantKyc(
    security: EvmAddress,
    targetId: EvmAddress,
    vcBase64: string,
    validFrom: BigDecimal,
    validTo: BigDecimal,
    issuer: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Granting KYC from issuer ${issuer.toString()} to address ${targetId.toString()} with VC ${vcBase64}`,
    );
    return this.executor.executeContractCall(
      securityId.toString(),
      KycFacet__factory.createInterface(),
      "grantKyc",
      [targetId.toString(), vcBase64, validFrom.toBigInt(), validTo.toBigInt(), issuer.toString()],
      GAS.GRANT_KYC,
    );
  }

  async revokeKyc(
    security: EvmAddress,
    targetId: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Revoking KYC to address ${targetId.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      KycFacet__factory.createInterface(),
      "revokeKyc",
      [targetId.toString()],
      GAS.REVOKE_KYC,
    );
  }

  async addIssuer(
    security: EvmAddress,
    issuer: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Adding issuer ${issuer}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      SsiManagementFacet__factory.createInterface(),
      "addIssuer",
      [issuer.toString()],
      GAS.ADD_ISSUER,
    );
  }

  async removeIssuer(
    security: EvmAddress,
    issuer: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Removing issuer ${issuer}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      SsiManagementFacet__factory.createInterface(),
      "removeIssuer",
      [issuer.toString()],
      GAS.REMOVE_ISSUER,
    );
  }

  async setRevocationRegistryAddress(
    security: EvmAddress,
    revocationRegistry: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Setting revocation registry address ${revocationRegistry}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      SsiManagementFacet__factory.createInterface(),
      "setRevocationRegistryAddress",
      [revocationRegistry.toString()],
      GAS.SET_REVOCATION_REGISTRY,
    );
  }

  async activateInternalKyc(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Activate Internal Kyc to address ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      new ethers.Interface(["function activateInternalKyc()"]),
      "activateInternalKyc",
      [],
      GAS.ACTIVATE_INTERNAL_KYC,
    );
  }

  async deactivateInternalKyc(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Deactivate Internal Kyc to address ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      new ethers.Interface(["function deactivateInternalKyc()"]),
      "deactivateInternalKyc",
      [],
      GAS.DEACTIVATE_INTERNAL_KYC,
    );
  }

  async setOnchainID(
    security: EvmAddress,
    onchainID: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Setting onchainID to ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC3643ManagementFacet__factory.createInterface(),
      "setOnchainID",
      [onchainID.toString()],
      GAS.SET_ONCHAIN_ID,
    );
  }

  async setIdentityRegistry(
    security: EvmAddress,
    identityRegistry: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Setting identity registry to ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC3643ManagementFacet__factory.createInterface(),
      "setIdentityRegistry",
      [identityRegistry.toString()],
      GAS.SET_IDENTITY_REGISTRY,
    );
  }

  async setCompliance(
    security: EvmAddress,
    compliance: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Setting compliance to ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ERC3643ManagementFacet__factory.createInterface(),
      "setCompliance",
      [compliance.toString()],
      GAS.SET_COMPLIANCE,
    );
  }

  async updateExternalKycLists(
    security: EvmAddress,
    externalKycListsAddresses: EvmAddress[],
    actives: boolean[],
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Updating External Kyc Lists for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ExternalKycListManagementFacet__factory.createInterface(),
      "updateExternalKycLists",
      [externalKycListsAddresses.map((address) => address.toString()), actives],
      GAS.UPDATE_EXTERNAL_KYC_LISTS,
    );
  }

  async addExternalKycList(
    security: EvmAddress,
    externalKycListAddress: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Adding External kyc Lists for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ExternalKycListManagementFacet__factory.createInterface(),
      "addExternalKycList",
      [externalKycListAddress.toString()],
      GAS.ADD_EXTERNAL_KYC_LIST,
    );
  }

  async removeExternalKycList(
    security: EvmAddress,
    externalKycListAddress: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Removing External kyc Lists for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ExternalKycListManagementFacet__factory.createInterface(),
      "removeExternalKycList",
      [externalKycListAddress.toString()],
      GAS.REMOVE_EXTERNAL_KYC_LIST,
    );
  }

  async grantKycMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Grant kyc address ${targetId.toString()} to external kyc mock ${contract.toString()}`);
    return this.executor.executeContractCall(
      contractId.toString(),
      MockedExternalKycList__factory.createInterface(),
      "grantKyc",
      [targetId.toString()],
      GAS.GRANT_KYC_MOCK,
    );
  }

  async revokeKycMock(
    contract: EvmAddress,
    targetId: EvmAddress,
    contractId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Revoke kyc address ${targetId.toString()} to external kyc mock ${contract.toString()}`);
    return this.executor.executeContractCall(
      contractId.toString(),
      MockedExternalKycList__factory.createInterface(),
      "revokeKyc",
      [targetId.toString()],
      GAS.REVOKE_KYC_MOCK,
    );
  }

  async createExternalKycListMock(): Promise<TransactionResponse> {
    LogService.logTrace(`Deploying External Kyc List List Mock contract`);
    return this.executor.deployContract(MockedExternalKycList__factory.bytecode, GAS.CREATE_EXTERNAL_KYC_LIST_MOCK);
  }
}
