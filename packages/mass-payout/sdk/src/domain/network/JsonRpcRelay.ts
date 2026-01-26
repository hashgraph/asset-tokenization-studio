// SPDX-License-Identifier: Apache-2.0

import { Environment } from "./Environment";

export class JsonRpcRelay {
  name?: string;
  baseUrl: string;
  apiKey?: string;
  headerName?: string;

  constructor(baseUrl: string, name?: string, apiKey?: string, headerName?: string) {
    this.name = name;
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.headerName = headerName;
  }
}

export class EnvironmentJsonRpcRelay {
  jsonRpcRelay: JsonRpcRelay;
  environment: Environment;

  constructor(jsonRpcRelay: JsonRpcRelay, environment: Environment) {
    this.jsonRpcRelay = jsonRpcRelay;
    this.environment = environment;
  }
}

export class JsonRpcRelays {
  nodes: EnvironmentJsonRpcRelay[];

  constructor(nodes: EnvironmentJsonRpcRelay[]) {
    this.nodes = nodes;
  }
}
