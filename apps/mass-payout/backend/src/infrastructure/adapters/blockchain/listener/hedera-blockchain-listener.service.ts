// SPDX-License-Identifier: Apache-2.0

import { GetBlockchainEventListenerConfigUseCase } from "@application/use-cases/get-blockchain-event-listener-config.use-case"
import { UpsertBlockchainEventListenerConfigUseCase } from "@application/use-cases/upsert-blockchain-event-listener-config.use-case"
import {
  ApprovalEventData,
  BlockchainEvent,
  BlockchainEventListenerConfig,
  BlockchainEventListenerError,
  MirrorNodeLog,
  MirrorNodeResponse,
  TransferEvent,
} from "@domain/model/blockchain-listener"
import { BlockchainEventListenerService } from "@domain/ports/blockchain-event-listener.service"
import { Injectable, Logger } from "@nestjs/common"
import axios from "axios"
import chalk from "chalk"
import { Interface, LogDescription } from "ethers/lib/utils"
import abiERC20 from "./abi_ERC20"

@Injectable()
export class HederaBlockchainListenerService implements BlockchainEventListenerService {
  private readonly logger = new Logger(HederaBlockchainListenerService.name)
  private readonly iface: Interface
  private config: BlockchainEventListenerConfig

  constructor(
    private readonly getConfigUseCase: GetBlockchainEventListenerConfigUseCase,
    private readonly upsertConfigUseCase: UpsertBlockchainEventListenerConfigUseCase,
  ) {
    this.iface = new Interface(abiERC20)
  }

  async fetchNewEvents(): Promise<BlockchainEvent[]> {
    try {
      this.config = await this.getConfigUseCase.execute()
      const logs: MirrorNodeLog[] = await this.retrieveLogsFromMirrorNode(
        this.config.mirrorNodeUrl,
        this.config.contractId,
        this.config.startTimestamp,
      )
      const events: BlockchainEvent[] = []
      for (const log of logs) {
        const event = this.decodeLog(log)
        if (event) {
          events.push(event)
        }
      }
      this.logger.debug(`Fetched blockchain events ${events.length}, since: ${this.config.startTimestamp}`)
      return events
    } catch (error) {
      throw new BlockchainEventListenerError("Error listening events", error)
    }
  }

  async updateStartTimestamp(newStartTimestamp: string): Promise<void> {
    this.config = await this.getConfigUseCase.execute()
    if (Number(this.config.startTimestamp) >= Number(newStartTimestamp)) return
    this.config.startTimestamp = newStartTimestamp
    this.logger.verbose(`Updating config: ${chalk.yellow(JSON.stringify(this.config, null, 2))}`)
    await this.upsertConfigUseCase.execute(this.config)
  }

  private async retrieveLogsFromMirrorNode(
    mirrorNodeUrl: string,
    contractId: string,
    startTimestamp: string,
  ): Promise<MirrorNodeLog[]> {
    try {
      const query = startTimestamp ? `?limit=100&order=asc&timestamp=gt%3A${startTimestamp.toString()}` : ""
      const url = `${mirrorNodeUrl}/api/v1/contracts/${contractId}/results/logs${query}`
      this.logger.verbose(`Retrieving logs from Mirror Node: "${url}"`)
      const { data }: { data: MirrorNodeResponse } = await axios.get(url)
      return data.logs || []
    } catch (error) {
      throw new BlockchainEventListenerError("Error extracting Mirror Node Logs", error)
    }
  }

  private decodeLog(log: MirrorNodeLog): BlockchainEvent | undefined {
    try {
      if (!log.data || log.data === "0x") {
        this.logger.debug("Ignored event: ", log)
        return
      }
      const parsed = this.iface.parseLog({
        data: log.data,
        topics: log.topics,
      })
      return this.logDecodedEvent(parsed, log.timestamp)
    } catch (error) {
      throw new BlockchainEventListenerError(`Error decoding log.\n${JSON.stringify(log, null, 2)}`, error)
    }
  }

  private logDecodedEvent(parsed: LogDescription, timestamp: string): BlockchainEvent | undefined {
    const name = parsed.name
    const eventData: BlockchainEvent = {
      timestamp,
      name: name,
    }
    switch (name) {
      case "Transfer":
        return this.decodeTransferEvent(parsed, eventData)
      case "Approval":
        return this.decodeApprovalEvent(parsed, eventData)
      default:
        return this.decodeDefaultEvent(parsed, eventData)
    }
  }

  private decodeTransferEvent(parsed: LogDescription, eventData: BlockchainEvent): TransferEvent {
    const decoded: TransferEvent = {
      ...eventData,
      from: parsed.args.from,
      to: parsed.args.to,
      value: this.formatNumber(parsed.args.value),
      rawValue: parsed.args.value.toString(),
    }
    this.logger.verbose(`Decoded event: ${chalk.green(JSON.stringify(decoded.to, null, 2))}`)
    return decoded
  }

  private decodeApprovalEvent(parsed: LogDescription, eventData: BlockchainEvent): ApprovalEventData {
    return {
      ...eventData,
      owner: parsed.args.owner,
      spender: parsed.args.spender,
      value: this.formatNumber(parsed.args.value),
      rawValue: parsed.args.value.toString(),
    }
  }

  private decodeDefaultEvent(parsed: LogDescription, eventData: BlockchainEvent): BlockchainEvent {
    return {
      ...eventData,
      ...Object.fromEntries(
        parsed.eventFragment.inputs.map((input, i) => {
          const val = parsed.args[i]
          return [input.name, typeof val === "object" ? val.toString() : val]
        }),
      ),
    }
  }

  private formatNumber(value: bigint): number {
    return Number(value.toString()) / 10 ** this.config.tokenDecimals
  }
}
