// SPDX-License-Identifier: Apache-2.0

/* eslint-disable @typescript-eslint/no-unused-vars */
import { Injectable } from "@nestjs/common";
import NetworkService from "@app/services/network/NetworkService";
import WalletEvent, { ConnectionState, WalletEvents } from "@app/services/event/WalletEvent";
import EventService from "@app/services/event/EventService";
import { LogError } from "@core/decorator/LogErrorDecorator";

export { WalletEvent, WalletEvents, ConnectionState };

export type EventParameter<T extends keyof WalletEvent> = Parameters<WalletEvent[T]>[0];

interface EventInPortBase {
  register(events: Partial<WalletEvent>): void;
}

@Injectable()
export class Event implements EventInPortBase {
  constructor(
    private readonly networkService: NetworkService,
    private readonly eventService: EventService,
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
