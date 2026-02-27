// SPDX-License-Identifier: Apache-2.0

import { Interface } from "ethers";
import { TransactionResponseAdapter } from "@port/out/TransactionResponseAdapter";
import { TransactionResponseError } from "@port/out/error/TransactionResponseError";

describe("TransactionResponseAdapter", () => {
  describe("manageResponse", () => {
    it("should throw 'Method not implemented.'", () => {
      const adapter = new TransactionResponseAdapter();
      expect(() => adapter.manageResponse()).toThrowError("Method not implemented.");
    });
  });

  describe("decodeFunctionResult", () => {
    const abi = ["function testFunction(uint256 a, uint256 b) view returns (uint256, uint256)"];

    it("should correctly decode a valid function result", () => {
      const iface = new Interface(abi);
      const encoded = iface.encodeFunctionResult("testFunction", [1, 2]);
      const bytes = Uint8Array.from(Buffer.from(encoded.slice(2), "hex"));

      const result = TransactionResponseAdapter.decodeFunctionResult("testFunction", bytes, abi, "mainnet");

      // In ethers v6, decoded results are bigint, serialized as strings via JSON
      expect(result[0]).toEqual("1");
      expect(result[1]).toEqual("2");
    });

    it("should throw TransactionResponseError on invalid input", () => {
      const invalidBytes = new Uint8Array([0, 1, 2]);

      expect(() =>
        TransactionResponseAdapter.decodeFunctionResult("testFunction", invalidBytes, abi, "testnet"),
      ).toThrow(TransactionResponseError);
    });
  });
});
