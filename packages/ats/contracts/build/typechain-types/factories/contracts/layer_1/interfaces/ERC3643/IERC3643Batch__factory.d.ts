import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IERC3643Batch, IERC3643BatchInterface } from "../../../../../contracts/layer_1/interfaces/ERC3643/IERC3643Batch";
export declare class IERC3643Batch__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "_userAddresses";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "_amounts";
            readonly type: "uint256[]";
        }];
        readonly name: "batchBurn";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "_fromList";
            readonly type: "address[]";
        }, {
            readonly internalType: "address[]";
            readonly name: "_toList";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "_amounts";
            readonly type: "uint256[]";
        }];
        readonly name: "batchForcedTransfer";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "_toList";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "_amounts";
            readonly type: "uint256[]";
        }];
        readonly name: "batchMint";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "_toList";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "_amounts";
            readonly type: "uint256[]";
        }];
        readonly name: "batchTransfer";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IERC3643BatchInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IERC3643Batch;
}
