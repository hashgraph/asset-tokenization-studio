// SPDX-License-Identifier: Apache-2.0

import { BaseContract, TransactionReceipt } from "ethers";
import { TypedContractEvent } from "typechain-types/common";

export type GetEventArguments<T extends BaseContract, TName extends keyof T["filters"]> =
  T["filters"][TName] extends TypedContractEvent<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any,
    infer TOutputObject
  >
    ? TOutputObject
    : never;

export async function decodeEvent<T extends BaseContract, TEventName extends keyof T["filters"]>(
  contract: T,
  eventName: TEventName,
  transactionReceipt: TransactionReceipt | null,
): Promise<GetEventArguments<T, TEventName>> {
  if (transactionReceipt == null) {
    throw new Error("Transaction receipt is empty");
  }

  const eventFragment = contract.interface.getEvent(eventName as string);
  if (eventFragment === null) {
    throw new Error(`Event "${eventName as string}" doesn't exist in the contract`);
  }

  const topic = eventFragment.topicHash;
  const contractAddress = await contract.getAddress();

  const eventLog = transactionReceipt.logs.find(
    (log) => log.address.toLowerCase() === contractAddress.toLowerCase() && log.topics[0] === topic,
  );

  if (!eventLog) {
    throw new Error(`Event log for "${eventName as string}" not found in transaction receipt`);
  }

  const decodedArgs = contract.interface.decodeEventLog(eventFragment, eventLog.data, eventLog.topics);

  return decodedArgs.toObject() as GetEventArguments<T, TEventName>;
}
