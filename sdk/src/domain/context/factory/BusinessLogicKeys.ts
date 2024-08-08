import { Environment } from '../network/Environment.js';

export class EnvironmentBusinessLogicKeys {
  businesslogicKeys: string[];
  environment: Environment;

  constructor(businesslogicKeys: string[], environment: Environment) {
    this.businesslogicKeys = businesslogicKeys;
    this.environment = environment;
  }
}

export class BusinessLogicKeys {
  businesslogicKeys: EnvironmentBusinessLogicKeys[];

  constructor(businesslogicKeys: EnvironmentBusinessLogicKeys[]) {
    this.businesslogicKeys = businesslogicKeys;
  }
}
