// SPDX-License-Identifier: Apache-2.0

export enum ErrorCode {
  // Error codes for Input Data (Prefix: 1XXXX)
  AccountIdInValid = "10001",
  AccountIdNotExists = "10026",
  ContractKeyInvalid = "10006",
  EmptyValue = "10017",
  InvalidAmount = "10008",
  InvalidBase64 = "10011",
  InvalidBytes = "10007",
  InvalidBytes3 = "10003",
  InvalidBytes32 = "10002",
  InvalidContractId = "10014",
  InvalidDividendType = "10028",
  InvalidEvmAddress = "10023",
  InvalidIdFormatHedera = "10009",
  InvalidIdFormatHederaIdOrEvmAddress = "10010",
  InvalidLength = "10016",
  InvalidRange = "10018",
  InvalidRegulationSubType = "10030",
  InvalidRegulationSubTypeForType = "10031",
  InvalidRegulationType = "10029",
  InvalidRequest = "10024",
  InvalidRole = "10019",
  InvalidSecurityType = "10020",
  InvalidType = "10015",
  InvalidValue = "10021",
  PublicKeyInvalid = "10004",
  ValidationChecks = "10022",
  InvalidClearingOperationType = "10032",
  InvalidClearingOperationTypeNumber = "10033",
  InvalidVcFormat = "10034",
  InvalidVcDates = "10036",
  InvalidTimeUnits = "10037",
  InvalidInterestRateType = "10038",
  InvalidRateStatus = "10039",
  InvalidNegativeRate = "10040",

  // Error codes for Logic Errors (Prefix: 2XXXX)
  AccountAlreadyInControlList = "20013",
  AccountIsAlreadyAnIssuer = "20020",
  AccountFreeze = "20008",
  AccountInBlackList = "20011",
  AccountNotAssociatedToSecurity = "20001",
  AccountNotInControlList = "20015",
  AccountNotInWhiteList = "20012",
  InsufficientBalance = "20009",
  InsufficientFunds = "20005",
  InsufficientHoldBalance = "20019",
  MaxSupplyReached = "20002",
  NounceAlreadyUsed = "20016",
  OperationNotAllowed = "20004",
  PartitionsProtected = "20017",
  PartitionsUnprotected = "20018",
  RoleNotAssigned = "20003",
  SecurityPaused = "20010",
  SecurityUnPaused = "20014",
  UnlistedKycIssuer = "20021",
  InvalidVcHolder = "20022",
  InvalidVc = "20023",
  ClearingActivated = "20024",
  ClearingDeactivated = "20025",
  AccountNotKycd = "20026",
  AccountIsNotOperator = "20027",
  InsufficientAllowance = "20028",
  InvalidPartition = "20029",
  InvalidFromAccount = "20030",
  InvalidDestinationAccount = "20031",
  MaxSupplyByPartitionReached = "20032",
  NotAllowedInMultiPartition = "20033",
  OnlyDefaultPartitionAllowed = "20034",
  NotIssuable = "20035",
  InvalidSupply = "20036",
  AddressRecovered = "20037",
  ZeroAddressNotAllowed = "20038",
  AccountBlocked = "20039",
  ComplianceNotAllowed = "20040",
  InvalidKycStatus = "20041",
  WalletRecovered = "20042",
  AddressNotVerified = "20043",
  AccountIsProceedRecipient = "20044",
  AccountIsNotProceedRecipient = "20045",

  // Error codes for System Errors (Prefix: 3XXXX)
  ContractNotFound = "30002",
  InvalidResponse = "30005",
  NotFound = "30006",
  ReceiptNotReceived = "30001",
  RuntimeError = "30004",
  Unexpected = "30003",
  TransactionNotFound = "30007",
  TransactionResultNotFound = "30008",
  BalanceNotFound = "30009",
  ErrorRetrievingEvmAddress = "30010",
  PublickKeyNotFound = "30011",
  UnsupportedNetwork = "30012",
  NotInitialized = "30013",
  AccountNotSet = "30014",
  NoSettings = "30015",
  NoSigners = "30016",
  AccountNotRetrievedFromSigners = "30017",
  AccountNotFound = "30018",
  ConsensusNodesNotSet = "30019",
  SignatureNotFound = "30020",
  ErrorDecodingVc = "30021",
  EmptyResponse = "30022",
  WalletNotSupported = "30023",
  UncaughtCommandError = "30024",
  UncaughtQueryError = "30025",

  // Error codes for Provider Errors (Prefix: 4XXXX)
  DeploymentError = "40006", // Fixed typo here
  InitializationError = "40001",
  PairingError = "40002",
  PairingRejected = "40008",
  ProviderError = "40007",
  SigningError = "40004",
  TransactionCheck = "40003",
  TransactionError = "40005",
}

export enum ErrorCategory {
  InputData = "1",
  Logic = "2",
  System = "3",
  Provider = "4",
}

export function getErrorCategory(errorCode: ErrorCode): ErrorCategory {
  switch (true) {
    case errorCode.startsWith(ErrorCategory.InputData):
      return ErrorCategory.InputData;
    case errorCode.startsWith(ErrorCategory.Logic):
      return ErrorCategory.Logic;
    default:
      return ErrorCategory.System;
  }
}

export default class BaseError extends Error {
  message: string;
  errorCode: ErrorCode;
  errorCategory: ErrorCategory;

  /**
   * Generic Error Constructor
   */
  constructor(code: ErrorCode, msg: string) {
    super(msg);
    this.message = msg;
    this.errorCode = code;
    this.errorCategory = getErrorCategory(code);
  }

  toString(stack = false): string {
    return `${this.errorCode} - ${stack ? this.stack : this.message}`;
  }
}
