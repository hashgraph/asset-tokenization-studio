import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IERC3643Basic, IERC3643BasicInterface } from "../../../../../contracts/layer_1/interfaces/ERC3643/IERC3643Basic";
export declare class IERC3643Basic__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "AddressNotVerified";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "CannotRecoverWallet";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ComplianceCallFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ComplianceNotAllowed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "IdentityRegistryCallFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InputAmountsArrayLengthMismatch";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InputBoolArrayLengthMismatch";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "WalletRecovered";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_agent";
            readonly type: "address";
        }];
        readonly name: "AgentAdded";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_agent";
            readonly type: "address";
        }];
        readonly name: "AgentRemoved";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "identityRegistry";
            readonly type: "address";
        }];
        readonly name: "IdentityRegistryAdded";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_lostWallet";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_newWallet";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_investorOnchainID";
            readonly type: "address";
        }];
        readonly name: "RecoverySuccess";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "string";
            readonly name: "newName";
            readonly type: "string";
        }, {
            readonly indexed: true;
            readonly internalType: "string";
            readonly name: "newSymbol";
            readonly type: "string";
        }, {
            readonly indexed: false;
            readonly internalType: "uint8";
            readonly name: "newDecimals";
            readonly type: "uint8";
        }, {
            readonly indexed: false;
            readonly internalType: "string";
            readonly name: "newVersion";
            readonly type: "string";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "newOnchainID";
            readonly type: "address";
        }];
        readonly name: "UpdatedTokenInformation";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_agent";
            readonly type: "address";
        }];
        readonly name: "addAgent";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_userAddress";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "burn";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "compliance";
        readonly outputs: readonly [{
            readonly internalType: "contract ICompliance";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_from";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "_to";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "forcedTransfer";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "identityRegistry";
        readonly outputs: readonly [{
            readonly internalType: "contract IIdentityRegistry";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_compliance";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "_identityRegistry";
            readonly type: "address";
        }];
        readonly name: "initialize_ERC3643";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_wallet";
            readonly type: "address";
        }];
        readonly name: "isAddressRecovered";
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
            readonly name: "_agent";
            readonly type: "address";
        }];
        readonly name: "isAgent";
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
            readonly name: "_to";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "mint";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "onchainID";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_lostWallet";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "_newWallet";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "_investorOnchainID";
            readonly type: "address";
        }];
        readonly name: "recoveryAddress";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_agent";
            readonly type: "address";
        }];
        readonly name: "removeAgent";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_compliance";
            readonly type: "address";
        }];
        readonly name: "setCompliance";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_identityRegistry";
            readonly type: "address";
        }];
        readonly name: "setIdentityRegistry";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "string";
            readonly name: "_name";
            readonly type: "string";
        }];
        readonly name: "setName";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_onchainID";
            readonly type: "address";
        }];
        readonly name: "setOnchainID";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "string";
            readonly name: "_symbol";
            readonly type: "string";
        }];
        readonly name: "setSymbol";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "version";
        readonly outputs: readonly [{
            readonly internalType: "string";
            readonly name: "";
            readonly type: "string";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IERC3643BasicInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IERC3643Basic;
}
