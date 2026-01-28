// SPDX-License-Identifier: Apache-2.0

export interface BaseQuery {}
export class Query<T> implements BaseQuery {
  private $resultType!: T;
}
