// SPDX-License-Identifier: Apache-2.0

import { CommandBus } from "@core/command/CommandBus";
import { QueryBus } from "@core/query/QueryBus";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";

export abstract class BaseSecurityInPort {
  protected commandBus!: CommandBus;
  protected queryBus!: QueryBus;
  protected mirrorNode!: MirrorNodeAdapter;
}
