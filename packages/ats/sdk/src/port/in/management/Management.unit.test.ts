// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { CommandBus } from "@core/command/CommandBus";
import {
  GetConfigInfoRequest,
  UpdateConfigRequest,
  UpdateConfigVersionRequest,
  UpdateResolverRequest,
} from "../request";
import { EvmAddressPropsFixture, HederaIdPropsFixture, TransactionIdFixture } from "@test/fixtures/shared/DataFixture";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import Management from "./Management";
import {
  GetConfigInfoRequestFixture,
  UpdateConfigRequestFixture,
  UpdateConfigVersionRequestFixture,
  UpdateResolverRequestFixture,
} from "@test/fixtures/management/ManagementFixture";
import { UpdateConfigVersionCommand } from "@command/management/updateConfigVersion/updateConfigVersionCommand";
import { UpdateConfigCommand } from "@command/management/updateConfig/updateConfigCommand";
import { UpdateResolverCommand } from "@command/management/updateResolver/updateResolverCommand";
import ContractId from "@domain/context/contract/ContractId";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { DiamondConfiguration } from "@domain/context/security/DiamondConfiguration";
import { GetConfigInfoQuery } from "@query/management/GetConfigInfoQuery";
describe("Management", () => {
  let commandBusMock: jest.Mocked<CommandBus>;
  let queryBusMock: jest.Mocked<QueryBus>;
  let mirrorNodeMock: jest.Mocked<MirrorNodeAdapter>;

  let updateConfigVersionRequest: UpdateConfigVersionRequest;
  let updateConfigRequest: UpdateConfigRequest;
  let getConfigInfoRequest: GetConfigInfoRequest;
  let updateResolverRequest: UpdateResolverRequest;

  let handleValidationSpy: jest.SpyInstance;

  const transactionId = TransactionIdFixture.create().id;
  const resolverAddress = HederaIdPropsFixture.create().value;

  const contractViewModel = {
    id: resolverAddress,
    evmAddress: EvmAddressPropsFixture.create().value,
  };

  const expectedResponse = {
    payload: true,
    transactionId: transactionId,
  };

  beforeEach(() => {
    commandBusMock = createMock<CommandBus>();
    queryBusMock = createMock<QueryBus>();
    mirrorNodeMock = createMock<MirrorNodeAdapter>();

    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (Management as any).commandBus = commandBusMock;
    (Management as any).queryBus = queryBusMock;
    (Management as any).mirrorNode = mirrorNodeMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("updateConfigVersion", () => {
    updateConfigVersionRequest = new UpdateConfigVersionRequest(UpdateConfigVersionRequestFixture.create());
    it("should update config version successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Management.updateConfigVersion(updateConfigVersionRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("UpdateConfigVersionRequest", updateConfigVersionRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UpdateConfigVersionCommand(updateConfigVersionRequest.configVersion, updateConfigVersionRequest.securityId),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Management.updateConfigVersion(updateConfigVersionRequest)).rejects.toThrow(
        "Command execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith("UpdateConfigVersionRequest", updateConfigVersionRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UpdateConfigVersionCommand(updateConfigVersionRequest.configVersion, updateConfigVersionRequest.securityId),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      updateConfigVersionRequest = new UpdateConfigVersionRequest({
        ...UpdateConfigVersionRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Management.updateConfigVersion(updateConfigVersionRequest)).rejects.toThrow(ValidationError);
    });

    it("should throw error if configVersion is invalid", async () => {
      updateConfigVersionRequest = new UpdateConfigVersionRequest({
        ...UpdateConfigVersionRequestFixture.create({
          configVersion: "invalid" as unknown as number,
        }),
      });

      await expect(Management.updateConfigVersion(updateConfigVersionRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("updateConfig", () => {
    updateConfigRequest = new UpdateConfigRequest(UpdateConfigRequestFixture.create());
    it("should update config successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Management.updateConfig(updateConfigRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("UpdateConfigRequest", updateConfigRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UpdateConfigCommand(
          updateConfigRequest.configId,
          updateConfigRequest.configVersion,
          updateConfigRequest.securityId,
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Management.updateConfig(updateConfigRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("UpdateConfigRequest", updateConfigRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UpdateConfigCommand(
          updateConfigRequest.configId,
          updateConfigRequest.configVersion,
          updateConfigRequest.securityId,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      updateConfigRequest = new UpdateConfigRequest({
        ...UpdateConfigRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Management.updateConfig(updateConfigRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if configId is invalid", async () => {
      updateConfigRequest = new UpdateConfigRequest({
        ...UpdateConfigRequestFixture.create({
          configId: "invalid",
        }),
      });

      await expect(Management.updateConfig(updateConfigRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if configVersion is invalid", async () => {
      updateConfigRequest = new UpdateConfigRequest({
        ...UpdateConfigRequestFixture.create({
          configVersion: "invalid" as unknown as number,
        }),
      });

      await expect(Management.updateConfig(updateConfigRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("updateResolver", () => {
    updateResolverRequest = new UpdateResolverRequest(UpdateResolverRequestFixture.create());
    it("should update resolver successfully", async () => {
      commandBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await Management.updateResolver(updateResolverRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("UpdateResolverRequest", updateResolverRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UpdateResolverCommand(
          updateResolverRequest.configVersion,
          updateResolverRequest.securityId,
          updateResolverRequest.configId,
          new ContractId(updateResolverRequest.resolver),
        ),
      );

      expect(result).toEqual(expectedResponse);
    });

    it("should throw an error if command execution fails", async () => {
      const error = new Error("Command execution failed");
      commandBusMock.execute.mockRejectedValue(error);

      await expect(Management.updateResolver(updateResolverRequest)).rejects.toThrow("Command execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("UpdateResolverRequest", updateResolverRequest);

      expect(commandBusMock.execute).toHaveBeenCalledWith(
        new UpdateResolverCommand(
          updateResolverRequest.configVersion,
          updateResolverRequest.securityId,
          updateResolverRequest.configId,
          new ContractId(updateResolverRequest.resolver),
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      updateResolverRequest = new UpdateResolverRequest({
        ...UpdateResolverRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Management.updateResolver(updateResolverRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if configId is invalid", async () => {
      updateResolverRequest = new UpdateResolverRequest({
        ...UpdateResolverRequestFixture.create({
          configId: "invalid",
        }),
      });

      await expect(Management.updateResolver(updateResolverRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if configVersion is invalid", async () => {
      updateResolverRequest = new UpdateResolverRequest({
        ...UpdateResolverRequestFixture.create({
          configVersion: "invalid" as unknown as number,
        }),
      });

      await expect(Management.updateResolver(updateResolverRequest)).rejects.toThrow(ValidationError);
    });
    it("should throw error if resolver is invalid", async () => {
      updateResolverRequest = new UpdateResolverRequest({
        ...UpdateResolverRequestFixture.create({
          resolver: "invalid",
        }),
      });

      await expect(Management.updateResolver(updateResolverRequest)).rejects.toThrow(ValidationError);
    });
  });

  describe("getConfigInfo", () => {
    getConfigInfoRequest = new GetConfigInfoRequest(GetConfigInfoRequestFixture.create());

    const expectedResponse = {
      payload: new DiamondConfiguration(resolverAddress, "1", 1),
    };
    it("should get config info successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);
      mirrorNodeMock.getContractInfo.mockResolvedValue(contractViewModel);

      const result = await Management.getConfigInfo(getConfigInfoRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith("GetConfigInfoRequest", getConfigInfoRequest);

      expect(queryBusMock.execute).toHaveBeenCalledTimes(1);
      expect(mirrorNodeMock.getContractInfo).toHaveBeenCalledTimes(1);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetConfigInfoQuery(getConfigInfoRequest.securityId));
      expect(mirrorNodeMock.getContractInfo).toHaveBeenCalledWith(resolverAddress);
      expect(result).toEqual(
        expect.objectContaining({
          resolverAddress: resolverAddress,
          configId: "1",
          configVersion: 1,
        }),
      );
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(Management.getConfigInfo(getConfigInfoRequest)).rejects.toThrow("Query execution failed");

      expect(handleValidationSpy).toHaveBeenCalledWith("GetConfigInfoRequest", getConfigInfoRequest);

      expect(queryBusMock.execute).toHaveBeenCalledWith(new GetConfigInfoQuery(getConfigInfoRequest.securityId));
    });

    it("should throw error if securityId is invalid", async () => {
      getConfigInfoRequest = new GetConfigInfoRequest({
        ...GetConfigInfoRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(Management.getConfigInfo(getConfigInfoRequest)).rejects.toThrow(ValidationError);
    });
  });
});
