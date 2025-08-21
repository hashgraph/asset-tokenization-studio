import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IExternalControlListManagement, IExternalControlListManagementInterface } from "../../../../../contracts/layer_1/interfaces/externalControlLists/IExternalControlListManagement";
export declare class IExternalControlListManagement__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "controlLista";
            readonly type: "address[]";
        }, {
            readonly internalType: "bool[]";
            readonly name: "actives";
            readonly type: "bool[]";
        }];
        readonly name: "ExternalControlListsNotUpdated";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "controlList";
            readonly type: "address";
        }];
        readonly name: "ListedControlList";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "controlList";
            readonly type: "address";
        }];
        readonly name: "UnlistedControlList";
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
            readonly name: "controlList";
            readonly type: "address";
        }];
        readonly name: "AddedToExternalControlLists";
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
            readonly name: "controlLists";
            readonly type: "address[]";
        }, {
            readonly indexed: false;
            readonly internalType: "bool[]";
            readonly name: "actives";
            readonly type: "bool[]";
        }];
        readonly name: "ExternalControlListsUpdated";
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
            readonly name: "controlList";
            readonly type: "address";
        }];
        readonly name: "RemovedFromExternalControlLists";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_controlList";
            readonly type: "address";
        }];
        readonly name: "addExternalControlList";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getExternalControlListsCount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "externalControlListsCount_";
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
        readonly name: "getExternalControlListsMembers";
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
            readonly name: "_controlLists";
            readonly type: "address[]";
        }];
        readonly name: "initialize_ExternalControlLists";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_controlList";
            readonly type: "address";
        }];
        readonly name: "isExternalControlList";
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
            readonly name: "_controlList";
            readonly type: "address";
        }];
        readonly name: "removeExternalControlList";
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
            readonly name: "_controlLists";
            readonly type: "address[]";
        }, {
            readonly internalType: "bool[]";
            readonly name: "_actives";
            readonly type: "bool[]";
        }];
        readonly name: "updateExternalControlLists";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IExternalControlListManagementInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IExternalControlListManagement;
}
