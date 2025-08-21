import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IERC1643, IERC1643Interface } from "../../../../../contracts/layer_1/interfaces/ERC1400/IERC1643";
export declare class IERC1643__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "name";
            readonly type: "bytes32";
        }];
        readonly name: "DocumentDoesNotExist";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "EmptyHASH";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "EmptyName";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "EmptyURI";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "name";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "string";
            readonly name: "uri";
            readonly type: "string";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "documentHash";
            readonly type: "bytes32";
        }];
        readonly name: "DocumentRemoved";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "name";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "string";
            readonly name: "uri";
            readonly type: "string";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "documentHash";
            readonly type: "bytes32";
        }];
        readonly name: "DocumentUpdated";
        readonly type: "event";
    }, {
        readonly inputs: readonly [];
        readonly name: "getAllDocuments";
        readonly outputs: readonly [{
            readonly internalType: "bytes32[]";
            readonly name: "";
            readonly type: "bytes32[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_name";
            readonly type: "bytes32";
        }];
        readonly name: "getDocument";
        readonly outputs: readonly [{
            readonly internalType: "string";
            readonly name: "";
            readonly type: "string";
        }, {
            readonly internalType: "bytes32";
            readonly name: "";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_name";
            readonly type: "bytes32";
        }];
        readonly name: "removeDocument";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_name";
            readonly type: "bytes32";
        }, {
            readonly internalType: "string";
            readonly name: "_uri";
            readonly type: "string";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_documentHash";
            readonly type: "bytes32";
        }];
        readonly name: "setDocument";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IERC1643Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): IERC1643;
}
