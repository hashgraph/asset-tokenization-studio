import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import TransactionService from '../../../../../service/TransactionService.js';
import {
  ApplyRolesCommand,
  ApplyRolesCommandResponse,
} from './ApplyRolesCommand.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { SecurityPaused } from '../../error/SecurityPaused.js';
import { RPCQueryAdapter } from '../../../../../../port/out/rpc/RPCQueryAdapter.js';

@CommandHandler(ApplyRolesCommand)
export class ApplyRolesCommandHandler
  implements ICommandHandler<ApplyRolesCommand>
{
  constructor(
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(
    command: ApplyRolesCommand,
  ): Promise<ApplyRolesCommandResponse> {
    const { roles, actives, targetId, securityId } = command;
    const handler = this.transactionService.getHandler();

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId.toString(),
    );

    const targetEvmAddress: EvmAddress = HEDERA_FORMAT_ID_REGEX.exec(targetId)
      ? await this.mirrorNodeAdapter.accountToEvmAddress(targetId)
      : new EvmAddress(targetId);

    if (await this.queryAdapter.isPaused(securityEvmAddress)) {
      throw new SecurityPaused();
    }

    const res = await handler.applyRoles(
      securityEvmAddress,
      targetEvmAddress,
      roles,
      actives,
      securityId,
    );

    return Promise.resolve(
      new ApplyRolesCommandResponse(res.error === undefined, res.id!),
    );
  }
}
