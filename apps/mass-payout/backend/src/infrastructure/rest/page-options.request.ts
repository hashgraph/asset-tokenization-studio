// SPDX-License-Identifier: Apache-2.0

import { PageOptions } from "@domain/model/page";
import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

/**
 * Largest page a client may request. Keeps a single call from loading an unbounded number of rows
 * (and, for asset distributions, one holder-count query per row). The frontend's asset distributions
 * view asks for 1000 and filters client-side, so the cap sits there.
 */
export const MAX_PAGE_LIMIT = 1000;

export class PageOptionsRequest {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @ApiProperty({ description: "The page number", example: "1" })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_PAGE_LIMIT)
  @ApiProperty({
    description: `The maximum number of items by page (1 to ${MAX_PAGE_LIMIT})`,
    example: "6",
  })
  limit: number = 10;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: "The criterion to order the results", example: "createdAt" })
  orderBy: string = "createdAt";

  @IsOptional()
  @IsIn(["ASC", "DESC", "asc", "desc"])
  @ApiProperty({ description: "Whether the results will be ordered ascending or descending", example: "DESC" })
  order: string = "DESC";

  toPageOptions(): PageOptions {
    return {
      page: this.page,
      limit: this.limit,
      order: {
        orderBy: this.orderBy,
        order: this.order as "asc" | "desc" | "ASC" | "DESC",
      },
    };
  }

  static readonly DEFAULT: PageOptionsRequest = (() => {
    const instance = new PageOptionsRequest();
    instance.page = 1;
    instance.limit = 10;
    instance.orderBy = "createdAt";
    instance.order = "DESC";
    return instance;
  })();
}
