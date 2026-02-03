// SPDX-License-Identifier: Apache-2.0
import SecurityViewModel from "../response/SecurityViewModel";
import { MirrorNodeAdapter } from "@port/out/mirror/MirrorNodeAdapter";
import Injectable from "@core/injectable/Injectable";
import { QueryBus } from "@core/query/QueryBus";
import { CommandBus } from "@core/command/CommandBus";
import { SecurityControlListType } from "@domain/context/security/SecurityControlListType";
import { ISecurityInPortAgent, SecurityInPortAgent } from "./agent/Agent";
import { ISecurityInPortPause, SecurityInPortPause } from "./pause/Pause";
import { ISecurityInPortControlList, SecurityInPortControlList } from "./controlList/ControlList";
import { ISecurityInPortBalance, SecurityInPortBalance } from "./balance/Balance";
import { ISecurityInPortLock, SecurityInPortLock } from "./lock/Lock";
import { applyMixins } from "../utils";
import { ISecurityInPortClearing, SecurityInPortClearing } from "./clearing/Clearing";
import { ISecurityInPortCompliance, SecurityInPortCompliance } from "./compliance/Compliance";
import { ISecurityInPortFreeze, SecurityInPortFreeze } from "./freeze/Freeze";
import { ISecurityInPortHold, SecurityInPortHold } from "./hold/Hold";
import { ISecurityInPortIdentity, SecurityInPortIdentity } from "./identity/Identity";
import { ISecurityInPortInfo, SecurityInPortInfo } from "./info/Info";
import { ISecurityInPortIssue, SecurityInPortIssue } from "./issue/Issue";
import {
  ISecurityInPortProtectedPartitions,
  SecurityInPortProtectedPartitions,
} from "./protectedPartitions/ProtectedPartitions";
import { ISecurityInPortRecovery, SecurityInPortRecovery } from "./recovery/Recovery";
import { ISecurityInPortRedeem, SecurityInPortRedeem } from "./redeem/Redeem";
import { ISecurityInPortSupply, SecurityInPortSupply } from "./supply/Supply";
import { ISecurityInPortTokenMetadata, SecurityInPortTokenMetadata } from "./tokenMetadata/TokenMetadata";
import { ISecurityInPortTransfer, SecurityInPortTransfer } from "./transfer/Transfer";
import { BaseSecurityInPort } from "./BaseSecurityInPort";
import { ISecurityInPortSnapshot, SecurityInPortSnapshot } from "./snapshot/Snapshot";

export { SecurityViewModel, SecurityControlListType };

/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging, no-redeclare */
interface SecurityInPort
  extends ISecurityInPortAgent,
    ISecurityInPortBalance,
    ISecurityInPortClearing,
    ISecurityInPortCompliance,
    ISecurityInPortControlList,
    ISecurityInPortFreeze,
    ISecurityInPortHold,
    ISecurityInPortIdentity,
    ISecurityInPortInfo,
    ISecurityInPortIssue,
    ISecurityInPortLock,
    ISecurityInPortPause,
    ISecurityInPortProtectedPartitions,
    ISecurityInPortRecovery,
    ISecurityInPortRedeem,
    ISecurityInPortSupply,
    ISecurityInPortTokenMetadata,
    ISecurityInPortTransfer,
    ISecurityInPortSnapshot {}

class SecurityInPort extends BaseSecurityInPort {
  constructor(
    queryBus: QueryBus = Injectable.resolve(QueryBus),
    commandBus: CommandBus = Injectable.resolve(CommandBus),
    mirrorNode: MirrorNodeAdapter = Injectable.resolve(MirrorNodeAdapter),
  ) {
    super();
    this.queryBus = queryBus;
    this.commandBus = commandBus;
    this.mirrorNode = mirrorNode;
  }
}

applyMixins(SecurityInPort, [
  SecurityInPortAgent,
  SecurityInPortBalance,
  SecurityInPortClearing,
  SecurityInPortCompliance,
  SecurityInPortControlList,
  SecurityInPortFreeze,
  SecurityInPortHold,
  SecurityInPortIdentity,
  SecurityInPortInfo,
  SecurityInPortIssue,
  SecurityInPortLock,
  SecurityInPortPause,
  SecurityInPortProtectedPartitions,
  SecurityInPortRecovery,
  SecurityInPortRedeem,
  SecurityInPortSupply,
  SecurityInPortTokenMetadata,
  SecurityInPortTransfer,
  SecurityInPortSnapshot,
]);

export default new SecurityInPort();
