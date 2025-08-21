import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ArrayLib, ArrayLibInterface } from "../../../../../contracts/layer_0/common/libraries/ArrayLib";
type ArrayLibConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class ArrayLib__factory extends ContractFactory {
    constructor(...args: ArrayLibConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string;
    }): Promise<ArrayLib>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): ArrayLib;
    connect(signer: Signer): ArrayLib__factory;
    static readonly bytecode = "0x60566037600b82828239805160001a607314602a57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe73000000000000000000000000000000000000000030146080604052600080fdfea2646970667358221220d2945a172150d5d694c0e809d162fc011caf092c7918cbc423f021688550e0cf64736f6c63430008120033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "lowerIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "upperIndex";
            readonly type: "uint256";
        }];
        readonly name: "ContradictoryValuesInArray";
        readonly type: "error";
    }];
    static createInterface(): ArrayLibInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ArrayLib;
}
export {};
