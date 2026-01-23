// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
import { injectable } from "tsyringe";
import { QUERY_HANDLER_METADATA, QUERY_METADATA } from "@core/Constants";
import { QueryMetadata } from "@core/decorator/QueryMetadata";
import Injectable from "@core/injectable/Injectable";
import { Type } from "@core/Type";
import { Query } from "./Query";
import { IQueryHandler } from "./QueryHandler";
import { QueryResponse } from "./QueryResponse";
import { QueryHandlerNotFoundException } from "./error/QueryHandlerNotFoundException";
import { InvalidQueryHandlerException } from "./error/InvalidQueryHandlerException";

export type QueryHandlerType = IQueryHandler<Query<QueryResponse>>;

export interface IQueryBus<T extends QueryResponse> {
  execute<X extends T>(query: Query<X>): Promise<X>;
  bind<X extends T>(handler: IQueryHandler<Query<X>>, id: string): void;
}

@injectable()
export class QueryBus<T extends QueryResponse = QueryResponse> implements IQueryBus<T> {
  public handlers = new Map<string, IQueryHandler<Query<T>>>();

  constructor() {
    const handlers = Injectable.getQueryHandlers();
    this.registerHandlers(handlers);
  }

  execute<X extends T>(query: Query<X>): Promise<X> {
    const queryId = this.getQueryId(query);
    const handler = this.handlers.get(queryId);
    if (!handler) {
      throw new QueryHandlerNotFoundException(queryId);
    }
    return handler.execute(query) as Promise<X>;
  }

  bind<X extends T>(handler: IQueryHandler<Query<X>>, id: string): void {
    this.handlers.set(id, handler);
  }

  private getQueryId<X>(query: Query<X>): string {
    const { constructor: queryType } = Object.getPrototypeOf(query);
    const queryMetadata: QueryMetadata = Reflect.getMetadata(QUERY_METADATA, queryType);
    if (!queryMetadata) {
      throw new QueryHandlerNotFoundException(queryType.name);
    }
    return queryMetadata.id;
  }

  protected registerHandlers(handlers: QueryHandlerType[]): void {
    handlers.forEach((handler) => {
      const target = this.reflectQueryId(handler);
      if (!target) {
        throw new InvalidQueryHandlerException();
      }
      this.bind(handler as IQueryHandler<Query<T>>, target);
    });
  }

  private reflectQueryId(handler: QueryHandlerType): string | undefined {
    const { constructor: handlerType } = Object.getPrototypeOf(handler);
    const query: Type<Query<QueryResponse>> = Reflect.getMetadata(QUERY_HANDLER_METADATA, handlerType);
    const queryMetadata: QueryMetadata = Reflect.getMetadata(QUERY_METADATA, query);
    return queryMetadata.id;
  }
}
