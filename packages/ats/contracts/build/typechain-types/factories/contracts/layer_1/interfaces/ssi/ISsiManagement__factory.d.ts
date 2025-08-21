import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ISsiManagement, ISsiManagementInterface } from "../../../../../contracts/layer_1/interfaces/ssi/ISsiManagement";
export declare class ISsiManagement__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "issuer";
            readonly type: "address";
        }];
        readonly name: "AccountIsNotIssuer";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "issuer";
            readonly type: "address";
        }];
        readonly name: "ListedIssuer";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "issuer";
            readonly type: "address";
        }];
        readonly name: "UnlistedIssuer";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "issuer";
            readonly type: "address";
        }];
        readonly name: "AddedToIssuerList";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "issuer";
            readonly type: "address";
        }];
        readonly name: "RemovedFromIssuerList";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "oldRegistryAddress";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "newRegistryAddress";
            readonly type: "address";
        }];
        readonly name: "RevocationRegistryUpdated";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_issuer";
            readonly type: "address";
        }];
        readonly name: "addIssuer";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getIssuerListCount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "issuerListCount_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getIssuerListMembers";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "members_";
            readonly type: "address[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getRevocationRegistryAddress";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "revocationRegistryAddress_";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_issuer";
            readonly type: "address";
        }];
        readonly name: "isIssuer";
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
            readonly name: "_issuer";
            readonly type: "address";
        }];
        readonly name: "removeIssuer";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_revocationRegistryAddress";
            readonly type: "address";
        }];
        readonly name: "setRevocationRegistryAddress";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): ISsiManagementInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ISsiManagement;
}
