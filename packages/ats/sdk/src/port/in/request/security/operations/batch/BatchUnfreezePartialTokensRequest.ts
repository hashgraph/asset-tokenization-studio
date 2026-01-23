// SPDX-License-Identifier: Apache-2.0

import { InvalidValue } from "../../../error/InvalidValue";
import ValidatedRequest from "@core/validation/ValidatedArgs";

import FormatValidation from "../../../FormatValidation";

export default class BatchUnfreezePartialTokensRequest extends ValidatedRequest<BatchUnfreezePartialTokensRequest> {
  securityId: string;
  amountList: string[];
  targetList: string[];

  constructor({
    securityId,
    amountList,
    targetList,
  }: {
    securityId: string;
    amountList: string[];
    targetList: string[];
  }) {
    super({
      securityId: FormatValidation.checkHederaIdFormatOrEvmAddress(),
      amountList: (vals) =>
        vals.length !== targetList.length
          ? [new InvalidValue(`The list of targetList and amountList must have equal length.`)]
          : [],
      targetList: (vals) => FormatValidation.checkHederaIdOrEvmAddressArray(vals, "targetList"),
    });
    this.securityId = securityId;
    this.amountList = amountList;
    this.targetList = targetList;
  }
}
