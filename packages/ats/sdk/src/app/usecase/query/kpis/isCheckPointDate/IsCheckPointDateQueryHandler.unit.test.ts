// SPDX-License-Identifier: Apache-2.0
import { createMock } from "@golevelup/ts-jest";
import { ErrorMsgFixture, EvmAddressPropsFixture } from "@test/fixtures/shared/DataFixture";
import { ErrorCode } from "@core/error/BaseError";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import EvmAddress from "@domain/context/contract/EvmAddress";
import ContractService from "@service/contract/ContractService";
import { IsCheckPointDateQueryHandler } from "./IsCheckPointDateQueryHandler";
import { IsCheckPointDateQuery, IsCheckPointDateQueryResponse } from "./IsCheckPointDateQuery";
import { IsCheckPointDateQueryError } from "./error/IsCheckPointDateQueryError";

describe("IsCheckPointDateQueryHandler", () => {
  let handler: IsCheckPointDateQueryHandler;
  let query: IsCheckPointDateQuery;
  const queryAdapterServiceMock = createMock<RPCQueryAdapter>();
  const contractServiceMock = createMock<ContractService>();
  const evmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const projectEvmAddress = new EvmAddress(EvmAddressPropsFixture.create().value);
  const errorMsg = ErrorMsgFixture.create().msg;
  const testDate = BigInt(1234567890);
  const testProject = "project-123";

  beforeEach(() => {
    handler = new IsCheckPointDateQueryHandler(queryAdapterServiceMock, contractServiceMock);
    query = new IsCheckPointDateQuery("security-123", testDate, testProject);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    it("throws IsCheckPointDateQueryError when query fails with uncaught error", async () => {
      const fakeError = new Error(errorMsg);
      contractServiceMock.getContractEvmAddress.mockRejectedValue(fakeError);

      const resultPromise = handler.execute(query);

      await expect(resultPromise).rejects.toBeInstanceOf(IsCheckPointDateQueryError);
      await expect(resultPromise).rejects.toMatchObject({
        message: expect.stringContaining(`An error occurred while querying checkpoint date: ${errorMsg}`),
        errorCode: ErrorCode.UncaughtQueryError,
      });
    });

    it("should successfully check if date is checkpoint date", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(projectEvmAddress);
      queryAdapterServiceMock.isCheckPointDate.mockResolvedValue(true);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(IsCheckPointDateQueryResponse);
      expect(result.isCheckPoint).toBe(true);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledTimes(2);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.securityId);
      expect(contractServiceMock.getContractEvmAddress).toHaveBeenCalledWith(query.project);
      expect(queryAdapterServiceMock.isCheckPointDate).toHaveBeenCalledWith(evmAddress, testDate, projectEvmAddress);
    });

    it("should successfully return false when date is not checkpoint date", async () => {
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(evmAddress);
      contractServiceMock.getContractEvmAddress.mockResolvedValueOnce(projectEvmAddress);
      queryAdapterServiceMock.isCheckPointDate.mockResolvedValue(false);

      const result = await handler.execute(query);

      expect(result).toBeInstanceOf(IsCheckPointDateQueryResponse);
      expect(result.isCheckPoint).toBe(false);
    });
  });
});
