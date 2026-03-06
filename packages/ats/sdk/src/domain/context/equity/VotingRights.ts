// SPDX-License-Identifier: Apache-2.0

export class VotingRights {
  recordTimeStamp: number;
  data: string;
  snapshotId?: number;
  isDisabled: boolean;

  constructor(recordTimeStamp: number, data: string, snapshotId?: number, isDisabled: boolean = false) {
    this.recordTimeStamp = recordTimeStamp;
    this.data = data;
    this.snapshotId = snapshotId ? snapshotId : undefined;
    this.isDisabled = isDisabled;
  }
}
