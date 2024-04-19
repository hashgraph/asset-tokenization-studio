import {
  SDK,
  LoggerTransports,
  GetRegulationDetailsRequest,
  SupportedWallets,
  Network,
  Factory,
} from '../../../src/index.js';
import {
  BUSINESS_LOGIC_KEYS_COMMON,
  BUSINESS_LOGIC_KEYS_EQUITY,
  BUSINESS_LOGIC_KEYS_BOND,
  CLIENT_ACCOUNT_ECDSA,
  FACTORY_ADDRESS,
  RESOLVER_ADDRESS,
} from '../../config.js';
import ConnectRequest from '../../../src/port/in/request/ConnectRequest.js';
import { Wallet, ethers } from 'ethers';
import { MirrorNode } from '../../../src/domain/context/network/MirrorNode.js';
import { JsonRpcRelay } from '../../../src/domain/context/network/JsonRpcRelay.js';
import RPCTransactionAdapter from '../../../src/port/out/rpc/RPCTransactionAdapter.js';
import NetworkService from '../../../src/app/service/NetworkService.js';
import { MirrorNodeAdapter } from '../../../src/port/out/mirror/MirrorNodeAdapter.js';
import RPCQueryAdapter from '../../../src/port/out/rpc/RPCQueryAdapter.js';
import Injectable from '../../../src/core/Injectable.js';
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from '../../../src/domain/context/factory/RegulationType.js';

SDK.log = { level: 'ERROR', transports: new LoggerTransports.Console() };

const regulationType = RegulationType.REG_S;
const regulationSubType = RegulationSubType.NONE;

const mirrorNode: MirrorNode = {
  name: 'testmirrorNode',
  baseUrl: 'https://testnet.mirrornode.hedera.com/api/v1/',
};

const rpcNode: JsonRpcRelay = {
  name: 'testrpcNode',
  baseUrl: 'http://127.0.0.1:7546/api',
};

describe('🧪 Factory test', () => {
  let th: RPCTransactionAdapter;
  let ns: NetworkService;
  let mirrorNodeAdapter: MirrorNodeAdapter;
  let rpcQueryAdapter: RPCQueryAdapter;

  const delay = async (seconds = 5): Promise<void> => {
    seconds = seconds * 1000;
    await new Promise((r) => setTimeout(r, seconds));
  };

  beforeAll(async () => {
    mirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter);
    mirrorNodeAdapter.set(mirrorNode);

    th = Injectable.resolve(RPCTransactionAdapter);
    ns = Injectable.resolve(NetworkService);
    rpcQueryAdapter = Injectable.resolve(RPCQueryAdapter);

    rpcQueryAdapter.init();
    ns.environment = 'testnet';
    ns.configuration = {
      factoryAddress: FACTORY_ADDRESS,
      resolverAddress: RESOLVER_ADDRESS,
      businessLogicKeysCommon: BUSINESS_LOGIC_KEYS_COMMON,
      businessLogicKeysEquity: BUSINESS_LOGIC_KEYS_EQUITY,
      businessLogicKeysBond: BUSINESS_LOGIC_KEYS_BOND,
    };
    ns.mirrorNode = mirrorNode;
    ns.rpcNode = rpcNode;

    await th.init(true);
    await th.register(undefined, true);

    const url = 'http://127.0.0.1:7546';
    const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

    th.signerOrProvider = new Wallet(
      CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? '',
      customHttpProvider,
    );

    await Network.connect(
      new ConnectRequest({
        account: {
          accountId: CLIENT_ACCOUNT_ECDSA.id.toString(),
          privateKey: CLIENT_ACCOUNT_ECDSA.privateKey,
        },
        network: 'testnet',
        wallet: SupportedWallets.METAMASK,
        mirrorNode: mirrorNode,
        rpcNode: rpcNode,
        debug: true,
      }),
    );

    await delay();
  }, 600_000);

  it('Check Regulation Details', async () => {
    const regulationDetails = await Factory.getRegulationDetails(
      new GetRegulationDetailsRequest({
        regulationType: CastRegulationType.toNumber(regulationType),
        regulationSubType: CastRegulationSubType.toNumber(regulationSubType),
      }),
    );

    expect(regulationDetails.type).toEqual(regulationType);
    expect(regulationDetails.subType).toEqual(regulationSubType);
    expect(regulationDetails.accreditedInvestors).toEqual(
      'ACCREDITATION REQUIRED',
    );
    expect(regulationDetails.dealSize).toEqual('0');
    expect(regulationDetails.internationalInvestors).toEqual('ALLOWED');
    expect(regulationDetails.manualInvestorVerification).toEqual(
      'VERIFICATION INVESTORS FINANCIAL DOCUMENTS REQUIRED',
    );
    expect(regulationDetails.maxNonAccreditedInvestors).toEqual(0);
    expect(regulationDetails.resaleHoldPeriod).toEqual('NOT APPLICABLE');
  }, 60_000);
});
