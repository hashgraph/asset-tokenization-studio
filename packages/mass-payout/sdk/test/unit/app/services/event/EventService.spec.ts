// SPDX-License-Identifier: Apache-2.0

import EventService from "@app/services/event/EventService";
import { EventNotFound } from "@app/services/event/error/EventNotFound";
import { EventListenerNotFound } from "@app/services/event/error/EventListenerNotFound";
import WalletEvent, { WalletEvents } from "@app/services/event/WalletEvent";
import { SupportedWallets } from "@domain/network/Wallet";

describe("EventService", () => {
  let service: EventService;

  beforeEach(() => {
    service = new EventService();
  });

  it("should register all wallet events on construction", () => {
    const eventNames = service.eventNames();
    expect(eventNames).toEqual(Object.keys(WalletEvents));
  });

  it("should allow registering and emitting a valid event", () => {
    const mockListener = jest.fn();
    const eventName = Object.keys(WalletEvents)[0] as keyof WalletEvent;

    service.on(eventName, mockListener);
    service.emit(eventName, { wallet: SupportedWallets.DFNS });

    expect(mockListener).toHaveBeenCalledTimes(1);
    expect(mockListener).toHaveBeenCalledWith({ wallet: "DFNS" });
  });

  it("should throw EventNotFound when emitting unknown event", () => {
    // @ts-expect-error simulating invalid event
    expect(() => service.emit("nonExistingEvent")).toThrow(EventNotFound);
  });

  it("should throw EventListenerNotFound when registering listener for unknown event", () => {
    // @ts-expect-error simulating invalid event
    expect(() => service.on("nonExistingEvent", jest.fn())).toThrow(EventListenerNotFound);
  });

  it("should reuse the same EventEmitter instance for repeated event access", () => {
    const eventName = Object.keys(WalletEvents)[0] as keyof WalletEvent;
    const emitter1 = (service as any).getEventEmitter(eventName);
    const emitter2 = (service as any).getEventEmitter(eventName);

    expect(emitter1).toBe(emitter2);
  });
});
