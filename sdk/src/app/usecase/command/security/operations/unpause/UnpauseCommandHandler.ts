import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import AccountService from '../../../../../service/AccountService.js';
import SecurityService from '../../../../../service/SecurityService.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { UnpauseCommand, UnpauseCommandResponse } from './UnpauseCommand.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import { RPCQueryAdapter } from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import { NotGrantedRole } from '../../error/NotGrantedRole.js';
import { SecurityRole } from '../../../../../../domain/context/security/SecurityRole.js';
import { SecurityUnPaused } from '../../error/SecurityUnPaused.js';

@CommandHandler(UnpauseCommand)
export class UnpauseCommandHandler implements ICommandHandler<UnpauseCommand> {
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
    private readonly rpcQueryAdapter: RPCQueryAdapter,
  ) {}

  async execute(command: UnpauseCommand): Promise<UnpauseCommandResponse> {
    const { securityId } = command;
    const handler = this.transactionService.getHandler();
    const account = this.accountService.getCurrentAccount();

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId.toString(),
    );

    if (
      account.evmAddress &&
      !(await this.rpcQueryAdapter.hasRole(
        securityEvmAddress,
        new EvmAddress(account.evmAddress!),
        SecurityRole._PAUSER_ROLE,
      ))
    ) {
      throw new NotGrantedRole(SecurityRole._PAUSER_ROLE);
    }

    if (!(await this.rpcQueryAdapter.isPaused(securityEvmAddress))) {
      throw new SecurityUnPaused();
    }

    const res = await handler.unpause(securityEvmAddress, securityId);
    return Promise.resolve(
      new UnpauseCommandResponse(res.error === undefined, res.id!),
    );
  }
}
