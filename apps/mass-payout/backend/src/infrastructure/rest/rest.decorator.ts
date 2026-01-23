// SPDX-License-Identifier: Apache-2.0

import { applyDecorators, Controller, UseFilters, UsePipes, ValidationPipe } from "@nestjs/common"
import { RestExceptionFilter } from "@infrastructure/rest/rest-exception.filter"

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
  )
}
