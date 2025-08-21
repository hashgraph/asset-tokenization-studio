import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IExternalPauseManagement, IExternalPauseManagementInterface } from "../../../../../contracts/layer_1/interfaces/externalPauses/IExternalPauseManagement";
export declare class IExternalPauseManagement__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "pauses";
            readonly type: "address[]";
        }, {
            readonly internalType: "bool[]";
            readonly name: "actives";
            readonly type: "bool[]";
        }];
        readonly name: "ExternalPausesNotUpdated";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "pause";
            readonly type: "address";
        }];
        readonly name: "ListedPause";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "pause";
            readonly type: "address";
        }];
        readonly name: "UnlistedPause";
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
            readonly name: "pause";
            readonly type: "address";
        }];
        readonly name: "AddedToExternalPauses";
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
            readonly name: "pauses";
            readonly type: "address[]";
        }, {
            readonly indexed: false;
            readonly internalType: "bool[]";
            readonly name: "actives";
            readonly type: "bool[]";
        }];
        readonly name: "ExternalPausesUpdated";
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
            readonly name: "pause";
            readonly type: "address";
        }];
        readonly name: "RemovedFromExternalPauses";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_pause";
            readonly type: "address";
        }];
        readonly name: "addExternalPause";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getExternalPausesCount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "externalPausesCount_";
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
        readonly name: "getExternalPausesMembers";
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
            readonly name: "_pauses";
            readonly type: "address[]";
        }];
        readonly name: "initialize_ExternalPauses";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_pause";
            readonly type: "address";
        }];
        readonly name: "isExternalPause";
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
            readonly name: "_pause";
            readonly type: "address";
        }];
        readonly name: "removeExternalPause";
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
            readonly name: "_pauses";
            readonly type: "address[]";
        }, {
            readonly internalType: "bool[]";
            readonly name: "_actives";
            readonly type: "bool[]";
        }];
        readonly name: "updateExternalPauses";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IExternalPauseManagementInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IExternalPauseManagement;
}
