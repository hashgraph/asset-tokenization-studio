// SPDX-License-Identifier: Apache-2.0

import { LifeCycleCashFlow } from "@port/in/lifeCycleCashFlow/LifeCycleCashFlow";
import { CommandBus } from "@core/command/CommandBus";
import { QueryBus } from "@core/query/QueryBus";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { EvmAddressPropsFixture, HederaIdPropsFixture } from "../../../../fixture/DataFixture";

jest.mock("@core/validation/ValidatedArgs", () => {
  return {
    __esModule: true,
    default: class MockValidatedArgs {
      static handleValidation = jest.fn();
    },
  };
});

describe("LifeCycleCashFlow", () => {
  let service: LifeCycleCashFlow;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;
  let mirrorNode: jest.Mocked<MirrorNodeAdapter>;

  beforeEach(() => {
    commandBus = { execute: jest.fn() } as any;
    queryBus = { execute: jest.fn() } as any;
    mirrorNode = {} as any;

    service = new LifeCycleCashFlow(commandBus, queryBus, mirrorNode);
    (ValidatedRequest.handleValidation as jest.Mock).mockClear();
  });

  describe("deploy", () => {
    it("should validate request and execute DeployCommand", async () => {
      const rbacMock: any[] = [
        {
          role: "0x0000000000000000000000000000000000000000000000000000000000000001",
          members: ["0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"],
        },
      ];
      const mockRequest: any = {
        asset: HederaIdPropsFixture.create().value,
        paymentToken: HederaIdPropsFixture.create().value,
        rbac: rbacMock,
      };
      const mockResponse = { payload: "tx123" };

      commandBus.execute.mockResolvedValue(mockResponse);

      const result = await service.deploy(mockRequest);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("DeployRequest", mockRequest);
      expect(commandBus.execute).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe("pause", () => {
    it("should validate request and execute PauseCommand", async () => {
      const mockRequest: any = {
        lifeCycleCashFlow: HederaIdPropsFixture.create().value,
      };
      const mockResponse = { payload: true, transactionId: "tx123" };

      commandBus.execute.mockResolvedValue(mockResponse);

      const result = await service.pause(mockRequest);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("PauseRequest", mockRequest);
      expect(commandBus.execute).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe("unpause", () => {
    it("should validate request and execute UnpauseCommand", async () => {
      const mockRequest: any = {
        lifeCycleCashFlow: HederaIdPropsFixture.create().value,
      };
      const mockResponse = { payload: true, transactionId: "tx123" };

      commandBus.execute.mockResolvedValue(mockResponse);

      const result = await service.unpause(mockRequest);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("UnpauseRequest", mockRequest);
      expect(commandBus.execute).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe("isPaused", () => {
    it("should validate request and query IsPaused", async () => {
      const mockRequest: any = {
        lifeCycleCashFlow: HederaIdPropsFixture.create().value,
      };
      const mockResponse = { payload: false };

      queryBus.execute.mockResolvedValue(mockResponse);

      const result = await service.isPaused(mockRequest);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("IsPausedRequest", mockRequest);
      expect(queryBus.execute).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe("executeDistribution", () => {
    it("should validate request and execute ExecuteDistributionCommand", async () => {
      const lifeCycleCashFlow = HederaIdPropsFixture.create().value;
      const mockRequest: any = {
        lifeCycleCashFlow: lifeCycleCashFlow,
        asset: HederaIdPropsFixture.create().value,
        pageIndex: 1,
        pageLength: 1,
        distributionId: "dist123",
      };
      const mockQueryResponse = { payload: 6 };
      const mockCommandResponse = {
        failed: [EvmAddressPropsFixture.create().value],
        succeeded: [EvmAddressPropsFixture.create().value],
        paidAmount: ["1"],
        executed: true,
        transactionId: "tx123",
      };

      queryBus.execute.mockResolvedValue(mockQueryResponse);
      commandBus.execute.mockResolvedValue(mockCommandResponse);

      const result = await service.executeDistribution(mockRequest);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledTimes(2);
      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("GetPaymentTokenDecimalsRequest", {
        lifeCycleCashFlow: lifeCycleCashFlow,
      });
      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("ExecuteDistributionRequest", mockRequest);
      expect(commandBus.execute).toHaveBeenCalled();
      expect(result).toEqual(mockCommandResponse);
    });
  });

  describe("executeDistributionByAddresses", () => {
    it("should validate request and execute ExecuteDistributionByAddressesCommand", async () => {
      const lifeCycleCashFlow = HederaIdPropsFixture.create().value;
      const holder1 = EvmAddressPropsFixture.create().value;
      const holder2 = EvmAddressPropsFixture.create().value;
      const mockRequest: any = {
        lifeCycleCashFlow: lifeCycleCashFlow,
        asset: HederaIdPropsFixture.create().value,
        holders: [holder1, holder2],
        distributionId: "dist123",
      };
      const mockQueryResponse = { payload: 6 };
      const mockCommandResponse = {
        failed: [holder1],
        succeeded: [holder2],
        paidAmount: ["1"],
        transactionId: "tx123",
      };

      queryBus.execute.mockResolvedValue(mockQueryResponse);
      commandBus.execute.mockResolvedValue(mockCommandResponse);

      const result = await service.executeDistributionByAddresses(mockRequest);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledTimes(2);
      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("GetPaymentTokenDecimalsRequest", {
        lifeCycleCashFlow: lifeCycleCashFlow,
      });
      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith(
        "ExecuteDistributionByAddressesRequest",
        mockRequest,
      );
      expect(commandBus.execute).toHaveBeenCalled();
      expect(result).toEqual(mockCommandResponse);
    });
  });

  describe("executeBondCashOut", () => {
    it("should validate request and execute ExecuteBondCashOutCommand", async () => {
      const lifeCycleCashFlow = HederaIdPropsFixture.create().value;
      const mockRequest: any = {
        lifeCycleCashFlow: lifeCycleCashFlow,
        bond: HederaIdPropsFixture.create().value,
        pageIndex: 1,
        pageLength: 1,
      };
      const mockQueryResponse = { payload: 6 };
      const mockCommandResponse = {
        failed: [EvmAddressPropsFixture.create().value],
        succeeded: [EvmAddressPropsFixture.create().value],
        paidAmount: ["1"],
        executed: true,
        transactionId: "tx123",
      };

      queryBus.execute.mockResolvedValue(mockQueryResponse);
      commandBus.execute.mockResolvedValue(mockCommandResponse);

      const result = await service.executeBondCashOut(mockRequest);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledTimes(2);
      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("GetPaymentTokenDecimalsRequest", {
        lifeCycleCashFlow: lifeCycleCashFlow,
      });
      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("ExecuteBondCashOutRequest", mockRequest);
      expect(commandBus.execute).toHaveBeenCalled();
      expect(result).toEqual(mockCommandResponse);
    });
  });

  describe("executeBondCashOutByAddresses", () => {
    it("should validate request and execute ExecuteBondCashOutByAddressesCommand", async () => {
      const lifeCycleCashFlow = HederaIdPropsFixture.create().value;
      const holder1 = EvmAddressPropsFixture.create().value;
      const holder2 = EvmAddressPropsFixture.create().value;
      const mockRequest: any = {
        lifeCycleCashFlow: lifeCycleCashFlow,
        bond: HederaIdPropsFixture.create().value,
        holders: [holder1, holder2],
      };
      const mockQueryResponse = { payload: 6 };
      const mockCommandResponse = {
        failed: [holder1],
        succeeded: [holder2],
        paidAmount: ["1"],
        transactionId: "tx123",
      };

      queryBus.execute.mockResolvedValue(mockQueryResponse);
      commandBus.execute.mockResolvedValue(mockCommandResponse);

      const result = await service.executeBondCashOutByAddresses(mockRequest);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledTimes(2);
      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("GetPaymentTokenDecimalsRequest", {
        lifeCycleCashFlow: lifeCycleCashFlow,
      });
      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith(
        "ExecuteBondCashOutByAddressesRequest",
        mockRequest,
      );
      expect(commandBus.execute).toHaveBeenCalled();
      expect(result).toEqual(mockCommandResponse);
    });
  });

  describe("executeAmountSnapshot", () => {
    it("should validate request and execute ExecuteAmountSnapshot", async () => {
      const lifeCycleCashFlow = HederaIdPropsFixture.create().value;
      const mockRequest: any = {
        lifeCycleCashFlow: lifeCycleCashFlow,
        asset: HederaIdPropsFixture.create().value,
        pageIndex: 1,
        pageLength: 1,
        snapshotId: "snap123",
        amount: 1,
      };
      const mockQueryResponse = { payload: 6 };
      const mockCommandResponse = {
        failed: [EvmAddressPropsFixture.create().value],
        succeeded: [EvmAddressPropsFixture.create().value],
        paidAmount: ["1"],
        executed: true,
        transactionId: "tx123",
      };

      queryBus.execute.mockResolvedValue(mockQueryResponse);
      commandBus.execute.mockResolvedValue(mockCommandResponse);

      const result = await service.executeAmountSnapshot(mockRequest);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledTimes(2);
      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("GetPaymentTokenDecimalsRequest", {
        lifeCycleCashFlow: lifeCycleCashFlow,
      });
      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("ExecuteAmountSnapshotRequest", mockRequest);
      expect(commandBus.execute).toHaveBeenCalled();
      expect(result).toEqual(mockCommandResponse);
    });
  });

  describe("executePercentageSnapshot", () => {
    it("should validate request and execute ExecutePercentageSnapshot", async () => {
      const lifeCycleCashFlow = HederaIdPropsFixture.create().value;
      const mockRequest: any = {
        lifeCycleCashFlow: lifeCycleCashFlow,
        asset: HederaIdPropsFixture.create().value,
        pageIndex: 1,
        pageLength: 1,
        snapshotId: "snap123",
        percentage: 20,
      };
      const mockQueryResponse = { payload: 6 };
      const mockCommandResponse = {
        failed: [EvmAddressPropsFixture.create().value],
        succeeded: [EvmAddressPropsFixture.create().value],
        paidAmount: ["1"],
        executed: true,
        transactionId: "tx123",
      };

      queryBus.execute.mockResolvedValue(mockQueryResponse);
      commandBus.execute.mockResolvedValue(mockCommandResponse);

      const result = await service.executePercentageSnapshot(mockRequest);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledTimes(2);
      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("GetPaymentTokenDecimalsRequest", {
        lifeCycleCashFlow: lifeCycleCashFlow,
      });
      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("ExecutePercentageSnapshotRequest", mockRequest);
      expect(commandBus.execute).toHaveBeenCalled();
      expect(result).toEqual(mockCommandResponse);
    });
  });

  describe("executeAmountSnapshotByAddresses", () => {
    it("should validate request and execute ExecuteAmountSnapshotByAddresses", async () => {
      const lifeCycleCashFlow = HederaIdPropsFixture.create().value;
      const holder1 = EvmAddressPropsFixture.create().value;
      const holder2 = EvmAddressPropsFixture.create().value;
      const mockRequest: any = {
        lifeCycleCashFlow: lifeCycleCashFlow,
        asset: HederaIdPropsFixture.create().value,
        holders: [holder1, holder2],
        snapshotId: "snap123",
        amount: 1,
      };
      const mockQueryResponse = { payload: 6 };
      const mockCommandResponse = {
        failed: [holder1],
        succeeded: [holder2],
        paidAmount: ["1"],
        transactionId: "tx123",
      };

      queryBus.execute.mockResolvedValue(mockQueryResponse);
      commandBus.execute.mockResolvedValue(mockCommandResponse);

      const result = await service.executeAmountSnapshotByAddresses(mockRequest);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledTimes(2);
      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("GetPaymentTokenDecimalsRequest", {
        lifeCycleCashFlow: lifeCycleCashFlow,
      });
      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith(
        "ExecuteAmountSnapshotByAddressesRequest",
        mockRequest,
      );
      expect(commandBus.execute).toHaveBeenCalled();
      expect(result).toEqual(mockCommandResponse);
    });
  });

  describe("executePercentageSnapshotByAddresses", () => {
    it("should validate request and execute ExecutePercentageSnapshotByAddresses", async () => {
      const lifeCycleCashFlow = HederaIdPropsFixture.create().value;
      const holder1 = EvmAddressPropsFixture.create().value;
      const holder2 = EvmAddressPropsFixture.create().value;
      const mockRequest: any = {
        lifeCycleCashFlow: lifeCycleCashFlow,
        asset: HederaIdPropsFixture.create().value,
        snapshotId: "snap123",
        holders: [holder1, holder2],
        percentage: 20,
      };

      const mockQueryResponse = { payload: 6 };
      const mockCommandResponse = {
        failed: [holder1],
        succeeded: [holder2],
        paidAmount: ["1"],
        transactionId: "tx123",
      };

      queryBus.execute.mockResolvedValue(mockQueryResponse);
      commandBus.execute.mockResolvedValue(mockCommandResponse);

      const result = await service.executePercentageSnapshotByAddresses(mockRequest);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledTimes(2);
      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("GetPaymentTokenDecimalsRequest", {
        lifeCycleCashFlow: lifeCycleCashFlow,
      });
      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith(
        "ExecutePercentageSnapshotByAddressesRequest",
        mockRequest,
      );
      expect(commandBus.execute).toHaveBeenCalled();
      expect(result).toEqual(mockCommandResponse);
    });
  });

  describe("getPaymentToken", () => {
    it("should validate request and execute GetPaymentTokenQuery", async () => {
      const mockRequest: any = {
        lifeCycleCashFlow: HederaIdPropsFixture.create().value,
      };
      const mockResponse = { payload: EvmAddressPropsFixture.create().value };

      queryBus.execute.mockResolvedValue(mockResponse);

      const result = await service.getPaymentToken(mockRequest);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("GetPaymentTokenRequest", mockRequest);
      expect(queryBus.execute).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });

  describe("getPaymentTokenDecimals", () => {
    it("should validate request and execute getPaymentTokenDecimalsQuery", async () => {
      const mockRequest: any = {
        lifeCycleCashFlow: HederaIdPropsFixture.create().value,
      };
      const mockResponse = { payload: 6 };

      queryBus.execute.mockResolvedValue(mockResponse);

      const result = await service.getPaymentTokenDecimals(mockRequest);

      expect(ValidatedRequest.handleValidation).toHaveBeenCalledWith("GetPaymentTokenDecimalsRequest", mockRequest);
      expect(queryBus.execute).toHaveBeenCalled();
      expect(result).toEqual(mockResponse);
    });
  });
});
