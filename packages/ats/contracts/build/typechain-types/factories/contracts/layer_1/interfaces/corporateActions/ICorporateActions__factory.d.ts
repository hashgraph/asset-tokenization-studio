import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ICorporateActions, ICorporateActionsInterface } from "../../../../../contracts/layer_1/interfaces/corporateActions/ICorporateActions";
export declare class ICorporateActions__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "actionType";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly name: "DuplicatedCorporateAction";
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
            readonly internalType: "bytes32";
            readonly name: "actionType";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "corporateActionId";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "corporateActionIndexByType";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly name: "CorporateActionAdded";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_actionType";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }];
        readonly name: "addCorporateAction";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }, {
            readonly internalType: "bytes32";
            readonly name: "corporateActionId_";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "corporateActionIndexByType_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_corporateActionId";
            readonly type: "bytes32";
        }];
        readonly name: "getCorporateAction";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "actionType_";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "data_";
            readonly type: "bytes";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getCorporateActionCount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "corporateActionCount_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_actionType";
            readonly type: "bytes32";
        }];
        readonly name: "getCorporateActionCountByType";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "corporateActionCount_";
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
        readonly name: "getCorporateActionIds";
        readonly outputs: readonly [{
            readonly internalType: "bytes32[]";
            readonly name: "corporateActionIds_";
            readonly type: "bytes32[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_actionType";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getCorporateActionIdsByType";
        readonly outputs: readonly [{
            readonly internalType: "bytes32[]";
            readonly name: "corporateActionIds_";
            readonly type: "bytes32[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): ICorporateActionsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ICorporateActions;
}
