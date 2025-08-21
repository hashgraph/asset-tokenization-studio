import { ContractFactory } from 'ethers';
import { Client, ContractId, Hbar, Long } from '@hashgraph/sdk';
export declare function contractCall(contractId: ContractId, functionName: string, parameters: any[], clientOperator: Client, gas: number, abi: any, value?: number | string | Long | Hbar): Promise<any>;
export declare function createContractFactory(factory: any): ContractFactory;
