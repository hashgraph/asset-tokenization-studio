// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
import Injectable from "@core/injectable/Injectable";
import NetworkService from "@service/network/NetworkService";
import WalletEvent, { ConnectionState, WalletEvents } from "@service/event/WalletEvent";
import EventService from "@service/event/EventService";
import { LogError } from "@core/decorator/LogErrorDecorator";

export { WalletEvent, WalletEvents, ConnectionState };

export type EventParameter<T extends keyof WalletEvent> = Parameters<WalletEvent[T]>[0];

interface EventInPortBase {
  register(events: Partial<WalletEvent>): void;
}

class EventInPort implements EventInPortBase {
  constructor(
    private readonly networkService: NetworkService = Injectable.resolve<NetworkService>(NetworkService),
    private readonly eventService: EventService = Injectable.resolve(EventService),
  ) {}

  @LogError
  register(events: Partial<WalletEvent>): void {
    Object.entries(events).map(([name, cll]) => {
      if (name in WalletEvents) {
        this.eventService.on(name as keyof WalletEvent, cll);
      }
    });
  }
}

const Event = new EventInPort();
export default Event;
