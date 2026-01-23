// SPDX-License-Identifier: Apache-2.0

import { ethers } from 'ethers';
import LogService from '@service/log/LogService';
import TransactionResponse from '@domain/context/transaction/TransactionResponse';
import { TransactionResponseError } from './error/TransactionResponseError';

export class TransactionResponseAdapter {
  manageResponse(): TransactionResponse {
    throw new Error('Method not implemented.');
  }
  public static decodeFunctionResult(
    functionName: string,
    resultAsBytes: Uint8Array<ArrayBufferLike> | Uint32Array<ArrayBufferLike>,
    abi: any, // eslint-disable-line
    network: string,
  ): Uint8Array {
    try {
      const iface = new ethers.utils.Interface(abi);

      if (!iface.functions[functionName]) {
        throw new TransactionResponseError({
          message: `Contract function ${functionName} not found in ABI, are you using the right version?`,
          network: network,
        });
      }

      const resultHex = '0x'.concat(Buffer.from(resultAsBytes).toString('hex'));
      const result = iface.decodeFunctionResult(functionName, resultHex);

      const jsonParsedArray = JSON.parse(JSON.stringify(result));
      return jsonParsedArray;
    } catch (error) {
      LogService.logError(error);
      throw new TransactionResponseError({
        message: 'Could not decode function result',
        network: network,
      });
    }
  }
}
