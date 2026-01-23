// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Query } from "@core/query/Query";
import { IQueryHandler } from "@core/query/QueryHandler";
import { QueryResponse } from "@core/query/QueryResponse";
import { QueryHandler } from "@core/decorator/QueryHandlerDecorator";

export class ConcreteQueryResponse implements QueryResponse {
  constructor(public readonly payload: number) {}
}

export class ConcreteQuery extends Query<ConcreteQueryResponse> {
  constructor(
    public readonly itemId: string,
    public readonly payload: number,
  ) {
    super();
  }
}

export class ConcreteQueryRepository {
  public map = new Map<ConcreteQuery, any>();
}

@QueryHandler(ConcreteQuery)
export class ConcreteQueryHandler implements IQueryHandler<ConcreteQuery> {
  constructor(private readonly repo: ConcreteQueryRepository = new ConcreteQueryRepository()) {}

  execute(query: ConcreteQuery): Promise<ConcreteQueryResponse> {
    this.repo.map.set(query, "Hello world");
    return Promise.resolve(new ConcreteQueryResponse(query.payload));
  }
}
