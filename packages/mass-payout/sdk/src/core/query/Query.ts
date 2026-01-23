// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BaseQuery {}
export class Query<T> implements BaseQuery {
  private $resultType!: T;
}
