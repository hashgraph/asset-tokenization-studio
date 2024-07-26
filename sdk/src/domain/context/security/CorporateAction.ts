export const MIN_ID = 1;

export class CorporateAction {
  id: string;
  actionType: string;
  recordDateTimestamp: number;
  executionDateTimestamp: number;

  constructor(
    id: string,
    actionType: string,
    recordDateTimestamp: number,
    executionDateTimestamp: number,
  ) {
    this.id = id;
    this.actionType = actionType;
    this.recordDateTimestamp = recordDateTimestamp;
    this.executionDateTimestamp = executionDateTimestamp;
  }
}
