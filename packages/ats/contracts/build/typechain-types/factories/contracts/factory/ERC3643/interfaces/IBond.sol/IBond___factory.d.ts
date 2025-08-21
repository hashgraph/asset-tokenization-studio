import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IBond_, IBond_Interface } from "../../../../../../contracts/factory/ERC3643/interfaces/IBond.sol/IBond_";
export declare class IBond___factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "getBondDetails";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes3";
                readonly name: "currency";
                readonly type: "bytes3";
            }, {
                readonly internalType: "uint256";
                readonly name: "nominalValue";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "startingDate";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "maturityDate";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBond_.BondDetailsData";
            readonly name: "bondDetailsData_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_couponID";
            readonly type: "uint256";
        }];
        readonly name: "getCoupon";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "recordDate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "executionDate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "rate";
                    readonly type: "uint256";
                }];
                readonly internalType: "struct IBond_.Coupon";
                readonly name: "coupon";
                readonly type: "tuple";
            }, {
                readonly internalType: "uint256";
                readonly name: "snapshotId";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBond_.RegisteredCoupon";
            readonly name: "registeredCoupon_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getCouponCount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "couponCount_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getCouponDetails";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "couponFrequency";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "couponRate";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "firstCouponDate";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBond_.CouponDetailsData";
            readonly name: "couponDetails_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_couponID";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_account";
            readonly type: "address";
        }];
        readonly name: "getCouponFor";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "tokenBalance";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "rate";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "recordDate";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "executionDate";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint8";
                readonly name: "decimals";
                readonly type: "uint8";
            }, {
                readonly internalType: "bool";
                readonly name: "recordDateReached";
                readonly type: "bool";
            }];
            readonly internalType: "struct IBond_.CouponFor";
            readonly name: "couponFor_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_couponID";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getCouponHolders";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "holders_";
            readonly type: "address[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_couponID";
            readonly type: "uint256";
        }];
        readonly name: "getTotalCouponHolders";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "redeemAtMaturityByPartition";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "recordDate";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "executionDate";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "rate";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IBond_.Coupon";
            readonly name: "_newCoupon";
            readonly type: "tuple";
        }];
        readonly name: "setCoupon";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }, {
            readonly internalType: "uint256";
            readonly name: "couponID_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_maturityDate";
            readonly type: "uint256";
        }];
        readonly name: "updateMaturityDate";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IBond_Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): IBond_;
}
