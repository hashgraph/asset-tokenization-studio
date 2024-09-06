import { OptionalField } from '../../../core/decorator/OptionalDecorator.js';
import { Environment } from '../../../domain/context/network/Environment.js';
import { MirrorNode } from '../../../domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../domain/context/network/JsonRpcRelay.js';
import { SupportedWallets } from '../../../domain/context/network/Wallet.js';
import { BaseRequest, RequestAccount } from './BaseRequest.js';
import ValidatedRequest from './validation/ValidatedRequest.js';
import Validation from './validation/Validation.js';

export { SupportedWallets };

export type HWCRequestSettings = {
  projectId: string;
  dappName: string;
  dappDescription: string;
  dappURL: string;
  dappIcons: string[];
};

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
  hwcSettings?: HWCRequestSettings;
  debug?: boolean;

  constructor({
    account,
    network,
    mirrorNode,
    rpcNode,
    wallet,
    hwcSettings,
    debug,
  }: {
    account?: RequestAccount;
    network: Environment;
    mirrorNode: MirrorNode;
    rpcNode: JsonRpcRelay;
    wallet: SupportedWallets;
    hwcSettings?: HWCRequestSettings;
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
    this.debug = debug;
    this.hwcSettings = hwcSettings;
  }

  [n: string]: any;
}
