// SPDX-License-Identifier: Apache-2.0

export class EquityDetailsData {
  public votingRight: boolean;
  public informationRight: boolean;
  public liquidationRight: boolean;
  public subscriptionRight: boolean;
  public conversionRight: boolean;
  public redemptionRight: boolean;
  public putRight: boolean;
  public dividendRight: number;
  public currency: string;
  public nominalValue: string;
  public nominalValueDecimals: number;
}
