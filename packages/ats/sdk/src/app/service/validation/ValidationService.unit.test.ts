// SPDX-License-Identifier: Apache-2.0

import ValidationService from "./ValidationService";
import { QueryBus } from "@core/query/QueryBus";
import Injectable from "@core/injectable/Injectable";
import { createMock } from "@golevelup/ts-jest";
import {
  AmountFixture,
  EvmAddressPropsFixture,
  HederaIdPropsFixture,
  NonDefaultPartitionIdFixture,
  PartitionIdFixture,
  RoleFixture,
} from "@test/fixtures/shared/DataFixture";
import { AccountNotKycd } from "@domain/context/security/error/operations/AccountNotKycd";
import { UnlistedKycIssuer } from "@domain/context/security/error/operations/UnlistedKycIssuer";
import { ClearingDeactivated } from "@domain/context/security/error/operations/ClearingDeactivated";
import { ClearingActivated } from "@domain/context/security/error/operations/ClearingActivated";
import { AccountIsNotOperator } from "@domain/context/security/error/operations/AccountIsNotOperator";
import { NotGrantedRole } from "@domain/context/security/error/operations/NotGrantedRole";
import { SecurityPaused } from "@domain/context/security/error/operations/SecurityPaused";
import { SecurityPropsFixture } from "@test/fixtures/shared/SecurityFixture";
import { Security } from "@domain/context/security/Security";
import { PartitionsUnProtected } from "@domain/context/security/error/operations/PartitionsUnprotected";
import { PartitionsProtected } from "@domain/context/security/error/operations/PartitionsProtected";
import { CanTransferByPartitionQuery } from "@query/security/canTransferByPartition/CanTransferByPartitionQuery";
import { ContractsErrorMapper } from "@domain/context/security/error/operations/contractsErrorsMapper/ContractsErrorMapper";
import { CanRedeemByPartitionQuery } from "@query/security/canRedeemByPartition/CanRedeemByPartitionQuery";
import { GetMaxSupplyByPartitionQuery } from "@query/security/cap/getMaxSupplyByPartition/GetMaxSupplyByPartitionQuery";
import { GetTotalSupplyByPartitionQuery } from "@query/security/cap/getTotalSupplyByPartition/GetTotalSupplyByPartitionQuery";
import { MaxSupplyByPartitionReached } from "@domain/context/security/error/operations/MaxSupplyByPartitionReached";
import { GetMaxSupplyQuery } from "@query/security/cap/getMaxSupply/GetMaxSupplyQuery";
import { MaxSupplyReached } from "@domain/context/security/error/operations/MaxSupplyReached";
import CheckNums from "@core/checks/numbers/CheckNums";
import { DecimalsOverRange } from "@domain/context/security/error/operations/DecimalsOverRange";
import { GetNounceQuery } from "@query/security/protectedPartitions/getNounce/GetNounceQuery";
import { NounceAlreadyUsed } from "@domain/context/security/error/operations/NounceAlreadyUsed";
import { IsInControlListQuery } from "@query/account/controlList/IsInControlListQuery";
import { AccountAlreadyInControlList } from "@domain/context/security/error/operations/AccountAlreadyInControlList";
import { AccountNotInControlList } from "@domain/context/security/error/operations/AccountNotInControlList";
import { IsIssuerQuery } from "@query/security/ssi/isIssuer/IsIssuerQuery";
import { AccountIsAlreadyAnIssuer } from "@domain/context/security/error/operations/AccountAlreadyIsAnIssuer";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { GetHoldForByPartitionQuery } from "@query/security/hold/getHoldForByPartition/GetHoldForByPartitionQuery";
import { InsufficientHoldBalance } from "@domain/context/security/error/operations/InsufficientHoldBalance";
import { BalanceOfQuery } from "@query/security/balanceof/BalanceOfQuery";
import { InsufficientBalance } from "@domain/context/security/error/operations/InsufficientBalance";
import { SecurityControlListType } from "@domain/context/security/SecurityControlListType";
import { GetControlListTypeQuery } from "@query/security/controlList/getControlListType/GetControlListTypeQuery";
import { GetControlListCountQuery } from "@query/security/controlList/getControlListCount/GetControlListCountQuery";
import { GetControlListMembersQuery } from "@query/security/controlList/getControlListMembers/GetControlListMembersQuery";
import { AccountNotInWhiteList } from "@domain/context/security/error/operations/AccountNotInWhiteList";
import { GetKycStatusForQuery } from "@query/security/kyc/getKycStatusFor/GetKycStatusForQuery";
import { IsClearingActivatedQuery } from "@query/security/clearing/isClearingActivated/IsClearingActivatedQuery";
import { IsOperatorQuery } from "@query/security/operator/isOperator/IsOperatorQuery";
import { IsOperatorForPartitionQuery } from "@query/security/operator/isOperatorForPartition/IsOperatorForPartitionQuery";
import { HasRoleQuery } from "@query/security/roles/hasRole/HasRoleQuery";
import { IsPausedQuery } from "@query/security/isPaused/IsPausedQuery";
import { SecurityUnPaused } from "@domain/context/security/error/operations/SecurityUnPaused";
import { _PARTITION_ID_1 } from "@core/Constants";
import { NotAllowedInMultiPartition } from "@domain/context/security/error/operations/NotAllowedInMultiPartition";
import { OnlyDefaultPartitionAllowed } from "@domain/context/security/error/operations/OnlyDefaultPartitionAllowed";
import { NotIssuable } from "@domain/context/security/error/operations/NotIssuable";
import { Terminal3Vc } from "@domain/context/kyc/Terminal3";
import { InvalidVcHolder } from "@domain/context/security/error/operations/InvalidVcHolder";
import { SignedCredential } from "@terminal3/vc_core";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetBondDetailsQuery } from "@query/bond/get/getBondDetails/GetBondDetailsQuery";
import { OperationNotAllowed } from "@domain/context/security/error/operations/OperationNotAllowed";
import { KycStatus } from "@domain/context/kyc/Kyc";
import { IsInternalKycActivatedQuery } from "@query/security/kyc/isInternalKycActivated/IsInternalKycActivatedQuery";
import { IsExternallyGrantedQuery } from "@query/security/externalKycLists/isExternallyGranted/IsExternallyGrantedQuery";
import { IsProceedRecipientQuery } from "@query/security/proceedRecipient/isProceedRecipient/IsProceedRecipientQuery";
import { AccountIsNotProceedRecipient } from "@domain/context/security/error/operations/AccountIsNotProceedRecipient";
import { AccountIsProceedRecipient } from "@domain/context/security/error/operations/AccountIsProceedRecipient";

describe("ValidationService", () => {
  let service: ValidationService;

  const queryBusMock = createMock<QueryBus>();

  const securityId = HederaIdPropsFixture.create();
  const issuerId = HederaIdPropsFixture.create();
  const operatorId = HederaIdPropsFixture.create();
  const targetId = HederaIdPropsFixture.create();
  const targetEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const firstAddress = HederaIdPropsFixture.create();
  const secondAddress = HederaIdPropsFixture.create();
  const partitionId = PartitionIdFixture.create();
  const nonDefaultPartitionId = NonDefaultPartitionIdFixture.create();
  const role = RoleFixture.create();
  const amount = AmountFixture.create();
  const sourceId = HederaIdPropsFixture.create();
  const holdId = 1;

  beforeEach(() => {
    service = new ValidationService();
    jest.spyOn(Injectable, "resolve").mockReturnValue(queryBusMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("checkIssuer", () => {
    it("should return void when issuer is valid", async () => {
      queryBusMock.execute.mockResolvedValue({ payload: true });

      await expect(service.checkIssuer(securityId.value, issuerId.value)).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledWith(new IsIssuerQuery(securityId.value, issuerId.value));
    });

    it("should throw UnlistedKycIssuer when issuer is invalid", async () => {
      queryBusMock.execute.mockResolvedValue({ payload: false });
      await expect(service.checkIssuer(securityId.value, issuerId.value)).rejects.toThrow(UnlistedKycIssuer);
    });
  });

  describe("checkKycAddresses", () => {
    it("should return void when internal/external all addresses are Granted", async () => {
      queryBusMock.execute
        .mockResolvedValueOnce({ payload: true })
        .mockResolvedValueOnce({ payload: 1 })
        .mockResolvedValueOnce({ payload: true })
        .mockResolvedValueOnce({ payload: 1 })
        .mockResolvedValueOnce({ payload: true });

      await expect(
        service.checkKycAddresses(securityId.value, [firstAddress.value, secondAddress.value], KycStatus.GRANTED),
      ).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledTimes(5);
      expect(queryBusMock.execute).toHaveBeenNthCalledWith(1, new IsInternalKycActivatedQuery(securityId.value));
      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        2,
        new GetKycStatusForQuery(securityId.value, firstAddress.value),
      );
      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        3,
        new IsExternallyGrantedQuery(securityId.value, KycStatus.GRANTED, firstAddress.value),
      );
      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        4,
        new GetKycStatusForQuery(securityId.value, secondAddress.value),
      );
      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        5,
        new IsExternallyGrantedQuery(securityId.value, KycStatus.GRANTED, secondAddress.value),
      );
    });

    it("should throw AccountNotKycd when internal validation is false", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: true }).mockResolvedValueOnce({ payload: 0 });

      await expect(
        service.checkKycAddresses(securityId.value, [firstAddress.value], KycStatus.GRANTED),
      ).rejects.toThrow(AccountNotKycd);
    });

    it("should throw AccountNotKycd when external validation is false", async () => {
      queryBusMock.execute
        .mockResolvedValueOnce({ payload: true })
        .mockResolvedValueOnce({ payload: 1 })
        .mockResolvedValueOnce({ payload: false });

      await expect(
        service.checkKycAddresses(securityId.value, [firstAddress.value], KycStatus.GRANTED),
      ).rejects.toThrow(AccountNotKycd);
    });
  });

  describe("checkClearingActivated", () => {
    it("should return void when clearing is activated", async () => {
      queryBusMock.execute.mockResolvedValue({ payload: true });

      await expect(service.checkClearingActivated(securityId.value)).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledWith(new IsClearingActivatedQuery(securityId.value));
    });

    it("should throw ClearingDeactivated when clearing is not activated", async () => {
      queryBusMock.execute.mockResolvedValue({ payload: false });

      await expect(service.checkClearingActivated(securityId.value)).rejects.toThrow(ClearingDeactivated);
    });
  });

  describe("checkClearingDeactivated", () => {
    it("should return void when clearing is deactivated", async () => {
      queryBusMock.execute.mockResolvedValue({ payload: false });

      await expect(service.checkClearingDeactivated(securityId.value)).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledWith(new IsClearingActivatedQuery(securityId.value));
    });

    it("should throw ClearingActivated when clearing is activated", async () => {
      queryBusMock.execute.mockResolvedValue({ payload: true });

      await expect(service.checkClearingDeactivated(securityId.value)).rejects.toThrow(ClearingActivated);
    });
  });

  describe("checkOperator", () => {
    it("should return void when operator is valid via IsOperatorQuery", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: true }).mockResolvedValueOnce({ payload: false });

      await expect(
        service.checkOperator(securityId.value, partitionId.value, operatorId.value, targetId.value),
      ).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new IsOperatorQuery(securityId.value, operatorId.value, targetId.value),
      );
    });

    it("should return void when operator is valid via IsOperatorForPartitionQuery", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: false }).mockResolvedValueOnce({ payload: true });

      await expect(
        service.checkOperator(securityId.value, partitionId.value, operatorId.value, targetId.value),
      ).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledTimes(2);
      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        1,
        new IsOperatorQuery(securityId.value, operatorId.value, targetId.value),
      );
      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        2,
        new IsOperatorForPartitionQuery(securityId.value, partitionId.value, operatorId.value, targetId.value),
      );
    });

    it("should throw AccountIsNotOperator when neither query validates", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: false }).mockResolvedValueOnce({ payload: false });

      await expect(
        service.checkOperator(securityId.value, partitionId.value, operatorId.value, targetId.value),
      ).rejects.toThrow(AccountIsNotOperator);
    });
  });

  describe("checkRole", () => {
    it("should return void when role is valid via HasRoleQuery", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: true });

      await expect(service.checkRole(role.value, targetId.value, securityId.value)).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledWith(new HasRoleQuery(role.value, targetId.value, securityId.value));
    });

    it("should throw NotGrantedRole when role is not granted", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: false });

      await expect(service.checkRole(role.value, targetId.value, securityId.value)).rejects.toThrow(NotGrantedRole);
    });
  });

  describe("checkAnyRole", () => {
    it("should return void when any role is valid via HasRoleQuery", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: true });

      await expect(
        service.checkAnyRole([role.value, role.value], targetId.value, securityId.value),
      ).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledTimes(2);
      expect(queryBusMock.execute).toHaveBeenCalledWith(new HasRoleQuery(role.value, targetId.value, securityId.value));
    });

    it("should throw NotGrantedRole when no role is not granted", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: false });

      await expect(service.checkAnyRole([role.value], targetId.value, securityId.value)).rejects.toThrow(
        NotGrantedRole,
      );
    });
  });

  describe("checkPause", () => {
    it("should return void when pause via IsPausedQuery", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: false });

      await expect(service.checkPause(securityId.value)).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledWith(new IsPausedQuery(securityId.value));
    });

    it("should throw SecurityPaused when security is paused", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: true });

      await expect(service.checkPause(securityId.value)).rejects.toThrow(SecurityPaused);
    });
  });

  describe("checkUnpause", () => {
    it("should return void when pause via IsPausedQuery", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: true });

      await expect(service.checkUnpause(securityId.value)).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledWith(new IsPausedQuery(securityId.value));
    });

    it("should throw SecurityUnPaused when security is paused", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: false });

      await expect(service.checkUnpause(securityId.value)).rejects.toThrow(SecurityUnPaused);
    });
  });

  describe("checkProtectedPartitions", () => {
    it("should work successfully", async () => {
      const security = new Security(SecurityPropsFixture.create({ arePartitionsProtected: true }));

      await expect(service.checkProtectedPartitions(security)).resolves.toBeUndefined();
    });

    it("should throw PartitionsUnProtected when security is unprotected", async () => {
      const security = new Security(SecurityPropsFixture.create({ arePartitionsProtected: false }));

      await expect(service.checkProtectedPartitions(security)).rejects.toThrow(PartitionsUnProtected);
    });
  });

  describe("checkUnprotectedPartitions", () => {
    it("should work successfully", async () => {
      const security = new Security(SecurityPropsFixture.create({ arePartitionsProtected: false }));

      await expect(service.checkUnprotectedPartitions(security)).resolves.toBeUndefined();
    });

    it("should throw PartitionsProtected when security is protected", async () => {
      const security = new Security(SecurityPropsFixture.create({ arePartitionsProtected: true }));

      await expect(service.checkUnprotectedPartitions(security)).rejects.toThrow(PartitionsProtected);
    });
  });

  describe("checkCanTransfer", () => {
    it("should work when transfer is possible", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: ["0x01", "test"] });

      await expect(
        service.checkCanTransfer(
          securityId.value,
          targetId.value,
          amount.value.toString(),
          operatorId.value,
          sourceId.value,
          partitionId.value,
        ),
      ).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new CanTransferByPartitionQuery(
          securityId.value,
          sourceId.value,
          targetId.value,
          partitionId.value,
          amount.value.toString(),
        ),
      );
      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
    });

    it("should throw error when transfer fails", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: "0x00" });
      jest.spyOn(ContractsErrorMapper, "mapError").mockImplementation(() => {
        throw new Error("Transfer failed");
      });

      await expect(
        service.checkCanTransfer(
          securityId.value,
          targetId.value,
          amount.value.toString(),
          operatorId.value,
          sourceId.value,
          partitionId.value,
        ),
      ).rejects.toThrow("Transfer failed");
    });
  });

  describe("checkCanRedeem", () => {
    it("should work when redeem", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: ["0x01", "test"] });

      await expect(
        service.checkCanRedeem(securityId.value, sourceId.value, amount.value.toString(), partitionId.value),
      ).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new CanRedeemByPartitionQuery(securityId.value, sourceId.value, partitionId.value, amount.value.toString()),
      );
      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
    });

    it("should throw error when redeem fails", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: "0x00" });
      jest.spyOn(ContractsErrorMapper, "mapError").mockImplementation(() => {
        throw new Error("Transfer failed");
      });

      await expect(
        service.checkCanRedeem(securityId.value, sourceId.value, partitionId.value, amount.value.toString()),
      ).rejects.toThrow("Transfer failed");
    });
  });

  describe("checkMaxSupply", () => {
    it("should work when max supply not exceeded with partitionId", async () => {
      const security = new Security(SecurityPropsFixture.create());

      queryBusMock.execute
        .mockResolvedValueOnce({ payload: amount.value })
        .mockResolvedValueOnce({
          payload: BigDecimal.fromString((BigInt(amount.value.toString()) - BigInt(10000)).toString()),
        })
        .mockResolvedValueOnce({
          payload: BigDecimal.fromString((BigInt(security.totalSupply!.value.toString()) + BigInt(10000)).toString()),
        });

      await expect(
        service.checkMaxSupply(securityId.value, BigDecimal.fromString("1"), security, partitionId.value),
      ).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledTimes(3);
      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        1,
        new GetMaxSupplyByPartitionQuery(securityId.value, partitionId.value),
      );
      expect(queryBusMock.execute).toHaveBeenNthCalledWith(
        2,
        new GetTotalSupplyByPartitionQuery(securityId.value, partitionId.value),
      );
      expect(queryBusMock.execute).toHaveBeenNthCalledWith(3, new GetMaxSupplyQuery(securityId.value));
    });

    it("should work when max supply not exceeded without partitionId", async () => {
      const security = new Security(SecurityPropsFixture.create());

      queryBusMock.execute.mockResolvedValueOnce({
        payload: BigDecimal.fromString(
          (BigInt(security.totalSupply!.value.toString()) + BigInt(amount.value.toString())).toString(),
        ),
      });

      await service.checkMaxSupply(securityId.value, amount.value, security);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetMaxSupplyQuery(securityId.value));
    });

    it("should throw MaxSupplyByPartitionReached when partition limit exceeded", async () => {
      const security = new Security(SecurityPropsFixture.create());
      queryBusMock.execute
        .mockResolvedValueOnce({ payload: amount.value })
        .mockResolvedValueOnce({ payload: amount.value });

      await expect(service.checkMaxSupply(securityId.value, amount.value, security, partitionId.value)).rejects.toThrow(
        MaxSupplyByPartitionReached,
      );
    });

    it("should throw MaxSupplyReached when limit exceeded", async () => {
      const security = new Security(SecurityPropsFixture.create());
      queryBusMock.execute.mockResolvedValueOnce({ payload: amount.value });

      await expect(service.checkMaxSupply(securityId.value, amount.value, security)).rejects.toThrow(MaxSupplyReached);
    });
  });

  describe("checkDecimals", () => {
    const security = new Security(SecurityPropsFixture.create());

    it("should return void when decimals are within range", async () => {
      jest.spyOn(CheckNums, "hasMoreDecimals").mockReturnValue(false);

      await expect(service.checkDecimals(security, amount.value.toString())).resolves.toBeUndefined();

      expect(CheckNums.hasMoreDecimals).toHaveBeenCalledWith(amount.value.toString(), security.decimals);
    });

    it("should throw DecimalsOverRange when too many decimals", async () => {
      jest.spyOn(CheckNums, "hasMoreDecimals").mockReturnValue(true);

      await expect(service.checkDecimals(security, amount.value.toString())).rejects.toThrow(DecimalsOverRange);

      expect(CheckNums.hasMoreDecimals).toHaveBeenCalledWith(amount.value.toString(), security.decimals);
    });
  });

  describe("checkProtectedPartitionRole", () => {
    it("should return void when role check passes", async () => {
      const checkRoleSpy = jest.spyOn(service, "checkRole").mockResolvedValue(undefined);

      await expect(
        service.checkProtectedPartitionRole(partitionId.value, targetId.value, securityId.value),
      ).resolves.toBeUndefined();
      expect(checkRoleSpy).toHaveBeenCalledWith(expect.any(String), targetId.value, securityId.value);
    });
  });

  describe("checkValidNounce", () => {
    const nonce = 5;
    it("should return void when nounce is valid", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: 4 });

      await expect(service.checkValidNounce(securityId.value, targetId.value, nonce)).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetNounceQuery(securityId.value, targetId.value));
      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
    });

    it("should throw NounceAlreadyUsed when nounce is equal to nextNounce", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: 5 });

      await expect(service.checkValidNounce(securityId.value, targetId.value, nonce)).rejects.toThrow(
        NounceAlreadyUsed,
      );
    });

    it("should throw NounceAlreadyUsed when nounce is less than nextNounce", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: 6 });

      await expect(service.checkValidNounce(securityId.value, targetId.value, nonce)).rejects.toThrow(
        NounceAlreadyUsed,
      );
    });
  });

  describe("checkAccountInControlList", () => {
    it("should return void when adding and account is not in control list", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: false });

      await expect(service.checkAccountInControlList(securityId.value, targetId.value, true)).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledWith(new IsInControlListQuery(securityId.value, targetId.value));
      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
    });

    it("should return void when removing and account is in control list", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: true });

      await expect(service.checkAccountInControlList(securityId.value, targetId.value, false)).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledWith(new IsInControlListQuery(securityId.value, targetId.value));
    });

    it("should throw AccountAlreadyInControlList when adding and account exists", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: true });

      await expect(service.checkAccountInControlList(securityId.value, targetId.value, true)).rejects.toThrow(
        AccountAlreadyInControlList,
      );
    });

    it("should throw AccountNotInControlList when removing and account not found", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: false });

      await expect(service.checkAccountInControlList(securityId.value, targetId.value, false)).rejects.toThrow(
        AccountNotInControlList,
      );
    });
  });

  describe("checkAccountInIssuersList", () => {
    it("should return void when adding and account is not an issuer", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: false });

      await expect(service.checkAccountInIssuersList(securityId.value, targetId.value, true)).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledWith(new IsIssuerQuery(securityId.value, targetId.value));
      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
    });

    it("should return void when removing and account is an issuer", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: true });

      await expect(service.checkAccountInIssuersList(securityId.value, targetId.value, false)).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledWith(new IsIssuerQuery(securityId.value, targetId.value));
    });

    it("should throw AccountIsAlreadyAnIssuer when adding and account exists", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: true });

      await expect(service.checkAccountInIssuersList(securityId.value, targetId.value, true)).rejects.toThrow(
        AccountIsAlreadyAnIssuer,
      );
    });

    it("should throw UnlistedKycIssuer when removing and account not found", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: false });

      await expect(service.checkAccountInIssuersList(securityId.value, targetId.value, false)).rejects.toThrow(
        UnlistedKycIssuer,
      );
    });
  });

  describe("checkHoldBalance", () => {
    it("should return void when hold balance is sufficient", async () => {
      queryBusMock.execute.mockResolvedValueOnce({
        payload: {
          amount: new BigDecimal((BigInt(amount.value.toString()) + BigInt(150)).toString()),
        },
      });
      await expect(
        service.checkHoldBalance(securityId.value, partitionId.value, sourceId.value, holdId, amount.value),
      ).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new GetHoldForByPartitionQuery(securityId.value, partitionId.value, sourceId.value, holdId),
      );
      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
    });

    it("should throw InsufficientHoldBalance when balance is too low", async () => {
      queryBusMock.execute.mockResolvedValueOnce({
        payload: {
          amount: BigDecimal.fromString((BigInt(amount.value.toString()) - BigInt(150)).toString()),
        },
      });

      await expect(
        service.checkHoldBalance(securityId.value, partitionId.value, sourceId.value, holdId, amount.value),
      ).rejects.toThrow(InsufficientHoldBalance);
    });
  });

  describe("checkBalance", () => {
    it("should return void when balance is sufficient", async () => {
      queryBusMock.execute.mockResolvedValueOnce({
        payload: BigDecimal.fromString((BigInt(amount.value.toString()) + BigInt(amount.value.toString())).toString()),
      });

      await expect(service.checkBalance(securityId.value, targetId.value, amount.value)).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledWith(new BalanceOfQuery(securityId.value, targetId.value));
    });

    it("should throw InsufficientBalance when balance is too low", async () => {
      queryBusMock.execute.mockResolvedValueOnce({
        payload: BigDecimal.fromString((BigInt(amount.value.toString()) - BigInt(amount.value.toString())).toString()),
      });

      await expect(service.checkBalance(securityId.value, targetId.value, amount.value)).rejects.toThrow(
        InsufficientBalance,
      );
    });
  });

  describe("checkControlList", () => {
    it("should return true for whitelist when user is in list", async () => {
      queryBusMock.execute
        .mockResolvedValueOnce({ payload: SecurityControlListType.WHITELIST })
        .mockResolvedValueOnce({ payload: 2 })
        .mockResolvedValueOnce({
          payload: [sourceId.value, targetId.value],
        });

      await expect(service.checkControlList(securityId.value, sourceId.value, targetId.value)).resolves.toBeUndefined();

      expect(queryBusMock.execute).toHaveBeenCalledTimes(3);
      expect(queryBusMock.execute).toHaveBeenNthCalledWith(1, new GetControlListTypeQuery(securityId.value));
      expect(queryBusMock.execute).toHaveBeenNthCalledWith(2, new GetControlListCountQuery(securityId.value));
      expect(queryBusMock.execute).toHaveBeenNthCalledWith(3, new GetControlListMembersQuery(securityId.value, 0, 2));
    });

    it("should throw AccountNotInWhiteList when user not in whitelist", async () => {
      queryBusMock.execute
        .mockResolvedValueOnce({ payload: SecurityControlListType.WHITELIST })
        .mockResolvedValueOnce({ payload: 1 })
        .mockResolvedValueOnce({ payload: ["0xOTHER"] });

      await expect(service.checkControlList(securityId.value, sourceId.value)).rejects.toThrow(AccountNotInWhiteList);
    });
  });

  describe("checkMultiPartition", () => {
    const securityMulti = new Security(SecurityPropsFixture.create({ isMultiPartition: true }));
    const securitySingle = new Security(SecurityPropsFixture.create({ isMultiPartition: false }));

    it("should resolve void when no partitionId and single partition", async () => {
      await expect(service.checkMultiPartition(securitySingle)).resolves.toBeUndefined();
    });

    it("should resolve void when partitionId matches default and single partition", async () => {
      await expect(service.checkMultiPartition(securitySingle, _PARTITION_ID_1)).resolves.toBeUndefined();
    });

    it("should resolve void when partitionId provided and multi-partition", async () => {
      await expect(service.checkMultiPartition(securityMulti, partitionId.value)).resolves.toBeUndefined();
    });

    it("should throw NotAllowedInMultiPartition when no partitionId and multi-partition", async () => {
      await expect(service.checkMultiPartition(securityMulti)).rejects.toThrow(NotAllowedInMultiPartition);
    });

    it("should throw OnlyDefaultPartitionAllowed when non-default partitionId and single partition", async () => {
      await expect(service.checkMultiPartition(securitySingle, nonDefaultPartitionId.value)).rejects.toThrow(
        OnlyDefaultPartitionAllowed,
      );
    });
  });

  describe("checkIssuable", () => {
    it("should resolve void when security is issuable", async () => {
      const security = new Security(SecurityPropsFixture.create({ isIssuable: true }));

      await expect(service.checkIssuable(security)).resolves.toBeUndefined();
    });

    it("should throw NotIssuable when security is not issuable", async () => {
      const security = new Security(SecurityPropsFixture.create({ isIssuable: false }));

      await expect(service.checkIssuable(security)).rejects.toThrow(NotIssuable);
    });
  });

  describe("checkValidVc", () => {
    const signedCredential = {} as SignedCredential;

    beforeEach(() => {
      jest.spyOn(Terminal3Vc, "extractIssuer").mockReturnValue(issuerId.value);
      jest.spyOn(Terminal3Vc, "checkValidDates").mockReturnValue(signedCredential);
      jest.spyOn(Terminal3Vc, "extractHolder").mockReturnValue(targetEvmAddress.value.toString());
    });

    it("should return issuer and credential when valid", async () => {
      const checkIssuerSpy = jest.spyOn(service, "checkIssuer" as any).mockResolvedValue(undefined);

      const result = await service.checkValidVc(signedCredential, targetEvmAddress, securityId.value);
      expect(result).toEqual([issuerId.value, signedCredential]);
      expect(Terminal3Vc.extractIssuer).toHaveBeenCalledWith(signedCredential);
      expect(Terminal3Vc.checkValidDates).toHaveBeenCalledWith(signedCredential);
      expect(Terminal3Vc.extractHolder).toHaveBeenCalledWith(signedCredential);
      expect(checkIssuerSpy).toHaveBeenCalledWith(securityId.value, issuerId.value);
    });

    it("should throw InvalidVcHolder when holder mismatch", async () => {
      jest.spyOn(Terminal3Vc, "extractHolder").mockReturnValue(sourceId.value + "1");

      await expect(service.checkValidVc(signedCredential, targetEvmAddress, securityId.value)).rejects.toThrow(
        InvalidVcHolder,
      );
    });
  });

  describe("checkMaturityDate", () => {
    const currentTime = new Date().getTime();
    it("should resolve void when new maturity date is later", async () => {
      queryBusMock.execute.mockResolvedValueOnce({
        bond: { maturityDate: currentTime },
      });

      await expect(
        service.checkMaturityDate(securityId.value, (currentTime + 1000).toString()),
      ).resolves.toBeUndefined();
      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetBondDetailsQuery(securityId.value));
    });

    it("should throw OperationNotAllowed when date is earlier", async () => {
      queryBusMock.execute.mockResolvedValueOnce({
        bond: { maturityDate: currentTime },
      });

      await expect(service.checkMaturityDate(securityId.value, (currentTime - 1000).toString())).rejects.toThrow(
        OperationNotAllowed,
      );
    });

    it("should throw OperationNotAllowed when date is equal", async () => {
      queryBusMock.execute.mockResolvedValueOnce({
        bond: { maturityDate: currentTime },
      });

      await expect(service.checkMaturityDate(securityId.value, currentTime.toString())).rejects.toThrow(
        OperationNotAllowed,
      );
    });
  });

  describe("checkIsProceedRecipient", () => {
    it("should resolve successfully when address is a proceed recipient", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: true });
      const res = await service.checkIsProceedRecipient(securityId.value, targetId.value);

      expect(res).toBe(true);
      expect(queryBusMock.execute).toHaveBeenCalledWith(new IsProceedRecipientQuery(securityId.value, targetId.value));
    });

    it("should throw AccountIsNotProceedRecipient when security is not issuable", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: false });
      await expect(service.checkIsProceedRecipient(securityId.value, targetId.value)).rejects.toThrow(
        AccountIsNotProceedRecipient,
      );
    });
  });

  describe("checkIsNotProceedRecipient", () => {
    it("should resolve successfully when address is not a proceed recipient", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: false });
      const res = await service.checkIsNotProceedRecipient(securityId.value, targetId.value);

      expect(res).toBe(true);
      expect(queryBusMock.execute).toHaveBeenCalledWith(new IsProceedRecipientQuery(securityId.value, targetId.value));
    });

    it("should throw AccountIsProceedRecipient when security is not issuable", async () => {
      queryBusMock.execute.mockResolvedValueOnce({ payload: true });
      await expect(service.checkIsNotProceedRecipient(securityId.value, targetId.value)).rejects.toThrow(
        AccountIsProceedRecipient,
      );
    });
  });
});
