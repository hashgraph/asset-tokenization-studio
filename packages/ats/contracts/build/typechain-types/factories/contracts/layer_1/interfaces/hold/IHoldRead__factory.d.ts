import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IHoldRead, IHoldReadInterface } from "../../../../../contracts/layer_1/interfaces/hold/IHoldRead";
export declare class IHoldRead__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }];
        readonly name: "getHeldAmountFor";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "amount_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }];
        readonly name: "getHeldAmountForByPartition";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "amount_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }];
        readonly name: "getHoldCountForByPartition";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "holdCount_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "partition";
                readonly type: "bytes32";
            }, {
                readonly internalType: "address";
                readonly name: "tokenHolder";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "holdId";
                readonly type: "uint256";
            }];
            readonly internalType: "struct HoldIdentifier";
            readonly name: "_holdIdentifier";
            readonly type: "tuple";
        }];
        readonly name: "getHoldForByPartition";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "amount_";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "expirationTimestamp_";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "escrow_";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "destination_";
            readonly type: "address";
        }, {
            readonly internalType: "bytes";
            readonly name: "data_";
            readonly type: "bytes";
        }, {
            readonly internalType: "bytes";
            readonly name: "operatorData_";
            readonly type: "bytes";
        }, {
            readonly internalType: "enum ThirdPartyType";
            readonly name: "thirdPartyType_";
            readonly type: "uint8";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "partition";
                readonly type: "bytes32";
            }, {
                readonly internalType: "address";
                readonly name: "tokenHolder";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "holdId";
                readonly type: "uint256";
            }];
            readonly internalType: "struct HoldIdentifier";
            readonly name: "_holdIdentifier";
            readonly type: "tuple";
        }];
        readonly name: "getHoldThirdParty";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "thirdParty_";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getHoldsIdForByPartition";
        readonly outputs: readonly [{
            readonly internalType: "uint256[]";
            readonly name: "holdsId_";
            readonly type: "uint256[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IHoldReadInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IHoldRead;
}
