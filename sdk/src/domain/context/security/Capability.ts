export enum Operation {
  ISSUE = 'Issue',
  CONTROLLER = 'Controller',
  PAUSE = 'Pause',
  CONTROLLIST = 'Control_List',
  CORPORATEACTIONS = 'Corporate_Actions',
  ROLE_ADMIN_MANAGEMENT = 'Admin_Role',
}

export class Capability {
  constructor(public readonly operation: Operation) {}
}
