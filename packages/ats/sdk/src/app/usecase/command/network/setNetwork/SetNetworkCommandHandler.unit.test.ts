// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import NetworkService from "@service/network/NetworkService";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import { SetNetworkCommandFixture } from "@test/fixtures/network/NetworkFixture";
import { SetNetworkCommandHandler } from "./SetNetworkCommandHandler";
import { SetNetworkCommand, SetNetworkCommandResponse } from "./SetNetworkCommand";
import { RPCQueryAdapter } from "@port/out/rpc/RPCQueryAdapter";
import Injectable from "@core/injectable/Injectable";
import { ErrorMsgFixture } from "@test/fixtures/shared/DataFixture";
import { SetNetworkCommandError } from "./error/SetNetworkCommandError";
import { ErrorCode } from "@core/error/BaseError";

describe("SetNetworkCommandHandler", () => {
  let handler: SetNetworkCommandHandler;
  let command: SetNetworkCommand;

  const networkServiceMock = createMock<NetworkService>();
  const mirrorNodeAdapterMock = createMock<MirrorNodeAdapter>();
  const queryAdapterMock = createMock<RPCQueryAdapter>();
  const errorMsg = ErrorMsgFixture.create().msg;

  beforeEach(() => {
    handler = new SetNetworkCommandHandler(networkServiceMock, mirrorNodeAdapterMock);
    command = SetNetworkCommandFixture.create();
    jest.spyOn(Injectable, "resolve").mockReturnValue(queryAdapterMock);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("execute", () => {
    describe("error cases", () => {
      it("throws SetNetworkCommandError when command fails with uncaught error", async () => {
        const fakeError = new Error(errorMsg);

        jest.spyOn(mirrorNodeAdapterMock, "set").mockImplementation(() => {
          throw fakeError;
        });

        const resultPromise = handler.execute(command);

        await expect(resultPromise).rejects.toBeInstanceOf(SetNetworkCommandError);

        await expect(resultPromise).rejects.toMatchObject({
          message: expect.stringContaining(`An error occurred while setting network: ${errorMsg}`),
          errorCode: ErrorCode.UncaughtCommandError,
        });
      });
    });
    describe("success cases", () => {
      it("should successfully set network", async () => {
        const result = await handler.execute(command);

        expect(result).toBeInstanceOf(SetNetworkCommandResponse);
        expect(result.environment).toEqual(command.environment);
        expect(result.mirrorNode).toEqual(command.mirrorNode);
        expect(result.rpcNode).toEqual(command.rpcNode);
        expect(result.consensusNodes).toEqual(command.consensusNodes);
      });
    });
  });
});
