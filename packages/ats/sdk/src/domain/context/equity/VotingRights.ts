// SPDX-License-Identifier: Apache-2.0

export class VotingRights {
  recordTimeStamp: number;
  data: string;
  snapshotId?: number;

  constructor(recordTimeStamp: number, data: string, snapshotId?: number) {
    this.recordTimeStamp = recordTimeStamp;
    this.data = data;
    this.snapshotId = snapshotId ? snapshotId : undefined;
  }
}
