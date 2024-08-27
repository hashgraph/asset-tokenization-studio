import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import { Environment } from '../../../domain/context/network/Environment.js';
import { MirrorNode } from '../../../domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../domain/context/network/JsonRpcRelay.js';
import { SupportedWallets } from '../../../domain/context/network/Wallet.js';
import { BaseRequest, RequestAccount } from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';
import WalletConnectSettings from '../../../domain/context/walletConnect/WalletConnectSettings.js';

export { SupportedWallets };

export default class ConnectRequest
  extends ValidatedRequest<ConnectRequest>
  implements BaseRequest
{
  @OptionalField()
  account?: RequestAccount;
  network: Environment;
  mirrorNode: MirrorNode;
  rpcNode: JsonRpcRelay;
  wallet: SupportedWallets;
  wcConnectingSettings?: WalletConnectSettings;
  debug?: boolean;

  constructor({
    account,
    network,
    mirrorNode,
    rpcNode,
    wallet,
    wcConnectingSettings,
    debug,
  }: {
    account?: RequestAccount;
    network: Environment;
    mirrorNode: MirrorNode;
    rpcNode: JsonRpcRelay;
    wallet: SupportedWallets;
    wcConnectingSettings?: WalletConnectSettings;
    debug?: boolean;
  }) {
    super({
      account: Validation.checkAccount(),
      wallet: Validation.checkString({ emptyCheck: true }),
    });
    this.account = account;
    this.network = network;
    this.mirrorNode = mirrorNode;
    this.rpcNode = rpcNode;
    this.wallet = wallet;
    this.wcConnectingSettings = wcConnectingSettings;
    this.debug = debug;
  }
}
