// SPDX-License-Identifier: Apache-2.0

import { Injectable } from "@nestjs/common";
import { LogError } from "@core/decorator/LogErrorDecorator";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { CommandBus } from "@core/command/CommandBus";
import { QueryBus } from "@core/query/QueryBus";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import DeployRequest from "@port/in/request/lifeCycleCashFlow/DeployRequest";
import RbacRequest from "@port/in/request/lifeCycleCashFlow/RbacRequest";
import PauseRequest from "@port/in/request/lifeCycleCashFlow/PauseRequest";
import UnpauseRequest from "@port/in/request/lifeCycleCashFlow/UnpauseRequest";
import IsPausedRequest from "@port/in/request/lifeCycleCashFlow/IsPausedRequest";
import GetPaymentTokenRequest from "@port/in/request/lifeCycleCashFlow/GetPaymentTokenRequest";
import GetPaymentTokenDecimalsRequest from "@port/in/request/lifeCycleCashFlow/GetPaymentTokenDecimalsRequest";
import ExecuteDistributionRequest from "@port/in/request/lifeCycleCashFlow/ExecuteDistributionRequest";
import ExecuteDistributionByAddressesRequest from "@port/in/request/lifeCycleCashFlow/ExecuteDistributionByAddressesRequest";
import ExecuteBondCashOutRequest from "@port/in/request/lifeCycleCashFlow/ExecuteBondCashOutRequest";
import ExecuteBondCashOutByAddressesRequest from "@port/in/request/lifeCycleCashFlow/ExecuteBondCashOutByAddressesRequest";
import ExecuteAmountSnapshotRequest from "@port/in/request/lifeCycleCashFlow/ExecuteAmountSnapshotRequest";
import ExecutePercentageSnapshotRequest from "@port/in/request/lifeCycleCashFlow/ExecutePercentageSnapshotRequest";
import ExecuteAmountSnapshotByAddressesRequest from "@port/in/request/lifeCycleCashFlow/ExecuteAmountSnapshotByAddressesRequest";
import ExecutePercentageSnapshotByAddressesRequest from "@port/in/request/lifeCycleCashFlow/ExecutePercentageSnapshotByAddressesRequest";
import { DeployCommand, RbacCommand } from "@app/usecase/command/lifeCycleCashFlow/operations/deploy/DeployCommand";
import { PauseCommand } from "@app/usecase/command/lifeCycleCashFlow/operations/pause/PauseCommand";
import { UnpauseCommand } from "@app/usecase/command/lifeCycleCashFlow/operations/unpause/UnpauseCommand";
import { IsPausedQuery } from "@app/usecase/query/lifeCycleCashFlow/isPaused/IsPausedQuery";
import { GetPaymentTokenQuery } from "@app/usecase/query/lifeCycleCashFlow/getPaymentToken/GetPaymentTokenQuery";
import { GetPaymentTokenDecimalsQuery } from "@app/usecase/query/lifeCycleCashFlow/getPaymentTokenDecimals/GetPaymentTokenDecimalsQuery";
import { ExecuteDistributionCommand } from "@app/usecase/command/lifeCycleCashFlow/operations/executeDistribution/ExecuteDistributionCommand";
import { ExecuteDistributionByAddressesCommand } from "@app/usecase/command/lifeCycleCashFlow/operations/executeDistributionByAddresses/ExecuteDistributionByAddressesCommand";
import { ExecuteBondCashOutCommand } from "@app/usecase/command/lifeCycleCashFlow/operations/executeBondCashOut/ExecuteBondCashOutCommand";
import { ExecuteBondCashOutByAddressesCommand } from "@app/usecase/command/lifeCycleCashFlow/operations/executeBondCashOutByAddresses/ExecuteBondCashOutByAddressesCommand";
import { ExecuteAmountSnapshotCommand } from "@app/usecase/command/lifeCycleCashFlow/operations/executeAmountSnapshot/ExecuteAmountSnapshotCommand";
import { ExecuteAmountSnapshotByAddressesCommand } from "@app/usecase/command/lifeCycleCashFlow/operations/executeAmountSnapshotByAddresses/ExecuteAmountSnapshotByAddressesCommand";
import { ExecutePercentageSnapshotCommand } from "@app/usecase/command/lifeCycleCashFlow/operations/executePercentageSnapshot/ExecutePercentageSnapshotCommand";
import { ExecutePercentageSnapshotByAddressesCommand } from "@app/usecase/command/lifeCycleCashFlow/operations/executePercentageSnapshotByAddresses/ExecutePercentageSnapshotByAddressesCommand";

interface ILifeCycleCashFlowPort {
  deploy(request: DeployRequest): Promise<{ payload: string }>;
  pause(request: PauseRequest): Promise<{ payload: boolean; transactionId: string }>;
  unpause(request: UnpauseRequest): Promise<{ payload: boolean; transactionId: string }>;
  isPaused(request: IsPausedRequest): Promise<{ payload: boolean }>;
  executeDistribution(request: ExecuteDistributionRequest): Promise<{
    failed: string[];
    succeeded: string[];
    paidAmount: string[];
    executed: boolean;
    transactionId: string;
  }>;
  executeDistributionByAddresses(request: ExecuteDistributionByAddressesRequest): Promise<{
    failed: string[];
    succeeded: string[];
    paidAmount: string[];
    transactionId: string;
  }>;
  executeBondCashOut(request: ExecuteBondCashOutRequest): Promise<{
    failed: string[];
    succeeded: string[];
    paidAmount: string[];
    executed: boolean;
    transactionId: string;
  }>;
  executeBondCashOutByAddresses(request: ExecuteBondCashOutByAddressesRequest): Promise<{
    failed: string[];
    succeeded: string[];
    paidAmount: string[];
    transactionId: string;
  }>;
  executeAmountSnapshot(request: ExecuteAmountSnapshotRequest): Promise<{
    failed: string[];
    succeeded: string[];
    paidAmount: string[];
    executed: boolean;
    transactionId: string;
  }>;
  executePercentageSnapshot(request: ExecutePercentageSnapshotRequest): Promise<{
    failed: string[];
    succeeded: string[];
    paidAmount: string[];
    executed: boolean;
    transactionId: string;
  }>;
  executeAmountSnapshotByAddresses(request: ExecuteAmountSnapshotByAddressesRequest): Promise<{
    failed: string[];
    succeeded: string[];
    paidAmount: string[];
    transactionId: string;
  }>;
  executePercentageSnapshotByAddresses(request: ExecutePercentageSnapshotByAddressesRequest): Promise<{
    failed: string[];
    succeeded: string[];
    paidAmount: string[];
    transactionId: string;
  }>;
  getPaymentToken(request: GetPaymentTokenRequest): Promise<{ payload: string }>;
  getPaymentTokenDecimals(request: GetPaymentTokenDecimalsRequest): Promise<{ payload: number }>;
}

@Injectable()
export class LifeCycleCashFlow implements ILifeCycleCashFlowPort {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
    private readonly mirrorNode: MirrorNodeAdapter,
  ) {}

  @LogError
  async deploy(request: DeployRequest): Promise<{ payload: string }> {
    const { asset, paymentToken, rbac } = request;
    ValidatedRequest.handleValidation("DeployRequest", request);

    const commandRbac = this.mapRbacRequestToCommand(rbac);

    return await this.commandBus.execute(new DeployCommand(asset, paymentToken, commandRbac));
  }

  private mapRbacRequestToCommand(rbac: RbacRequest[]): RbacCommand[] {
    return rbac != undefined && rbac.length > 0
      ? rbac.map(({ role, members }) => ({
          role,
          members,
        }))
      : [];
  }

  @LogError
  async pause(request: PauseRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { lifeCycleCashFlow } = request;

    ValidatedRequest.handleValidation("PauseRequest", request);

    return await this.commandBus.execute(new PauseCommand(lifeCycleCashFlow));
  }

  @LogError
  async unpause(request: UnpauseRequest): Promise<{ payload: boolean; transactionId: string }> {
    const { lifeCycleCashFlow } = request;
    ValidatedRequest.handleValidation("UnpauseRequest", request);

    return await this.commandBus.execute(new UnpauseCommand(lifeCycleCashFlow));
  }

  @LogError
  async isPaused(request: IsPausedRequest): Promise<{ payload: boolean }> {
    const { lifeCycleCashFlow } = request;
    IsPausedRequest.handleValidation("IsPausedRequest", request);

    return await this.queryBus.execute(new IsPausedQuery(lifeCycleCashFlow));
  }

  @LogError
  async getPaymentToken(request: GetPaymentTokenRequest): Promise<{ payload: string }> {
    const { lifeCycleCashFlow } = request;
    GetPaymentTokenRequest.handleValidation("GetPaymentTokenRequest", request);

    return await this.queryBus.execute(new GetPaymentTokenQuery(lifeCycleCashFlow));
  }

  @LogError
  async getPaymentTokenDecimals(request: GetPaymentTokenDecimalsRequest): Promise<{ payload: number }> {
    const { lifeCycleCashFlow } = request;
    GetPaymentTokenDecimalsRequest.handleValidation("GetPaymentTokenDecimalsRequest", request);

    return await this.queryBus.execute(new GetPaymentTokenDecimalsQuery(lifeCycleCashFlow));
  }

  @LogError
  async executeDistribution(request: ExecuteDistributionRequest): Promise<{
    failed: string[];
    succeeded: string[];
    paidAmount: string[];
    executed: boolean;
    transactionId: string;
  }> {
    const { lifeCycleCashFlow, asset, pageIndex, pageLength, distributionId } = request;
    ValidatedRequest.handleValidation("ExecuteDistributionRequest", request);

    const { payload: tokenDecimals } = await this.getPaymentTokenDecimals(
      new GetPaymentTokenDecimalsRequest({
        lifeCycleCashFlow: lifeCycleCashFlow,
      }),
    );

    return await this.commandBus.execute(
      new ExecuteDistributionCommand(lifeCycleCashFlow, asset, pageIndex, pageLength, distributionId, tokenDecimals),
    );
  }

  @LogError
  async executeDistributionByAddresses(request: ExecuteDistributionByAddressesRequest): Promise<{
    failed: string[];
    succeeded: string[];
    paidAmount: string[];
    transactionId: string;
  }> {
    const { lifeCycleCashFlow, asset, holders, distributionId } = request;
    ValidatedRequest.handleValidation("ExecuteDistributionByAddressesRequest", request);

    const { payload: tokenDecimals } = await this.getPaymentTokenDecimals(
      new GetPaymentTokenDecimalsRequest({
        lifeCycleCashFlow: lifeCycleCashFlow,
      }),
    );

    return await this.commandBus.execute(
      new ExecuteDistributionByAddressesCommand(lifeCycleCashFlow, asset, holders, distributionId, tokenDecimals),
    );
  }

  @LogError
  async executeBondCashOut(request: ExecuteBondCashOutRequest): Promise<{
    failed: string[];
    succeeded: string[];
    paidAmount: string[];
    executed: boolean;
    transactionId: string;
  }> {
    const { lifeCycleCashFlow, bond, pageIndex, pageLength } = request;
    ValidatedRequest.handleValidation("ExecuteBondCashOutRequest", request);

    const { payload: tokenDecimals } = await this.getPaymentTokenDecimals(
      new GetPaymentTokenDecimalsRequest({
        lifeCycleCashFlow: lifeCycleCashFlow,
      }),
    );

    return await this.commandBus.execute(
      new ExecuteBondCashOutCommand(lifeCycleCashFlow, bond, pageIndex, pageLength, tokenDecimals),
    );
  }

  @LogError
  async executeBondCashOutByAddresses(request: ExecuteBondCashOutByAddressesRequest): Promise<{
    failed: string[];
    succeeded: string[];
    paidAmount: string[];
    transactionId: string;
  }> {
    const { lifeCycleCashFlow, bond, holders } = request;
    ValidatedRequest.handleValidation("ExecuteBondCashOutByAddressesRequest", request);

    const { payload: tokenDecimals } = await this.getPaymentTokenDecimals(
      new GetPaymentTokenDecimalsRequest({
        lifeCycleCashFlow: lifeCycleCashFlow,
      }),
    );

    return await this.commandBus.execute(
      new ExecuteBondCashOutByAddressesCommand(lifeCycleCashFlow, bond, holders, tokenDecimals),
    );
  }

  @LogError
  async executeAmountSnapshot(request: ExecuteAmountSnapshotRequest): Promise<{
    failed: string[];
    succeeded: string[];
    paidAmount: string[];
    executed: boolean;
    transactionId: string;
  }> {
    const { lifeCycleCashFlow, asset, snapshotId, pageIndex, pageLength, amount } = request;
    ValidatedRequest.handleValidation("ExecuteAmountSnapshotRequest", request);

    const { payload: tokenDecimals } = await this.getPaymentTokenDecimals(
      new GetPaymentTokenDecimalsRequest({
        lifeCycleCashFlow: lifeCycleCashFlow,
      }),
    );

    return await this.commandBus.execute(
      new ExecuteAmountSnapshotCommand(
        lifeCycleCashFlow,
        asset,
        snapshotId,
        pageIndex,
        pageLength,
        amount,
        tokenDecimals,
      ),
    );
  }

  @LogError
  async executeAmountSnapshotByAddresses(request: ExecuteAmountSnapshotByAddressesRequest): Promise<{
    failed: string[];
    succeeded: string[];
    paidAmount: string[];
    transactionId: string;
  }> {
    const { lifeCycleCashFlow, asset, snapshotId, holders, amount } = request;
    ValidatedRequest.handleValidation("ExecuteAmountSnapshotByAddressesRequest", request);

    const { payload: tokenDecimals } = await this.getPaymentTokenDecimals(
      new GetPaymentTokenDecimalsRequest({
        lifeCycleCashFlow: lifeCycleCashFlow,
      }),
    );

    return await this.commandBus.execute(
      new ExecuteAmountSnapshotByAddressesCommand(lifeCycleCashFlow, asset, snapshotId, holders, amount, tokenDecimals),
    );
  }

  @LogError
  async executePercentageSnapshot(request: ExecutePercentageSnapshotRequest): Promise<{
    failed: string[];
    succeeded: string[];
    paidAmount: string[];
    executed: boolean;
    transactionId: string;
  }> {
    const { lifeCycleCashFlow, asset, snapshotId, pageIndex, pageLength, percentage } = request;
    ValidatedRequest.handleValidation("ExecutePercentageSnapshotRequest", request);

    const { payload: tokenDecimals } = await this.getPaymentTokenDecimals(
      new GetPaymentTokenDecimalsRequest({
        lifeCycleCashFlow: lifeCycleCashFlow,
      }),
    );

    return await this.commandBus.execute(
      new ExecutePercentageSnapshotCommand(
        lifeCycleCashFlow,
        asset,
        snapshotId,
        pageIndex,
        pageLength,
        percentage,
        tokenDecimals,
      ),
    );
  }

  @LogError
  async executePercentageSnapshotByAddresses(request: ExecutePercentageSnapshotByAddressesRequest): Promise<{
    failed: string[];
    succeeded: string[];
    paidAmount: string[];
    transactionId: string;
  }> {
    const { lifeCycleCashFlow, asset, snapshotId, holders, percentage } = request;
    ValidatedRequest.handleValidation("ExecutePercentageSnapshotByAddressesRequest", request);

    const { payload: tokenDecimals } = await this.getPaymentTokenDecimals(
      new GetPaymentTokenDecimalsRequest({
        lifeCycleCashFlow: lifeCycleCashFlow,
      }),
    );

    return await this.commandBus.execute(
      new ExecutePercentageSnapshotByAddressesCommand(
        lifeCycleCashFlow,
        asset,
        snapshotId,
        holders,
        percentage,
        tokenDecimals,
      ),
    );
  }
}
