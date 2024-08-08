import { Query } from '../../../../../core/query/Query.js';
import { QueryResponse } from '../../../../../core/query/QueryResponse.js';
import { Regulation } from '../../../../../domain/context/factory/Regulation.js';
import ContractId from '../../../../../domain/context/contract/ContractId.js';

export class GetRegulationDetailsQueryResponse implements QueryResponse {
  constructor(public readonly regulation: Regulation) {}
}

export class GetRegulationDetailsQuery extends Query<GetRegulationDetailsQueryResponse> {
  constructor(
    public readonly type: number,
    public readonly subType: number,
    public readonly factory?: ContractId,
  ) {
    super();
  }
}
