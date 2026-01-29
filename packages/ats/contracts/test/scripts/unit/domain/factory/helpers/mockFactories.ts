// SPDX-License-Identifier: Apache-2.0

/**
 * Mock factories for factory deployment tests.
 *
 * Provides reusable mock data factories and stubs for testing factory
 * deployment functions without actual contract interactions.
 *
 * @module test/scripts/unit/domain/factory/helpers/mockFactories
 */

import sinon from "sinon";
import {
  TEST_ADDRESSES,
  TEST_CONFIG_IDS,
  TEST_TOKEN_METADATA,
  TEST_NOMINAL_VALUES,
  TEST_REGULATION,
  TEST_INTEREST_RATES,
  TEST_IMPACT_DATA,
  TEST_FACTORY_EVENTS,
  TEST_TX_HASHES,
} from "@test";
import type {
  SecurityDataParams,
  EquityDetailsDataParams,
  BondDetailsDataParams,
  FactoryRegulationDataParams,
  DividendRight,
} from "@scripts/domain";

// ============================================================================
// Security Data Factories
// ============================================================================

/**
 * Create mock security data with sensible defaults.
 *
 * @param overrides - Optional overrides for specific fields
 * @returns SecurityDataParams with test defaults
 */
export function createMockSecurityData(overrides?: Partial<SecurityDataParams>): SecurityDataParams {
  return {
    arePartitionsProtected: false,
    isMultiPartition: false,
    resolver: TEST_ADDRESSES.VALID_0,
    isControllable: true,
    isWhiteList: true,
    maxSupply: TEST_NOMINAL_VALUES.MAX_SUPPLY,
    erc20MetadataInfo: {
      name: TEST_TOKEN_METADATA.NAME,
      symbol: TEST_TOKEN_METADATA.SYMBOL,
      decimals: TEST_TOKEN_METADATA.DECIMALS,
      isin: TEST_TOKEN_METADATA.ISIN,
    },
    clearingActive: false,
    internalKycActivated: false,
    erc20VotesActivated: false,
    externalPauses: [],
    externalControlLists: [],
    externalKycLists: [],
    compliance: TEST_ADDRESSES.ZERO,
    identityRegistry: TEST_ADDRESSES.ZERO,
    resolverProxyConfiguration: {
      key: TEST_CONFIG_IDS.EQUITY,
      version: 1,
    },
    rbacs: [],
    ...overrides,
  };
}

/**
 * Create mock security data with additional RBACs.
 *
 * @param additionalRbacs - Additional RBAC entries to include
 * @returns SecurityDataParams with test defaults and additional RBACs
 */
export function createMockSecurityDataWithRbacs(
  additionalRbacs: Array<{ role: string; members: string[] }>,
): SecurityDataParams {
  return createMockSecurityData({
    rbacs: additionalRbacs,
  });
}

// ============================================================================
// Equity Details Factories
// ============================================================================

/**
 * Create mock equity details data with sensible defaults.
 *
 * @param overrides - Optional overrides for specific fields
 * @returns EquityDetailsDataParams with test defaults
 */
export function createMockEquityDetails(overrides?: Partial<EquityDetailsDataParams>): EquityDetailsDataParams {
  return {
    votingRight: true,
    informationRight: true,
    liquidationRight: true,
    subscriptionRight: false,
    conversionRight: false,
    redemptionRight: false,
    putRight: false,
    dividendRight: 2 as DividendRight, // DividendRight.COMMON
    currency: TEST_TOKEN_METADATA.CURRENCY,
    nominalValue: TEST_NOMINAL_VALUES.STANDARD,
    nominalValueDecimals: TEST_NOMINAL_VALUES.DECIMALS,
    ...overrides,
  };
}

// ============================================================================
// Bond Details Factories
// ============================================================================

/**
 * Create mock bond details data with sensible defaults.
 *
 * @param overrides - Optional overrides for specific fields
 * @returns BondDetailsDataParams with test defaults
 */
export function createMockBondDetails(overrides?: Partial<BondDetailsDataParams>): BondDetailsDataParams {
  return {
    currency: TEST_TOKEN_METADATA.CURRENCY,
    nominalValue: TEST_NOMINAL_VALUES.STANDARD,
    nominalValueDecimals: TEST_NOMINAL_VALUES.DECIMALS,
    startingDate: Math.floor(Date.now() / 1000),
    maturityDate: Math.floor(Date.now() / 1000) + 365 * 24 * 60 * 60, // 1 year
    ...overrides,
  };
}

// ============================================================================
// Regulation Data Factories
// ============================================================================

/**
 * Create mock regulation data with sensible defaults.
 *
 * @param overrides - Optional overrides for specific fields
 * @returns FactoryRegulationDataParams with test defaults
 */
export function createMockRegulationData(
  overrides?: Partial<FactoryRegulationDataParams>,
): FactoryRegulationDataParams {
  return {
    regulationType: TEST_REGULATION.TYPE_REG_S,
    regulationSubType: TEST_REGULATION.SUBTYPE_NONE,
    additionalSecurityData: {
      countriesControlListType: TEST_REGULATION.COUNTRIES_WHITELIST,
      listOfCountries: TEST_REGULATION.COUNTRIES,
      info: TEST_REGULATION.INFO,
    },
    ...overrides,
  };
}

// ============================================================================
// Interest Rate Factories (Bond Variants)
// ============================================================================

/**
 * Create mock fixed rate params for fixed rate bond tests.
 */
export function createMockFixedRateParams() {
  return {
    rate: TEST_INTEREST_RATES.FIXED_RATE,
    rateDecimals: TEST_INTEREST_RATES.FIXED_RATE_DECIMALS,
  };
}

/**
 * Create mock interest rate params for KPI linked rate bond tests.
 */
export function createMockInterestRateParams() {
  return {
    maxRate: TEST_INTEREST_RATES.MAX_RATE,
    baseRate: TEST_INTEREST_RATES.BASE_RATE,
    minRate: TEST_INTEREST_RATES.MIN_RATE,
    startPeriod: TEST_INTEREST_RATES.START_PERIOD,
    startRate: TEST_INTEREST_RATES.START_RATE,
    missedPenalty: TEST_INTEREST_RATES.MISSED_PENALTY,
    reportPeriod: TEST_INTEREST_RATES.REPORT_PERIOD,
    rateDecimals: TEST_INTEREST_RATES.RATE_DECIMALS,
  };
}

/**
 * Create mock interest rate params for SPT bond tests.
 */
export function createMockInterestRateParamsSPT() {
  return {
    baseRate: TEST_INTEREST_RATES.BASE_RATE,
    startPeriod: TEST_INTEREST_RATES.START_PERIOD,
    startRate: TEST_INTEREST_RATES.START_RATE,
    rateDecimals: TEST_INTEREST_RATES.RATE_DECIMALS,
  };
}

/**
 * Create mock impact data params for KPI linked rate bond tests.
 */
export function createMockImpactDataParams() {
  return {
    maxDeviationCap: TEST_IMPACT_DATA.MAX_DEVIATION_CAP,
    baseLine: TEST_IMPACT_DATA.BASELINE,
    maxDeviationFloor: TEST_IMPACT_DATA.MAX_DEVIATION_FLOOR,
    impactDataDecimals: TEST_IMPACT_DATA.DECIMALS,
    adjustmentPrecision: TEST_IMPACT_DATA.ADJUSTMENT_PRECISION,
  };
}

/**
 * Create mock impact data params for SPT bond tests.
 */
export function createMockImpactDataParamsSPT() {
  return {
    baseLine: TEST_IMPACT_DATA.BASELINE,
    baseLineMode: TEST_IMPACT_DATA.BASELINE_MODE,
    deltaRate: TEST_IMPACT_DATA.DELTA_RATE,
    impactDataMode: TEST_IMPACT_DATA.IMPACT_DATA_MODE,
  };
}

// ============================================================================
// Transaction Receipt Factories
// ============================================================================

/**
 * Create mock transaction receipt with specified event.
 *
 * @param eventName - Name of the event to include in receipt
 * @param diamondAddress - Diamond proxy address to return in event args
 * @returns Mock receipt object with events array
 */
export function createMockReceipt(eventName: string, diamondAddress: string) {
  return {
    events: [
      {
        event: eventName,
        args: {
          diamondProxyAddress: diamondAddress,
        },
      },
    ],
  };
}

/**
 * Create mock receipt with empty events array.
 */
export function createMockReceiptWithNoEvents() {
  return {
    events: [],
  };
}

/**
 * Create mock receipt with event but no args.
 *
 * @param eventName - Name of the event
 */
export function createMockReceiptWithEventNoArgs(eventName: string) {
  return {
    events: [
      {
        event: eventName,
        args: undefined,
      },
    ],
  };
}

/**
 * Create mock receipt with wrong event name.
 *
 * @param diamondAddress - Diamond proxy address
 */
export function createMockReceiptWithWrongEvent(diamondAddress: string) {
  return createMockReceipt(TEST_FACTORY_EVENTS.UNKNOWN, diamondAddress);
}

// ============================================================================
// Factory Contract Stubs
// ============================================================================

/**
 * Create a minimal mock signer that satisfies ethers.js BaseContract requirements.
 *
 * This provides the minimum interface needed for ResolverProxy__factory.connect()
 * to work without throwing "invalid signer or provider" errors.
 */
export function createMockSigner() {
  const mockProvider = {
    getNetwork: sinon.stub().resolves({ chainId: 1, name: "hardhat" }),
    getBlockNumber: sinon.stub().resolves(12345),
    getGasPrice: sinon.stub().resolves(1000000000),
    estimateGas: sinon.stub().resolves(21000),
    call: sinon.stub().resolves("0x"),
    getCode: sinon.stub().resolves("0x"),
    resolveName: sinon.stub().resolves(TEST_ADDRESSES.VALID_0),
    lookupAddress: sinon.stub().resolves(null),
    waitForTransaction: sinon.stub().resolves({ status: 1 }),
    getTransaction: sinon.stub().resolves(null),
    getTransactionReceipt: sinon.stub().resolves(null),
    getLogs: sinon.stub().resolves([]),
    getBalance: sinon.stub().resolves(0),
    getStorageAt: sinon.stub().resolves("0x"),
    sendTransaction: sinon
      .stub()
      .resolves({ hash: TEST_TX_HASHES.SAMPLE_0, wait: sinon.stub().resolves({ status: 1 }) }),
    _isProvider: true,
  };

  return {
    getAddress: sinon.stub().resolves(TEST_ADDRESSES.VALID_0),
    signMessage: sinon.stub().resolves("0x"),
    signTransaction: sinon.stub().resolves("0x"),
    sendTransaction: sinon
      .stub()
      .resolves({ hash: TEST_TX_HASHES.SAMPLE_0, wait: sinon.stub().resolves({ status: 1 }) }),
    connect: sinon.stub().returnsThis(),
    provider: mockProvider,
    _isSigner: true,
  };
}

/**
 * Create mock IFactory stub with all deployment methods.
 *
 * @param receiptEvent - Event name to include in receipt
 * @param diamondAddress - Diamond proxy address to return
 * @returns Mock factory object with stubbed methods
 */
export function createMockFactory(receiptEvent: string, diamondAddress: string) {
  const mockReceipt = createMockReceipt(receiptEvent, diamondAddress);
  const mockTx = {
    wait: sinon.stub().resolves(mockReceipt),
    hash: TEST_TX_HASHES.SAMPLE_0,
  };

  return {
    deployEquity: sinon.stub().resolves(mockTx),
    deployBond: sinon.stub().resolves(mockTx),
    deployBondFixedRate: sinon.stub().resolves(mockTx),
    deployBondKpiLinkedRate: sinon.stub().resolves(mockTx),
    deployBondSustainabilityPerformanceTargetRate: sinon.stub().resolves(mockTx),
    signer: createMockSigner(),
  };
}

/**
 * Create mock factory that returns receipt with no matching event.
 *
 * @param diamondAddress - Diamond proxy address
 */
export function createMockFactoryWithWrongEvent(diamondAddress: string) {
  return createMockFactory(TEST_FACTORY_EVENTS.UNKNOWN, diamondAddress);
}

/**
 * Create mock factory that returns receipt with event but no args.
 *
 * @param eventName - Event name to include
 */
export function createMockFactoryWithNoArgs(eventName: string) {
  const mockReceipt = createMockReceiptWithEventNoArgs(eventName);
  const mockTx = {
    wait: sinon.stub().resolves(mockReceipt),
    hash: TEST_TX_HASHES.SAMPLE_0,
  };

  return {
    deployEquity: sinon.stub().resolves(mockTx),
    deployBond: sinon.stub().resolves(mockTx),
    deployBondFixedRate: sinon.stub().resolves(mockTx),
    deployBondKpiLinkedRate: sinon.stub().resolves(mockTx),
    deployBondSustainabilityPerformanceTargetRate: sinon.stub().resolves(mockTx),
    signer: createMockSigner(),
  };
}

/**
 * Create mock factory that returns zero address in event args.
 *
 * @param eventName - Event name to include
 */
export function createMockFactoryWithZeroAddress(eventName: string) {
  return createMockFactory(eventName, TEST_ADDRESSES.ZERO);
}

// ============================================================================
// Deploy Params Factories
// ============================================================================

/**
 * Create mock deploy equity params with factory stub.
 *
 * @param factoryStub - Mock factory to use
 * @param overrides - Optional overrides
 */
export function createDeployEquityParams(
  factoryStub: ReturnType<typeof createMockFactory>,
  overrides?: {
    adminAccount?: string;
    securityData?: SecurityDataParams;
    equityDetails?: EquityDetailsDataParams;
  },
) {
  return {
    adminAccount: overrides?.adminAccount ?? TEST_ADDRESSES.VALID_1,
    factory: factoryStub as any,
    securityData: overrides?.securityData ?? createMockSecurityData(),
    equityDetails: overrides?.equityDetails ?? createMockEquityDetails(),
  };
}

/**
 * Create mock deploy bond params with factory stub.
 *
 * @param factoryStub - Mock factory to use
 * @param overrides - Optional overrides
 */
export function createDeployBondParams(
  factoryStub: ReturnType<typeof createMockFactory>,
  overrides?: {
    adminAccount?: string;
    securityData?: SecurityDataParams;
    bondDetails?: BondDetailsDataParams;
    proceedRecipients?: string[];
    proceedRecipientsData?: string[];
  },
) {
  return {
    adminAccount: overrides?.adminAccount ?? TEST_ADDRESSES.VALID_1,
    factory: factoryStub as any,
    securityData: overrides?.securityData ?? createMockSecurityData(),
    bondDetails: overrides?.bondDetails ?? createMockBondDetails(),
    proceedRecipients: overrides?.proceedRecipients ?? [TEST_ADDRESSES.VALID_2],
    proceedRecipientsData: overrides?.proceedRecipientsData ?? ["0x"],
  };
}

// ============================================================================
// Factory Result Factories
// ============================================================================

/**
 * Create mock deploy factory result for summary tests.
 *
 * @param overrides - Optional overrides
 */
export function createMockDeployFactoryResult(overrides?: {
  factoryAddress?: string;
  implementationAddress?: string;
  proxyAdminAddress?: string;
  initialized?: boolean;
  success?: boolean;
}) {
  return {
    success: overrides?.success ?? true,
    proxyResult: {
      proxyAddress: overrides?.factoryAddress ?? TEST_ADDRESSES.VALID_0,
      implementationAddress: overrides?.implementationAddress ?? TEST_ADDRESSES.VALID_1,
      proxyAdminAddress: overrides?.proxyAdminAddress ?? TEST_ADDRESSES.VALID_2,
    },
    factoryAddress: overrides?.factoryAddress ?? TEST_ADDRESSES.VALID_0,
    implementationAddress: overrides?.implementationAddress ?? TEST_ADDRESSES.VALID_1,
    proxyAdminAddress: overrides?.proxyAdminAddress ?? TEST_ADDRESSES.VALID_2,
    initialized: overrides?.initialized ?? false,
  };
}
