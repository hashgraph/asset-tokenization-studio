// SPDX-License-Identifier: Apache-2.0

import "reflect-metadata";
import { QueryBus } from "@core/query/QueryBus";
import { Query } from "@core/query/Query";
import { QueryResponse } from "@core/query/QueryResponse";
import { IQueryHandler } from "@core/query/QueryHandler";
import { QUERY_METADATA, QUERY_HANDLER_METADATA } from "@core/Constants";

describe("QueryBus", () => {
  interface DummyResponse extends QueryResponse {}

  class DummyQuery extends Query<DummyResponse> {}

  class DummyHandler implements IQueryHandler<Query<DummyResponse>> {
    execute = jest.fn();
  }

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should execute a registered query handler", async () => {
    // define command metadata
    Reflect.defineMetadata(QUERY_METADATA, { id: "DUMMY_QUERY" }, DummyQuery);
    Reflect.defineMetadata(QUERY_HANDLER_METADATA, DummyQuery, DummyHandler);

    const handler = new DummyHandler();
    handler.execute.mockResolvedValue({} as DummyResponse);

    const bus = new QueryBus<DummyResponse>([handler]);
    const result = await bus.execute(new DummyQuery());

    expect(handler.execute).toHaveBeenCalledTimes(1);
    expect(result).toEqual({});
  });

  it("should bind a handler manually", async () => {
    const bus = new QueryBus<DummyResponse>([]);

    const handler = new DummyHandler();
    Reflect.defineMetadata(QUERY_METADATA, { id: "MANUAL_QUERY" }, DummyQuery);
    Reflect.defineMetadata(QUERY_HANDLER_METADATA, DummyQuery, DummyHandler);

    bus.bind(handler, "MANUAL_QUERY");

    const result = await bus.execute(new DummyQuery());
    expect(result).toBeUndefined();
    expect(handler.execute).toHaveBeenCalledTimes(1);
  });
});
