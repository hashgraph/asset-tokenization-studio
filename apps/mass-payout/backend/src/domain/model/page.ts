// SPDX-License-Identifier: Apache-2.0

export class OrderPageOptions {
  static DEFAULT: OrderPageOptions = {
    order: "DESC",
    orderBy: "createdAt",
  }

  order: "asc" | "desc" | "ASC" | "DESC"
  orderBy: string
}

export class PageOptions {
  static DEFAULT: PageOptions = {
    page: 1,
    limit: 10,
    order: OrderPageOptions.DEFAULT,
  }

  page: number
  limit: number
  order: OrderPageOptions
}

export interface Page<T> {
  items: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}
