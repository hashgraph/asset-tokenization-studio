/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  TransactionResponse as HTransactionResponse,
  Signer,
} from '@hashgraph/sdk';
import TransactionResponse from '../../../../domain/context/transaction/TransactionResponse.js';
import { TransactionResponseError } from '../../error/TransactionResponseError.js';
import { TransactionResponseAdapter } from '../../TransactionResponseAdapter.js';
import LogService from '../../../../app/service/LogService.js';

export class HashpackTransactionResponseAdapter extends TransactionResponseAdapter {
  public static async manageResponse(
    response: HTransactionResponse,
    signer: Signer,
    network: string,
    eventTopic?: Uint8Array | string, // * Event Topi | Event Signature
  ): Promise<TransactionResponse> {
    LogService.logTrace('Constructing response from:', response);
    try {
      // Get Receipt and Record in parallel
      const receipt = response.getReceiptWithSigner(signer);
      const record = response.getRecordWithSigner(signer);
      LogService.logTrace(
        ` Receipt: ${await receipt}, Record: ${await record}`,
      );
      const txHashHex = Buffer.from(response.transactionHash).toString('hex');
      // * Events
      // If eventTopic is provided, check if the eventTopic is in the logs
      if (eventTopic) {
        const eventTopicBytes =
          typeof eventTopic === 'string'
            ? new Uint8Array(Buffer.from(eventTopic, 'hex'))
            : eventTopic;
        const logs = (await record).contractFunctionResult?.logs;
        if (logs) {
          logs.forEach((log) => {
            log.topics.forEach((topic) => {
              if (topic === eventTopicBytes) {
                return new TransactionResponse(txHashHex, log.data);
              }
            });
          });
        }
      }

      return Promise.resolve(
        new TransactionResponse(txHashHex, (await receipt).status.toString()),
      );
    } catch (error) {
      LogService.logError('Uncaught Exception:', JSON.stringify(error));
      if (eventTopic && typeof eventTopic !== 'string') {
        eventTopic = Buffer.from(eventTopic).toString('hex');
      }
      throw new TransactionResponseError({
        message: '',
        network: network,
        name: eventTopic,
        status: 'error',
        transactionId: (error as any)?.transactionHash,
        RPC_relay: true,
      });
    }
  }
}
