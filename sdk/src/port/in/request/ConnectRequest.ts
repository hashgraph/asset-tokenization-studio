/*
 *
 * Hedera Asset Tokenization Studio SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import {OptionalField} from '../../../core/decorator/OptionalDecorator.js';
import {Environment} from '../../../domain/context/network/Environment.js';
import {MirrorNode} from '../../../domain/context/network/MirrorNode.js';
import {JsonRpcRelay} from '../../../domain/context/network/JsonRpcRelay.js';
import {SupportedWallets} from '../../../domain/context/network/Wallet.js';
import {BaseRequest, RequestAccount} from './BaseRequest.js';
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
