// SPDX-License-Identifier: Apache-2.0

import { createMock } from "@golevelup/ts-jest";
import EventInPort from "./Event";
import NetworkService from "@service/network/NetworkService";
import WalletEvent, { WalletEvents } from "@service/event/WalletEvent";
import LogService from "@service/log/LogService";

interface MockEventService {
  on: <T extends keyof WalletEvent>(event: T, callback: WalletEvent[T]) => Promise<void>;
}

describe("Event", () => {
  let networkServiceMock: jest.Mocked<NetworkService>;
  let eventServiceMock: jest.Mocked<MockEventService>;

  beforeEach(() => {
    networkServiceMock = createMock<NetworkService>();
    eventServiceMock = createMock<MockEventService>({
      on: jest.fn().mockResolvedValue(undefined),
    });
    (EventInPort as any).networkService = networkServiceMock;
    (EventInPort as any).eventService = eventServiceMock;
    jest.spyOn(LogService, "logError").mockImplementation(() => {});
  });

  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });

  describe("register", () => {
    it("should register events with eventService", async () => {
      const mockCallback = jest.fn();
      const events: Partial<WalletEvent> = {
        [WalletEvents.walletInit]: mockCallback,
      };

      EventInPort.register(events);

      expect(eventServiceMock.on).toHaveBeenCalledWith(WalletEvents.walletInit, mockCallback);
      expect(eventServiceMock.on).toHaveBeenCalledTimes(1);
    });

    it("should ignore events not in WalletEvents", async () => {
      const mockCallback = jest.fn();
      const events = {
        invalidEvent: mockCallback,
      } as unknown as Partial<WalletEvent>;

      EventInPort.register(events);

      expect(eventServiceMock.on).not.toHaveBeenCalled();
    });
  });
});
