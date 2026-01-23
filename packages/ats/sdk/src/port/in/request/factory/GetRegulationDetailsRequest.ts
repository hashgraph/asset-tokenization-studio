// SPDX-License-Identifier: Apache-2.0

import { Factory } from "@domain/context/factory/Factories";
import ValidatedRequest from "@core/validation/ValidatedArgs";

export default class GetRegulationDetailsRequest extends ValidatedRequest<GetRegulationDetailsRequest> {
  regulationType: number;
  regulationSubType: number;

  constructor({ regulationType, regulationSubType }: { regulationType: number; regulationSubType: number }) {
    super({
      regulationType: (val) => {
        return Factory.checkRegulationType(val);
      },
      regulationSubType: (val) => {
        return Factory.checkRegulationSubType(val, this.regulationType);
      },
    });
    this.regulationType = regulationType;
    this.regulationSubType = regulationSubType;
  }
}
