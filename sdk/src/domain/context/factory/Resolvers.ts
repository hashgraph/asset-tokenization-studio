import { Environment } from '../network/Environment.js';

export class EnvironmentResolver {
  resolver: string;
  environment: Environment;

  constructor(resolver: string, environment: Environment) {
    this.resolver = resolver;
    this.environment = environment;
  }
}

export class Resolvers {
  resolvers: EnvironmentResolver[];

  constructor(resolvers: EnvironmentResolver[]) {
    this.resolvers = resolvers;
  }
}
