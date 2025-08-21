import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IIdentityRegistryStorage, IIdentityRegistryStorageInterface } from "../../../../../../@tokenysolutions/t-rex/contracts/registry/interface/IIdentityRegistryStorage";
export declare class IIdentityRegistryStorage__factory {
    static readonly abi: readonly [{
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
        readonly name: "CountryModified";
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
        readonly name: "IdentityModified";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "identityRegistry";
            readonly type: "address";
        }];
        readonly name: "IdentityRegistryBound";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "identityRegistry";
            readonly type: "address";
        }];
        readonly name: "IdentityRegistryUnbound";
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
        readonly name: "IdentityStored";
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
        readonly name: "IdentityUnstored";
        readonly type: "event";
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
        readonly name: "addIdentityToStorage";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_identityRegistry";
            readonly type: "address";
        }];
        readonly name: "bindIdentityRegistry";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "linkedIdentityRegistries";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "";
            readonly type: "address[]";
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
        }];
        readonly name: "modifyStoredIdentity";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
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
        readonly name: "modifyStoredInvestorCountry";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_userAddress";
            readonly type: "address";
        }];
        readonly name: "removeIdentityFromStorage";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_userAddress";
            readonly type: "address";
        }];
        readonly name: "storedIdentity";
        readonly outputs: readonly [{
            readonly internalType: "contract IIdentity";
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
        readonly name: "storedInvestorCountry";
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
            readonly name: "_identityRegistry";
            readonly type: "address";
        }];
        readonly name: "unbindIdentityRegistry";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IIdentityRegistryStorageInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IIdentityRegistryStorage;
}
