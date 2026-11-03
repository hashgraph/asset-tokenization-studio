// SPDX-License-Identifier: Apache-2.0

import { applyDecorators, Controller, UseFilters, UseInterceptors, UsePipes, ValidationPipe } from "@nestjs/common";
import { AuditLogInterceptor } from "@infrastructure/rest/audit-log.interceptor";
import { RestExceptionFilter } from "@infrastructure/rest/rest-exception.filter";

export function RestController(prefix?: string) {
  return applyDecorators(
    Controller(prefix),
    UsePipes(
      new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    ),
    UseFilters(new RestExceptionFilter()),
    UseInterceptors(new AuditLogInterceptor()),
  );
}
