// SPDX-License-Identifier: Apache-2.0

/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable camelcase */
import { Injectable, Logger } from "@nestjs/common";
import { ethers } from "ethers";
import { LifeCycleCashFlow__factory } from "@hashgraph/mass-payout-contracts";
import EvmAddress from "@domain/contract/EvmAddress";
import NetworkService from "@app/services/network/NetworkService";
import { MirrorNodeAdapter } from "../mirror/MirrorNodeAdapter";

const LOCAL_JSON_RPC_RELAY_URL = "http://127.0.0.1:7546/api";

type StaticConnect = { connect: (...args: any[]) => any };

type FactoryContract<T extends StaticConnect> = T["connect"] extends (...args: any[]) => infer K ? K : never;

@Injectable()
export class RPCQueryAdapter {
  protected readonly logger = new Logger(RPCQueryAdapter.name);

  /**
   * The ethers.js provider used to interact with the Ethereum network.
   * It is initialized with a JSON RPC URL, which can be set via the init method.
   */
  provider: ethers.providers.JsonRpcProvider;

  constructor(
    private readonly networkService: NetworkService,
    public readonly mirrorNode: MirrorNodeAdapter,
  ) {}

  async init(urlRpcProvider?: string, apiKey?: string): Promise<string> {
    const url = urlRpcProvider ? (apiKey ? urlRpcProvider + apiKey : urlRpcProvider) : LOCAL_JSON_RPC_RELAY_URL;
    this.provider = new ethers.providers.JsonRpcProvider(url);
    this.logger.log("RPC Query Adapter Initialized on: ", url);

    return this.networkService.environment;
  }

  connect<T extends StaticConnect>(fac: T, address: string): FactoryContract<T> {
    return fac.connect(address, this.provider);
  }

  async isPaused(lifeCycleCashFlow: EvmAddress): Promise<boolean> {
    this.logger.log(`Checking if the LifeCycleCashFlow contract ${lifeCycleCashFlow.toString()} is paused`);

    return await this.connect(LifeCycleCashFlow__factory, lifeCycleCashFlow.toString()).isPaused();
  }

  async getPaymentToken(lifeCycleCashFlow: EvmAddress): Promise<string> {
    this.logger.log(`Getting the payment token for the contract ${lifeCycleCashFlow.toString()}`);

    return await this.connect(LifeCycleCashFlow__factory, lifeCycleCashFlow.toString()).getPaymentToken();
  }

  async getPaymentTokenDecimals(lifeCycleCashFlow: EvmAddress): Promise<number> {
    this.logger.log(`Getting the payment token decimals for the contract ${lifeCycleCashFlow.toString()}`);

    return await this.connect(LifeCycleCashFlow__factory, lifeCycleCashFlow.toString()).getPaymentTokenDecimals();
  }
}
