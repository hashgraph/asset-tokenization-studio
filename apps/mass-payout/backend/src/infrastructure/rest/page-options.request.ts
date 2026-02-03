// SPDX-License-Identifier: Apache-2.0

import { PageOptions } from "@domain/model/page"
import { Type } from "class-transformer"
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class PageOptionsRequest {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ description: "The page number", example: "1" })
  page: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ description: "The maximum number of items by page", example: "6" })
  limit: number = 10

  @IsOptional()
  @IsString()
  @ApiProperty({ description: "The criterion to order the results", example: "createdAt" })
  orderBy: string = "createdAt"

  @IsOptional()
  @IsIn(["ASC", "DESC", "asc", "desc"])
  @ApiProperty({ description: "Whether the results will be ordered ascending or descending", example: "DESC" })
  order: string = "DESC"

  toPageOptions(): PageOptions {
    return {
      page: this.page,
      limit: this.limit,
      order: {
        orderBy: this.orderBy,
        order: this.order as "asc" | "desc" | "ASC" | "DESC",
      },
    }
  }

  static readonly DEFAULT: PageOptionsRequest = (() => {
    const instance = new PageOptionsRequest()
    instance.page = 1
    instance.limit = 10
    instance.orderBy = "createdAt"
    instance.order = "DESC"
    return instance
  })()
}
