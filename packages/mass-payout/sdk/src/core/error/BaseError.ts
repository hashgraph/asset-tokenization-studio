// SPDX-License-Identifier: Apache-2.0

export enum ErrorCode {
  // Error codes for Input Data (Prefix: 1XXXX)
  AccountIdInValid = "10001",
  ContractKeyInvalid = "10006",
  EmptyValue = "10017",
  InvalidBase64 = "10011",
  InvalidBytes = "10007",
  InvalidBytes3 = "10003",
  InvalidBytes32 = "10002",
  InvalidContractId = "10014",
  InvalidEvmAddress = "10023",
  InvalidIdFormatHedera = "10009",
  InvalidIdFormatHederaIdOrEvmAddress = "10010",
  InvalidLength = "10016",
  InvalidRange = "10018",
  InvalidType = "10015",
  InvalidValue = "10021",
  InvalidArray = "10019",
  ValidationChecks = "10022",

  // Error codes for Logic Errors (Prefix: 2XXXX)
  OperationNotAllowed = "20004",

  // Error codes for System Errors (Prefix: 3XXXX)
  InvalidResponse = "30005",
  RuntimeError = "30004",
  TransactionNotFound = "30007",
  TransactionResultNotFound = "30008",
  ErrorRetrievingEvmAddress = "30010",
  UnsupportedNetwork = "30012",
  EmptyResponse = "30022",
  WalletNotSupported = "30023",
  UncaughtCommandError = "30024",
  UncaughtQueryError = "30025",
  NetworkNotSet = "30026",
  ExecuteConnectionError = "30027",

  // Error codes for Provider Errors (Prefix: 4XXXX)
  SigningError = "40004",
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
