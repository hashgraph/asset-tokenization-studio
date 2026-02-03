// SPDX-License-Identifier: Apache-2.0

import { ethers } from "ethers";
import TransactionResponse from "@domain/transaction/TransactionResponse";
import { TransactionResponseError } from "./error/TransactionResponseError";

export class TransactionResponseAdapter {
  manageResponse(): TransactionResponse {
    throw new Error("Method not implemented.");
  }

  public static decodeFunctionResult(
    functionName: string,
    resultAsBytes: Uint8Array | Uint32Array,
    abi: any, // eslint-disable-line
    network: string,
  ): Uint8Array {
    try {
      const iface = new ethers.utils.Interface(abi);
      const resultHex = "0x".concat(Buffer.from(resultAsBytes).toString("hex"));
      const result = iface.decodeFunctionResult(functionName, resultHex);

      const jsonParsedArray = JSON.parse(JSON.stringify(result));
      return jsonParsedArray;

      // eslint-disable-next-line unused-imports/no-unused-vars
    } catch (error) {
      throw new TransactionResponseError({
        message: "Could not decode function result",
        network: network,
      });
    }
  }
}
