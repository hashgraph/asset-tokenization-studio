import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICap, ICapInterface } from "../../../../../contracts/layer_1/interfaces/cap/ICap";
export declare class ICap__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "getMaxSupply";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "maxSupply_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_partition";
            readonly type: "bytes32";
        }];
        readonly name: "getMaxSupplyByPartition";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "maxSupply_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "maxSupply";
            readonly type: "uint256";
        }, {
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "partition";
                readonly type: "bytes32";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxSupply";
                readonly type: "uint256";
            }];
            readonly internalType: "struct ICap.PartitionCap[]";
            readonly name: "partitionCap";
            readonly type: "tuple[]";
        }];
        readonly name: "initialize_Cap";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_maxSupply";
            readonly type: "uint256";
        }];
        readonly name: "setMaxSupply";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_maxSupply";
            readonly type: "uint256";
        }];
        readonly name: "setMaxSupplyByPartition";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): ICapInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICap;
}
