// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-empty-interface */
export interface BaseCommand {}
export class Command<T = unknown> implements BaseCommand {
  resultType!: T;
}
