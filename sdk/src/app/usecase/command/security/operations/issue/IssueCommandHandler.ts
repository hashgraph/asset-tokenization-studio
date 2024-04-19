import { ICommandHandler } from '../../../../../../core/command/CommandHandler.js';
import { CommandHandler } from '../../../../../../core/decorator/CommandHandlerDecorator.js';
import AccountService from '../../../../../service/AccountService.js';
import SecurityService from '../../../../../service/SecurityService.js';
import { IssueCommand, IssueCommandResponse } from './IssueCommand.js';
import TransactionService from '../../../../../service/TransactionService.js';
import { lazyInject } from '../../../../../../core/decorator/LazyInjectDecorator.js';
import BigDecimal from '../../../../../../domain/context/shared/BigDecimal.js';
import { DecimalsOverRange } from '../../error/DecimalsOverRange.js';
import CheckNums from '../../../../../../core/checks/numbers/CheckNums.js';
import EvmAddress from '../../../../../../domain/context/contract/EvmAddress.js';
import { HEDERA_FORMAT_ID_REGEX } from '../../../../../../domain/context/shared/HederaId.js';
import { MirrorNodeAdapter } from '../../../../../../port/out/mirror/MirrorNodeAdapter.js';
import RPCQueryAdapter from '../../../../../../port/out/rpc/RPCQueryAdapter.js';
import { SecurityControlListType } from '../../../../../../domain/context/security/SecurityControlListType.js';
import { AccountInBlackList } from '../../error/AccountInBlackList.js';
import { AccountNotInWhiteList } from '../../error/AccountNotInWhiteList.js';
import { SecurityPaused } from '../../error/SecurityPaused.js';
import { MaxSupplyReached } from '../../error/MaxSupplyReached.js';

@CommandHandler(IssueCommand)
export class IssueCommandHandler implements ICommandHandler<IssueCommand> {
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

  async execute(command: IssueCommand): Promise<IssueCommandResponse> {
    const { securityId, targetId, amount } = command;
    const handler = this.transactionService.getHandler();
    const security = await this.securityService.get(securityId);

    if (CheckNums.hasMoreDecimals(amount, security.decimals)) {
      throw new DecimalsOverRange(security.decimals);
    }

    const amountBd = BigDecimal.fromString(amount, security.decimals);

    const securityEvmAddress: EvmAddress = new EvmAddress(
      HEDERA_FORMAT_ID_REGEX.exec(securityId)
        ? (await this.mirrorNodeAdapter.getContractInfo(securityId)).evmAddress
        : securityId.toString(),
    );

    const targetEvmAddress: EvmAddress = HEDERA_FORMAT_ID_REGEX.exec(targetId)
      ? await this.mirrorNodeAdapter.accountToEvmAddress(targetId)
      : new EvmAddress(targetId);

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

    if (
      controListType === SecurityControlListType.BLACKLIST &&
      controlListMembers.includes(targetEvmAddress.toString().toUpperCase())
    ) {
      throw new AccountInBlackList(targetEvmAddress.toString());
    }

    if (
      controListType === SecurityControlListType.WHITELIST &&
      !controlListMembers.includes(targetEvmAddress.toString().toUpperCase())
    ) {
      throw new AccountNotInWhiteList(targetEvmAddress.toString());
    }

    if (await this.queryAdapter.isPaused(securityEvmAddress)) {
      throw new SecurityPaused();
    }

    if (security.maxSupply && security.maxSupply.toBigNumber().gt(0)) {
      if (security.totalSupply) {
        const remainingAmount = security.maxSupply
          .toBigNumber()
          .sub(security.totalSupply.toBigNumber());
        if (remainingAmount.lt(amountBd.toBigNumber())) {
          throw new MaxSupplyReached();
        }
      }
    }

    // Check that the amount to issue + total supply is not greater than max supply

    const res = await handler.issue(
      securityEvmAddress,
      targetEvmAddress,
      amountBd,
    );
    return Promise.resolve(new IssueCommandResponse(res.error === undefined));
  }
}
