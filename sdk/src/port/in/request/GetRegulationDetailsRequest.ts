import { Factory } from '../../../domain/context/factory/Factories.js';
import ValidatedRequest from './validation/ValidatedRequest.js';

export default class GetRegulationDetailsRequest extends ValidatedRequest<GetRegulationDetailsRequest> {
  regulationType: number;
  regulationSubType: number;

  constructor({
    regulationType,
    regulationSubType,
  }: {
    regulationType: number;
    regulationSubType: number;
  }) {
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
