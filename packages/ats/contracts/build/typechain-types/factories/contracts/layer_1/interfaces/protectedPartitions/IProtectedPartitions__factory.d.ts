import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IProtectedPartitions, IProtectedPartitionsInterface } from "../../../../../contracts/layer_1/interfaces/protectedPartitions/IProtectedPartitions";
export declare class IProtectedPartitions__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "arePartitionsProtected";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_partition";
            readonly type: "bytes32";
        }];
        readonly name: "calculateRoleForPartition";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "roleForPartition_";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "getNounceFor";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bool";
            readonly name: "_arePartitionsProtected";
            readonly type: "bool";
        }];
        readonly name: "initialize_ProtectedPartitions";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "protectPartitions";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "unprotectPartitions";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IProtectedPartitionsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IProtectedPartitions;
}
