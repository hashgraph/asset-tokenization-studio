// SPDX-License-Identifier: Apache-2.0

import { Inject, Injectable } from "@nestjs/common"
import { LifeCycleCashFlowPort } from "@domain/ports/life-cycle-cash-flow.port"
import { LifeCycleCashFlowAddress } from "@domain/model/life-cycle-cash-flow-address.value-object"
import {
  DeployRequest,
  RbacRequest,
  ExecuteAmountSnapshotByAddressesRequest,
  ExecuteAmountSnapshotRequest,
  ExecuteBondCashOutByAddressesRequest,
  ExecuteBondCashOutRequest,
  ExecuteDistributionByAddressesRequest,
  ExecuteDistributionRequest,
  ExecutePercentageSnapshotByAddressesRequest,
  ExecutePercentageSnapshotRequest,
  GetPaymentTokenRequest,
  GetPaymentTokenDecimalsRequest,
  IsPausedRequest,
  LifeCycleCashFlow,
  PauseRequest,
  UnpauseRequest,
} from "@hashgraph/mass-payout-sdk"
import { ExecuteDistributionResponse } from "@domain/ports/execute-distribution-response.interface"
import { HederaService } from "@domain/ports/hedera.port"
import { ConfigModule, ConfigService } from "@nestjs/config"
import { ConfigKeys } from "@config/config-keys"

@Injectable()
export class LifeCycleCashFlowSdkService implements LifeCycleCashFlowPort {
  lifeCycleCashFlowRoles = [
    "0x0000000000000000000000000000000000000000000000000000000000000000", // DEFAULT_ADMIN_ROLE
    "0x8943226357c41253cf6ffc651e04f2a3a7cf1255138972ce150e207c0393cbce", // PAUSER_ROLE
    "0x88ad01da1e5558735d5b478c04a0f1667377fb68a98cb0278159d0b790f08c10", // PAYOUT_ROLE
    "0xe0d6eef1076057afbcdc5a0534cf7ab9071fa4fdd3750e202da3d49c8913a144", // CASHOUT_ROLE
    "0x4a16419d45be80f6de7609caac23eb8c7bfe6336a71da3cefd43ea62183ad211", // TRANSFERER_ROLE
    "0x15e92345f55818ea6e01143954b5841c1ba74302c2b157a2b4d0f21f9ad40286", // PAYMENT_TOKEN_MANAGER_ROLE
  ]

  constructor(
    private readonly lifeCycleCashFlow: LifeCycleCashFlow,
    @Inject("HederaService")
    private readonly hederaService: HederaService,
    private readonly config: ConfigService,
  ) {}

  async deployContract(hederaAssetTokenAddress: string, hederaTokenAddress: string): Promise<LifeCycleCashFlowAddress> {
    const defaultRbac: RbacRequest[] = this.getDefaultRbac(this.config.get<string>(ConfigKeys.DFNS_HEDERA_ACCOUNT_ID))

    console.log(
      "[LifeCycleCashFlowService] deployContract called with:",
      `\nToken: ${hederaAssetTokenAddress}`,
      `\nUSDC : ${hederaTokenAddress}`,
      `\nrbac : ${defaultRbac}`,
    )

    const response = await this.lifeCycleCashFlow.deploy(
      new DeployRequest({
        asset: hederaAssetTokenAddress,
        paymentToken: hederaTokenAddress,
        rbac: defaultRbac,
      }),
    )

    const evmLifeCycleCashFlowAddress = response.payload
    const hederaLifeCycleCashFlowAddress = await this.hederaService.getHederaAddressFromEvm(evmLifeCycleCashFlowAddress)

    return LifeCycleCashFlowAddress.create(hederaLifeCycleCashFlowAddress, evmLifeCycleCashFlowAddress)
  }

  private getDefaultRbac(accountId: string): RbacRequest[] {
    return this.lifeCycleCashFlowRoles.map((role) => ({ role, members: [accountId] }))
  }

  async pause(lifeCycleCashFlowId: string): Promise<boolean> {
    console.log("[LifeCycleCashFlowService] pause called for LifeCycleCashFlowId:", lifeCycleCashFlowId)
    return await this.lifeCycleCashFlow.pause(new PauseRequest({ lifeCycleCashFlow: lifeCycleCashFlowId }))
  }

  async unpause(lifeCycleCashFlowId: string): Promise<boolean> {
    console.log("[LifeCycleCashFlowService] unpause called for LifeCycleCashFlowId:", lifeCycleCashFlowId)
    return await this.lifeCycleCashFlow.unpause(new UnpauseRequest({ lifeCycleCashFlow: lifeCycleCashFlowId }))
  }

  async executeDistribution(
    lifeCycleCashFlowId: string,
    asset: string,
    distributionID: number,
    pageIndex: number,
    pageLength: number,
  ): Promise<ExecuteDistributionResponse> {
    console.log("[LifeCycleCashFlowService] execute distribution called for asset:", asset)
    const res = await this.lifeCycleCashFlow.executeDistribution(
      new ExecuteDistributionRequest({
        lifeCycleCashFlow: lifeCycleCashFlowId,
        asset: asset,
        pageIndex: pageIndex,
        pageLength: pageLength,
        distributionId: distributionID,
      }),
    )
    return res as ExecuteDistributionResponse
  }

  async executeDistributionByAddresses(
    lifeCycleCashFlowId: string,
    asset: string,
    distributionID: number,
    holders: string[],
  ): Promise<ExecuteDistributionResponse> {
    console.log("[LifeCycleCashFlowService] execute distribution by addresses called for asset:", asset)
    const res = await this.lifeCycleCashFlow.executeDistributionByAddresses(
      new ExecuteDistributionByAddressesRequest({
        lifeCycleCashFlow: lifeCycleCashFlowId,
        asset: asset,
        holders: holders,
        distributionId: distributionID,
      }),
    )
    return res as ExecuteDistributionResponse
  }

  async executeBondCashOut(
    lifeCycleCashFlowId: string,
    bond: string,
    pageIndex: number,
    pageLength: number,
  ): Promise<string> {
    console.log("[LifeCycleCashFlowService] execute bond cash out called for bond:", bond)
    const res = await this.lifeCycleCashFlow.executeBondCashOut(
      new ExecuteBondCashOutRequest({
        lifeCycleCashFlow: lifeCycleCashFlowId,
        bond: bond,
        pageIndex: pageIndex,
        pageLength: pageLength,
      }),
    )
    return res.payload
  }

  async executeBondCashOutByAddresses(lifeCycleCashFlowId: string, bond: string, holders: string[]): Promise<string> {
    console.log("[LifeCycleCashFlowService] execute bond cash out by addresses called for bond:", bond)
    const res = await this.lifeCycleCashFlow.executeBondCashOutByAddresses(
      new ExecuteBondCashOutByAddressesRequest({
        lifeCycleCashFlow: lifeCycleCashFlowId,
        bond: bond,
        holders: holders,
      }),
    )
    return res.payload
  }

  async executeAmountSnapshot(
    lifeCycleCashFlowId: string,
    asset: string,
    snapshotId: number,
    pageIndex: number,
    pageLength: number,
    amount: string,
  ): Promise<ExecuteDistributionResponse> {
    console.log("[LifeCycleCashFlowService] execute amount snapshot called for bond:", asset)
    const res = await this.lifeCycleCashFlow.executeAmountSnapshot(
      new ExecuteAmountSnapshotRequest({
        lifeCycleCashFlow: lifeCycleCashFlowId,
        asset: asset,
        snapshotId: snapshotId,
        pageIndex: pageIndex,
        pageLength: pageLength,
        amount: amount,
      }),
    )
    return res as ExecuteDistributionResponse
  }

  async executeAmountSnapshotByAddresses(
    lifeCycleCashFlowId: string,
    asset: string,
    snapshotId: number,
    holders: string[],
    amount: string,
  ): Promise<ExecuteDistributionResponse> {
    console.log("[LifeCycleCashFlowService] execute amount snapshot by addresses called for bond:", asset)
    const res = await this.lifeCycleCashFlow.executeAmountSnapshotByAddresses(
      new ExecuteAmountSnapshotByAddressesRequest({
        lifeCycleCashFlow: lifeCycleCashFlowId,
        asset: asset,
        snapshotId: snapshotId,
        holders: holders,
        amount: amount,
      }),
    )
    return res as ExecuteDistributionResponse
  }

  async executePercentageSnapshot(
    lifeCycleCashFlowId: string,
    asset: string,
    snapshotId: number,
    pageIndex: number,
    pageLength: number,
    percentage: string,
  ): Promise<ExecuteDistributionResponse> {
    console.log("[ChainLifeCycleCashFlowService] execute percentage snapshot called for bond:", asset)
    const res = await this.lifeCycleCashFlow.executePercentageSnapshot(
      new ExecutePercentageSnapshotRequest({
        lifeCycleCashFlow: lifeCycleCashFlowId,
        asset: asset,
        snapshotId: snapshotId,
        pageIndex: pageIndex,
        pageLength: pageLength,
        percentage: percentage,
      }),
    )
    return res as ExecuteDistributionResponse
  }

  async executePercentageSnapshotByAddresses(
    lifeCycleCashFlowId: string,
    asset: string,
    snapshotId: number,
    holders: string[],
    percentage: string,
  ): Promise<ExecuteDistributionResponse> {
    console.log("[LifeCycleCashFlowService] execute percentage snapshot by addresses called for bond:", asset)
    const res = await this.lifeCycleCashFlow.executePercentageSnapshotByAddresses(
      new ExecutePercentageSnapshotByAddressesRequest({
        lifeCycleCashFlow: lifeCycleCashFlowId,
        asset: asset,
        snapshotId: snapshotId,
        holders: holders,
        percentage: percentage,
      }),
    )
    return res as ExecuteDistributionResponse
  }

  async isPaused(lifeCycleCashFlowId: string): Promise<boolean> {
    console.log("[LifeCycleCashFlowService] isPaused called for LifeCycleCashFlow:", lifeCycleCashFlowId)
    const res = await this.lifeCycleCashFlow.isPaused(new IsPausedRequest({ lifeCycleCashFlow: lifeCycleCashFlowId }))
    return res.payload
  }

  async getPaymentToken(lifeCycleCashFlowId: string): Promise<boolean> {
    console.log("[LifeCycleCashFlowService] getPaymentToken called for LifeCycleCashFlow:", lifeCycleCashFlowId)
    const res = await this.lifeCycleCashFlow.getPaymentToken(
      new GetPaymentTokenRequest({ lifeCycleCashFlow: lifeCycleCashFlowId }),
    )
    return res.payload
  }

  async getPaymentTokenDecimals(lifeCycleCashFlowId: string): Promise<boolean> {
    console.log("[LifeCycleCashFlowService] getPaymentTokenDecimals called for LifeCycleCashFlow:", lifeCycleCashFlowId)
    const res = await this.lifeCycleCashFlow.getPaymentTokenDecimals(
      new GetPaymentTokenDecimalsRequest({ lifeCycleCashFlow: lifeCycleCashFlowId }),
    )
    return res.payload
  }
}
