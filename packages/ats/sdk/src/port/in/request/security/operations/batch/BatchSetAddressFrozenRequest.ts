// SPDX-License-Identifier: Apache-2.0

import { InvalidValue } from "../../../error/InvalidValue";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "../../../FormatValidation";

export default class BatchSetAddressFrozenRequest extends ValidatedRequest<BatchSetAddressFrozenRequest> {
  securityId: string;
  freezeList: boolean[];
  targetList: string[];

  constructor({
    securityId,
    freezeList,
    targetList,
  }: {
    securityId: string;
    freezeList: boolean[];
    targetList: string[];
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      freezeList: (vals) =>
        vals.length !== targetList.length
          ? [new InvalidValue(`The list of targetList and freezeList must have equal length.`)]
          : [],
      targetList: (vals) => FormatValidation.checkHederaIdOrEvmAddressArray(vals, "targetList"),
    });
    this.securityId = securityId;
    this.freezeList = freezeList;
    this.targetList = targetList;
  }
}
