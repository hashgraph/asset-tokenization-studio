import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IIdentityRegistry, IIdentityRegistryInterface } from "../../../../../../@tokenysolutions/t-rex/contracts/registry/interface/IIdentityRegistry";
export declare class IIdentityRegistry__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "claimTopicsRegistry";
            readonly type: "address";
        }];
        readonly name: "ClaimTopicsRegistrySet";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "investorAddress";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "uint16";
            readonly name: "country";
            readonly type: "uint16";
        }];
        readonly name: "CountryUpdated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "investorAddress";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "contract IIdentity";
            readonly name: "identity";
            readonly type: "address";
        }];
        readonly name: "IdentityRegistered";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "investorAddress";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "contract IIdentity";
            readonly name: "identity";
            readonly type: "address";
        }];
        readonly name: "IdentityRemoved";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "identityStorage";
            readonly type: "address";
        }];
        readonly name: "IdentityStorageSet";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "contract IIdentity";
            readonly name: "oldIdentity";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "contract IIdentity";
            readonly name: "newIdentity";
            readonly type: "address";
        }];
        readonly name: "IdentityUpdated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "trustedIssuersRegistry";
            readonly type: "address";
        }];
        readonly name: "TrustedIssuersRegistrySet";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "_userAddresses";
            readonly type: "address[]";
        }, {
            readonly internalType: "contract IIdentity[]";
            readonly name: "_identities";
            readonly type: "address[]";
        }, {
            readonly internalType: "uint16[]";
            readonly name: "_countries";
            readonly type: "uint16[]";
        }];
        readonly name: "batchRegisterIdentity";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_userAddress";
            readonly type: "address";
        }];
        readonly name: "contains";
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
            readonly name: "_userAddress";
            readonly type: "address";
        }];
        readonly name: "deleteIdentity";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_userAddress";
            readonly type: "address";
        }];
        readonly name: "identity";
        readonly outputs: readonly [{
            readonly internalType: "contract IIdentity";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "identityStorage";
        readonly outputs: readonly [{
            readonly internalType: "contract IIdentityRegistryStorage";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_userAddress";
            readonly type: "address";
        }];
        readonly name: "investorCountry";
        readonly outputs: readonly [{
            readonly internalType: "uint16";
            readonly name: "";
            readonly type: "uint16";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_userAddress";
            readonly type: "address";
        }];
        readonly name: "isVerified";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "issuersRegistry";
        readonly outputs: readonly [{
            readonly internalType: "contract ITrustedIssuersRegistry";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_userAddress";
            readonly type: "address";
        }, {
            readonly internalType: "contract IIdentity";
            readonly name: "_identity";
            readonly type: "address";
        }, {
            readonly internalType: "uint16";
            readonly name: "_country";
            readonly type: "uint16";
        }];
        readonly name: "registerIdentity";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_claimTopicsRegistry";
            readonly type: "address";
        }];
        readonly name: "setClaimTopicsRegistry";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_identityRegistryStorage";
            readonly type: "address";
        }];
        readonly name: "setIdentityRegistryStorage";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_trustedIssuersRegistry";
            readonly type: "address";
        }];
        readonly name: "setTrustedIssuersRegistry";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "topicsRegistry";
        readonly outputs: readonly [{
            readonly internalType: "contract IClaimTopicsRegistry";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_userAddress";
            readonly type: "address";
        }, {
            readonly internalType: "uint16";
            readonly name: "_country";
            readonly type: "uint16";
        }];
        readonly name: "updateCountry";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_userAddress";
            readonly type: "address";
        }, {
            readonly internalType: "contract IIdentity";
            readonly name: "_identity";
            readonly type: "address";
        }];
        readonly name: "updateIdentity";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IIdentityRegistryInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IIdentityRegistry;
}
