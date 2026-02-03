// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import { ActionContentHashExistsRequest } from "../../request";
import LogService from "@service/log/LogService";
import { QueryBus } from "@core/query/QueryBus";
import ValidatedRequest from "@core/validation/ValidatedArgs";
import { ValidationError } from "@core/validation/ValidationError";
import CorporateActions from "./CorporateActions";

import { ActionContentHashExistsRequestFixture } from "@test/fixtures/corporateActions/CorporateActionsFixture";
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
});
