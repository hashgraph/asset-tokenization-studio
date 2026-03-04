// SPDX-License-Identifier: Apache-2.0

import { ContractId } from "@hiero-ledger/sdk";
import { ethers } from "ethers";
import {
  BondUSAFacet__factory,
  EquityUSAFacet__factory,
  SnapshotsFacet__factory,
  ScheduledCrossOrderedTasksFacet__factory,
  Bond__factory,
  ProceedRecipientsFacet__factory,
  FixedRate__factory,
  KpiLinkedRate__factory,
  Kpis__factory,
} from "@hashgraph/asset-tokenization-contracts";
import { GAS } from "@core/Constants";
import BigDecimal from "@domain/context/shared/BigDecimal";
import EvmAddress from "@domain/context/contract/EvmAddress";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import { CastRateStatus, RateStatus } from "@domain/context/bond/RateStatus";
import LogService from "@service/log/LogService";
import { TransactionExecutor } from "../TransactionExecutor";

export class SecurityOperations {
  constructor(private readonly executor: TransactionExecutor) {}

  async setCoupon(
    security: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    rate: BigDecimal,
    startDate: BigDecimal,
    endDate: BigDecimal,
    fixingDate: BigDecimal,
    rateStatus: RateStatus,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `bond: ${security} , recordDate :${recordDate} , executionDate: ${executionDate}, rate : ${rate}, startDate: ${startDate}, endDate: ${endDate}, fixingDate: ${fixingDate}, rateStatus: ${rateStatus}`,
    );
    const coupon = {
      recordDate: recordDate.toHexString(),
      executionDate: executionDate.toHexString(),
      rate: rate.toHexString(),
      rateDecimals: rate.decimals,
      startDate: startDate.toBigInt(),
      endDate: endDate.toBigInt(),
      fixingDate: fixingDate.toBigInt(),
      rateStatus: CastRateStatus.toNumber(rateStatus),
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      BondUSAFacet__factory.createInterface(),
      "setCoupon",
      [coupon],
      GAS.SET_COUPON,
    );
  }

  setRate(
    security: EvmAddress,
    rate: BigDecimal,
    rateDecimals: number,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Setting Rate ${rate.toString()} with decimals ${rateDecimals} for security ${security.toString()}`,
    );
    return this.executor.executeContractCall(
      securityId.toString(),
      FixedRate__factory.createInterface(),
      "setRate",
      [rate, rateDecimals],
      GAS.SET_RATE,
    );
  }

  setInterestRate(
    security: EvmAddress,
    maxRate: BigDecimal,
    baseRate: BigDecimal,
    minRate: BigDecimal,
    startPeriod: BigDecimal,
    startRate: BigDecimal,
    missedPenalty: BigDecimal,
    reportPeriod: BigDecimal,
    rateDecimals: number,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Setting Interest Rate for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      KpiLinkedRate__factory.createInterface(),
      "setInterestRate",
      [
        {
          maxRate,
          baseRate,
          minRate,
          startPeriod,
          startRate,
          missedPenalty,
          reportPeriod,
          rateDecimals,
        },
      ],
      GAS.SET_INTEREST_RATE,
    );
  }

  setImpactData(
    security: EvmAddress,
    maxDeviationCap: BigDecimal,
    baseLine: BigDecimal,
    maxDeviationFloor: BigDecimal,
    impactDataDecimals: number,
    adjustmentPrecision: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Setting Impact Data for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      KpiLinkedRate__factory.createInterface(),
      "setImpactData",
      [
        {
          maxDeviationCap,
          baseLine,
          maxDeviationFloor,
          impactDataDecimals,
          adjustmentPrecision,
        },
      ],
      GAS.SET_IMPACT_DATA,
    );
  }

  addKpiData(
    security: EvmAddress,
    date: number,
    value: string,
    project: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `Adding KPI data for security ${security.toString()}, date: ${date}, value: ${value}, project: ${project.toString()}`,
    );
    return this.executor.executeContractCall(
      securityId.toString(),
      new ethers.Interface(Kpis__factory.abi as ethers.InterfaceAbi),
      "addKpiData",
      [date, value, project.toString()],
      GAS.ADD_KPI_DATA,
    );
  }

  async updateMaturityDate(
    security: EvmAddress,
    maturityDate: number,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Updating bond maturity date ${maturityDate} for security ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      new ethers.Interface(Bond__factory.abi as ethers.InterfaceAbi),
      "updateMaturityDate",
      [maturityDate],
      GAS.UPDATE_MATURITY_DATE,
    );
  }

  addProceedRecipient(
    security: EvmAddress,
    proceedRecipient: EvmAddress,
    data: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Adding proceedRecipient: ${proceedRecipient} to security: ${security}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ProceedRecipientsFacet__factory.createInterface(),
      "addProceedRecipient",
      [proceedRecipient.toString(), data],
      GAS.ADD_PROCEED_RECIPIENT,
    );
  }

  removeProceedRecipient(
    security: EvmAddress,
    proceedRecipient: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Removing proceedRecipient: ${proceedRecipient} from security: ${security}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ProceedRecipientsFacet__factory.createInterface(),
      "removeProceedRecipient",
      [proceedRecipient.toString()],
      GAS.REMOVE_PROCEED_RECIPIENT,
    );
  }

  updateProceedRecipientData(
    security: EvmAddress,
    proceedRecipient: EvmAddress,
    data: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Updating proceedRecipient: ${proceedRecipient} data in security: ${security}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ProceedRecipientsFacet__factory.createInterface(),
      "updateProceedRecipientData",
      [proceedRecipient.toString(), data],
      GAS.UPDATE_PROCEED_RECIPIENT,
    );
  }

  async setDividends(
    security: EvmAddress,
    recordDate: BigDecimal,
    executionDate: BigDecimal,
    amount: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `equity: ${security} , recordDate :${recordDate} , executionDate: ${executionDate}, amount : ${amount}`,
    );
    const dividend = {
      recordDate: recordDate.toHexString(),
      executionDate: executionDate.toHexString(),
      amount: amount.toHexString(),
      amountDecimals: amount.decimals,
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      EquityUSAFacet__factory.createInterface(),
      "setDividends",
      [dividend],
      GAS.SET_DIVIDENDS,
    );
  }

  async setVotingRights(
    security: EvmAddress,
    recordDate: BigDecimal,
    data: string,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`equity: ${security} , recordDate :${recordDate}`);
    const voting = {
      recordDate: recordDate.toHexString(),
      data: data,
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      EquityUSAFacet__factory.createInterface(),
      "setVoting",
      [voting],
      GAS.SET_VOTING_RIGHTS,
    );
  }

  async setScheduledBalanceAdjustment(
    security: EvmAddress,
    executionDate: BigDecimal,
    factor: BigDecimal,
    decimals: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(
      `equity: ${security} , executionDate :${executionDate} , factor: ${factor}, decimals : ${decimals}`,
    );
    const scheduleBalanceAdjustment = {
      executionDate: executionDate.toHexString(),
      factor: factor.toHexString(),
      decimals: decimals.toHexString(),
    };
    return this.executor.executeContractCall(
      securityId.toString(),
      EquityUSAFacet__factory.createInterface(),
      "setScheduledBalanceAdjustment",
      [scheduleBalanceAdjustment],
      GAS.SET_SCHEDULED_BALANCE_ADJUSTMENT,
    );
  }

  async takeSnapshot(security: EvmAddress, securityId: ContractId | string): Promise<TransactionResponse> {
    LogService.logTrace(`Take snapshot of: ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      SnapshotsFacet__factory.createInterface(),
      "takeSnapshot",
      [],
      GAS.TAKE_SNAPSHOT,
    );
  }

  async triggerPendingScheduledSnapshots(
    security: EvmAddress,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Triggering pending scheduled snapshots for ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ScheduledCrossOrderedTasksFacet__factory.createInterface(),
      "triggerPendingScheduledCrossOrderedTasks",
      [],
      GAS.TRIGGER_PENDING_SCHEDULED_SNAPSHOTS,
    );
  }

  async triggerScheduledSnapshots(
    security: EvmAddress,
    max: BigDecimal,
    securityId: ContractId | string,
  ): Promise<TransactionResponse> {
    LogService.logTrace(`Triggering up to ${max.toString()} pending scheduled snapshots for ${security.toString()}`);
    return this.executor.executeContractCall(
      securityId.toString(),
      ScheduledCrossOrderedTasksFacet__factory.createInterface(),
      "triggerScheduledCrossOrderedTasks",
      [max.toHexString()],
      GAS.TRIGGER_PENDING_SCHEDULED_SNAPSHOTS,
    );
  }
}
