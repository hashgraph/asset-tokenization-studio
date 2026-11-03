// SPDX-License-Identifier: Apache-2.0

import safeStringify from "fast-safe-stringify";
import { REDACTED, redactForLog, redactReplacer, redactUrl } from "./LogRedaction";

describe("LogRedaction", () => {
  describe("redactUrl", () => {
    it("should keep only the origin of a URL", () => {
      expect(redactUrl("https://user:pass@rpc.example.com:8443/v1/SECRET_KEY?token=abc#x")).toBe(
        "https://rpc.example.com:8443",
      );
    });

    it("should return an empty string for an empty URL", () => {
      expect(redactUrl(undefined)).toBe("");
      expect(redactUrl("")).toBe("");
    });

    it("should redact values that are not valid URLs", () => {
      expect(redactUrl("not a url SECRET")).toBe(REDACTED);
    });
  });

  describe("redactForLog", () => {
    it("should mask custodial credentials, private keys and API keys", () => {
      const value = {
        wallet: "DFNS",
        account: { accountId: "0.0.1", privateKey: { key: "PK_SECRET", type: "ED25519" } },
        mirrorNode: { name: "mirror", baseUrl: "https://mirror.example/api/v1/", apiKey: "MIRROR_SECRET" },
        custodialWalletSettings: {
          authorizationToken: "DFNS_TOKEN",
          serviceAccountPrivateKey: "DFNS_PK",
          serviceAccountSecretKey: "DFNS_SK",
          serviceAccountAuthToken: "DFNS_AUTH",
          apiSecretKey: "FIREBLOCKS_SECRET",
          awsAccessKeyId: "AWS_ACCESS",
          awsSecretAccessKey: "AWS_SECRET",
          hederaAccountId: "0.0.2",
          credentialId: "cred-1",
          publicKey: "PUBLIC",
        },
        signatureMap: "SIG",
      };

      const result = redactForLog(value);
      const redacted = JSON.stringify(result);

      ["PK_SECRET", "MIRROR_SECRET", "DFNS_TOKEN", "DFNS_PK", "DFNS_SK", "DFNS_AUTH", "FIREBLOCKS_SECRET"].forEach(
        (secret) => expect(redacted).not.toContain(secret),
      );
      ["AWS_ACCESS", "AWS_SECRET", "SIG"].forEach((secret) => expect(redacted).not.toContain(`:"${secret}"`));
      expect(result).toMatchObject({
        wallet: "DFNS",
        account: { accountId: "0.0.1", privateKey: REDACTED },
        mirrorNode: { name: "mirror", baseUrl: "https://mirror.example", apiKey: REDACTED },
        custodialWalletSettings: { hederaAccountId: "0.0.2", credentialId: "cred-1", publicKey: "PUBLIC" },
        signatureMap: REDACTED,
      });
    });

    it("should not modify the original object", () => {
      const value = { apiKey: "KEY" };
      redactForLog(value);
      expect(value.apiKey).toBe("KEY");
    });

    it("should return primitives and empty values unchanged", () => {
      expect(redactForLog(undefined)).toBeUndefined();
      expect(redactForLog(null)).toBeNull();
      expect(redactForLog("text")).toBe("text");
      expect(redactForLog(5)).toBe(5);
    });

    it("should handle circular references and bigint values", () => {
      const value: Record<string, unknown> = { amount: BigInt(10), apiKey: "KEY" };
      value.self = value;
      expect(redactForLog(value)).toEqual({ amount: "10", apiKey: REDACTED, self: "[Circular]" });
    });
  });

  describe("redactReplacer", () => {
    it("should mask sensitive keys when used as a stringify replacer", () => {
      const out = safeStringify({ apiKey: "KEY", nested: { privateKey: "PK" }, id: "0.0.1" }, redactReplacer);
      expect(out).toBe(`{"apiKey":"${REDACTED}","nested":{"privateKey":"${REDACTED}"},"id":"0.0.1"}`);
    });

    it("should leave unset sensitive fields as they are", () => {
      expect(redactReplacer("apiKey", undefined)).toBeUndefined();
      expect(redactReplacer("apiKey", null)).toBeNull();
    });
  });
});
