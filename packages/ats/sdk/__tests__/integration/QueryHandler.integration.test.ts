// SPDX-License-Identifier: Apache-2.0

/* eslint-disable jest/no-mocks-import */
import { QueryBus } from "@core/query/QueryBus";
import { ConcreteQuery, ConcreteQueryResponse } from "./__mocks__/ConcreteQueryHandler";

const queryBus = new QueryBus();

describe("QueryHandler Test", () => {
  it("Executes a simple query successfully", async () => {
    const execSpy = jest.spyOn(queryBus, "execute");
    const query = new ConcreteQuery("1", 4);
    const res = await queryBus.execute(query);
    expect(res).toBeInstanceOf(ConcreteQueryResponse);
    expect(res.payload).toBe(query.payload);
    expect(execSpy).toHaveBeenCalled();
  });
});
