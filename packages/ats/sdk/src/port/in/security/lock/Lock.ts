import { LogError } from '@core/decorator/LogErrorDecorator';
import {
  GetLockCountRequest,
  GetLockedBalanceRequest,
  GetLockRequest,
  GetLocksIdRequest,
  LockRequest,
  ReleaseRequest,
} from '../../request';
import ValidatedRequest from '@core/validation/ValidatedArgs';
import { LockCommand } from '@command/security/operations/lock/LockCommand';
import { ReleaseCommand } from '@command/security/operations/release/ReleaseCommand';
import { BalanceViewModel, LockViewModel } from '../../response';
import { LockedBalanceOfQuery } from '@query/security/lockedBalanceOf/LockedBalanceOfQuery';
import { LockCountQuery } from '@query/security/lockCount/LockCountQuery';
import { LocksIdQuery } from '@query/security/locksId/LocksIdQuery';
import { GetLockQuery } from '@query/security/getLock/GetLockQuery';
import { BaseSecurityInPort } from '../BaseSecurityInPort';

export interface ISecurityInPortLock {
  lock(
    request: LockRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  release(
    request: ReleaseRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  getLockedBalanceOf(
    request: GetLockedBalanceRequest,
  ): Promise<BalanceViewModel>;
  getLockCount(request: GetLockCountRequest): Promise<number>;
  getLocksId(request: GetLocksIdRequest): Promise<string[]>;
  getLock(request: GetLockRequest): Promise<LockViewModel>;
}

export class SecurityInPortLock
  extends BaseSecurityInPort
  implements ISecurityInPortLock
{
  @LogError
  async lock(
    request: LockRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, amount, targetId, expirationTimestamp } = request;
    ValidatedRequest.handleValidation('LockRequest', request);

    return await this.commandBus.execute(
      new LockCommand(amount, targetId, securityId, expirationTimestamp),
    );
  }

  @LogError
  async release(
    request: ReleaseRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    const { securityId, lockId, targetId } = request;
    ValidatedRequest.handleValidation('ReleaseRequest', request);

    return await this.commandBus.execute(
      new ReleaseCommand(lockId, targetId, securityId),
    );
  }

  @LogError
  async getLockedBalanceOf(
    request: GetLockedBalanceRequest,
  ): Promise<BalanceViewModel> {
    ValidatedRequest.handleValidation('GetLockedBalanceRequest', request);

    const res = await this.queryBus.execute(
      new LockedBalanceOfQuery(request.securityId, request.targetId),
    );

    const balance: BalanceViewModel = { value: res.payload.toString() };

    return balance;
  }

  @LogError
  async getLockCount(request: GetLockCountRequest): Promise<number> {
    ValidatedRequest.handleValidation('GetLockCountRequest', request);

    return (
      await this.queryBus.execute(
        new LockCountQuery(request.securityId, request.targetId),
      )
    ).payload;
  }

  @LogError
  async getLocksId(request: GetLocksIdRequest): Promise<string[]> {
    ValidatedRequest.handleValidation('GetLocksIdRequest', request);

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

    const lockIds: string[] = res.map((id) => id.toString());

    return lockIds;
  }

  @LogError
  async getLock(request: GetLockRequest): Promise<LockViewModel> {
    ValidatedRequest.handleValidation('GetLockRequest', request);

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
}
