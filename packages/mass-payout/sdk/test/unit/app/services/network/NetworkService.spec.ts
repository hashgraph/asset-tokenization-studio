// SPDX-License-Identifier: Apache-2.0

import NetworkService from "@app/services/network/NetworkService";
import { Environment } from "@domain/network/Environment";
import { MirrorNode } from "@domain/network/MirrorNode";
import { JsonRpcRelay } from "@domain/network/JsonRpcRelay";

const environment: Environment = "testnet";
const mirrorNode: MirrorNode = {
  name: "testnetMirrorNode",
  baseUrl: "https://testnet.mirrornode.hedera.com",
};
const rpcNode: JsonRpcRelay = {
  name: "testnetJsonRpcRelayNode",
  baseUrl: "http://testnet.jpcnode.hedera.com",
};

describe("NetworkService", () => {
  let networkService: NetworkService;

  beforeEach(() => {
    networkService = new NetworkService({
      environment: environment,
      mirrorNode: mirrorNode,
      rpcNode: rpcNode,
      consensusNodes: "consensus",
    });
  });

  describe("environment", () => {
    it("should get the environment", async () => {
      expect(networkService.environment).toEqual(environment);
    });

    it("should set the environment", async () => {
      const environmentNew: Environment = "previewnet";
      networkService.environment = environmentNew;
      expect(networkService.environment).toEqual(environmentNew);
    });
  });

  describe("mirror node", () => {
    it("should get the mirrorNode", async () => {
      expect(networkService.mirrorNode).toEqual(mirrorNode);
    });

    it("should set the mirrorNode", async () => {
      const mirrorNodeNew: MirrorNode = {
        name: "previewnetMirrorNode",
        baseUrl: "https://previewnet.mirrornode.hedera.com",
      };
      networkService.mirrorNode = mirrorNodeNew;
      expect(networkService.mirrorNode).toEqual(mirrorNodeNew);
    });
  });

  describe("rpc node", () => {
    it("should get the rpcNode", async () => {
      expect(networkService.rpcNode).toEqual(rpcNode);
    });

    it("should set the mirrorNode", async () => {
      const rpcNodeNew: JsonRpcRelay = {
        name: "previewnetJsonRpcRelayNode",
        baseUrl: "http://previewnet.jpcnode.hedera.com",
      };
      networkService.rpcNode = rpcNodeNew;
      expect(networkService.rpcNode).toEqual(rpcNodeNew);
    });
  });

  describe("consensus nodes", () => {
    it("should get the consensusNodes", async () => {
      expect(networkService.consensusNodes).toEqual("consensus");
    });

    it("should set the consensusNodes", async () => {
      networkService.consensusNodes = "newConsensusNode";
      expect(networkService.consensusNodes).toEqual("newConsensusNode");
    });
  });
});
