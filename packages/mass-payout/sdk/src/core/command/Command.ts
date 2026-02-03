// SPDX-License-Identifier: Apache-2.0

export interface BaseCommand {}
export class Command<T = unknown> implements BaseCommand {
  resultType!: T;
}
