// SPDX-License-Identifier: Apache-2.0

import Injectable from "@core/injectable/Injectable";
import { QueryBus } from "@core/query/QueryBus";
import { UnlistedKycIssuer } from "@domain/context/security/error/operations/UnlistedKycIssuer";
import Service from "@service/Service";
import { singleton } from "tsyringe";
import { AccountNotKycd } from "@domain/context/security/error/operations/AccountNotKycd";
import { IsIssuerQuery } from "@query/security/ssi/isIssuer/IsIssuerQuery";
import { GetKycStatusForQuery } from "@query/security/kyc/getKycStatusFor/GetKycStatusForQuery";
import { IsClearingActivatedQuery } from "@query/security/clearing/isClearingActivated/IsClearingActivatedQuery";
import { ClearingDeactivated } from "@domain/context/security/error/operations/ClearingDeactivated";
import { ClearingActivated } from "@domain/context/security/error/operations/ClearingActivated";
import { IsOperatorForPartitionQuery } from "@query/security/operator/isOperatorForPartition/IsOperatorForPartitionQuery";
import { HasRoleQuery } from "@query/security/roles/hasRole/HasRoleQuery";
import { IsPausedQuery } from "@query/security/isPaused/IsPausedQuery";
import { IsOperatorQuery } from "@query/security/operator/isOperator/IsOperatorQuery";
import { AccountIsNotOperator } from "@domain/context/security/error/operations/AccountIsNotOperator";
import { NotGrantedRole } from "@domain/context/security/error/operations/NotGrantedRole";
import { SecurityPaused } from "@domain/context/security/error/operations/SecurityPaused";
import { DecimalsOverRange } from "@domain/context/security/error/operations/DecimalsOverRange";
import { PartitionsUnProtected } from "@domain/context/security/error/operations/PartitionsUnprotected";
import { ContractsErrorMapper } from "@domain/context/security/error/operations/contractsErrorsMapper/ContractsErrorMapper";
import { CanTransferByPartitionQuery } from "@query/security/canTransferByPartition/CanTransferByPartitionQuery";
import { Security } from "@domain/context/security/Security";
import CheckNums from "@core/checks/numbers/CheckNums";
import { getProtectedPartitionRole } from "@domain/context/security/SecurityRole";
import { GetNounceQuery } from "@query/security/protectedPartitions/getNounce/GetNounceQuery";
import { NounceAlreadyUsed } from "@domain/context/security/error/operations/NounceAlreadyUsed";
import { IsInControlListQuery } from "@query/account/controlList/IsInControlListQuery";
import { AccountNotInControlList } from "@domain/context/security/error/operations/AccountNotInControlList";
import { AccountAlreadyInControlList } from "@domain/context/security/error/operations/AccountAlreadyInControlList";
import { AccountIsAlreadyAnIssuer } from "@domain/context/security/error/operations/AccountAlreadyIsAnIssuer";
import { CanRedeemByPartitionQuery } from "@query/security/canRedeemByPartition/CanRedeemByPartitionQuery";
import BigDecimal from "@domain/context/shared/BigDecimal";
import { InsufficientHoldBalance } from "@domain/context/security/error/operations/InsufficientHoldBalance";
import { BalanceOfQuery } from "@query/security/balanceof/BalanceOfQuery";
import { InsufficientBalance } from "@domain/context/security/error/operations/InsufficientBalance";
import { GetHoldForByPartitionQuery } from "@query/security/hold/getHoldForByPartition/GetHoldForByPartitionQuery";
import { GetControlListTypeQuery } from "@query/security/controlList/getControlListType/GetControlListTypeQuery";
import { SecurityControlListType } from "@domain/context/security/SecurityControlListType";
import { GetControlListCountQuery } from "@query/security/controlList/getControlListCount/GetControlListCountQuery";
import { GetControlListMembersQuery } from "@query/security/controlList/getControlListMembers/GetControlListMembersQuery";
import { AccountInBlackList } from "@domain/context/security/error/operations/AccountInBlackList";
import { AccountNotInWhiteList } from "@domain/context/security/error/operations/AccountNotInWhiteList";
import { GetMaxSupplyQuery } from "@query/security/cap/getMaxSupply/GetMaxSupplyQuery";
import { GetMaxSupplyByPartitionQuery } from "@query/security/cap/getMaxSupplyByPartition/GetMaxSupplyByPartitionQuery";
import { MaxSupplyByPartitionReached } from "@domain/context/security/error/operations/MaxSupplyByPartitionReached";
import { MaxSupplyReached } from "@domain/context/security/error/operations/MaxSupplyReached";
import { NotAllowedInMultiPartition } from "@domain/context/security/error/operations/NotAllowedInMultiPartition";
import { OnlyDefaultPartitionAllowed } from "@domain/context/security/error/operations/OnlyDefaultPartitionAllowed";
import { NotIssuable } from "@domain/context/security/error/operations/NotIssuable";
import { _PARTITION_ID_1 } from "@core/Constants";
import { Terminal3Vc } from "@domain/context/kyc/Terminal3";
import { SignedCredential } from "@terminal3/vc_core";
import { InvalidVcHolder } from "@domain/context/security/error/operations/InvalidVcHolder";
import EvmAddress from "@domain/context/contract/EvmAddress";
import { GetTotalSupplyByPartitionQuery } from "@query/security/cap/getTotalSupplyByPartition/GetTotalSupplyByPartitionQuery";
import { BigNumber } from "ethers";
import { SecurityUnPaused } from "@domain/context/security/error/operations/SecurityUnPaused";
import { PartitionsProtected } from "@domain/context/security/error/operations/PartitionsProtected";
import { GetBondDetailsQuery } from "@query/bond/get/getBondDetails/GetBondDetailsQuery";
import { OperationNotAllowed } from "@domain/context/security/error/operations/OperationNotAllowed";
import { IsInternalKycActivatedQuery } from "@query/security/kyc/isInternalKycActivated/IsInternalKycActivatedQuery";
import { IsExternallyGrantedQuery } from "@query/security/externalKycLists/isExternallyGranted/IsExternallyGrantedQuery";
import { GetTokenBySaltQuery } from "@query/factory/trex/getTokenBySalt/GetTokenBySaltQuery";
import { InvalidTrexTokenSalt } from "@domain/context/factory/error/InvalidTrexTokenSalt";
import { IsProceedRecipientQuery } from "@query/security/proceedRecipient/isProceedRecipient/IsProceedRecipientQuery";
import { AccountIsNotProceedRecipient } from "@domain/context/security/error/operations/AccountIsNotProceedRecipient";
import { AccountIsProceedRecipient } from "@domain/context/security/error/operations/AccountIsProceedRecipient";

@singleton()
export default class ValidationService extends Service {
  queryBus: QueryBus;
  constructor() {
    super();
  }

  async checkIssuer(securityId: string, issuer: string): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const res = await this.queryBus.execute(new IsIssuerQuery(securityId, issuer));
    if (!res.payload) throw new UnlistedKycIssuer(issuer);
  }

  async checkKycAddresses(securityId: string, addresses: string[], kycStatus: number): Promise<void> {
    const queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const isInternalKycActivated = await queryBus.execute(new IsInternalKycActivatedQuery(securityId));

    for (const address of addresses) {
      const isKycValid = await this.validateAddressKyc(
        queryBus,
        securityId,
        address,
        kycStatus,
        isInternalKycActivated.payload,
      );

      if (!isKycValid) {
        throw new AccountNotKycd(address, kycStatus);
      }
    }
  }

  async checkClearingActivated(securityId: string): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const result = (await this.queryBus.execute(new IsClearingActivatedQuery(securityId))).payload;

    if (!result) {
      throw new ClearingDeactivated();
    }
  }

  async checkClearingDeactivated(securityId: string): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const result = (await this.queryBus.execute(new IsClearingActivatedQuery(securityId))).payload;

    if (result) {
      throw new ClearingActivated();
    }
  }

  async checkOperator(securityId: string, partitionId: string, operatorId: string, targetId: string): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);

    if (
      (await this.queryBus.execute(new IsOperatorQuery(securityId, operatorId, targetId))).payload ||
      (await this.queryBus.execute(new IsOperatorForPartitionQuery(securityId, partitionId, operatorId, targetId)))
        .payload
    ) {
      return;
    }
    throw new AccountIsNotOperator(operatorId, targetId);
  }

  async checkRole(role: string, accountId: string, securityId: string): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const res = await this.queryBus.execute(new HasRoleQuery(role, accountId, securityId));
    if (!res.payload) {
      throw new NotGrantedRole(role);
    }
  }

  async checkAnyRole(roles: string[], accountId: string, securityId: string): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const roleChecks = roles.map((r) => this.queryBus.execute(new HasRoleQuery(r, accountId, securityId)));
    const results = await Promise.all(roleChecks);

    const granted = results.some((r) => r.payload === true);
    if (!granted) {
      throw new NotGrantedRole(`any of [${roles.join(", ")}]`);
    }
  }

  async checkPause(securityId: string): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const res = await this.queryBus.execute(new IsPausedQuery(securityId));
    if (res.payload) {
      throw new SecurityPaused();
    }
  }

  async checkUnpause(securityId: string): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const res = await this.queryBus.execute(new IsPausedQuery(securityId));
    if (!res.payload) {
      throw new SecurityUnPaused();
    }
  }

  async checkProtectedPartitions(security: Security): Promise<void> {
    if (!security.arePartitionsProtected) {
      throw new PartitionsUnProtected();
    }
  }

  async checkUnprotectedPartitions(security: Security): Promise<void> {
    if (security.arePartitionsProtected) {
      throw new PartitionsProtected();
    }
  }

  async checkCanTransfer(
    securityId: string,
    targetId: string,
    amount: string,
    operatorId: string,
    sourceId?: string,
    partitionId?: string,
  ): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);

    const res = await this.queryBus.execute(
      new CanTransferByPartitionQuery(
        securityId,
        sourceId ?? operatorId,
        targetId,
        partitionId ?? _PARTITION_ID_1,
        amount,
      ),
    );

    if (res.payload[0] != "0x01") {
      throw ContractsErrorMapper.mapError(res.payload[0], res.payload[1]);
    }
  }

  async checkCanRedeem(securityId: string, sourceId: string, amount: string, partitionId: string): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const res = await this.queryBus.execute(new CanRedeemByPartitionQuery(securityId, sourceId, partitionId, amount));

    if (res.payload[0] != "0x01") {
      throw ContractsErrorMapper.mapError(res.payload[0], res.payload[1]);
    }
  }

  async checkMaxSupply(
    securityId: string,
    amount: BigDecimal,
    security: Security,
    partitionId?: string,
  ): Promise<void> {
    let res;
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    if (partitionId) {
      res = await this.queryBus.execute(new GetMaxSupplyByPartitionQuery(securityId, partitionId));
      const partitionTotalSupply = await this.queryBus.execute(
        new GetTotalSupplyByPartitionQuery(securityId, partitionId),
      );
      if (
        this.isMaxSupplyExceeded(
          res.payload.toBigNumber(),
          amount.toBigNumber(),
          partitionTotalSupply.payload.toBigNumber(),
        )
      ) {
        throw new MaxSupplyByPartitionReached();
      }
    }
    res = await this.queryBus.execute(new GetMaxSupplyQuery(securityId));
    if (
      this.isMaxSupplyExceeded(res.payload.toBigNumber(), amount.toBigNumber(), security.totalSupply!.toBigNumber())
    ) {
      throw new MaxSupplyReached();
    }
  }

  async checkDecimals(security: Security, amount: string): Promise<void> {
    if (CheckNums.hasMoreDecimals(amount, security.decimals)) {
      throw new DecimalsOverRange(security.decimals);
    }
  }

  async checkProtectedPartitionRole(partitionId: string, accountId: string, securityId: string): Promise<void> {
    const protectedPartitionRole = getProtectedPartitionRole(partitionId);
    await this.checkRole(protectedPartitionRole, accountId, securityId);
  }

  async checkValidNounce(securityId: string, targetId: string, nounce: number): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const nextNounce = (await this.queryBus.execute(new GetNounceQuery(securityId, targetId))).payload;

    if (nounce <= nextNounce) {
      throw new NounceAlreadyUsed(nounce);
    }
  }

  async checkAccountInControlList(securityId: string, targetId: string, add: boolean): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const res = await this.queryBus.execute(new IsInControlListQuery(securityId, targetId));
    if (add && res.payload) {
      throw new AccountAlreadyInControlList(targetId.toString());
    }
    if (!add && !res.payload) {
      throw new AccountNotInControlList(targetId.toString());
    }
  }

  async checkAccountInIssuersList(securityId: string, targetId: string, add: boolean): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const res = await this.queryBus.execute(new IsIssuerQuery(securityId, targetId));
    if (add && res.payload) {
      throw new AccountIsAlreadyAnIssuer(targetId.toString());
    }
    if (!add && !res.payload) {
      throw new UnlistedKycIssuer(targetId.toString());
    }
  }

  async checkHoldBalance(
    securityId: string,
    partitionId: string,
    sourceId: string,
    holdId: number,
    amount: BigDecimal,
  ): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const holdDetails = await this.queryBus.execute(
      new GetHoldForByPartitionQuery(securityId, partitionId, sourceId, holdId),
    );
    if (holdDetails.payload.amount.toBigNumber().lt(amount.toBigNumber())) {
      throw new InsufficientHoldBalance();
    }
  }

  async checkBalance(securityId: string, accountId: string, amount: BigDecimal): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const res = await this.queryBus.execute(new BalanceOfQuery(securityId, accountId));
    if (res.payload.toBigNumber().lt(amount.toBigNumber())) {
      throw new InsufficientBalance();
    }
  }

  async checkControlList(securityId: string, sourceEvmAddress?: string, targetEvmAddress?: string): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const controListType = (await this.queryBus.execute(new GetControlListTypeQuery(securityId))).payload;
    const controlListCount = (await this.queryBus.execute(new GetControlListCountQuery(securityId))).payload;
    const controlListMembers = (
      await this.queryBus.execute(new GetControlListMembersQuery(securityId, 0, controlListCount))
    ).payload.map(function (x) {
      return x.toUpperCase();
    });

    if (sourceEvmAddress) {
      await this.checkUserInControlList(controListType, controlListMembers, sourceEvmAddress);
    }

    if (targetEvmAddress) {
      await this.checkUserInControlList(controListType, controlListMembers, targetEvmAddress);
    }
  }

  async checkMultiPartition(security: Security, partitionId?: string): Promise<void> {
    if (!partitionId && security.isMultiPartition) {
      throw new NotAllowedInMultiPartition();
    }
    if (partitionId && partitionId != _PARTITION_ID_1 && !security.isMultiPartition) {
      throw new OnlyDefaultPartitionAllowed();
    }
  }

  async checkIssuable(security: Security): Promise<void> {
    if (!security.isIssuable) {
      throw new NotIssuable();
    }
  }

  async checkValidVc(
    signedCredential: SignedCredential,
    targetEvmAddress: EvmAddress,
    securityId: string,
  ): Promise<[string, SignedCredential]> {
    const issuer = Terminal3Vc.extractIssuer(signedCredential);
    signedCredential = Terminal3Vc.checkValidDates(signedCredential);
    const holder = Terminal3Vc.extractHolder(signedCredential);

    if (targetEvmAddress.toString().toLowerCase() !== holder.toLowerCase()) {
      throw new InvalidVcHolder();
    }

    await this.checkIssuer(securityId, issuer);

    return [issuer, signedCredential];
  }

  async checkMaturityDate(securityId: string, maturityDate: string): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const bondDetails = (await this.queryBus.execute(new GetBondDetailsQuery(securityId))).bond;

    if (parseInt(maturityDate) <= bondDetails.maturityDate) {
      throw new OperationNotAllowed("The maturity date cannot be earlier or equal than the current one");
    }
  }

  async checkTrexTokenSaltExists(factory: string, salt: string): Promise<void> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const exists = (await this.queryBus.execute(new GetTokenBySaltQuery(factory, salt))).token;

    if (!exists) {
      throw new InvalidTrexTokenSalt(salt);
    }
  }

  private async checkUserInControlList(
    controListType: SecurityControlListType,
    controlListMembers: string[],
    user: string,
  ): Promise<void> {
    if (
      controListType === SecurityControlListType.BLACKLIST &&
      controlListMembers.includes(user.toString().toUpperCase())
    ) {
      throw new AccountInBlackList(user.toString());
    }

    if (
      controListType === SecurityControlListType.WHITELIST &&
      !controlListMembers.includes(user.toString().toUpperCase())
    ) {
      throw new AccountNotInWhiteList(user.toString());
    }
  }

  private isMaxSupplyExceeded(maxSupply: BigNumber, amount: BigNumber, totalSupply: BigNumber): boolean {
    return maxSupply.lt(totalSupply.add(amount));
  }

  private async validateAddressKyc(
    queryBus: QueryBus,
    securityId: string,
    address: string,
    kycStatus: number,
    isInternalKycActivated: boolean,
  ): Promise<boolean> {
    const internalKycValid = await this.checkInternalKyc(
      queryBus,
      securityId,
      address,
      kycStatus,
      isInternalKycActivated,
    );

    if (!internalKycValid) {
      return false;
    }
    return (await queryBus.execute(new IsExternallyGrantedQuery(securityId, kycStatus, address))).payload;
  }

  private async checkInternalKyc(
    queryBus: QueryBus,
    securityId: string,
    address: string,
    kycStatus: number,
    isInternalKycActivated: boolean,
  ): Promise<boolean> {
    if (!isInternalKycActivated) {
      return true;
    }
    const kycResult = await queryBus.execute(new GetKycStatusForQuery(securityId, address));
    return kycResult.payload === kycStatus;
  }

  async checkIsProceedRecipient(securityId: string, proceedRecipient: string): Promise<boolean> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const res = (await this.queryBus.execute(new IsProceedRecipientQuery(securityId, proceedRecipient))).payload;
    if (!res) {
      throw new AccountIsNotProceedRecipient(securityId, proceedRecipient);
    }

    return res;
  }
  async checkIsNotProceedRecipient(securityId: string, proceedRecipient: string): Promise<boolean> {
    this.queryBus = Injectable.resolve<QueryBus>(QueryBus);
    const res = (await this.queryBus.execute(new IsProceedRecipientQuery(securityId, proceedRecipient))).payload;
    if (res) {
      throw new AccountIsProceedRecipient(securityId, proceedRecipient);
    }

    return !res;
  }
}
