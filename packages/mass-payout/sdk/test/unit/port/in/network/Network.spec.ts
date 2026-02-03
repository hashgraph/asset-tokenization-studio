// SPDX-License-Identifier: Apache-2.0

import { Network } from "@port/in/network/Network";
import { testnet, mainnet, unrecognized } from "@domain/network/Environment";
import { SupportedWallets } from "@port/in/request/network/ConnectRequest";
import SetNetworkRequest from "@port/in/request/network/SetNetworkRequest";
import SetNetworkResponse from "@port/in/network/response/SetNetworkResponse";
import ExecuteConnectionResponse from "@port/in/network/response/ExecuteConnectionResponse";
import ValidatedRequest from "@core/validation/ValidatedArgs";

jest.mock("@core/validation/ValidatedArgs", () => {
  return {
    __esModule: true,
    default: class MockValidatedArgs {
      static handleValidation = jest.fn();
    },
  };
});

describe("Network", () => {
  let service: Network;
  let networkService: any;
  let transactionService: any;
  let dfnsAdapter: any;
  let mirrorNode: any;
  let rpcQuery: any;
  let event: any;

  beforeEach(() => {
    networkService = {
      environment: "testnet",
      consensusNodes: undefined,
      rpcNode: undefined,
      mirrorNode: undefined,
    };

    transactionService = {
      getHandler: jest.fn().mockReturnValue({ stop: jest.fn().mockResolvedValue(true) }),
      getHandlerClass: jest.fn(),
    };

    dfnsAdapter = { init: jest.fn().mockResolvedValue(undefined) };
    mirrorNode = { set: jest.fn() };
    rpcQuery = { init: jest.fn() };
    event = { register: jest.fn() };

    service = new Network(networkService, transactionService, dfnsAdapter, mirrorNode, rpcQuery, event);

    (ValidatedRequest.handleValidation as jest.Mock).mockClear();
  });

  describe("getNetwork", () => {
    it("should return environment", async () => {
      await expect(service.getNetwork()).resolves.toBe("testnet");
    });
  });

  describe("isNetworkRecognized", () => {
    it("should return true when environment is not unrecognized", async () => {
      await expect(service.isNetworkRecognized()).resolves.toBe(true);
    });

    it("should return false when environment is unrecognized", async () => {
      networkService.environment = unrecognized;
      await expect(service.isNetworkRecognized()).resolves.toBe(false);
    });
  });

  describe("setNetwork", () => {
    it("should validate and set network data", async () => {
      const req = new SetNetworkRequest({
        environment: mainnet,
        mirrorNode: { baseUrl: "mirror" },
        rpcNode: { baseUrl: "rpc", apiKey: "key" },
      });

      const res = await service.setNetwork(req);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("SetNetworkRequest", req);
      expect(mirrorNode.set).toHaveBeenCalledWith(req.mirrorNode);
      expect(rpcQuery.init).toHaveBeenCalledWith("rpc", "key");
      expect(res).toBeInstanceOf(SetNetworkResponse);
      expect(res.environment).toBe(mainnet);
    });
  });

  describe("executeConnection", () => {
    it("should call handler.register and return ExecuteConnectionResponse", async () => {
      const handler = { register: jest.fn().mockResolvedValue("registration") };
      transactionService.getHandlerClass.mockReturnValue(handler);

      const res = await service.executeConnection(testnet, SupportedWallets.DFNS, { id: "acc" } as any);

      expect(transactionService.getHandlerClass).toHaveBeenCalledWith(SupportedWallets.DFNS);
      expect(handler.register).toHaveBeenCalledWith({ id: "acc" });
      expect(res).toBeInstanceOf(ExecuteConnectionResponse);
      expect(res.payload).toBe("registration");
    });
  });

  describe("init", () => {
    it("should validate, set network, register events, init DFNS, and return wallets", async () => {
      const req: any = {
        network: testnet,
        mirrorNode: { baseUrl: "mirror" },
        rpcNode: { baseUrl: "rpc", apiKey: "key" },
        events: { connect: jest.fn() },
      };

      const res = await service.init(req);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("InitializationRequest", req);
      expect(event.register).toHaveBeenCalledWith(req.events);
      expect(dfnsAdapter.init).toHaveBeenCalled();
      expect(res).toEqual([SupportedWallets.DFNS]);
    });
  });

  describe("connect", () => {
    it("should validate, set network, and call executeConnection", async () => {
      const req: any = {
        network: testnet,
        mirrorNode: { baseUrl: "mirror" },
        rpcNode: { baseUrl: "rpc", apiKey: "key" },
        wallet: SupportedWallets.DFNS,
      };

      const execRes = { payload: { accountId: "acc" } };
      jest.spyOn(service, "executeConnection").mockResolvedValue(execRes as any);

      const res = await service.connect(req);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("ConnectRequest", req);
      expect(service.executeConnection).toHaveBeenCalledWith(req.network, req.wallet, undefined, undefined);
      expect(res).toEqual(execRes.payload);
    });
  });

  describe("disconnect", () => {
    it("should call stop on transaction handler", async () => {
      const result = await service.disconnect();
      expect(transactionService.getHandler().stop).toHaveBeenCalled();
      expect(result).toBe(true);
    });
  });
});
