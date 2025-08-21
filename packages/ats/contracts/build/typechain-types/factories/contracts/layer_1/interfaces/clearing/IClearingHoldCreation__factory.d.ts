import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IClearingHoldCreation, IClearingHoldCreationInterface } from "../../../../../contracts/layer_1/interfaces/clearing/IClearingHoldCreation";
export declare class IClearingHoldCreation__factory {
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
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "expirationTimestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "address";
                readonly name: "escrow";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "to";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }];
            readonly internalType: "struct Hold";
            readonly name: "_hold";
            readonly type: "tuple";
        }];
        readonly name: "clearingCreateHoldByPartition";
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
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "expirationTimestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "address";
                readonly name: "escrow";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "to";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }];
            readonly internalType: "struct Hold";
            readonly name: "_hold";
            readonly type: "tuple";
        }];
        readonly name: "clearingCreateHoldFromByPartition";
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
            readonly name: "_partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_clearingId";
            readonly type: "uint256";
        }];
        readonly name: "getClearingCreateHoldForByPartition";
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
                readonly internalType: "address";
                readonly name: "holdEscrow";
                readonly type: "address";
            }, {
                readonly internalType: "uint256";
                readonly name: "holdExpirationTimestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "address";
                readonly name: "holdTo";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "holdData";
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
            readonly internalType: "struct IClearing.ClearingHoldCreationData";
            readonly name: "clearingHoldCreationData_";
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
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "expirationTimestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "address";
                readonly name: "escrow";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "to";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }];
            readonly internalType: "struct Hold";
            readonly name: "_hold";
            readonly type: "tuple";
        }];
        readonly name: "operatorClearingCreateHoldByPartition";
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
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "expirationTimestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "address";
                readonly name: "escrow";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "to";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }];
            readonly internalType: "struct Hold";
            readonly name: "_hold";
            readonly type: "tuple";
        }, {
            readonly internalType: "bytes";
            readonly name: "_signature";
            readonly type: "bytes";
        }];
        readonly name: "protectedClearingCreateHoldByPartition";
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
    static createInterface(): IClearingHoldCreationInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IClearingHoldCreation;
}
