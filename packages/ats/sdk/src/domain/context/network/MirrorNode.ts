// SPDX-License-Identifier: Apache-2.0

import { Environment } from "./Environment";

export class MirrorNode {
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

export class EnvironmentMirrorNode {
  mirrorNode: MirrorNode;
  environment: Environment;

  constructor(mirrorNode: MirrorNode, environment: Environment) {
    this.mirrorNode = mirrorNode;
    this.environment = environment;
  }
}

export class MirrorNodes {
  nodes: EnvironmentMirrorNode[];

  constructor(nodes: EnvironmentMirrorNode[]) {
    this.nodes = nodes;
  }
}
