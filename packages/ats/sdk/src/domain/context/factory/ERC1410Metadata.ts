// SPDX-License-Identifier: Apache-2.0

export class BasicTransferInfo {
  public to: string;
  public value: string;
}

export class OperatorTransferData {
  public partition: string;
  public from: string;
  public to: string;
  public value: string;
  public data: string;
  public operatorData: string;
}

export class IssueData {
  public partition: string;
  public tokenHolder: string;
  public value: string;
  public data: string;
}
