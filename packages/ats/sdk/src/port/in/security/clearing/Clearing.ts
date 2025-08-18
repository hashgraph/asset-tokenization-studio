import { LogError } from '@core/decorator/LogErrorDecorator';
import {
  ActivateClearingRequest,
  ApproveClearingOperationByPartitionRequest,
  CancelClearingOperationByPartitionRequest,
  ClearingCreateHoldByPartitionRequest,
  ClearingCreateHoldFromByPartitionRequest,
  ClearingRedeemByPartitionRequest,
  ClearingRedeemFromByPartitionRequest,
  ClearingTransferByPartitionRequest,
  ClearingTransferFromByPartitionRequest,
  DeactivateClearingRequest,
  GetClearedAmountForByPartitionRequest,
  GetClearedAmountForRequest,
  GetClearingCountForByPartitionRequest,
  GetClearingCreateHoldForByPartitionRequest,
  GetClearingRedeemForByPartitionRequest,
  GetClearingsIdForByPartitionRequest,
  GetClearingTransferForByPartitionRequest,
  IsClearingActivatedRequest,
  OperatorClearingCreateHoldByPartitionRequest,
  OperatorClearingRedeemByPartitionRequest,
  OperatorClearingTransferByPartitionRequest,
  ProtectedClearingCreateHoldByPartitionRequest,
  ProtectedClearingRedeemByPartitionRequest,
  ProtectedClearingTransferByPartitionRequest,
  ReclaimClearingOperationByPartitionRequest,
} from '../../request';
import ValidatedRequest from '@core/validation/ValidatedArgs';
import {
  ClearingCreateHoldViewModel,
  ClearingRedeemViewModel,
  ClearingTransferViewModel,
} from '../../response';
import { ActivateClearingCommand } from '@command/security/operations/clearing/activateClearing/ActivateClearingCommand';
import { DeactivateClearingCommand } from '@command/security/operations/clearing/deactivateClearing/DeactivateClearingCommand';
import { ClearingTransferByPartitionCommand } from '@command/security/operations/clearing/clearingTransferByPartition/ClearingTransferByPartitionCommand';
import { ClearingTransferFromByPartitionCommand } from '@command/security/operations/clearing/clearingTransferFromByPartition/ClearingTransferFromByPartitionCommand';
import { ApproveClearingOperationByPartitionCommand } from '@command/security/operations/clearing/approveClearingOperationByPartition/ApproveClearingOperationByPartitionCommand';
import { CancelClearingOperationByPartitionCommand } from '@command/security/operations/clearing/cancelClearingOperationByPartition/CancelClearingOperationByPartitionCommand';
import { ReclaimClearingOperationByPartitionCommand } from '@command/security/operations/clearing/reclaimClearingOperationByPartition/ReclaimClearingOperationByPartitionCommand';
import { ClearingRedeemByPartitionCommand } from '@command/security/operations/clearing/clearingRedeemByPartition/ClearingRedeemByPartitionCommand';
import { ClearingRedeemFromByPartitionCommand } from '@command/security/operations/clearing/clearingRedeemFromByPartition/ClearingRedeemFromByPartitionCommand';
import { ProtectedClearingRedeemByPartitionCommand } from '@command/security/operations/clearing/protectedClearingRedeemByPartition/ProtectedClearingRedeemByPartitionCommand';
import { ClearingCreateHoldByPartitionCommand } from '@command/security/operations/clearing/clearingCreateHoldByPartition/ClearingCreateHoldByPartitionCommand';
import { ClearingCreateHoldFromByPartitionCommand } from '@command/security/operations/clearing/clearingCreateHoldFromByPartition/ClearingCreateHoldFromByPartitionCommand';
import { ProtectedClearingCreateHoldByPartitionCommand } from '@command/security/operations/clearing/protectedClearingCreateHoldByPartition/ProtectedClearingCreateHoldByPartitionCommand';
import { GetClearedAmountForQuery } from '@query/security/clearing/getClearedAmountFor/GetClearedAmountForQuery';
import { GetClearedAmountForByPartitionQuery } from '@query/security/clearing/getClearedAmountForByPartition/GetClearedAmountForByPartitionQuery';
import { GetClearingCountForByPartitionQuery } from '@query/security/clearing/getClearingCountForByPartition/GetClearingCountForByPartitionQuery';
import { GetClearingCreateHoldForByPartitionQuery } from '@query/security/clearing/getClearingCreateHoldForByPartition/GetClearingCreateHoldForByPartitionQuery';
import { ONE_THOUSAND } from '@domain/context/shared/SecurityDate';
import { GetClearingRedeemForByPartitionQuery } from '@query/security/clearing/getClearingRedeemForByPartition/GetClearingRedeemForByPartitionQuery';
import { GetClearingTransferForByPartitionQuery } from '@query/security/clearing/getClearingTransferForByPartition/GetClearingTransferForByPartitionQuery';
import { GetClearingsIdForByPartitionQuery } from '@query/security/clearing/getClearingsIdForByPartition/GetClearingsIdForByPartitionQuery';
import { IsClearingActivatedQuery } from '@query/security/clearing/isClearingActivated/IsClearingActivatedQuery';
import { OperatorClearingCreateHoldByPartitionCommand } from '@command/security/operations/clearing/operatorClearingCreateHoldByPartition/OperatorClearingCreateHoldByPartitionCommand';
import { OperatorClearingRedeemByPartitionCommand } from '@command/security/operations/clearing/operatorClearingRedeemByPartition/OperatorClearingRedeemByPartitionCommand';
import { OperatorClearingTransferByPartitionCommand } from '@command/security/operations/clearing/operatorClearingTransferByPartition/OperatorClearingTransferByPartitionCommand';
import { ProtectedClearingTransferByPartitionCommand } from '@command/security/operations/clearing/protectedClearingTransferByPartition/ProtectedClearingTransferByPartitionCommand';
import { BaseSecurityInPort } from '../BaseSecurityInPort';

export interface ISecurityInPortClearing {
  activateClearing(
    request: ActivateClearingRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  deactivateClearing(
    request: DeactivateClearingRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  clearingTransferByPartition(
    request: ClearingTransferByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }>;
  clearingTransferFromByPartition(
    request: ClearingTransferFromByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }>;
  protectedClearingTransferByPartition(
    request: ProtectedClearingTransferByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }>;
  approveClearingOperationByPartition(
    request: ApproveClearingOperationByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  cancelClearingOperationByPartition(
    request: CancelClearingOperationByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  reclaimClearingOperationByPartition(
    request: ReclaimClearingOperationByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }>;
  clearingRedeemByPartition(
    request: ClearingRedeemByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }>;
  clearingRedeemFromByPartition(
    request: ClearingRedeemFromByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }>;
  protectedClearingRedeemByPartition(
    request: ProtectedClearingRedeemByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }>;
  clearingCreateHoldByPartition(
    request: ClearingCreateHoldByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }>;
  clearingCreateHoldFromByPartition(
    request: ClearingCreateHoldFromByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }>;
  protectedClearingCreateHoldByPartition(
    request: ProtectedClearingCreateHoldByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }>;
  getClearedAmountFor(request: GetClearedAmountForRequest): Promise<number>;
  getClearedAmountForByPartition(
    request: GetClearedAmountForByPartitionRequest,
  ): Promise<number>;
  getClearingCountForByPartition(
    request: GetClearingCountForByPartitionRequest,
  ): Promise<number>;
  getClearingCreateHoldForByPartition(
    request: GetClearingCreateHoldForByPartitionRequest,
  ): Promise<ClearingCreateHoldViewModel>;
  getClearingRedeemForByPartition(
    request: GetClearingRedeemForByPartitionRequest,
  ): Promise<ClearingRedeemViewModel>;
  getClearingTransferForByPartition(
    request: GetClearingTransferForByPartitionRequest,
  ): Promise<ClearingTransferViewModel>;
  getClearingsIdForByPartition(
    request: GetClearingsIdForByPartitionRequest,
  ): Promise<number[]>;
  isClearingActivated(request: IsClearingActivatedRequest): Promise<boolean>;
  operatorClearingCreateHoldByPartition(
    request: OperatorClearingCreateHoldByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }>;
  operatorClearingRedeemByPartition(
    request: OperatorClearingRedeemByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }>;
  operatorClearingTransferByPartition(
    request: OperatorClearingTransferByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }>;
}

export class SecurityInPortClearing
  extends BaseSecurityInPort
  implements ISecurityInPortClearing
{
  @LogError
  async activateClearing(
    request: ActivateClearingRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation('ActivateClearingRequest', request);

    return await this.commandBus.execute(
      new ActivateClearingCommand(request.securityId),
    );
  }

  @LogError
  async deactivateClearing(
    request: DeactivateClearingRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation('DeactivateClearingRequest', request);

    return await this.commandBus.execute(
      new DeactivateClearingCommand(request.securityId),
    );
  }

  @LogError
  async clearingTransferByPartition(
    request: ClearingTransferByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    ValidatedRequest.handleValidation(
      'ClearingTransferByPartitionRequest',
      request,
    );
    return await this.commandBus.execute(
      new ClearingTransferByPartitionCommand(
        request.securityId,
        request.partitionId,
        request.amount,
        request.targetId,
        request.expirationDate,
      ),
    );
  }

  @LogError
  async clearingTransferFromByPartition(
    request: ClearingTransferFromByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    ValidatedRequest.handleValidation(
      'ClearingTransferFromByPartitionRequest',
      request,
    );
    return await this.commandBus.execute(
      new ClearingTransferFromByPartitionCommand(
        request.securityId,
        request.partitionId,
        request.amount,
        request.sourceId,
        request.targetId,
        request.expirationDate,
      ),
    );
  }

  @LogError
  async approveClearingOperationByPartition(
    request: ApproveClearingOperationByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation(
      'ApproveClearingOperationByPartitionRequest',
      request,
    );
    return await this.commandBus.execute(
      new ApproveClearingOperationByPartitionCommand(
        request.securityId,
        request.partitionId,
        request.targetId,
        request.clearingId,
        request.clearingOperationType,
      ),
    );
  }

  @LogError
  async cancelClearingOperationByPartition(
    request: CancelClearingOperationByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation(
      'CancelClearingOperationByPartitionRequest',
      request,
    );
    return await this.commandBus.execute(
      new CancelClearingOperationByPartitionCommand(
        request.securityId,
        request.partitionId,
        request.targetId,
        request.clearingId,
        request.clearingOperationType,
      ),
    );
  }

  @LogError
  async reclaimClearingOperationByPartition(
    request: ReclaimClearingOperationByPartitionRequest,
  ): Promise<{ payload: boolean; transactionId: string }> {
    ValidatedRequest.handleValidation(
      'ReclaimClearingOperationByPartitionRequest',
      request,
    );
    return await this.commandBus.execute(
      new ReclaimClearingOperationByPartitionCommand(
        request.securityId,
        request.partitionId,
        request.targetId,
        request.clearingId,
        request.clearingOperationType,
      ),
    );
  }

  @LogError
  async clearingRedeemByPartition(
    request: ClearingRedeemByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    ValidatedRequest.handleValidation(
      'ClearingRedeemByPartitionRequest',
      request,
    );
    return await this.commandBus.execute(
      new ClearingRedeemByPartitionCommand(
        request.securityId,
        request.partitionId,
        request.amount,
        request.expirationDate,
      ),
    );
  }

  @LogError
  async clearingRedeemFromByPartition(
    request: ClearingRedeemFromByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    ValidatedRequest.handleValidation(
      'ClearingRedeemFromByPartitionRequest',
      request,
    );
    return await this.commandBus.execute(
      new ClearingRedeemFromByPartitionCommand(
        request.securityId,
        request.partitionId,
        request.amount,
        request.sourceId,
        request.expirationDate,
      ),
    );
  }

  @LogError
  async protectedClearingRedeemByPartition(
    request: ProtectedClearingRedeemByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    ValidatedRequest.handleValidation(
      'ProtectedClearingRedeemByPartitionRequest',
      request,
    );
    return await this.commandBus.execute(
      new ProtectedClearingRedeemByPartitionCommand(
        request.securityId,
        request.partitionId,
        request.amount,
        request.sourceId,
        request.expirationDate,
        request.deadline,
        request.nonce,
        request.signature,
      ),
    );
  }

  @LogError
  async clearingCreateHoldByPartition(
    request: ClearingCreateHoldByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    ValidatedRequest.handleValidation(
      'ClearingCreateHoldByPartitionRequest',
      request,
    );
    return await this.commandBus.execute(
      new ClearingCreateHoldByPartitionCommand(
        request.securityId,
        request.partitionId,
        request.escrow,
        request.amount,
        request.targetId,
        request.clearingExpirationDate,
        request.holdExpirationDate,
      ),
    );
  }

  @LogError
  async clearingCreateHoldFromByPartition(
    request: ClearingCreateHoldFromByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    ValidatedRequest.handleValidation(
      'ClearingCreateHoldFromByPartitionRequest',
      request,
    );
    return await this.commandBus.execute(
      new ClearingCreateHoldFromByPartitionCommand(
        request.securityId,
        request.partitionId,
        request.escrow,
        request.amount,
        request.sourceId,
        request.targetId,
        request.clearingExpirationDate,
        request.holdExpirationDate,
      ),
    );
  }

  @LogError
  async protectedClearingCreateHoldByPartition(
    request: ProtectedClearingCreateHoldByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    ValidatedRequest.handleValidation(
      'ProtectedClearingCreateHoldByPartitionRequest',
      request,
    );
    return await this.commandBus.execute(
      new ProtectedClearingCreateHoldByPartitionCommand(
        request.securityId,
        request.partitionId,
        request.escrow,
        request.amount,
        request.sourceId,
        request.targetId,
        request.clearingExpirationDate,
        request.holdExpirationDate,
        request.deadline,
        request.nonce,
        request.signature,
      ),
    );
  }

  @LogError
  async getClearedAmountFor(
    request: GetClearedAmountForRequest,
  ): Promise<number> {
    ValidatedRequest.handleValidation(
      'GetClearedAmountForByPartitionRequest',
      request,
    );
    return (
      await this.queryBus.execute(
        new GetClearedAmountForQuery(request.securityId, request.targetId),
      )
    ).payload;
  }

  @LogError
  async getClearedAmountForByPartition(
    request: GetClearedAmountForByPartitionRequest,
  ): Promise<number> {
    ValidatedRequest.handleValidation(
      'GetClearedAmountForByPartitionRequest',
      request,
    );
    return (
      await this.queryBus.execute(
        new GetClearedAmountForByPartitionQuery(
          request.securityId,
          request.partitionId,
          request.targetId,
        ),
      )
    ).payload;
  }

  @LogError
  async getClearingCountForByPartition(
    request: GetClearingCountForByPartitionRequest,
  ): Promise<number> {
    ValidatedRequest.handleValidation(
      'GetClearingCountForByPartitionRequest',
      request,
    );
    return (
      await this.queryBus.execute(
        new GetClearingCountForByPartitionQuery(
          request.securityId,
          request.partitionId,
          request.targetId,
          request.clearingOperationType,
        ),
      )
    ).payload;
  }

  @LogError
  async getClearingCreateHoldForByPartition(
    request: GetClearingCreateHoldForByPartitionRequest,
  ): Promise<ClearingCreateHoldViewModel> {
    ValidatedRequest.handleValidation(
      'GetClearingCreateHoldForByPartitionRequest',
      request,
    );

    const res = (
      await this.queryBus.execute(
        new GetClearingCreateHoldForByPartitionQuery(
          request.securityId,
          request.partitionId,
          request.targetId,
          request.clearingId,
        ),
      )
    ).payload;

    const clearing: ClearingCreateHoldViewModel = {
      id: request.clearingId,
      amount: res.amount.toString(),
      expirationDate: new Date(res.expirationTimestamp * ONE_THOUSAND),
      data: res.data,
      operatorData: res.operatorData,
      holdEscrow: res.holdEscrow,
      holdExpirationDate: new Date(res.holdExpirationTimestamp * ONE_THOUSAND),
      holdTo: res.holdTo,
      holdData: res.holdData,
    };

    return clearing;
  }

  @LogError
  async getClearingRedeemForByPartition(
    request: GetClearingRedeemForByPartitionRequest,
  ): Promise<ClearingRedeemViewModel> {
    ValidatedRequest.handleValidation(
      'GetClearingRedeemForByPartitionRequest',
      request,
    );

    const res = (
      await this.queryBus.execute(
        new GetClearingRedeemForByPartitionQuery(
          request.securityId,
          request.partitionId,
          request.targetId,
          request.clearingId,
        ),
      )
    ).payload;

    const clearing: ClearingRedeemViewModel = {
      id: request.clearingId,
      amount: res.amount.toString(),
      expirationDate: new Date(res.expirationTimestamp * ONE_THOUSAND),
      data: res.data,
      operatorData: res.operatorData,
    };

    return clearing;
  }

  @LogError
  async getClearingTransferForByPartition(
    request: GetClearingTransferForByPartitionRequest,
  ): Promise<ClearingTransferViewModel> {
    ValidatedRequest.handleValidation(
      'GetClearingTransferForByPartitionRequest',
      request,
    );
    const res = (
      await this.queryBus.execute(
        new GetClearingTransferForByPartitionQuery(
          request.securityId,
          request.partitionId,
          request.targetId,
          request.clearingId,
        ),
      )
    ).payload;

    const clearing: ClearingTransferViewModel = {
      id: request.clearingId,
      amount: res.amount.toString(),
      expirationDate: new Date(res.expirationTimestamp * ONE_THOUSAND),
      destination: res.destination,
      data: res.data,
      operatorData: res.operatorData,
    };

    return clearing;
  }

  @LogError
  async getClearingsIdForByPartition(
    request: GetClearingsIdForByPartitionRequest,
  ): Promise<number[]> {
    ValidatedRequest.handleValidation(
      'GetClearingsIdForByPartitionRequest',
      request,
    );
    return (
      await this.queryBus.execute(
        new GetClearingsIdForByPartitionQuery(
          request.securityId,
          request.partitionId,
          request.targetId,
          request.clearingOperationType,
          request.start,
          request.end,
        ),
      )
    ).payload;
  }

  @LogError
  async isClearingActivated(
    request: IsClearingActivatedRequest,
  ): Promise<boolean> {
    ValidatedRequest.handleValidation('IsClearingActivatedRequest', request);
    return (
      await this.queryBus.execute(
        new IsClearingActivatedQuery(request.securityId),
      )
    ).payload;
  }

  @LogError
  async operatorClearingCreateHoldByPartition(
    request: OperatorClearingCreateHoldByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    ValidatedRequest.handleValidation(
      'OperatorClearingCreateHoldByPartitionRequest',
      request,
    );
    return await this.commandBus.execute(
      new OperatorClearingCreateHoldByPartitionCommand(
        request.securityId,
        request.partitionId,
        request.escrow,
        request.amount,
        request.sourceId,
        request.targetId,
        request.clearingExpirationDate,
        request.holdExpirationDate,
      ),
    );
  }

  @LogError
  async operatorClearingRedeemByPartition(
    request: OperatorClearingRedeemByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    ValidatedRequest.handleValidation(
      'OperatorClearingRedeemByPartitionRequest',
      request,
    );
    return await this.commandBus.execute(
      new OperatorClearingRedeemByPartitionCommand(
        request.securityId,
        request.partitionId,
        request.amount,
        request.sourceId,
        request.expirationDate,
      ),
    );
  }

  @LogError
  async operatorClearingTransferByPartition(
    request: OperatorClearingTransferByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    ValidatedRequest.handleValidation(
      'OperatorClearingTransferByPartitionRequest',
      request,
    );
    return await this.commandBus.execute(
      new OperatorClearingTransferByPartitionCommand(
        request.securityId,
        request.partitionId,
        request.amount,
        request.sourceId,
        request.targetId,
        request.expirationDate,
      ),
    );
  }
  @LogError
  async protectedClearingTransferByPartition(
    request: ProtectedClearingTransferByPartitionRequest,
  ): Promise<{ payload: number; transactionId: string }> {
    ValidatedRequest.handleValidation(
      'ProtectedClearingTransferByPartitionRequest',
      request,
    );
    return await this.commandBus.execute(
      new ProtectedClearingTransferByPartitionCommand(
        request.securityId,
        request.partitionId,
        request.amount,
        request.sourceId,
        request.targetId,
        request.expirationDate,
        request.deadline,
        request.nonce,
        request.signature,
      ),
    );
  }
}
