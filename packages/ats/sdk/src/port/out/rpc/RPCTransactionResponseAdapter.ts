// SPDX-License-Identifier: Apache-2.0

import { ethers } from "ethers";
import LogService from "@service/log/LogService";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import { TransactionResponseError } from "../error/TransactionResponseError";
import { TransactionResponseAdapter } from "../TransactionResponseAdapter";

export class RPCTransactionResponseAdapter extends TransactionResponseAdapter {
  public static async manageResponse(
    response: ethers.ContractTransaction,
    network: string,
    eventName?: string,
  ): Promise<TransactionResponse> {
    LogService.logTrace("Constructing response from:", response);
    try {
      const receipt = await response.wait();
      LogService.logTrace("Receipt:", receipt);
      if (receipt.events && eventName) {
        const returnEvent = receipt.events.filter((e) => e.event && e.event === eventName);
        if (returnEvent.length > 0 && returnEvent[0].args) {
          return new TransactionResponse(receipt.transactionHash, returnEvent[0].args);
        }
      }
      return Promise.resolve(new TransactionResponse(receipt.transactionHash, receipt.status));
    } catch (error) {
      LogService.logError("Uncaught Exception:", JSON.stringify(error));
      throw new TransactionResponseError({
        message: "",
        network: network,
        name: eventName,
        status: "error",
        transactionId: (error as any)?.transactionHash,
        RPC_relay: true,
      });
    }
  }
}
