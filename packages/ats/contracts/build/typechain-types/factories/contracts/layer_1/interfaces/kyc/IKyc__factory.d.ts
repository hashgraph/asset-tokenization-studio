import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IKyc, IKycInterface } from "../../../../../contracts/layer_1/interfaces/kyc/IKyc";
export declare class IKyc__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "InvalidDates";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidKycStatus";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidZeroAddress";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "KycIsNotGranted";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bool";
            readonly name: "activated";
            readonly type: "bool";
        }];
        readonly name: "InternalKycStatusUpdated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "issuer";
            readonly type: "address";
        }];
        readonly name: "KycGranted";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "issuer";
            readonly type: "address";
        }];
        readonly name: "KycRevoked";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "activateInternalKyc";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "deactivateInternalKyc";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "enum IKyc.KycStatus";
            readonly name: "_kycStatus";
            readonly type: "uint8";
        }];
        readonly name: "getKycAccountsCount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "kycAccountsCount_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "enum IKyc.KycStatus";
            readonly name: "_kycStatus";
            readonly type: "uint8";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getKycAccountsData";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "accounts_";
            readonly type: "address[]";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "validFrom";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "validTo";
                readonly type: "uint256";
            }, {
                readonly internalType: "string";
                readonly name: "vcId";
                readonly type: "string";
            }, {
                readonly internalType: "address";
                readonly name: "issuer";
                readonly type: "address";
            }, {
                readonly internalType: "enum IKyc.KycStatus";
                readonly name: "status";
                readonly type: "uint8";
            }];
            readonly internalType: "struct IKyc.KycData[]";
            readonly name: "kycData_";
            readonly type: "tuple[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_account";
            readonly type: "address";
        }];
        readonly name: "getKycFor";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "validFrom";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "validTo";
                readonly type: "uint256";
            }, {
                readonly internalType: "string";
                readonly name: "vcId";
                readonly type: "string";
            }, {
                readonly internalType: "address";
                readonly name: "issuer";
                readonly type: "address";
            }, {
                readonly internalType: "enum IKyc.KycStatus";
                readonly name: "status";
                readonly type: "uint8";
            }];
            readonly internalType: "struct IKyc.KycData";
            readonly name: "kyc_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_account";
            readonly type: "address";
        }];
        readonly name: "getKycStatusFor";
        readonly outputs: readonly [{
            readonly internalType: "enum IKyc.KycStatus";
            readonly name: "kycStatus_";
            readonly type: "uint8";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_account";
            readonly type: "address";
        }, {
            readonly internalType: "string";
            readonly name: "_vcId";
            readonly type: "string";
        }, {
            readonly internalType: "uint256";
            readonly name: "_validFrom";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_validTo";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_issuer";
            readonly type: "address";
        }];
        readonly name: "grantKyc";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bool";
            readonly name: "_activateInternalKyc";
            readonly type: "bool";
        }];
        readonly name: "initializeInternalKyc";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "isInternalKycActivated";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_account";
            readonly type: "address";
        }];
        readonly name: "revokeKyc";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IKycInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IKyc;
}
