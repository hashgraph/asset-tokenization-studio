import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import AccountService from '../../../../../service/AccountService.js';
import SecurityService from '../../../../../service/SecurityService.js';
import { TransferCommand, TransferCommandResponse } from './TransferCommand.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import CheckNums from '../../../../../../core/checks/numbers/CheckNums.js';
import { DecimalsOverRange } from '../../error/DecimalsOverRange.js';
import { RPCQueryAdapter } from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import { InsufficientBalance } from '../../error/InsufficientBalance.js';
import { SecurityPaused } from '../../error/SecurityPaused.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { AccountInBlackList } from '../../error/AccountInBlackList.js';
import { AccountNotInWhiteList } from '../../error/AccountNotInWhiteList.js';
import { SecurityControlListType } from '../../../../../../domain/context/security/SecurityControlListType.js';

@CommandHandler(TransferCommand)
export class TransferCommandHandler
  implements ICommandHandler<TransferCommand>
{
  constructor(
    @lazyInject(SecurityService)
    public readonly securityService: SecurityService,
    @lazyInject(TransactionService)
    public readonly transactionService: TransactionService,
    @lazyInject(AccountService)
    public readonly accountService: AccountService,
    @lazyInject(RPCQueryAdapter)
    public readonly queryAdapter: RPCQueryAdapter,
    @lazyInject(MirrorNodeAdapter)
    private readonly mirrorNodeAdapter: MirrorNodeAdapter,
  ) {}

  async execute(command: TransferCommand): Promise<TransferCommandResponse> {
    const { securityId, targetId, amount } = command;
    const handler = this.transactionService.getHandler();
    const account = this.accountService.getCurrentAccount();

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.test(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId.toString(),
    );

    const controListType = (await this.queryAdapter.getControlListType(
      securityEvmAddress,
    ))
      ? SecurityControlListType.WHITELIST
      : SecurityControlListType.BLACKLIST;
    const controlListCount =
      await this.queryAdapter.getControlListCount(securityEvmAddress);
    const controlListMembers = (
      await this.queryAdapter.getControlListMembers(
        securityEvmAddress,
        0,
        controlListCount,
      )
    ).map(function (x) {
      return x.toUpperCase();
    });

    if (await this.queryAdapter.isPaused(securityEvmAddress)) {
      throw new SecurityPaused();
    }

    const targetEvmAddress: EvmAddress = HEDERA_FORMAT_ID_REGEX.exec(targetId)
      ? await this.mirrorNodeAdapter.accountToEvmAddress(targetId)
      : new EvmAddress(targetId);

    if (
      controListType === SecurityControlListType.BLACKLIST &&
      controlListMembers.includes(account.evmAddress!.toString().toUpperCase())
    ) {
      throw new AccountInBlackList(account.evmAddress!.toString());
    }

    if (
      controListType === SecurityControlListType.BLACKLIST &&
      controlListMembers.includes(targetEvmAddress.toString().toUpperCase())
    ) {
      throw new AccountInBlackList(targetEvmAddress.toString());
    }

    if (
      controListType === SecurityControlListType.WHITELIST &&
      !controlListMembers.includes(account.evmAddress!.toString().toUpperCase())
    ) {
      throw new AccountNotInWhiteList(account.evmAddress!.toString());
    }

    if (
      controListType === SecurityControlListType.WHITELIST &&
      !controlListMembers.includes(targetEvmAddress.toString().toUpperCase())
    ) {
      throw new AccountNotInWhiteList(targetEvmAddress.toString());
    }

    const security = await this.securityService.get(securityId);
    if (CheckNums.hasMoreDecimals(amount, security.decimals)) {
      throw new DecimalsOverRange(security.decimals);
    }

    const amountBd: BigDecimal = BigDecimal.fromString(
      amount,
      security.decimals,
    );

    if (
      account.evmAddress &&
      (
        await this.queryAdapter.balanceOf(
          securityEvmAddress,
          new EvmAddress(account.evmAddress.toString()),
        )
      ).lt(amountBd.toBigNumber())
    ) {
      throw new InsufficientBalance();
    }

    const res = await handler.transfer(
      securityEvmAddress,
      targetEvmAddress,
      amountBd,
    );
    return Promise.resolve(
      new TransferCommandResponse(res.error === undefined, res.id!),
    );
  }
}
