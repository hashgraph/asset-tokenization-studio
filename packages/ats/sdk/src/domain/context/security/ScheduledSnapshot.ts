// SPDX-License-Identifier: Apache-2.0

export class ScheduledSnapshot {
  constructor(
    public readonly scheduledTimestamp: bigint,
    public readonly data: string,
  ) {}
}
