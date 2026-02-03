// SPDX-License-Identifier: Apache-2.0

import { LifeCycleCashFlowAddress } from "@domain/model/life-cycle-cash-flow-address.value-object"
import { ExecuteDistributionResponse } from "@domain/ports/execute-distribution-response.interface"

export interface LifeCycleCashFlowPort {
  deployContract(hederaTokenAddress: string, hederaUsdcAddress: string): Promise<LifeCycleCashFlowAddress>

  pause(assetId: string): Promise<boolean>

  unpause(assetId: string): Promise<boolean>

  isPaused(assetId: string): Promise<boolean>

  executeDistribution(
    lifeCycleCashFlowId: string,
    asset: string,
    distributionID: number,
    pageIndex: number,
    pageLength: number,
  ): Promise<ExecuteDistributionResponse>

  executeDistributionByAddresses(
    lifeCycleCashFlowId: string,
    asset: string,
    distributionID: number,
    holders: string[],
  ): Promise<ExecuteDistributionResponse>

  executeAmountSnapshot(
    lifeCycleCashFlowId: string,
    asset: string,
    snapshotId: number,
    pageIndex: number,
    pageLength: number,
    amount: string,
  ): Promise<ExecuteDistributionResponse>

  executeAmountSnapshotByAddresses(
    lifeCycleCashFlowId: string,
    asset: string,
    snapshotId: number,
    holders: string[],
    amount: string,
  ): Promise<ExecuteDistributionResponse>

  executePercentageSnapshot(
    lifeCycleCashFlowId: string,
    asset: string,
    snapshotId: number,
    pageIndex: number,
    pageLength: number,
    percentage: string,
  ): Promise<ExecuteDistributionResponse>

  executePercentageSnapshotByAddresses(
    lifeCycleCashFlowId: string,
    asset: string,
    snapshotId: number,
    holders: string[],
    percentage: string,
  ): Promise<ExecuteDistributionResponse>
}
