// SPDX-License-Identifier: Apache-2.0

import "../environmentMock";
import { Bond, AddKpiDataRequest } from "@port/in";
import EvmAddress from "@domain/context/contract/EvmAddress";

describe("Bond - addKpiData", () => {
  it("should add KPI data successfully", async () => {
    const request = new AddKpiDataRequest({
      securityId: "0x0000000000000000000000000000000000001234",
      date: Math.floor(Date.now() / 1000),
      value: "1000",
      project: new EvmAddress("0x0000000000000000000000000000000000000001"),
    });

    const result = await Bond.addKpiData(request);

    expect(result).toHaveProperty("transactionId");
    expect(typeof result.transactionId).toBe("string");
  });
});
