import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import AccountService from '../../../../../service/AccountService.js';
import SecurityService from '../../../../../service/SecurityService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import {
  RemoveFromControlListCommand,
  RemoveFromControlListCommandResponse,
} from './RemoveFromControlListCommand.js';
import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { SecurityPaused } from '../../error/SecurityPaused.js';
import { RPCQueryAdapter } from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import { AccountNotInControlList } from '../../error/AccountNotInControlList.js';

@CommandHandler(RemoveFromControlListCommand)
export class RemoveFromControlListCommandHandler
  implements ICommandHandler<RemoveFromControlListCommand>
{
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
  ) {}

  async execute(
    command: RemoveFromControlListCommand,
  ): Promise<RemoveFromControlListCommandResponse> {
    const { targetId, securityId } = command;
    const handler = this.transactionService.getHandler();

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId.toString(),
    );

    const targetEvmAddress: EvmAddress = HEDERA_FORMAT_ID_REGEX.test(targetId)
      ? await this.mirrorNodeAdapter.accountToEvmAddress(targetId)
      : new EvmAddress(targetId);

    if (await this.queryAdapter.isPaused(securityEvmAddress)) {
      throw new SecurityPaused();
    }

    const isAlready = await this.queryAdapter.isAccountInControlList(
      securityEvmAddress,
      targetEvmAddress,
    );

    if (!isAlready) {
      throw new AccountNotInControlList(targetId.toString());
    }

    const res = await handler.removeFromControlList(
      securityEvmAddress,
      targetEvmAddress,
    );
    // return Promise.resolve({ payload: res.response });
    return Promise.resolve(
      new RemoveFromControlListCommandResponse(
        res.error === undefined,
        res.id!,
      ),
    );
  }
}
