export enum ErrorCode {
  AccountIdInValid = '10001',
  InvalidBytes32 = '10002',
  InvalidBytes3 = '10003',
  PublicKeyInvalid = '10004',
  ContractKeyInvalid = '10006',
  InvalidBytes = '10007',
  InvalidAmount = '10008',
  InvalidIdFormatHedera = '10009',
  InvalidIdFormatHederaIdOrEvmAddress = '10010',
  InvalidContractId = '10014',
  InvalidType = '10015',
  InvalidLength = '10016',
  EmptyValue = '10017',
  InvalidRange = '10018',
  InvalidRole = '10019',
  InvalidSecurityType = '10020',
  InvalidValue = '10021',
  ValidationChecks = '10022',
  InvalidEvmAddress = '10023',
  InvalidRequest = '10024',
  AccountIdNotExists = '10026',
  InvalidDividendType = '10028',
  InvalidRegulationType = '10029',
  InvalidRegulationSubType = '10030',
  InvalidRegulationSubTypeForType = '10031',
  AccountNotAssociatedToSecurity = '20001',
  MaxSupplyReached = '20002',
  RoleNotAssigned = '20003',
  OperationNotAllowed = '20004',
  InsufficientFunds = '20005',
  //KYCNotEnabled = '20006',
  //AccountNotKyc = '20007',
  AccountFreeze = '20008',
  InsufficientBalance = '20009',
  SecurityPaused = '20010',
  AccountInBlackList = '20011',
  AccountNotInWhiteList = '20012',
  AccountAlreadyInControlList = '20013',
  SecurityUnPaused = '20014',
  AccountNotInControlList = '20015',
  ReceiptNotReceived = '30001',
  ContractNotFound = '30002',
  Unexpected = '30003',
  RuntimeError = '30004',
  InvalidResponse = '30005',
  NotFound = '30006',
  InitializationError = '40001',
  PairingError = '40002',
  TransactionCheck = '40003',
  SigningError = '40004',
  TransactionError = '40005',
  DeplymentError = '40006',
  ProviderError = '40007',
  PairingRejected = '40008',
}

export enum ErrorCategory {
  InputData = '1',
  Logic = '2',
  System = '3',
  Provider = '4',
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
    Object.setPrototypeOf(this, BaseError.prototype);
  }

  toString(stack = false): string {
    return `${this.errorCode} - ${stack ? this.stack : this.message}`;
  }
}
