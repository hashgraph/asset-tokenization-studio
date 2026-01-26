// SPDX-License-Identifier: Apache-2.0

import EventService from "./EventService";
import { EventNotFound } from "./error/EventNotFound";
import WalletEvent, { WalletEvents } from "./WalletEvent";
import { EventListenerNotFound } from "./error/EventListenerNotFound";

describe("EventService", () => {
  let eventService: EventService;

  beforeEach(() => {
    jest.clearAllMocks();
    eventService = new EventService(WalletEvents);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("constructor and registerEvents", () => {
    it("should initialize with registered events", () => {
      expect(eventService.eventNames()).toEqual(Object.keys(WalletEvents));
    });
  });

  describe("getEventEmitter", () => {
    it("should throw EventNotFound for an unregistered event", () => {
      expect(() => (eventService as any).getEventEmitter("invalidEvent")).toThrow(EventNotFound);
      expect(() => (eventService as any).getEventEmitter("invalidEvent")).toThrow(
        "WalletEvent (invalidEvent) not registered yet",
      );
    });
  });

  describe("on", () => {
    it("should throw EventListenerNotFound for an unregistered event", () => {
      const listener = jest.fn();
      const invalidEvent = "invalidEvent" as keyof WalletEvent;

      expect(() => eventService.on(invalidEvent, listener)).toThrow(EventListenerNotFound);
      expect(() => eventService.on(invalidEvent, listener)).toThrow(invalidEvent);
    });
  });

  describe("emit", () => {
    it("should throw EventNotFound for an unregistered event", () => {
      const invalidEvent = "invalidEvent" as keyof WalletEvent;
      const data = {} as any;

      expect(() => eventService.emit(invalidEvent, data)).toThrow(EventNotFound);
      expect(() => eventService.emit(invalidEvent, data)).toThrow(`WalletEvent (${invalidEvent}) not registered yet`);
    });
  });

  describe("eventNames", () => {
    it("should return all registered event names", () => {
      const result = eventService.eventNames();

      expect(result).toEqual(Object.keys(WalletEvents));
      expect(result).toContain(WalletEvents.walletInit);
      expect(result).toContain(WalletEvents.walletPaired);
    });
  });
});
