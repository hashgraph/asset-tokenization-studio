// SPDX-License-Identifier: Apache-2.0

import "../environmentMock";
import {
  AddIssuerRequest,
  CreateEquityRequest,
  Equity,
  GetKycAccountsCountRequest,
  GetKycForRequest,
  GrantKycRequest,
  GetKycAccountsDataRequest,
  GetKycStatusForRequest,
  Kyc,
  LoggerTransports,
  RemoveIssuerRequest,
  RevokeKycRequest,
  Role,
  RoleRequest,
  SDK,
} from "@port/in";
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from "@domain/context/factory/RegulationType";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";
import { RPCTransactionAdapter } from "@port/out/rpc/RPCTransactionAdapter";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import NetworkService from "@service/network/NetworkService";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import SecurityViewModel from "@port/in/response/SecurityViewModel";
import {
  CLIENT_ACCOUNT_ECDSA,
  CLIENT_ACCOUNT_ECDSA_A,
  CLIENT_EVM_ADDRESS_ECDSA_1_CORRECT,
  FACTORY_ADDRESS,
  RESOLVER_ADDRESS,
} from "@test/config";
import Injectable from "@core/injectable/Injectable";
import Account from "@domain/context/account/Account";
import { ethers, Wallet } from "ethers";
import SsiManagement from "@port/in/ssiManagement/SsiManagement";
import { SecurityRole } from "@domain/context/security/SecurityRole";
import createVcT3 from "@test/utils/verifiableCredentials";
import { Terminal3Vc } from "@domain/context/kyc/Terminal3";
import { HederaId } from "@domain/context/shared/HederaId";

SDK.log = { level: "ERROR", transports: new LoggerTransports.Console() };

const decimals = 0;
const name = "TEST_SECURITY_TOKEN";
const symbol = "TEST";
const isin = "ABCDE123456Z";
const votingRight = true;
const informationRight = false;
const liquidationRight = true;
const subscriptionRight = false;
const conversionRight = true;
const redemptionRight = false;
const putRight = true;
const dividendRight = 1;
const currency = "0x345678";
const numberOfShares = 0;
const nominalValue = 1000;
const nominalValueDecimals = 3;
const regulationType = RegulationType.REG_D;
const regulationSubType = RegulationSubType.B_506;
const countries = "AF,HG,BN";
const info = "Anything";
const configId = "0x0000000000000000000000000000000000000000000000000000000000000000";
const configVersion = 1;

const mirrorNode: MirrorNode = {
  name: "testmirrorNode",
  baseUrl: "https://testnet.mirrornode.hedera.com/api/v1/",
};

const rpcNode: JsonRpcRelay = {
  name: "testrpcNode",
  baseUrl: "http://127.0.0.1:7546/api",
};

let th: RPCTransactionAdapter;
let mirrorNodeAdapter: MirrorNodeAdapter;

describe("🧪 Kyc tests", () => {
  let ns: NetworkService;
  let rpcQueryAdapter: RPCQueryAdapter;
  let equity: SecurityViewModel;

  const url = "http://127.0.0.1:7546";
  const customHttpProvider = new ethers.providers.JsonRpcProvider(url);

  beforeAll(async () => {
    try {
      mirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter);
      mirrorNodeAdapter.set(mirrorNode);

      th = Injectable.resolve(RPCTransactionAdapter);
      ns = Injectable.resolve(NetworkService);
      rpcQueryAdapter = Injectable.resolve(RPCQueryAdapter);

      rpcQueryAdapter.init();
      ns.environment = "testnet";
      ns.configuration = {
        factoryAddress: FACTORY_ADDRESS,
        resolverAddress: RESOLVER_ADDRESS,
      };
      ns.mirrorNode = mirrorNode;
      ns.rpcNode = rpcNode;

      await th.init(true);
      const account = new Account({
        id: CLIENT_ACCOUNT_ECDSA.id.toString(),
        evmAddress: CLIENT_ACCOUNT_ECDSA.evmAddress,
        alias: CLIENT_ACCOUNT_ECDSA.alias,
        privateKey: CLIENT_ACCOUNT_ECDSA.privateKey,
        publicKey: CLIENT_ACCOUNT_ECDSA.publicKey,
      });
      await th.register(account, true);

      th.setSignerOrProvider(new Wallet(CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? "", customHttpProvider));

      const requestST = new CreateEquityRequest({
        name,
        symbol,
        isin,
        decimals,
        isWhiteList: false,
        erc20VotesActivated: false,
        isControllable: true,
        arePartitionsProtected: false,
        clearingActive: false,
        internalKycActivated: true,
        isMultiPartition: false,
        diamondOwnerAccount: CLIENT_ACCOUNT_ECDSA.id.toString(),
        votingRight,
        informationRight,
        liquidationRight,
        subscriptionRight,
        conversionRight,
        redemptionRight,
        putRight,
        dividendRight,
        currency,
        numberOfShares: numberOfShares.toString(),
        nominalValue: nominalValue.toString(),
        nominalValueDecimals: nominalValueDecimals,
        regulationType: CastRegulationType.toNumber(regulationType),
        regulationSubType: CastRegulationSubType.toNumber(regulationSubType),
        isCountryControlListWhiteList: true,
        countries,
        info,
        configId,
        configVersion,
      });

      equity = (await Equity.create(requestST)).security;
    } catch (error) {
      console.error("Error in beforeAll setup:", error);
    }

    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._SSI_MANAGER_ROLE,
      }),
    );
    await Role.grantRole(
      new RoleRequest({
        securityId: equity.evmDiamondAddress!,
        targetId: CLIENT_ACCOUNT_ECDSA.evmAddress!.toString(),
        role: SecurityRole._KYC_ROLE,
      }),
    );
    await SsiManagement.addIssuer(
      new AddIssuerRequest({
        securityId: equity.evmDiamondAddress!,
        issuerId: CLIENT_EVM_ADDRESS_ECDSA_1_CORRECT as string,
      }),
    );
  }, 900_000);

  it("Grant and revoke KYC", async () => {
    const vcBase64 = await createVcT3(CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString());

    expect(
      (
        await Kyc.grantKyc(
          new GrantKycRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
            vcBase64: vcBase64,
          }),
        )
      ).payload,
    ).toBe(true);

    let vcDecoded = Terminal3Vc.vcFromBase64(vcBase64);
    const issuer = Terminal3Vc.extractIssuer(vcDecoded);
    vcDecoded = Terminal3Vc.checkValidDates(vcDecoded);

    const issuerId = CLIENT_ACCOUNT_ECDSA.id.toString();
    const accountId = CLIENT_ACCOUNT_ECDSA_A.id.toString();

    // Override mock for this test to get issuer Id from EVM address
    jest
      .spyOn(mirrorNodeAdapter, "getAccountInfo")
      .mockResolvedValueOnce({ id: HederaId.from(issuerId) })
      .mockResolvedValueOnce({ id: HederaId.from(accountId) });

    expect(
      await Kyc.getKycAccountsData(
        new GetKycAccountsDataRequest({
          securityId: equity.evmDiamondAddress!,
          kycStatus: 1,
          start: 0,
          end: 1,
        }),
      ),
    ).toEqual([
      {
        account: CLIENT_ACCOUNT_ECDSA_A.id.toString(),
        validFrom: vcDecoded.validFrom?.substring(0, 10),
        validTo: vcDecoded.validUntil?.substring(0, 10),
        vcId: vcDecoded.id,
        issuer: CLIENT_ACCOUNT_ECDSA.id.toString(),
        status: 1,
      },
    ]);

    expect(
      await Kyc.getKycFor(
        new GetKycForRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        }),
      ),
    ).toEqual({
      validFrom: vcDecoded.validFrom?.substring(0, 10),
      validTo: vcDecoded.validUntil?.substring(0, 10),
      vcId: vcDecoded.id,
      issuer: issuer,
      status: 1,
    });

    expect(
      await Kyc.getKycStatusFor(
        new GetKycStatusForRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        }),
      ),
    ).toEqual(1);

    expect(
      (
        await Kyc.revokeKyc(
          new RevokeKycRequest({
            securityId: equity.evmDiamondAddress!,
            targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
          }),
        )
      ).payload,
    ).toBe(true);

    expect(
      await Kyc.getKycStatusFor(
        new GetKycStatusForRequest({
          securityId: equity.evmDiamondAddress!,
          targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
        }),
      ),
    ).toEqual(0);

    expect(
      await Kyc.getKycAccountsData(
        new GetKycAccountsDataRequest({
          securityId: equity.evmDiamondAddress!,
          kycStatus: 1,
          start: 0,
          end: 1,
        }),
      ),
    ).toEqual([]);

    expect(
      await Kyc.getKycAccountsCount(
        new GetKycAccountsCountRequest({
          securityId: equity.evmDiamondAddress!,
          kycStatus: 1,
        }),
      ),
    ).toEqual(0);

    expect(
      (
        await SsiManagement.removeIssuer(
          new RemoveIssuerRequest({
            securityId: equity.evmDiamondAddress!,
            issuerId: CLIENT_EVM_ADDRESS_ECDSA_1_CORRECT,
          }),
        )
      ).payload,
    ).toBe(true);
  }, 600_000);

  it("Cannot grant KYC with invalid VC", async () => {
    const invalidAddress = CLIENT_ACCOUNT_ECDSA.evmAddress!;
    const vcBase64 = await createVcT3(invalidAddress);

    await expect(
      async () =>
        (
          await Kyc.grantKyc(
            new GrantKycRequest({
              securityId: equity.evmDiamondAddress!,
              targetId: CLIENT_ACCOUNT_ECDSA_A.evmAddress!.toString(),
              vcBase64: vcBase64,
            }),
          )
        ).payload,
    ).rejects.toThrow("The VC holder does not match target account");
  }, 600_000);
});
