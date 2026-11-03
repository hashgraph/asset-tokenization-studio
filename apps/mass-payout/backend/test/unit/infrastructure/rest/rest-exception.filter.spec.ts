// SPDX-License-Identifier: Apache-2.0

import {
  AssetHederaTokenAddressAlreadyExistsError,
  AssetInformationLookupLimitError,
  AssetNotFoundError,
  AssetPausedError,
} from "@domain/errors/asset.error";
import { BlockchainEventListenerMirrorNodeUrlNotAllowedError } from "@domain/errors/blockchain-event-error";
import { CustomError } from "@domain/errors/shared/custom.error";
import { RestExceptionFilter } from "@infrastructure/rest/rest-exception.filter";
import { ArgumentsHost, BadRequestException, HttpStatus, Logger } from "@nestjs/common";

const CONFLICT_MESSAGE = "The request conflicts with the current state of the resource";

describe(RestExceptionFilter.name, () => {
  const filter = new RestExceptionFilter();
  let response: { status: jest.Mock; json: jest.Mock };
  let host: ArgumentsHost;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);
    response = { status: jest.fn(), json: jest.fn() };
    response.status.mockReturnValue(response);
    host = { switchToHttp: () => ({ getResponse: () => response }) } as unknown as ArgumentsHost;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const sentBody = () => response.json.mock.calls[0][0];

  it.each([
    [new AssetNotFoundError("0.0.98765"), HttpStatus.NOT_FOUND, "Resource not found", "0.0.98765"],
    [new AssetHederaTokenAddressAlreadyExistsError("0.0.4242"), HttpStatus.CONFLICT, CONFLICT_MESSAGE, "0.0.4242"],
    [new AssetPausedError("Secret Bond", "0.0.777"), HttpStatus.CONFLICT, CONFLICT_MESSAGE, "Secret Bond"],
    [
      new BlockchainEventListenerMirrorNodeUrlNotAllowedError("host not allowed"),
      HttpStatus.BAD_REQUEST,
      "Invalid request",
      "host",
    ],
    [
      new AssetInformationLookupLimitError(10),
      HttpStatus.TOO_MANY_REQUESTS,
      "Too many requests, try again later",
      "limit 10",
    ],
  ])("returns a generic body for %s", (error, status, message, leakedValue) => {
    filter.catch(error, host);

    expect(response.status).toHaveBeenCalledWith(status);
    const body = sentBody();
    expect(body.statusCode).toBe(status);
    expect(body.error).toBe(error.name);
    expect(body.message).toBe(message);
    expect(body).not.toHaveProperty("cause");
    expect(JSON.stringify(body)).not.toContain(leakedValue);
  });

  it("still logs the detailed message server-side", () => {
    const errorSpy = jest.spyOn(Logger.prototype, "error").mockImplementation(() => undefined);

    filter.catch(new AssetNotFoundError("0.0.98765"), host);

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining("0.0.98765"),
      expect.anything(),
      "AssetNotFoundError",
    );
  });

  it("unwraps a wrapped domain error to its status", () => {
    filter.catch(new CustomError("wrapper", new AssetNotFoundError("0.0.1")), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
  });

  it("masks unexpected errors as 500", () => {
    filter.catch(new Error("db password is hunter2"), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(sentBody()).toEqual({ statusCode: HttpStatus.INTERNAL_SERVER_ERROR, message: "Internal server error" });
  });

  it("keeps request validation messages so clients can fix their input", () => {
    filter.catch(new BadRequestException(["limit must not be greater than 1000"]), host);

    expect(response.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(sentBody().message).toBe("limit must not be greater than 1000");
  });
});
