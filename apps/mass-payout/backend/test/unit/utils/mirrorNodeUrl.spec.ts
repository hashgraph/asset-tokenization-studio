// SPDX-License-Identifier: Apache-2.0

import {
  DEFAULT_ALLOWED_MIRROR_NODE_HOSTS,
  getAllowedMirrorNodeHosts,
  getMirrorNodeUrlViolation,
  mirrorNodeHostForLogs,
} from "@utils/mirrorNodeUrl";

describe("mirrorNodeUrl", () => {
  describe("getAllowedMirrorNodeHosts", () => {
    it("defaults to the public Hedera mirror nodes plus the configured default host", () => {
      const hosts = getAllowedMirrorNodeHosts(undefined, "http://localhost:5551");

      expect(hosts).toEqual(expect.arrayContaining([...DEFAULT_ALLOWED_MIRROR_NODE_HOSTS, "localhost"]));
    });

    it("uses the explicit allow-list instead of the public defaults, normalising entries", () => {
      const hosts = getAllowedMirrorNodeHosts(" Mirror.Internal. , ,other.example ", undefined);

      expect(hosts).toEqual(["mirror.internal", "other.example"]);
    });

    it("treats an empty allow-list as unset", () => {
      expect(getAllowedMirrorNodeHosts("", undefined)).toEqual([...DEFAULT_ALLOWED_MIRROR_NODE_HOSTS]);
    });
  });

  describe("getMirrorNodeUrlViolation", () => {
    const allowed = ["testnet.mirrornode.hedera.com", "localhost"];

    it.each([
      "https://testnet.mirrornode.hedera.com",
      "https://TESTNET.mirrornode.hedera.com./",
      "http://localhost:5551",
    ])("accepts %s", (url) => {
      expect(getMirrorNodeUrlViolation(url, allowed)).toBeUndefined();
    });

    it.each([
      ["not a url", "not a valid URL"],
      ["file:///etc/passwd", "http or https"],
      ["gopher://testnet.mirrornode.hedera.com", "http or https"],
      ["https://user:pass@testnet.mirrornode.hedera.com", "credentials"],
      ["https://testnet.mirrornode.hedera.com/?x=1", "query string"],
      ["https://testnet.mirrornode.hedera.com#frag", "query string or fragment"],
      ["http://169.254.169.254/latest/meta-data", "not in the allowed"],
      ["http://[::1]:8080", "not in the allowed"],
      ["https://testnet.mirrornode.hedera.com@evil.example", "credentials"],
      ["https://evil.example/testnet.mirrornode.hedera.com", "not in the allowed"],
      ["https://testnet.mirrornode.hedera.com.evil.example", "not in the allowed"],
    ])("rejects %s", (url, reason) => {
      const violation = getMirrorNodeUrlViolation(url, allowed);
      expect(violation).toContain(reason);
      expect(violation).not.toContain(url);
    });
  });

  describe("mirrorNodeHostForLogs", () => {
    it("returns only the host", () => {
      expect(mirrorNodeHostForLogs("https://mirror.internal:8443/secret/path?token=abc")).toBe("mirror.internal:8443");
    });

    it("never returns an unparseable value", () => {
      expect(mirrorNodeHostForLogs("garbage")).toBe("<invalid url>");
    });
  });
});
