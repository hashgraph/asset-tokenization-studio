// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import FormatValidation from "../../FormatValidation";
import { InvalidValue } from "../../error/InvalidValue";

export default class UpdateExternalKycListsRequest extends ValidatedRequest<UpdateExternalKycListsRequest> {
  securityId: string;
  externalKycListsAddresses: string[];
  actives: boolean[];

  constructor({
    securityId,
    externalKycListsAddresses,
    actives,
  }: {
    securityId: string;
    externalKycListsAddresses: string[];
    actives: boolean[];
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      externalKycListsAddresses: (vals) =>
        FormatValidation.checkHederaIdOrEvmAddressArray(vals, "externalKycListsAddresses"),
      actives: (vals) =>
        vals.length !== externalKycListsAddresses.length
          ? [new InvalidValue(`The list of externalKycListsAddresses and actives must have equal length.`)]
          : [],
    });

    this.securityId = securityId;
    this.externalKycListsAddresses = externalKycListsAddresses;
    this.actives = actives;
  }
}
