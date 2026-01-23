// SPDX-License-Identifier: Apache-2.0

import { container } from "tsyringe";
import NetworkService, { NetworkProps } from "./NetworkService"; // Adjust path as needed
import { Environment } from "@domain/context/network/Environment";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";
import Configuration from "@domain/context/network/Configuration";

describe("NetworkService", () => {
  let networkService: NetworkService;
  let mockProps: NetworkProps;

  beforeEach(() => {
    jest.clearAllMocks();
    container.clearInstances();

    mockProps = {
      environment: {} as Environment,
      mirrorNode: {} as MirrorNode,
      rpcNode: {} as JsonRpcRelay,
      consensusNodes: "consensus-node-1,consensus-node-2",
      configuration: {} as Configuration,
    };

    container.register("NetworkProps", { useValue: mockProps });

    networkService = container.resolve(NetworkService);
  });

  describe("constructor", () => {
    it("should initialize with provided NetworkProps", () => {
      expect(networkService.environment).toBe(mockProps.environment);
      expect(networkService.mirrorNode).toBe(mockProps.mirrorNode);
      expect(networkService.rpcNode).toBe(mockProps.rpcNode);
      expect(networkService.consensusNodes).toBe(mockProps.consensusNodes);
      expect(networkService.configuration).toBe(mockProps.configuration);
    });

    it("should initialize with undefined props if none provided", () => {
      container.clearInstances();
      container.register("NetworkProps", {
        useValue: {
          environment: undefined,
          mirrorNode: undefined,
          rpcNode: undefined,
          consensusNodes: undefined,
          configuration: undefined,
        } as unknown as NetworkProps,
      });

      const service = container.resolve(NetworkService);

      expect(service.environment).toBeUndefined();
      expect(service.mirrorNode).toBeUndefined();
      expect(service.rpcNode).toBeUndefined();
      expect(service.consensusNodes).toBeUndefined();
      expect(service.configuration).toBeUndefined();
    });

    it("should be a singleton", () => {
      const service1 = container.resolve(NetworkService);
      const service2 = container.resolve(NetworkService);

      expect(service1).toBe(service2);
    });
  });

  describe("environment getter and setter", () => {
    it("should get and set environment", () => {
      const newEnvironment = {} as Environment;

      networkService.environment = newEnvironment;
      const result = networkService.environment;

      expect(result).toBe(newEnvironment);
    });
  });

  describe("mirrorNode getter and setter", () => {
    it("should get and set mirrorNode", () => {
      const newMirrorNode = {} as MirrorNode;

      networkService.mirrorNode = newMirrorNode;
      const result = networkService.mirrorNode;

      expect(result).toBe(newMirrorNode);
    });
  });

  describe("rpcNode getter and setter", () => {
    it("should get and set rpcNode", () => {
      const newRpcNode = {} as JsonRpcRelay;

      networkService.rpcNode = newRpcNode;
      const result = networkService.rpcNode;

      expect(result).toBe(newRpcNode);
    });
  });

  describe("consensusNodes getter and setter", () => {
    it("should get and set consensusNodes", () => {
      const newConsensusNodes = "new-consensus-node";

      networkService.consensusNodes = newConsensusNodes;
      const result = networkService.consensusNodes;

      expect(result).toBe(newConsensusNodes);
    });

    it("should handle undefined consensusNodes", () => {
      networkService.consensusNodes = undefined;
      const result = networkService.consensusNodes;

      expect(result).toBeUndefined();
    });
  });

  describe("configuration getter and setter", () => {
    it("should get and set configuration", () => {
      const newConfiguration = {} as Configuration;

      networkService.configuration = newConfiguration;
      const result = networkService.configuration;

      expect(result).toBe(newConfiguration);
    });
  });
});
