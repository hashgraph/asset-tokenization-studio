// SPDX-License-Identifier: Apache-2.0

import { CallHandler, ExecutionContext, HttpException, Injectable, Logger, NestInterceptor } from "@nestjs/common";
import { Observable, tap } from "rxjs";

const STATE_CHANGING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

/**
 * Writes one structured audit line for every state-changing REST call (import, pause/unpause, payouts,
 * sync toggles, distribution cancel/retry, listener config and polling start/stop).
 *
 * The backend has no built-in authentication, so the actor is whatever identity the API gateway in front
 * of it forwards in the header named by AUDIT_ACTOR_HEADER (for example `x-authenticated-user`); without
 * it the actor is logged as "unknown". Only path parameters and the names of the body fields are logged,
 * never body values, so amounts, free-text concepts and URLs stay out of the logs.
 */
@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger("Audit");

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    if (context.getType() !== "http") return next.handle();

    const request = context.switchToHttp().getRequest();
    if (!STATE_CHANGING_METHODS.has(request.method)) return next.handle();

    const startedAt = Date.now();
    const base = {
      event: "audit",
      action: `${context.getClass().name}.${context.getHandler().name}`,
      method: request.method,
      route: request.route?.path ?? request.path,
      params: request.params ?? {},
      bodyFields: request.body && typeof request.body === "object" ? Object.keys(request.body).sort() : [],
      actor: this.getActor(request),
      sourceIp: request.ip,
    };

    return next.handle().pipe(
      tap({
        next: () => {
          this.write({ ...base, outcome: "success", durationMs: Date.now() - startedAt });
        },
        error: (error: unknown) => {
          // Domain errors get their HTTP status later in RestExceptionFilter, so only HttpExceptions carry one here.
          const status = error instanceof HttpException ? error.getStatus() : undefined;
          const errorName = error instanceof Error ? error.name : "UnknownError";
          this.write({ ...base, outcome: "failure", status, error: errorName, durationMs: Date.now() - startedAt });
        },
      }),
    );
  }

  private getActor(request: { headers?: Record<string, string | string[] | undefined> }): string {
    const header = process.env.AUDIT_ACTOR_HEADER?.trim().toLowerCase();
    if (!header) return "unknown";
    const value = request.headers?.[header];
    const actor = Array.isArray(value) ? value[0] : value;
    // Bound the length so a forged header cannot flood the log line.
    return actor ? String(actor).slice(0, 256) : "unknown";
  }

  private write(entry: Record<string, unknown>): void {
    this.logger.log(JSON.stringify(entry));
  }
}
