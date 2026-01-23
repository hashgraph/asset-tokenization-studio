// SPDX-License-Identifier: Apache-2.0

import ValidatedRequest from "@core/validation/ValidatedArgs";
import { InvalidValue } from "../../error/InvalidValue";
import FormatValidation from "../../FormatValidation";

export default class UpdateExternalControlListsRequest extends ValidatedRequest<UpdateExternalControlListsRequest> {
  securityId: string;
  externalControlListsAddresses: string[];
  actives: boolean[];

  constructor({
    securityId,
    externalControlListsAddresses,
    actives,
  }: {
    securityId: string;
    externalControlListsAddresses: string[];
    actives: boolean[];
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      externalControlListsAddresses: (vals) =>
        FormatValidation.checkHederaIdOrEvmAddressArray(vals, "externalControlListsAddresses"),
      actives: (vals) =>
        vals.length !== externalControlListsAddresses.length
          ? [new InvalidValue(`The list of externalControlListsAddresses and actives must have equal length.`)]
          : [],
    });

    this.securityId = securityId;
    this.externalControlListsAddresses = externalControlListsAddresses;
    this.actives = actives;
  }
}
