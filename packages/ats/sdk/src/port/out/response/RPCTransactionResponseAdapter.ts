// SPDX-License-Identifier: Apache-2.0

import { ContractTransactionResponse, EventLog } from "ethers";
import LogService from "@service/log/LogService";
import TransactionResponse from "@domain/context/transaction/TransactionResponse";
import { TransactionResponseError } from "@port/out/error/TransactionResponseError";
import { TransactionResponseAdapter } from "@port/out/TransactionResponseAdapter";

export class RPCTransactionResponseAdapter extends TransactionResponseAdapter {
  public static async manageResponse(
    response: ContractTransactionResponse,
    network: string,
    eventName?: string,
  ): Promise<TransactionResponse> {
    LogService.logTrace("Constructing response from:", response);
    try {
      const receipt = await response.wait();
      LogService.logTrace("Receipt:", receipt);
      if (receipt && receipt.logs && eventName) {
        const returnEvent = receipt.logs.filter(
          (e): e is EventLog => e instanceof EventLog && e.eventName === eventName,
        );
        if (returnEvent.length > 0 && returnEvent[0].args) {
          return new TransactionResponse(receipt.hash, returnEvent[0].args);
        }
      }
      return Promise.resolve(new TransactionResponse(receipt?.hash ?? "", receipt?.status ?? 0));
    } catch (error: unknown) {
      LogService.logError("Uncaught Exception:", JSON.stringify(error));
      throw new TransactionResponseError({
        message: "",
        network: network,
        name: eventName,
        status: "error",
        transactionId: (error as { transactionHash?: string })?.transactionHash,
        RPC_relay: true,
      });
    }
  }
}
