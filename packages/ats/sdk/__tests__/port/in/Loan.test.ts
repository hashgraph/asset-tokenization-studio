//SPDX-License-Identifier: Apache-2.0

import "../environmentMock";
import {
  SDK,
  LoggerTransports,
  CreateLoanRequest,
  GetLoanDetailsRequest,
  SetLoanDetailsRequest,
  SupportedWallets,
  Network,
  Loan,
} from "@port/in";
import { CLIENT_ACCOUNT_ECDSA, FACTORY_ADDRESS, RESOLVER_ADDRESS } from "@test/config";
import ConnectRequest from "@port/in/request/network/ConnectRequest";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";
import NetworkService from "@service/network/NetworkService";
import SecurityViewModel from "@port/in/response/SecurityViewModel";
import Injectable from "@core/injectable/Injectable";
import {
  CastRegulationSubType,
  CastRegulationType,
  RegulationSubType,
  RegulationType,
} from "@domain/context/factory/RegulationType";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { RPCTransactionAdapter } from "@port/out/rpc/RPCTransactionAdapter";
import { Wallet, ethers } from "ethers";

SDK.log = { level: "ERROR", transports: new LoggerTransports.Console() };

// Security params
const decimals = 0;
const name = "TEST_LOAN_TOKEN";
const symbol = "TLN";
const isin = "ABCDE123456Z";
const numberOfUnits = "1000";
const nominalValue = "100";
const nominalValueDecimals = 2;
const regulationType = RegulationType.REG_S;
const regulationSubType = RegulationSubType.NONE;
const countries = "AF,HG,BN";
const info = "Anything";
const configId = "0x0000000000000000000000000000000000000000000000000000000000000006";
const configVersion = 1;

// LoanBasicData
const currency = "0x455552";
const currentTimeInSeconds = Math.floor(new Date().getTime() / 1000) + 1000;
const startingDate = currentTimeInSeconds + 30;
const maturityDate = startingDate + 100_000;
const signingDate = currentTimeInSeconds;
const loanStructureType = 1; // TERM_LOAN
const repaymentType = 0; // BULLET
const interestType = 0; // FIXED

// LoanInterestData
const baseReferenceRate = 1; // EURIBOR
const floorRate = "100";
const capRate = "500";
const rateMargin = "200";
const dayCount = 0; // ACTUAL360
const paymentFrequency = 1; // QUARTERLY
const firstAccrualDate = startingDate;
const prepaymentPenalty = "50";
const commitmentFee = "25";
const utilizationFee = "10";
const utilizationFeeType = 0; // EMBEDDED
const servicingFee = "15";

// RiskData
const internalRiskGrade = "BBB";
const defaultProbability = "300";
const lossGivenDefault = "4500";

// Collateral
const totalCollateralValue = "1000000";
const loanToValue = "75";

// LoanPerformanceStatus
const performanceStatus = 0; // PERFORMING
const daysPastDue = "0";

const mirrorNode: MirrorNode = {
  name: "testmirrorNode",
  baseUrl: "https://testnet.mirrornode.hedera.com/api/v1/",
};

const rpcNode: JsonRpcRelay = {
  name: "testrpcNode",
  baseUrl: "http://127.0.0.1:7546/api",
};

describe("Loan test", () => {
  let th: RPCTransactionAdapter;
  let ns: NetworkService;
  let mirrorNodeAdapter: MirrorNodeAdapter;
  let rpcQueryAdapter: RPCQueryAdapter;
  let loan: SecurityViewModel;

  beforeAll(async () => {
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

    const url = "http://127.0.0.1:7546";
    const customHttpProvider = new ethers.JsonRpcProvider(url);

    th.setSignerOrProvider(new Wallet(CLIENT_ACCOUNT_ECDSA.privateKey?.key ?? "", customHttpProvider));

    await Network.connect(
      new ConnectRequest({
        account: {
          accountId: CLIENT_ACCOUNT_ECDSA.id.toString(),
          privateKey: CLIENT_ACCOUNT_ECDSA.privateKey,
        },
        network: "testnet",
        wallet: SupportedWallets.METAMASK,
        mirrorNode: mirrorNode,
        rpcNode: rpcNode,
        debug: true,
      }),
    );

    const requestST = new CreateLoanRequest({
      security: {
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
        numberOfUnits,
        regulationType: CastRegulationType.toNumber(regulationType),
        regulationSubType: CastRegulationSubType.toNumber(regulationSubType),
        isCountryControlListWhiteList: true,
        countries,
        info,
        configId,
        configVersion,
        diamondOwnerAccount: CLIENT_ACCOUNT_ECDSA.id.toString(),
      },
      nominalValue,
      nominalValueDecimals,
      loanBasicData: {
        currency,
        startingDate: startingDate.toString(),
        maturityDate: maturityDate.toString(),
        loanStructureType,
        repaymentType,
        interestType,
        signingDate: signingDate.toString(),
        originatorAccount: CLIENT_ACCOUNT_ECDSA.id.toString(),
        servicerAccount: CLIENT_ACCOUNT_ECDSA.id.toString(),
      },
      loanInterestData: {
        baseReferenceRate,
        floorRate,
        capRate,
        rateMargin,
        dayCount,
        paymentFrequency,
        firstAccrualDate: firstAccrualDate.toString(),
        prepaymentPenalty,
        commitmentFee,
        utilizationFee,
        utilizationFeeType,
        servicingFee,
      },
      riskData: {
        internalRiskGrade,
        defaultProbability,
        lossGivenDefault,
      },
      collateral: {
        totalCollateralValue,
        loanToValue,
      },
      loanPerformanceStatus: {
        performanceStatus,
        daysPastDue,
      },
    });

    Injectable.resolveTransactionHandler();

    loan = (await Loan.create(requestST)).security;
  }, 600_000);

  it("Check all Loan Details after create", async () => {
    const details = await Loan.getLoanDetails(
      new GetLoanDetailsRequest({
        loanId: loan.evmDiamondAddress!.toString(),
      }),
    );

    // LoanBasicData
    expect(details.currency).toEqual(currency);
    expect(details.startingDate.getTime() / 1000).toEqual(startingDate);
    expect(details.maturityDate.getTime() / 1000).toEqual(maturityDate);
    expect(details.loanStructureType).toEqual(loanStructureType);
    expect(details.repaymentType).toEqual(repaymentType);
    expect(details.interestType).toEqual(interestType);
    expect(details.signingDate.getTime() / 1000).toEqual(signingDate);
    expect(details.originatorAccount).toBeDefined();
    expect(details.servicerAccount).toBeDefined();

    // LoanInterestData
    expect(details.baseReferenceRate).toEqual(baseReferenceRate);
    expect(details.floorRate).toEqual(floorRate);
    expect(details.capRate).toEqual(capRate);
    expect(details.rateMargin).toEqual(rateMargin);
    expect(details.dayCount).toEqual(dayCount);
    expect(details.paymentFrequency).toEqual(paymentFrequency);
    expect(details.firstAccrualDate.getTime() / 1000).toEqual(firstAccrualDate);
    expect(details.prepaymentPenalty).toEqual(prepaymentPenalty);
    expect(details.commitmentFee).toEqual(commitmentFee);
    expect(details.utilizationFee).toEqual(utilizationFee);
    expect(details.utilizationFeeType).toEqual(utilizationFeeType);
    expect(details.servicingFee).toEqual(servicingFee);

    // RiskData
    expect(details.internalRiskGrade).toEqual(internalRiskGrade);
    expect(details.defaultProbability).toEqual(defaultProbability);
    expect(details.lossGivenDefault).toEqual(lossGivenDefault);

    // Collateral
    expect(details.totalCollateralValue).toEqual(totalCollateralValue);
    expect(details.loanToValue).toEqual(loanToValue);

    // LoanPerformanceStatus
    expect(details.performanceStatus).toEqual(performanceStatus);
    expect(details.daysPastDue).toEqual(daysPastDue);
  }, 60_000);

  it("Set all Loan Details and verify", async () => {
    const updatedStartingDate = startingDate + 500;
    const updatedMaturityDate = maturityDate + 500;
    const updatedSigningDate = signingDate + 500;
    const updatedFirstAccrualDate = updatedStartingDate;

    const request = new SetLoanDetailsRequest({
      loanId: loan.evmDiamondAddress!.toString(),
      loanBasicData: {
        currency: "0x474250", // GBP
        startingDate: updatedStartingDate.toString(),
        maturityDate: updatedMaturityDate.toString(),
        loanStructureType: 0, // RCF
        repaymentType: 1, // AMORTIZING
        interestType: 0,
        signingDate: updatedSigningDate.toString(),
        originatorAccount: CLIENT_ACCOUNT_ECDSA.id.toString(),
        servicerAccount: CLIENT_ACCOUNT_ECDSA.id.toString(),
      },
      loanInterestData: {
        baseReferenceRate: 2, // _3M
        floorRate: "200",
        capRate: "600",
        rateMargin: "300",
        dayCount: 0,
        paymentFrequency: 2, // YEARLY
        firstAccrualDate: updatedFirstAccrualDate.toString(),
        prepaymentPenalty: "75",
        commitmentFee: "30",
        utilizationFee: "20",
        utilizationFeeType: 1, // SEPARATE
        servicingFee: "25",
      },
      riskData: {
        internalRiskGrade: "AA+",
        defaultProbability: "150",
        lossGivenDefault: "2000",
      },
      collateral: {
        totalCollateralValue: "2000000",
        loanToValue: "60",
      },
      loanPerformanceStatus: {
        performanceStatus: 1, // NON_PERFORMING
        daysPastDue: "30",
      },
    });

    const result = await Loan.setLoanDetails(request);
    expect(result).toHaveProperty("transactionId");
    expect(typeof result.transactionId).toBe("string");

    // Verify all updated values
    const details = await Loan.getLoanDetails(
      new GetLoanDetailsRequest({
        loanId: loan.evmDiamondAddress!.toString(),
      }),
    );

    // LoanBasicData
    expect(details.currency).toEqual("0x474250");
    expect(details.startingDate.getTime() / 1000).toEqual(updatedStartingDate);
    expect(details.maturityDate.getTime() / 1000).toEqual(updatedMaturityDate);
    expect(details.loanStructureType).toEqual(0);
    expect(details.repaymentType).toEqual(1);
    expect(details.interestType).toEqual(0);
    expect(details.signingDate.getTime() / 1000).toEqual(updatedSigningDate);

    // LoanInterestData
    expect(details.baseReferenceRate).toEqual(2);
    expect(details.floorRate).toEqual("200");
    expect(details.capRate).toEqual("600");
    expect(details.rateMargin).toEqual("300");
    expect(details.dayCount).toEqual(0);
    expect(details.paymentFrequency).toEqual(2);
    expect(details.firstAccrualDate.getTime() / 1000).toEqual(updatedFirstAccrualDate);
    expect(details.prepaymentPenalty).toEqual("75");
    expect(details.commitmentFee).toEqual("30");
    expect(details.utilizationFee).toEqual("20");
    expect(details.utilizationFeeType).toEqual(1);
    expect(details.servicingFee).toEqual("25");

    // RiskData
    expect(details.internalRiskGrade).toEqual("AA+");
    expect(details.defaultProbability).toEqual("150");
    expect(details.lossGivenDefault).toEqual("2000");

    // Collateral
    expect(details.totalCollateralValue).toEqual("2000000");
    expect(details.loanToValue).toEqual("60");

    // LoanPerformanceStatus
    expect(details.performanceStatus).toEqual(1);
    expect(details.daysPastDue).toEqual("30");
  }, 600_000);
});
