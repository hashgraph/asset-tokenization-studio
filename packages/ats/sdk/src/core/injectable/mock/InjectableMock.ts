// SPDX-License-Identifier: Apache-2.0

import { TOKENS } from "../Tokens";
// eslint-disable-next-line jest/no-mocks-import
import { ConcreteCommandHandler } from "@test/integration/__mocks__/ConcreteCommandHandler";
// eslint-disable-next-line jest/no-mocks-import
import { ConcreteQueryHandler } from "@test/integration/__mocks__/ConcreteQueryHandler";

export const COMMAND_HANDLERS_MOCK = [
  {
    token: TOKENS.COMMAND_HANDLER,
    useClass: ConcreteCommandHandler,
  },
];

export const QUERY_HANDLERS_MOCK = [
  {
    token: TOKENS.QUERY_HANDLER,
    useClass: ConcreteQueryHandler,
  },
];
