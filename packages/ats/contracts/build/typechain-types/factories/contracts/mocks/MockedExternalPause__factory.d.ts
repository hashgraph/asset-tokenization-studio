import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { MockedExternalPause, MockedExternalPauseInterface } from "../../../contracts/mocks/MockedExternalPause";
type MockedExternalPauseConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class MockedExternalPause__factory extends ContractFactory {
    constructor(...args: MockedExternalPauseConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string;
    }): Promise<MockedExternalPause>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): MockedExternalPause;
    connect(signer: Signer): MockedExternalPause__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50610106806100206000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c806316c38b3c146037578063b187bd26146048575b600080fd5b6046604236600460a9565b6062565b005b60005460ff16604051901515815260200160405180910390f35b6000805460ff19168215159081179091556040519081527f9e3a5e37224532dea67b89face185703738a228a6e8a23dee546960180d3be649060200160405180910390a150565b60006020828403121560ba57600080fd5b8135801515811460c957600080fd5b939250505056fea26469706673582212208c171e3820ebc8bce22111282fe3dd853c403b119c6bb1a4f0113b667e1fbf4864736f6c63430008120033";
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "bool";
            readonly name: "isPaused";
            readonly type: "bool";
        }];
        readonly name: "PausedStateChanged";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "isPaused";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bool";
            readonly name: "paused";
            readonly type: "bool";
        }];
        readonly name: "setPaused";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): MockedExternalPauseInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): MockedExternalPause;
}
export {};
