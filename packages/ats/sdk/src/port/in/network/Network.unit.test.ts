// SPDX-License-Identifier: Apache-2.0

import NetworkService from "@service/network/NetworkService";
import TransactionService from "@service/transaction/TransactionService";
import { CommandBus } from "@core/command/CommandBus";
import SetNetworkRequest from "../request/network/SetNetworkRequest";
import SetConfigurationRequest from "../request/management/SetConfigurationRequest";
import { createMock } from "@golevelup/ts-jest";
import LogService from "@service/log/LogService";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import Network, { ConfigResponse, NetworkResponse } from "./Network";
import { SetConfigurationCommand } from "@command/network/setConfiguration/SetConfigurationCommand";
import Configuration from "@domain/context/network/Configuration";
import { SetNetworkCommand } from "@command/network/setNetwork/SetNetworkCommand";
import { MirrorNode } from "@domain/context/network/MirrorNode";
import { JsonRpcRelay } from "@domain/context/network/JsonRpcRelay";
import { HederaIdPropsFixture } from "@test/fixtures/shared/DataFixture";

describe("Network", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let transactionServiceMock: jest.Mocked<TransactionService>;
  let networkServiceMock: jest.Mocked<NetworkService>;

  let setNetworkRequest: SetNetworkRequest;
  let setConfigurationRequest: SetConfigurationRequest;

  let handleValidationSpy: jest.SpyInstance;

  const mockFactoryAddress = HederaIdPropsFixture.create().value;
  const mockResolverAddress = HederaIdPropsFixture.create().value;
  const mockEnvironment = "testnet";
  const mockMirrorNode = "mirror.node";
  const mockRpcNode = "rpc.node";
  const mockConsensusNodes = "consensus.nodes";

  beforeEach(() => {
    commandBusMock = createMock<CommandBus>();
    transactionServiceMock = createMock<TransactionService>();
    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    networkServiceMock = createMock<NetworkService>({
      configuration: {
        factoryAddress: mockFactoryAddress,
        resolverAddress: mockResolverAddress,
      },
      environment: mockEnvironment,
    });

    jest.spyOn(LogService, "logError").mockImplementation(() => {});

    setNetworkRequest = new SetNetworkRequest({
      environment: mockEnvironment,
      mirrorNode: mockMirrorNode as unknown as MirrorNode,
      rpcNode: mockRpcNode as unknown as JsonRpcRelay,
      consensusNodes: mockConsensusNodes,
    });

    setConfigurationRequest = new SetConfigurationRequest({
      factoryAddress: mockFactoryAddress,
      resolverAddress: mockResolverAddress,
    });

    (Network as any).commandBus = commandBusMock;
    (Network as any).transactionService = transactionServiceMock;
    (Network as any).networkService = networkServiceMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("setConfig", () => {
    it("should validate request and execute SetConfigurationCommand", async () => {
      const expectedResponse: ConfigResponse = {
        factoryAddress: mockFactoryAddress,
        resolverAddress: mockResolverAddress,
      };

      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Network.setConfig(setConfigurationRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetConfigurationRequest", setConfigurationRequest);
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetConfigurationCommand(mockFactoryAddress, mockResolverAddress),
      );
      expect(result).toEqual(expectedResponse);
    });
  });

  describe("getFactoryAddress", () => {
    it("should return factory address from networkService", async () => {
      const result = await Network.getFactoryAddress();

      expect(result).toBe(mockFactoryAddress);
    });

    it("should return empty string if configuration is undefined", async () => {
      networkServiceMock.configuration = undefined as unknown as Configuration;

      const result = await Network.getFactoryAddress();

      expect(result).toBe("");
    });
  });

  describe("getResolverAddress", () => {
    it("should return resolver address from networkService", async () => {
      const result = await Network.getResolverAddress();

      expect(result).toBe(mockResolverAddress);
    });

    it("should return empty string if configuration is undefined", async () => {
      networkServiceMock.configuration = undefined as unknown as Configuration;

      const result = await Network.getResolverAddress();

      expect(result).toBe("");
    });
  });

  describe("getNetwork", () => {
    it("should return environment from networkService", async () => {
      const result = await Network.getNetwork();

      expect(result).toBe(mockEnvironment);
    });
  });

  describe("isNetworkRecognized", () => {
    it("should return true if environment is recognized", async () => {
      const result = await Network.isNetworkRecognized();

      expect(result).toBe(true);
    });

    it("should return false if environment is unrecognized", async () => {
      networkServiceMock.environment = "unrecognized";

      const result = await Network.isNetworkRecognized();

      expect(result).toBe(false);
    });
  });

  describe("setNetwork", () => {
    it("should validate request and execute SetNetworkCommand", async () => {
      const expectedResponse: NetworkResponse = {
        environment: mockEnvironment,
        mirrorNode: mockMirrorNode as unknown as MirrorNode,
        rpcNode: mockRpcNode as unknown as JsonRpcRelay,
        consensusNodes: mockConsensusNodes,
      };
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Network.setNetwork(setNetworkRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("SetNetworkRequest", setNetworkRequest);
      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new SetNetworkCommand(
          mockEnvironment,
          mockMirrorNode as unknown as MirrorNode,
          mockRpcNode as unknown as JsonRpcRelay,
          mockConsensusNodes,
        ),
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
