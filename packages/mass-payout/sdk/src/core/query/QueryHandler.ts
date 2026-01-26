// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-explicit-any */
import { Query } from "./Query";

export type IQueryHandler<QueryType extends Query<unknown>> =
  QueryType extends Query<infer ResultType>
    ? {
        execute(query: QueryType): Promise<ResultType>;
      }
    : never;
