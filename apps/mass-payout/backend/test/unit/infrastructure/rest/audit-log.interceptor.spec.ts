// SPDX-License-Identifier: Apache-2.0

import { AuditLogInterceptor } from "@infrastructure/rest/audit-log.interceptor";
import { CallHandler, ExecutionContext, Logger, NotFoundException } from "@nestjs/common";
import { lastValueFrom, of, throwError } from "rxjs";

describe(AuditLogInterceptor.name, () => {
  const interceptor = new AuditLogInterceptor();
  let logSpy: jest.SpyInstance;
  const originalActorHeader = process.env.AUDIT_ACTOR_HEADER;

  class AssetController {
    pauseAsset() {}
  }

  const contextFor = (request: Record<string, unknown>): ExecutionContext =>
    ({
      getType: () => "http",
      getClass: () => AssetController,
      getHandler: () => AssetController.prototype.pauseAsset,
      switchToHttp: () => ({ getRequest: () => request, getResponse: () => ({ statusCode: 200 }) }),
    }) as unknown as ExecutionContext;

  const handler = (result = of(undefined)): CallHandler => ({ handle: () => result });

  const loggedEntry = () => JSON.parse(logSpy.mock.calls[0][0]);

  beforeEach(() => {
    logSpy = jest.spyOn(Logger.prototype, "log").mockImplementation(() => undefined);
    delete process.env.AUDIT_ACTOR_HEADER;
  });

  afterEach(() => {
    jest.restoreAllMocks();
    if (originalActorHeader === undefined) delete process.env.AUDIT_ACTOR_HEADER;
    else process.env.AUDIT_ACTOR_HEADER = originalActorHeader;
  });

  it("writes one structured line for a successful state-changing call, without body values", async () => {
    const request = {
      method: "POST",
      route: { path: "/assets/:assetId/distributions/payout" },
      params: { assetId: "asset-1" },
      body: { amount: "50", concept: "private note", subtype: "IMMEDIATE" },
      headers: {},
      ip: "10.0.0.5",
    };

    await lastValueFrom(interceptor.intercept(contextFor(request), handler()));

    expect(logSpy).toHaveBeenCalledTimes(1);
    const entry = loggedEntry();
    expect(entry).toMatchObject({
      event: "audit",
      action: "AssetController.pauseAsset",
      method: "POST",
      route: "/assets/:assetId/distributions/payout",
      params: { assetId: "asset-1" },
      bodyFields: ["amount", "concept", "subtype"],
      actor: "unknown",
      sourceIp: "10.0.0.5",
      outcome: "success",
    });
    expect(logSpy.mock.calls[0][0]).not.toContain("private note");
  });

  it("records the actor from the gateway header named by AUDIT_ACTOR_HEADER", async () => {
    process.env.AUDIT_ACTOR_HEADER = "X-Authenticated-User";
    const request = { method: "PATCH", path: "/assets/a/pause", headers: { "x-authenticated-user": "alice" } };

    await lastValueFrom(interceptor.intercept(contextFor(request), handler()));

    expect(loggedEntry().actor).toBe("alice");
  });

  it("records failures with the error name and HTTP status", async () => {
    const request = { method: "PATCH", path: "/assets/a/pause", headers: {} };

    await expect(
      lastValueFrom(interceptor.intercept(contextFor(request), handler(throwError(() => new NotFoundException())))),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(loggedEntry()).toMatchObject({ outcome: "failure", status: 404, error: "NotFoundException" });
  });

  it("does not log read-only calls", async () => {
    await lastValueFrom(interceptor.intercept(contextFor({ method: "GET", path: "/assets" }), handler()));

    expect(logSpy).not.toHaveBeenCalled();
  });
});
