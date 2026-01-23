// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BaseCommand {}
export class Command<T = unknown> implements BaseCommand {
  resultType!: T;
}
