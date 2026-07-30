// SPDX-License-Identifier: Apache-2.0

import {
  HederaNetworks,
  hashsphere,
  hashsphereChainIdEnvVars,
  local,
  mainnet,
  previewnet,
  resolveHashsphereChainId,
  testnet,
} from "./Environment";

describe("Environment", () => {
  describe("resolveHashsphereChainId", () => {
    it("returns undefined when no variable is set", () => {
      expect(resolveHashsphereChainId({})).toBeUndefined();
    });

    it.each([["HASHSPHERE_CHAIN_ID"], ["REACT_APP_HASHSPHERE_CHAIN_ID"]])("reads %s", (key) => {
      expect(resolveHashsphereChainId({ [key]: "4618" })).toBe(4618);
    });

    it("supports differing chain ids across HashSphere instances", () => {
      expect(resolveHashsphereChainId({ HASHSPHERE_CHAIN_ID: "1234" })).toBe(1234);
    });

    it("prefers HASHSPHERE_CHAIN_ID over the web-app prefixed variable", () => {
      expect(resolveHashsphereChainId({ HASHSPHERE_CHAIN_ID: "4618", REACT_APP_HASHSPHERE_CHAIN_ID: "296" })).toBe(
        4618,
      );
    });

    it("falls back to the next variable when the first is blank", () => {
      expect(resolveHashsphereChainId({ HASHSPHERE_CHAIN_ID: "  ", REACT_APP_HASHSPHERE_CHAIN_ID: "4618" })).toBe(4618);
    });

    it.each([[""], ["   "], ["not-a-number"], ["0"], ["-1"], ["4618.5"]])("ignores the invalid value %p", (value) => {
      expect(resolveHashsphereChainId({ HASHSPHERE_CHAIN_ID: value })).toBeUndefined();
    });

    it("exposes the variables it reads, in precedence order", () => {
      expect(hashsphereChainIdEnvVars).toEqual(["HASHSPHERE_CHAIN_ID", "REACT_APP_HASHSPHERE_CHAIN_ID"]);
    });
  });

  describe("HederaNetworks", () => {
    it("always registers the public Hedera networks", () => {
      expect(HederaNetworks).toEqual(
        expect.arrayContaining([
          { network: testnet, chainId: 296 },
          { network: previewnet, chainId: 297 },
          { network: mainnet, chainId: 295 },
          { network: local, chainId: 298 },
        ]),
      );
    });

    it("registers HashSphere only when its chain id is configured", () => {
      const entry = HederaNetworks.find((n) => n.network === hashsphere);
      const configured = resolveHashsphereChainId(typeof process !== "undefined" && process.env ? process.env : {});
      if (configured === undefined) {
        expect(entry).toBeUndefined();
      } else {
        expect(entry).toEqual({ network: hashsphere, chainId: configured });
      }
    });
  });
});
