import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IClearingRedeem, IClearingRedeemInterface } from "../../../../../contracts/layer_1/interfaces/clearing/IClearingRedeem";
export declare class IClearingRedeem__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "ClearingIsActivated";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ClearingIsDisabled";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ExpirationDateNotReached";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ExpirationDateReached";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "WrongClearingId";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "partition";
                readonly type: "bytes32";
            }, {
                readonly internalType: "uint256";
                readonly name: "expirationTimestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }];
            readonly internalType: "struct IClearing.ClearingOperation";
            readonly name: "_clearingOperation";
            readonly type: "tuple";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "clearingRedeemByPartition";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }, {
            readonly internalType: "uint256";
            readonly name: "clearingId_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "partition";
                    readonly type: "bytes32";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "expirationTimestamp";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "data";
                    readonly type: "bytes";
                }];
                readonly internalType: "struct IClearing.ClearingOperation";
                readonly name: "clearingOperation";
                readonly type: "tuple";
            }, {
                readonly internalType: "address";
                readonly name: "from";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "operatorData";
                readonly type: "bytes";
            }];
            readonly internalType: "struct IClearing.ClearingOperationFrom";
            readonly name: "_clearingOperationFrom";
            readonly type: "tuple";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "clearingRedeemFromByPartition";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }, {
            readonly internalType: "uint256";
            readonly name: "clearingId_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "clearingId";
            readonly type: "uint256";
        }];
        readonly name: "getClearingRedeemForByPartition";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "expirationTimestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }, {
                readonly internalType: "bytes";
                readonly name: "operatorData";
                readonly type: "bytes";
            }, {
                readonly internalType: "enum ThirdPartyType";
                readonly name: "operatorType";
                readonly type: "uint8";
            }];
            readonly internalType: "struct IClearing.ClearingRedeemData";
            readonly name: "clearingRedeemData_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "partition";
                    readonly type: "bytes32";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "expirationTimestamp";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "data";
                    readonly type: "bytes";
                }];
                readonly internalType: "struct IClearing.ClearingOperation";
                readonly name: "clearingOperation";
                readonly type: "tuple";
            }, {
                readonly internalType: "address";
                readonly name: "from";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "operatorData";
                readonly type: "bytes";
            }];
            readonly internalType: "struct IClearing.ClearingOperationFrom";
            readonly name: "_clearingOperationFrom";
            readonly type: "tuple";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "operatorClearingRedeemByPartition";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }, {
            readonly internalType: "uint256";
            readonly name: "clearingId_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "bytes32";
                    readonly name: "partition";
                    readonly type: "bytes32";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "expirationTimestamp";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "data";
                    readonly type: "bytes";
                }];
                readonly internalType: "struct IClearing.ClearingOperation";
                readonly name: "clearingOperation";
                readonly type: "tuple";
            }, {
                readonly internalType: "address";
                readonly name: "from";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "deadline";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "nonce";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IClearing.ProtectedClearingOperation";
            readonly name: "_protectedClearingOperation";
            readonly type: "tuple";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "_signature";
            readonly type: "bytes";
        }];
        readonly name: "protectedClearingRedeemByPartition";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }, {
            readonly internalType: "uint256";
            readonly name: "clearingId_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IClearingRedeemInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IClearingRedeem;
}
