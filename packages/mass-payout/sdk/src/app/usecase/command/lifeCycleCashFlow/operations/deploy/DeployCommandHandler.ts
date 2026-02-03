// SPDX-License-Identifier: Apache-2.0

import { Logger } from "@nestjs/common";
import { ICommandHandler } from "@core/command/CommandHandler";
import { CommandHandler } from "@core/decorator/CommandHandlerDecorator";
import EvmAddress from "@domain/contract/EvmAddress";
import { HEDERA_FORMAT_ID_REGEX } from "@domain/shared/HederaId";
import ContractService from "@app/services/contract/ContractService";
import TransactionService from "@app/services/transaction/TransactionService";
import {
  RbacCommand,
  DeployCommand,
  DeployCommandResponse,
} from "@app/usecase/command/lifeCycleCashFlow/operations/deploy/DeployCommand";
import { TokenId } from "@hiero-ledger/sdk";
import { DeployCommandError } from "./error/DeployCommandError";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";

@CommandHandler(DeployCommand)
export class DeployCommandHandler implements ICommandHandler<DeployCommand> {
  private readonly logger = new Logger(DeployCommandHandler.name);

  constructor(
    private readonly transactionService: TransactionService,
    private readonly contractService: ContractService,
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {}

  async execute(command: DeployCommand): Promise<DeployCommandResponse> {
    try {
      const { asset, paymentToken, rbac } = command;
      const handler = this.transactionService.getHandler();

      const assetAddress: EvmAddress = await this.contractService.getContractEvmAddress(asset);
      const paymentTokenAddress = TokenId.fromString(paymentToken).toSolidityAddress();

      const lifeCycleCashFlowAddress = await handler.deploy(
        assetAddress,
        new EvmAddress(paymentTokenAddress),
        await this.mapRbacCommandToPort(rbac),
      );

      return Promise.resolve(new DeployCommandResponse(lifeCycleCashFlowAddress));
    } catch (error) {
      throw new DeployCommandError(error as Error);
    }
  }

  async mapRbacCommandToPort(rbac: RbacCommand[]) {
    return rbac != undefined && rbac.length > 0
      ? Promise.all(
          rbac.map(async (rbacElement) => ({
            role: rbacElement.role,
            members: await this.normalizeMembersToEvmAddresses(rbacElement.members),
          })),
        )
      : [];
  }

  async normalizeMembersToEvmAddresses(members) {
    return Promise.all(
      members.map(async (member) => {
        if (HEDERA_FORMAT_ID_REGEX.exec(member)) {
          const accountInfo = await this.mirrorNodeAdapter.getAccountInfo(member);
          return accountInfo.evmAddress;
        }
        return member;
      }),
    );
  }
}
