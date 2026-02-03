// SPDX-License-Identifier: Apache-2.0

import { COMMAND_HANDLER_METADATA, COMMAND_METADATA } from "@core/Constants";
import { v4 } from "uuid";
import { BaseCommand } from "@core/command/Command";
import { injectable } from "tsyringe";
import { Constructor } from "@core/Type";

/**
 * This decorator determines that a class is a command handler
 *
 * The decorated class must implement the `CommandHandler` interface.
 *
 * @param command command *type* to be handled by this handler.
 */
export const CommandHandler = (command: BaseCommand): ClassDecorator => {
  return (target: object) => {
    const tgt = target as Constructor<typeof target>;
    injectable()(tgt);
    const id = v4();
    if (!Reflect.hasMetadata(COMMAND_METADATA, command)) {
      Reflect.defineMetadata(COMMAND_METADATA, { id }, command);
    }
    Reflect.defineMetadata(COMMAND_HANDLER_METADATA, command, target);
  };
};
