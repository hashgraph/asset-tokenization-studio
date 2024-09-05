/*
 *
 * Hedera Asset Tokenization Studio SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import SecurityViewModel from './response/SecurityViewModel.js';
import { handleValidation } from './Common.js';
import { MirrorNodeAdapter } from '../out/mirror/MirrorNodeAdapter.js';
import Injectable from '../../core/Injectable.js';
import { QueryBus } from '../../core/query/QueryBus.js';
import { CommandBus } from '../../core/command/CommandBus.js';
import { LogError } from '../../core/decorator/LogErrorDecorator.js';
import { GetSecurityQuery } from '../../app/usecase/query/security/get/GetSecurityQuery.js';
import PauseRequest from './request/PauseRequest.js';
import ControlListRequest from './request/ControlListRequest.js';
import RedeemRequest from './request/RedeemRequest.js';
import IssueRequest from './request/IssueRequest.js';
import { AddToControlListCommand } from '../../app/usecase/command/security/operations/AddToControlList/AddToControlListCommand.js';
import { UnpauseCommand } from '../../app/usecase/command/security/operations/unpause/UnpauseCommand.js';
import { PauseCommand } from '../../app/usecase/command/security/operations/pause/PauseCommand.js';
import { SetMaxSupplyCommand } from '../../app/usecase/command/security/operations/cap/SetMaxSupplyCommand.js';
import { GetMaxSupplyQuery } from '../../app/usecase/query/security/cap/GetMaxSupplyQuery.js';
import { RemoveFromControlListCommand } from '../../app/usecase/command/security/operations/removeFromControlList/RemoveFromControlListCommand.js';
import GetControlListCountRequest from './request/GetControlListCountRequest.js';
import GetControlListMembersRequest from './request/GetControlListMembersRequest.js';
import GetAccountBalanceRequest from './request/GetAccountBalanceRequest.js';
import BalanceViewModel from './response/BalanceViewModel.js';
import TransferRequest from './request/TransferRequest.js';
import TransferAndLockRequest from './request/TransferAndLockRequest.js';
import ForceTransferRequest from './request/ForceTransferRequest.js';
import ForceRedeemRequest from './request/ForceRedeemRequest.js';
import { IssueCommand } from '../../app/usecase/command/security/operations/issue/IssueCommand.js';
import { RedeemCommand } from '../../app/usecase/command/security/operations/redeem/RedeemCommand.js';
import { ControllerRedeemCommand } from '../../app/usecase/command/security/operations/redeem/ControllerRedeemCommand.js';
import { TransferCommand } from '../../app/usecase/command/security/operations/transfer/TransferCommand.js';
import { TransferAndLockCommand } from '../../app/usecase/command/security/operations/transfer/TransferAndLockCommand.js';
import { ControllerTransferCommand } from '../../app/usecase/command/security/operations/transfer/ControllerTransferCommand.js';
import { GetControlListCountQuery } from '../../app/usecase/query/security/controlList/getControlListCount/GetControlListCountQuery.js';
import { GetControlListMembersQuery } from '../../app/usecase/query/security/controlList/getControlListMembers/GetControlListMembersQuery.js';
import { BalanceOfQuery } from '../../app/usecase/query/security/balanceof/BalanceOfQuery.js';
import { IsPausedQuery } from '../../app/usecase/query/security/isPaused/IsPausedQuery.js';
import { IsInControlListQuery } from '../../app/usecase/query/account/controlList/IsInControlListQuery.js';
import { SecurityControlListType } from '../../domain/context/security/SecurityControlListType.js';
import GetControlListTypeRequest from './request/GetControlListTypeRequest.js';
import { GetControlListTypeQuery } from '../../app/usecase/query/security/controlList/getControlListType/GetControlListTypeQuery.js';
import GetMaxSupplyRequest from './request/GetMaxSupplyRequest.js';
import SetMaxSupplyRequest from './request/SetMaxSupplyRequest.js';
import MaxSupplyViewModel from './response/MaxSupplyViewModel.js';
import LockRequest from './request/LockRequest.js';
import ReleaseRequest from './request/ReleaseRequest.js';
import GetLockCountRequest from './request/GetLockCountRequest.js';
import GetLockRequest from './request/GetLockRequest.js';
import GetLockedBalanceRequest from './request/GetLockedBalanceRequest.js';
import GetLocksIdRequest from './request/GetLocksIdRequest.js';
import GetSecurityDetailsRequest from './request/GetSecurityDetailsRequest.js';
import { LockCommand } from '../../app/usecase/command/security/operations/lock/LockCommand.js';
import { ReleaseCommand } from '../../app/usecase/command/security/operations/release/ReleaseCommand.js';
import { LockedBalanceOfQuery } from '../../app/usecase/query/security/lockedBalanceOf/LockedBalanceOfQuery.js';
import { LockCountQuery } from '../../app/usecase/query/security/lockCount/LockCountQuery.js';
import { LocksIdQuery } from '../../app/usecase/query/security/locksId/LocksIdQuery.js';
import { GetLockQuery } from '../../app/usecase/query/security/getLock/GetLockQuery.js';
import LockViewModel from './response/LockViewModel.js';

export { SecurityViewModel, SecurityControlListType };

interface ISecurityInPort {
  getInfo(request: GetSecurityDetailsRequest): Promise<SecurityViewModel>;
  issue(
    request: IssueRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  redeem(
    request: RedeemRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  controllerRedeem(
    request: ForceRedeemRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  pause(
    request: PauseRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  unpause(
    request: PauseRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  isPaused(request: PauseRequest): Promise<boolean>;
  addToControlList(
    request: ControlListRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  removeFromControlList(
    request: ControlListRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  isAccountInControlList(request: ControlListRequest): Promise<boolean>;
  getControlListCount(request: GetControlListCountRequest): Promise<number>;
  getControlListMembers(
    request: GetControlListMembersRequest,
  ): Promise<string[]>;
  getControlListType(
    request: GetControlListTypeRequest,
  ): Promise<SecurityControlListType>;
  getBalanceOf(request: GetAccountBalanceRequest): Promise<BalanceViewModel>;
  transfer(
    request: TransferRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  transferAndLock(
    request: TransferAndLockRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  controllerTransfer(
    request: ForceTransferRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  setMaxSupply(
    request: SetMaxSupplyRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  getMaxSupply(request: GetMaxSupplyRequest): Promise<MaxSupplyViewModel>;
  lock(
    request: LockRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  release(
    request: ReleaseRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  getLockedBalanceOf(
    request: GetLockedBalanceRequest,
  ): Promise<BalanceViewModel>;
}

class SecurityInPort implements ISecurityInPort {
  constructor(
    private readonly queryBus: QueryBus = Injectable.resolve(QueryBus),
    private readonly commandBus: CommandBus = Injectable.resolve(CommandBus),
    private readonly mirrorNode: MirrorNodeAdapter = Injectable.resolve(
      MirrorNodeAdapter,
    ),
  ) {}

  @LogError
  async lock(
    request: LockRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amount, targetId, expirationTimestamp } = request;
    handleValidation('LockRequest', request);

    return await this.commandBus.execute(
      new LockCommand(amount, targetId, securityId, expirationTimestamp),
    );
  }

  @LogError
  async release(
    request: ReleaseRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, lockId, targetId } = request;
    handleValidation('ReleaseRequest', request);

    return await this.commandBus.execute(
      new ReleaseCommand(lockId, targetId, securityId),
    );
  }

  @LogError
  async getLockedBalanceOf(
    request: GetLockedBalanceRequest,
  ): Promise<BalanceViewModel> {
    handleValidation('GetLockedBalanceRequest', request);

    const res = await this.queryBus.execute(
      new LockedBalanceOfQuery(request.securityId, request.targetId),
    );

    const balance: BalanceViewModel = { value: res.payload.toString() };

    return balance;
  }

  @LogError
  async getLockCount(request: GetLockCountRequest): Promise<number> {
    handleValidation('GetLockCountRequest', request);

    return (
      await this.queryBus.execute(
        new LockCountQuery(request.securityId, request.targetId),
      )
    ).payload;
  }

  @LogError
  async getLocksId(request: GetLocksIdRequest): Promise<string[]> {
    handleValidation('GetLocksIdRequest', request);

    const lockIds: string[] = [];

    const res = (
      await this.queryBus.execute(
        new LocksIdQuery(
          request.securityId,
          request.targetId,
          request.start,
          request.end,
        ),
      )
    ).payload;

    for (let i = 0; i < res.length; i++) {
      lockIds.push(res.toString());
    }

    return lockIds;
  }

  @LogError
  async getLock(request: GetLockRequest): Promise<LockViewModel> {
    handleValidation('GetLockRequest', request);

    const res = (
      await this.queryBus.execute(
        new GetLockQuery(request.securityId, request.targetId, request.id),
      )
    ).payload;

    const lock: LockViewModel = {
      id: res.id,
      amount: res.amount.toString(),
      expirationDate: res.expiredTimestamp.toString(),
    };

    return lock;
  }

  @LogError
  async getInfo(
    request: GetSecurityDetailsRequest,
  ): Promise<SecurityViewModel> {
    const { securityId } = request;
    handleValidation('GetSecurityDetailsRequest', request);
    const res = await this.queryBus.execute(new GetSecurityQuery(securityId));

    const security: SecurityViewModel = {
      name: res.security.name,
      symbol: res.security.symbol,
      isin: res.security.isin,
      type: res.security.type,
      decimals: res.security.decimals,
      isWhiteList: res.security.isWhiteList,
      isControllable: res.security.isControllable,
      isMultiPartition: res.security.isMultiPartition,
      totalSupply: res.security.totalSupply?.toString(),
      maxSupply: res.security.maxSupply?.toString(),
      diamondAddress: res.security.diamondAddress?.toString(),
      evmDiamondAddress: res.security.evmDiamondAddress?.toString(),
      paused: res.security.paused,
      regulation: res.security.regulation,
      isCountryControlListWhiteList: res.security.isCountryControlListWhiteList,
      countries: res.security.countries,
      info: res.security.info,
    };

    return security;
  }

  @LogError
  async issue(
    request: IssueRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amount, targetId } = request;
    handleValidation('IssueRequest', request);

    return await this.commandBus.execute(
      new IssueCommand(amount, targetId, securityId),
    );
  }

  @LogError
  async redeem(
    request: RedeemRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amount } = request;
    handleValidation('RedeemRequest', request);

    return await this.commandBus.execute(new RedeemCommand(amount, securityId));
  }

  @LogError
  async controllerRedeem(
    request: ForceRedeemRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amount, sourceId } = request;
    handleValidation('ForceRedeemRequest', request);

    return await this.commandBus.execute(
      new ControllerRedeemCommand(amount, sourceId, securityId),
    );
  }

  @LogError
  async addToControlList(
    request: ControlListRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, targetId } = request;
    handleValidation('ControlListRequest', request);

    return await this.commandBus.execute(
      new AddToControlListCommand(targetId, securityId),
    );
  }

  @LogError
  async removeFromControlList(
    request: ControlListRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, targetId } = request;
    handleValidation('ControlListRequest', request);

    return await this.commandBus.execute(
      new RemoveFromControlListCommand(targetId, securityId),
    );
  }

  @LogError
  async isAccountInControlList(request: ControlListRequest): Promise<boolean> {
    handleValidation('ControlListRequest', request);

    return (
      await this.queryBus.execute(
        new IsInControlListQuery(request.securityId, request.targetId),
      )
    ).payload;
  }

  @LogError
  async getControlListCount(
    request: GetControlListCountRequest,
  ): Promise<number> {
    handleValidation('GetControlListCountRequest', request);

    return (
      await this.queryBus.execute(
        new GetControlListCountQuery(request.securityId),
      )
    ).payload;
  }

  @LogError
  async getControlListMembers(
    request: GetControlListMembersRequest,
  ): Promise<string[]> {
    handleValidation('GetControlListMembersRequest', request);

    const membersIds: string[] = [];

    const membersEvmAddresses = (
      await this.queryBus.execute(
        new GetControlListMembersQuery(
          request.securityId,
          request.start,
          request.end,
        ),
      )
    ).payload;

    let mirrorAccount;

    for (let i = 0; i < membersEvmAddresses.length; i++) {
      mirrorAccount = await this.mirrorNode.getAccountInfo(
        membersEvmAddresses[i],
      );
      membersIds.push(mirrorAccount.id.toString());
    }

    return membersIds;
  }

  @LogError
  async getControlListType(
    request: GetControlListTypeRequest,
  ): Promise<SecurityControlListType> {
    handleValidation('GetControlListTypeRequest', request);

    return (
      await this.queryBus.execute(
        new GetControlListTypeQuery(request.securityId),
      )
    ).payload;
  }

  @LogError
  async getBalanceOf(
    request: GetAccountBalanceRequest,
  ): Promise<BalanceViewModel> {
    handleValidation('GetAccountBalanceRequest', request);

    const res = await this.queryBus.execute(
      new BalanceOfQuery(request.securityId, request.targetId),
    );

    const balance: BalanceViewModel = { value: res.payload.toString() };

    return balance;
  }

  @LogError
  async transfer(
    request: TransferRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amount, targetId } = request;
    handleValidation('TransferRequest', request);

    return await this.commandBus.execute(
      new TransferCommand(amount, targetId, securityId),
    );
  }

  @LogError
  async transferAndLock(
    request: TransferAndLockRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amount, targetId, expirationDate } = request;
    handleValidation('TransferAndLockRequest', request);

    return await this.commandBus.execute(
      new TransferAndLockCommand(amount, targetId, securityId, expirationDate),
    );
  }

  @LogError
  async controllerTransfer(
    request: ForceTransferRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amount, targetId, sourceId } = request;
    handleValidation('ForceTransferRequest', request);

    return await this.commandBus.execute(
      new ControllerTransferCommand(amount, sourceId, targetId, securityId),
    );
  }

  @LogError
  async pause(
    request: PauseRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId } = request;
    handleValidation('PauseRequest', request);

    return await this.commandBus.execute(new PauseCommand(securityId));
  }

  @LogError
  async unpause(
    request: PauseRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId } = request;
    handleValidation('PauseRequest', request);

    return await this.commandBus.execute(new UnpauseCommand(securityId));
  }

  @LogError
  async isPaused(request: PauseRequest): Promise<boolean> {
    handleValidation('IsPausedRequest', request);

    return (await this.queryBus.execute(new IsPausedQuery(request.securityId)))
      .payload;
  }

  @LogError
  async setMaxSupply(
    request: SetMaxSupplyRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, maxSupply } = request;
    handleValidation('SetMaxSupplyRequest', request);

    return await this.commandBus.execute(
      new SetMaxSupplyCommand(maxSupply, securityId),
    );
  }

  @LogError
  async getMaxSupply(
    request: GetMaxSupplyRequest,
  ): Promise<MaxSupplyViewModel> {
    handleValidation('GetMaxSupplyRequest', request);

    const res = await this.queryBus.execute(
      new GetMaxSupplyQuery(request.securityId),
    );

    const maxSupply: MaxSupplyViewModel = { value: res.payload.toString() };

    return maxSupply;
  }
}

const assettokenization = new SecurityInPort();
export default assettokenization;
