// SPDX-License-Identifier: Apache-2.0

import ValidatedDomain from "@core/validation/ValidatedArgs";
import { SecurityDate } from "../shared/SecurityDate";

export class KycAccountData extends ValidatedDomain<KycAccountData> {
  public account: string;
  public validFrom: string;
  public validTo: string;
  public vcId: string;
  public issuer: string;
  public status: number;

  constructor(account: string, validFrom: string, validTo: string, vcId: string, issuer: string, status: number) {
    super({
      validTo: (val) => {
        return SecurityDate.checkDateTimestamp(parseInt(val), parseInt(this.validFrom));
      },
    });

    this.account = account;
    this.validFrom = validFrom;
    this.validTo = validTo;
    this.vcId = vcId;
    this.issuer = issuer;
    this.status = status;

    ValidatedDomain.handleValidation(KycAccountData.name, this);
  }
}
