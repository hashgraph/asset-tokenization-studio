import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ITREXFactory, ITREXFactoryInterface } from "../../../../../@tokenysolutions/t-rex/contracts/factory/ITREXFactory";
export declare class ITREXFactory__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_addr";
            readonly type: "address";
        }];
        readonly name: "Deployed";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_idFactory";
            readonly type: "address";
        }];
        readonly name: "IdFactorySet";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_implementationAuthority";
            readonly type: "address";
        }];
        readonly name: "ImplementationAuthoritySet";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_token";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_ir";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_irs";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_tir";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_ctr";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_mc";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "string";
            readonly name: "_salt";
            readonly type: "string";
        }];
        readonly name: "TREXSuiteDeployed";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "string";
            readonly name: "_salt";
            readonly type: "string";
        }, {
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "owner";
                readonly type: "address";
            }, {
                readonly internalType: "string";
                readonly name: "name";
                readonly type: "string";
            }, {
                readonly internalType: "string";
                readonly name: "symbol";
                readonly type: "string";
            }, {
                readonly internalType: "uint8";
                readonly name: "decimals";
                readonly type: "uint8";
            }, {
                readonly internalType: "address";
                readonly name: "irs";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "ONCHAINID";
                readonly type: "address";
            }, {
                readonly internalType: "address[]";
                readonly name: "irAgents";
                readonly type: "address[]";
            }, {
                readonly internalType: "address[]";
                readonly name: "tokenAgents";
                readonly type: "address[]";
            }, {
                readonly internalType: "address[]";
                readonly name: "complianceModules";
                readonly type: "address[]";
            }, {
                readonly internalType: "bytes[]";
                readonly name: "complianceSettings";
                readonly type: "bytes[]";
            }];
            readonly internalType: "struct ITREXFactory.TokenDetails";
            readonly name: "_tokenDetails";
            readonly type: "tuple";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint256[]";
                readonly name: "claimTopics";
                readonly type: "uint256[]";
            }, {
                readonly internalType: "address[]";
                readonly name: "issuers";
                readonly type: "address[]";
            }, {
                readonly internalType: "uint256[][]";
                readonly name: "issuerClaims";
                readonly type: "uint256[][]";
            }];
            readonly internalType: "struct ITREXFactory.ClaimDetails";
            readonly name: "_claimDetails";
            readonly type: "tuple";
        }];
        readonly name: "deployTREXSuite";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getIdFactory";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getImplementationAuthority";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "string";
            readonly name: "_salt";
            readonly type: "string";
        }];
        readonly name: "getToken";
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
            readonly name: "_contract";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "_newOwner";
            readonly type: "address";
        }];
        readonly name: "recoverContractOwnership";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_idFactory";
            readonly type: "address";
        }];
        readonly name: "setIdFactory";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_implementationAuthority";
            readonly type: "address";
        }];
        readonly name: "setImplementationAuthority";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): ITREXFactoryInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ITREXFactory;
}
