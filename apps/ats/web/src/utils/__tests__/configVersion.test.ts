// SPDX-License-Identifier: Apache-2.0

const resolveLatestConfigVersionMock = jest.fn();

jest.mock("../../services/SDKService", () => ({
  SDKService: {
    testnetResolverAddress: "0.0.12345",
    resolveLatestConfigVersion: resolveLatestConfigVersionMock,
  },
}));

import { resolveConfigVersion } from "../configVersion";

const CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000001";

describe("resolveConfigVersion", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("returns the explicit env version when it parses to an integer >= 1", async () => {
    const result = await resolveConfigVersion("3", CONFIG_ID);

    expect(result).toBe(3);
    expect(resolveLatestConfigVersionMock).not.toHaveBeenCalled();
  });

  it.each(["2x", "1.9", "abc"])(
    "resolves the latest version when the env value is malformed (%s) instead of silently pinning",
    async (malformed) => {
      resolveLatestConfigVersionMock.mockResolvedValueOnce(9);

      const result = await resolveConfigVersion(malformed, CONFIG_ID);

      expect(result).toBe(9);
      expect(resolveLatestConfigVersionMock).toHaveBeenCalledTimes(1);
    },
  );

  it("resolves the latest version when the env value is the legacy '0' sentinel", async () => {
    resolveLatestConfigVersionMock.mockResolvedValueOnce(5);

    const result = await resolveConfigVersion("0", CONFIG_ID);

    expect(result).toBe(5);
    expect(resolveLatestConfigVersionMock).toHaveBeenCalledTimes(1);
    expect(resolveLatestConfigVersionMock).toHaveBeenCalledWith(
      expect.objectContaining({ resolverAddress: "0.0.12345", configurationId: CONFIG_ID }),
    );
  });

  it("resolves the latest version when the env value is an empty string", async () => {
    resolveLatestConfigVersionMock.mockResolvedValueOnce(2);

    const result = await resolveConfigVersion("", CONFIG_ID);

    expect(result).toBe(2);
    expect(resolveLatestConfigVersionMock).toHaveBeenCalledTimes(1);
  });

  it("resolves the latest version when the env value is undefined", async () => {
    resolveLatestConfigVersionMock.mockResolvedValueOnce(4);

    const result = await resolveConfigVersion(undefined, CONFIG_ID);

    expect(result).toBe(4);
    expect(resolveLatestConfigVersionMock).toHaveBeenCalledTimes(1);
  });

  it("propagates errors from the SDK resolve call", async () => {
    resolveLatestConfigVersionMock.mockRejectedValueOnce(new Error("rpc down"));

    await expect(resolveConfigVersion(undefined, CONFIG_ID)).rejects.toThrow("rpc down");
  });
});
