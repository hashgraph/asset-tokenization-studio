// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
import { ConnectCommandHandler } from "@command/network/connect/ConnectCommandHandler";
import { DisconnectCommandHandler } from "@command/network/disconnect/DisconnectCommandHandler";
import { SetNetworkCommandHandler } from "@command/network/setNetwork/SetNetworkCommandHandler";
import { SetConfigurationCommandHandler } from "@command/network/setConfiguration/SetConfigurationCommandHandler";

export const COMMAND_HANDLERS_NETWORK = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ConnectCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: DisconnectCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetNetworkCommandHandler,
  },
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: SetConfigurationCommandHandler,
  },
];
