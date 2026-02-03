// SPDX-License-Identifier: Apache-2.0

import { Event } from "@port/in/event/Event";
import NetworkService from "@app/services/network/NetworkService";
import EventService from "@app/services/event/EventService";
import { WalletEvents } from "@app/services/event/WalletEvent";

describe("Event", () => {
  let networkService: jest.Mocked<NetworkService>;
  let eventService: jest.Mocked<EventService>;
  let event: Event;

  beforeEach(() => {
    networkService = {} as jest.Mocked<NetworkService>;
    eventService = {
      on: jest.fn(),
    } as any;

    event = new Event(networkService, eventService);
  });

  it("should register valid events with EventService", () => {
    const mockCallback = jest.fn();

    const events = {
      [WalletEvents.walletInit]: mockCallback,
      [WalletEvents.walletFound]: mockCallback,
      [WalletEvents.walletPaired]: mockCallback,
      [WalletEvents.walletConnectionStatusChanged]: mockCallback,
      [WalletEvents.walletAcknowledgeMessage]: mockCallback,
      [WalletEvents.walletDisconnect]: mockCallback,
    };

    event.register(events);

    expect(eventService.on).toHaveBeenCalledWith(WalletEvents.walletInit, mockCallback);
    expect(eventService.on).toHaveBeenCalledWith(WalletEvents.walletFound, mockCallback);
    expect(eventService.on).toHaveBeenCalledWith(WalletEvents.walletPaired, mockCallback);
    expect(eventService.on).toHaveBeenCalledWith(WalletEvents.walletConnectionStatusChanged, mockCallback);
    expect(eventService.on).toHaveBeenCalledWith(WalletEvents.walletAcknowledgeMessage, mockCallback);
    expect(eventService.on).toHaveBeenCalledWith(WalletEvents.walletDisconnect, mockCallback);
  });

  it("should ignore invalid event names", () => {
    const mockCallback = jest.fn();

    const events = {
      fakeEvent: mockCallback,
    } as any;

    event.register(events);

    expect(eventService.on).not.toHaveBeenCalled();
  });

  it("should handle an empty events object without errors", () => {
    event.register({});

    expect(eventService.on).not.toHaveBeenCalled();
  });
});
