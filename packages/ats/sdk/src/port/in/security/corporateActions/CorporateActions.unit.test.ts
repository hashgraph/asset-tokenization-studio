// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import {
  ActionContentHashExistsRequest,
  GetCorporateActionRequest,
  GetCorporateActionsRequest,
  GetCorporateActionsByTypeRequest,
} from "../../request";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import CorporateActions from "./CorporateActions";

import {
  ActionContentHashExistsRequestFixture,
  GetCorporateActionRequestFixture,
  GetCorporateActionResponseFixture,
  GetCorporateActionsRequestFixture,
  GetCorporateActionsResponseFixture,
  GetCorporateActionsByTypeRequestFixture,
} from "@test/fixtures/corporateActions/CorporateActionsFixture";
import { ActionContentHashExistsQuery } from "@query/security/actionContentHashExists/ActionContentHashExistsQuery";

describe("Corporate Actions", () => {
  let queryBusMock: jest.Mocked<QueryBus>;

  let actionContentHashExistsRequest: ActionContentHashExistsRequest;

  let handleValidationSpy: jest.SpyInstance;

  beforeEach(() => {
    queryBusMock = createMock<QueryBus>();

    handleValidationSpy = jest.spyOn(ValidatedRequest, "handleValidation");
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
    (CorporateActions as any).queryBus = queryBusMock;
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("ActionContentHashExists", () => {
    actionContentHashExistsRequest = new ActionContentHashExistsRequest(ActionContentHashExistsRequestFixture.create());

    const expectedResponse = {
      payload: true,
    };
    it("should check action content hash exist successfully", async () => {
      queryBusMock.execute.mockResolvedValue(expectedResponse);

      const result = await CorporateActions.actionContentHashExists(actionContentHashExistsRequest);

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ActionContentHashExistsRequest",
        actionContentHashExistsRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new ActionContentHashExistsQuery(
          actionContentHashExistsRequest.securityId,
          actionContentHashExistsRequest.contentHash,
        ),
      );
      expect(result).toEqual(expectedResponse.payload);
    });

    it("should throw an error if query execution fails", async () => {
      const error = new Error("Query execution failed");
      queryBusMock.execute.mockRejectedValue(error);

      await expect(CorporateActions.actionContentHashExists(actionContentHashExistsRequest)).rejects.toThrow(
        "Query execution failed",
      );

      expect(handleValidationSpy).toHaveBeenCalledWith(
        "ActionContentHashExistsRequest",
        actionContentHashExistsRequest,
      );

      expect(queryBusMock.execute).toHaveBeenCalledWith(
        new ActionContentHashExistsQuery(
          actionContentHashExistsRequest.securityId,
          actionContentHashExistsRequest.contentHash,
        ),
      );
    });

    it("should throw error if securityId is invalid", async () => {
      actionContentHashExistsRequest = new ActionContentHashExistsRequest({
        ...ActionContentHashExistsRequestFixture.create({
          securityId: "invalid",
        }),
      });

      await expect(CorporateActions.actionContentHashExists(actionContentHashExistsRequest)).rejects.toThrow(
        ValidationError,
      );
    });
    it("should throw error if content hash is invalid", async () => {
      actionContentHashExistsRequest = new ActionContentHashExistsRequest({
        ...ActionContentHashExistsRequestFixture.create({
          contentHash: "invalid",
        }),
      });

      await expect(CorporateActions.actionContentHashExists(actionContentHashExistsRequest)).rejects.toThrow(
        ValidationError,
      );
    });
  });

  describe("getCorporateAction", () => {
    it("should get corporate action successfully", async () => {
      const fixtureData = GetCorporateActionRequestFixture.create();
      const request = new GetCorporateActionRequest({
        securityId: fixtureData.securityId,
        corporateActionId: fixtureData.corporateActionId,
      });
      const expectedResponse = GetCorporateActionResponseFixture.create();

      queryBusMock.execute.mockResolvedValue({ payload: expectedResponse });

      const result = await CorporateActions.getCorporateAction(request);

      expect(result).toEqual(expectedResponse);
      expect(result.actionType).toBe(expectedResponse.actionType);
      expect(result.actionTypeId).toBe(expectedResponse.actionTypeId);
      expect(result.data).toBe(expectedResponse.data);
      expect(result.isDisabled).toBe(expectedResponse.isDisabled);
    });

    it("should throw ValidationError for invalid securityId", async () => {
      const invalidRequest = new GetCorporateActionRequest({
        securityId: "invalid-id",
        corporateActionId: "0x" + "a".repeat(64),
      });

      await expect(CorporateActions.getCorporateAction(invalidRequest)).rejects.toThrow();
    });

    it("should throw ValidationError for invalid corporateActionId", async () => {
      const invalidRequest = new GetCorporateActionRequest({
        securityId: "0.0.12345",
        corporateActionId: "invalid-bytes32",
      });

      await expect(CorporateActions.getCorporateAction(invalidRequest)).rejects.toThrow();
    });
  });

  describe("getCorporateActions", () => {
    it("should get corporate actions successfully", async () => {
      const fixtureData = GetCorporateActionsRequestFixture.create();
      const request = new GetCorporateActionsRequest({
        securityId: fixtureData.securityId,
        pageIndex: fixtureData.pageIndex,
        pageLength: fixtureData.pageLength,
      });
      const expectedResponse = GetCorporateActionsResponseFixture.create();

      queryBusMock.execute.mockResolvedValue({ payload: expectedResponse });

      const result = await CorporateActions.getCorporateActions(request);

      expect(result).toEqual(expectedResponse);
      expect(result.actionTypes).toEqual(expectedResponse.actionTypes);
      expect(result.actionTypeIds).toEqual(expectedResponse.actionTypeIds);
      expect(result.datas).toEqual(expectedResponse.datas);
      expect(result.isDisabled).toEqual(expectedResponse.isDisabled);
    });

    it("should throw ValidationError for invalid securityId", async () => {
      const invalidRequest = new GetCorporateActionsRequest({
        securityId: "invalid-id",
        pageIndex: 0,
        pageLength: 10,
      });

      await expect(CorporateActions.getCorporateActions(invalidRequest)).rejects.toThrow();
    });

    it("should throw ValidationError for invalid pageIndex", async () => {
      const invalidRequest = new GetCorporateActionsRequest({
        securityId: "0.0.12345",
        pageIndex: -1,
        pageLength: 10,
      });

      await expect(CorporateActions.getCorporateActions(invalidRequest)).rejects.toThrow();
    });

    it("should throw ValidationError for invalid pageLength", async () => {
      const invalidRequest = new GetCorporateActionsRequest({
        securityId: "0.0.12345",
        pageIndex: 0,
        pageLength: 0,
      });

      await expect(CorporateActions.getCorporateActions(invalidRequest)).rejects.toThrow();
    });
  });

  describe("getCorporateActionsByType", () => {
    it("should get corporate actions by type successfully", async () => {
      const fixtureData = GetCorporateActionsByTypeRequestFixture.create();
      const request = new GetCorporateActionsByTypeRequest({
        securityId: fixtureData.securityId,
        actionType: fixtureData.actionType,
        pageIndex: fixtureData.pageIndex,
        pageLength: fixtureData.pageLength,
      });
      const expectedResponse = GetCorporateActionsResponseFixture.create();

      queryBusMock.execute.mockResolvedValue({ payload: expectedResponse });

      const result = await CorporateActions.getCorporateActionsByType(request);

      expect(result).toEqual(expectedResponse);
      expect(result.actionTypes).toEqual(expectedResponse.actionTypes);
      expect(result.actionTypeIds).toEqual(expectedResponse.actionTypeIds);
      expect(result.datas).toEqual(expectedResponse.datas);
      expect(result.isDisabled).toEqual(expectedResponse.isDisabled);
    });

    it("should throw ValidationError for invalid securityId", async () => {
      const invalidRequest = new GetCorporateActionsByTypeRequest({
        securityId: "invalid-id",
        actionType: "0x" + "a".repeat(64),
        pageIndex: 0,
        pageLength: 10,
      });

      await expect(CorporateActions.getCorporateActionsByType(invalidRequest)).rejects.toThrow();
    });

    it("should throw ValidationError for invalid actionType", async () => {
      const invalidRequest = new GetCorporateActionsByTypeRequest({
        securityId: "0.0.12345",
        actionType: "invalid-bytes32",
        pageIndex: 0,
        pageLength: 10,
      });

      await expect(CorporateActions.getCorporateActionsByType(invalidRequest)).rejects.toThrow();
    });

    it("should throw ValidationError for invalid pageIndex", async () => {
      const invalidRequest = new GetCorporateActionsByTypeRequest({
        securityId: "0.0.12345",
        actionType: "0x" + "a".repeat(64),
        pageIndex: -1,
        pageLength: 10,
      });

      await expect(CorporateActions.getCorporateActionsByType(invalidRequest)).rejects.toThrow();
    });

    it("should throw ValidationError for invalid pageLength", async () => {
      const invalidRequest = new GetCorporateActionsByTypeRequest({
        securityId: "0.0.12345",
        actionType: "0x" + "a".repeat(64),
        pageIndex: 0,
        pageLength: 0,
      });

      await expect(CorporateActions.getCorporateActionsByType(invalidRequest)).rejects.toThrow();
    });
  });
});
