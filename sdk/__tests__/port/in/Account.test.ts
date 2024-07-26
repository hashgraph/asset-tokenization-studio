import { Account, Network } from '../../../src/index.js';
import { GetAccountInfoRequest } from '../../../src/port/in/request/index.js';
import ConnectRequest, {
  SupportedWallets,
} from '../../../src/port/in/request/ConnectRequest.js';

import { CLIENT_ACCOUNT_ECDSA, CLIENT_PUBLIC_KEY_ECDSA } from '../../config.js';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';

describe('🧪 Account test', () => {
  beforeAll(async () => {
    const mirrorNode: MirrorNode = {
      name: 'testmirrorNode',
      baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
    };

    const rpcNode: JsonRpcRelay = {
      name: 'testrpcNode',
      baseUrl: 'http://127.0.0.1:7546/api',
    };

    await Network.connect(
      new ConnectRequest({
        account: {
          accountId: CLIENT_ACCOUNT_ECDSA.id.toString(),
        },
        network: 'testnet',
        wallet: SupportedWallets.METAMASK,
        mirrorNode: mirrorNode,
        rpcNode: rpcNode,
        debug: true,
      }),
    );
  }, 60_000);

  it('Gets account info', async () => {
    const res = await Account.getInfo(
      new GetAccountInfoRequest({
        account: {
          accountId: CLIENT_ACCOUNT_ECDSA.id.toString(),
        },
      }),
    );
    expect(res).not.toBeFalsy();
    expect(res.id).toBeDefined();
    expect(res.id).toEqual(CLIENT_ACCOUNT_ECDSA.id.toString());
    expect(res.publicKey).toBeDefined();
    expect(res.publicKey).toEqual(CLIENT_PUBLIC_KEY_ECDSA);
  }, 10_000);
});
