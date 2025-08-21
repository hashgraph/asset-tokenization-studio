import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IExternalKycListManagement, IExternalKycListManagementInterface } from "../../../../../contracts/layer_1/interfaces/externalKycLists/IExternalKycListManagement";
export declare class IExternalKycListManagement__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "kycList";
            readonly type: "address[]";
        }, {
            readonly internalType: "bool[]";
            readonly name: "actives";
            readonly type: "bool[]";
        }];
        readonly name: "ExternalKycListsNotUpdated";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "kycList";
            readonly type: "address";
        }];
        readonly name: "ListedKycList";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "kycList";
            readonly type: "address";
        }];
        readonly name: "UnlistedKycList";
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
            readonly internalType: "address";
            readonly name: "kycList";
            readonly type: "address";
        }];
        readonly name: "AddedToExternalKycLists";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address[]";
            readonly name: "kycLists";
            readonly type: "address[]";
        }, {
            readonly indexed: false;
            readonly internalType: "bool[]";
            readonly name: "actives";
            readonly type: "bool[]";
        }];
        readonly name: "ExternalKycListsUpdated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "kycList";
            readonly type: "address";
        }];
        readonly name: "RemovedFromExternalKycLists";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_kycList";
            readonly type: "address";
        }];
        readonly name: "addExternalKycList";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getExternalKycListsCount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "externalKycListsCount_";
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
        readonly name: "getExternalKycListsMembers";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "members_";
            readonly type: "address[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "_kycLists";
            readonly type: "address[]";
        }];
        readonly name: "initialize_ExternalKycLists";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_kycList";
            readonly type: "address";
        }];
        readonly name: "isExternalKycList";
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
        }, {
            readonly internalType: "enum IKyc.KycStatus";
            readonly name: "_kycStatus";
            readonly type: "uint8";
        }];
        readonly name: "isExternallyGranted";
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
            readonly name: "_kycList";
            readonly type: "address";
        }];
        readonly name: "removeExternalKycList";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "_kycLists";
            readonly type: "address[]";
        }, {
            readonly internalType: "bool[]";
            readonly name: "_actives";
            readonly type: "bool[]";
        }];
        readonly name: "updateExternalKycLists";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IExternalKycListManagementInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IExternalKycListManagement;
}
