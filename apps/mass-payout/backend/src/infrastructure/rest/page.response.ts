// SPDX-License-Identifier: Apache-2.0

import { Page } from "@domain/model/page"
import { ApiProperty } from "@nestjs/swagger"

export class PageResponse<T> {
  @ApiProperty({
    description: "The list of items",
    example: "[]",
  })
  items: T[]

  @ApiProperty({
    description: "The total amount of items",
    example: "26",
  })
  total: number

  @ApiProperty({
    description: "The page number",
    example: "1",
  })
  page: number

  @ApiProperty({
    description: "The maximum number of items by page",
    example: "6",
  })
  limit: number

  @ApiProperty({
    description: "The existing total pages",
    example: "5",
  })
  totalPages: number

  static fromPage<T, R>(page: Page<T>, transform: (item: T) => R): PageResponse<R> {
    const response = new PageResponse<R>()
    response.items = page.items.map(transform)
    response.total = page.total
    response.page = page.page
    response.limit = page.limit
    response.totalPages = page.totalPages
    return response
  }
}
