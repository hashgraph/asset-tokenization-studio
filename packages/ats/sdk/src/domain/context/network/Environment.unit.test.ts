// SPDX-License-Identifier: Apache-2.0

import { hashsphereChainIdEnvVars, reservedChainIds, resolveHashsphereChainId } from "./Environment";

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
      expect(resolveHashsphereChainId({ HASHSPHERE_CHAIN_ID: "4618", REACT_APP_HASHSPHERE_CHAIN_ID: "1234" })).toBe(
        4618,
      );
    });

    it("falls back to the next variable when the first is blank", () => {
      expect(resolveHashsphereChainId({ HASHSPHERE_CHAIN_ID: "  ", REACT_APP_HASHSPHERE_CHAIN_ID: "4618" })).toBe(4618);
    });

    it.each([[""], ["   "], ["not-a-number"], ["0"], ["-1"], ["4618.5"]])("ignores the invalid value %p", (value) => {
      expect(resolveHashsphereChainId({ HASHSPHERE_CHAIN_ID: value })).toBeUndefined();
    });

    it.each(reservedChainIds)("ignores %i, which is reserved by a public network", (chainId) => {
      expect(resolveHashsphereChainId({ HASHSPHERE_CHAIN_ID: String(chainId) })).toBeUndefined();
    });

    it("falls back to the next variable when the first is a reserved chain id", () => {
      expect(resolveHashsphereChainId({ HASHSPHERE_CHAIN_ID: "296", REACT_APP_HASHSPHERE_CHAIN_ID: "4618" })).toBe(
        4618,
      );
    });

    it("exposes the variables it reads, in precedence order", () => {
      expect(hashsphereChainIdEnvVars).toEqual(["HASHSPHERE_CHAIN_ID", "REACT_APP_HASHSPHERE_CHAIN_ID"]);
    });
  });

  describe("HederaNetworks", () => {
    const saved: Record<string, string | undefined> = {};

    beforeEach(() => {
      for (const key of hashsphereChainIdEnvVars) {
        saved[key] = process.env[key];
        delete process.env[key];
      }
      jest.resetModules();
    });

    afterEach(() => {
      for (const key of hashsphereChainIdEnvVars) {
        if (saved[key] === undefined) delete process.env[key];
        else process.env[key] = saved[key];
      }
      jest.resetModules();
    });

    const load = () => import("./Environment");

    it("registers only the public Hedera networks when HashSphere is not configured", async () => {
      const { HederaNetworks, testnet, previewnet, mainnet, local } = await load();

      expect(HederaNetworks).toEqual([
        { network: testnet, chainId: 296 },
        { network: previewnet, chainId: 297 },
        { network: mainnet, chainId: 295 },
        { network: local, chainId: 298 },
      ]);
    });

    it("appends HashSphere when its chain id is configured", async () => {
      process.env.HASHSPHERE_CHAIN_ID = "4618";

      const { HederaNetworks, hashsphere } = await load();

      expect(HederaNetworks).toHaveLength(reservedChainIds.length + 1);
      expect(HederaNetworks).toContainEqual({ network: hashsphere, chainId: 4618 });
    });

    it("leaves a public network as the sole owner of its chain id", async () => {
      process.env.HASHSPHERE_CHAIN_ID = "296";

      const { HederaNetworks, hashsphere, testnet } = await load();

      expect(HederaNetworks.filter(({ chainId }) => chainId === 296)).toEqual([{ network: testnet, chainId: 296 }]);
      expect(HederaNetworks.map(({ network }) => network)).not.toContain(hashsphere);
    });
  });
});
