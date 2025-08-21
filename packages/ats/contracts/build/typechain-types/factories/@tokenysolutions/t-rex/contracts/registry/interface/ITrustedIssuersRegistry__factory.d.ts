import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ITrustedIssuersRegistry, ITrustedIssuersRegistryInterface } from "../../../../../../@tokenysolutions/t-rex/contracts/registry/interface/ITrustedIssuersRegistry";
export declare class ITrustedIssuersRegistry__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "contract IClaimIssuer";
            readonly name: "trustedIssuer";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256[]";
            readonly name: "claimTopics";
            readonly type: "uint256[]";
        }];
        readonly name: "ClaimTopicsUpdated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "contract IClaimIssuer";
            readonly name: "trustedIssuer";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256[]";
            readonly name: "claimTopics";
            readonly type: "uint256[]";
        }];
        readonly name: "TrustedIssuerAdded";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "contract IClaimIssuer";
            readonly name: "trustedIssuer";
            readonly type: "address";
        }];
        readonly name: "TrustedIssuerRemoved";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IClaimIssuer";
            readonly name: "_trustedIssuer";
            readonly type: "address";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "_claimTopics";
            readonly type: "uint256[]";
        }];
        readonly name: "addTrustedIssuer";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IClaimIssuer";
            readonly name: "_trustedIssuer";
            readonly type: "address";
        }];
        readonly name: "getTrustedIssuerClaimTopics";
        readonly outputs: readonly [{
            readonly internalType: "uint256[]";
            readonly name: "";
            readonly type: "uint256[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getTrustedIssuers";
        readonly outputs: readonly [{
            readonly internalType: "contract IClaimIssuer[]";
            readonly name: "";
            readonly type: "address[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "claimTopic";
            readonly type: "uint256";
        }];
        readonly name: "getTrustedIssuersForClaimTopic";
        readonly outputs: readonly [{
            readonly internalType: "contract IClaimIssuer[]";
            readonly name: "";
            readonly type: "address[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_issuer";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_claimTopic";
            readonly type: "uint256";
        }];
        readonly name: "hasClaimTopic";
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
        readonly name: "isTrustedIssuer";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IClaimIssuer";
            readonly name: "_trustedIssuer";
            readonly type: "address";
        }];
        readonly name: "removeTrustedIssuer";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IClaimIssuer";
            readonly name: "_trustedIssuer";
            readonly type: "address";
        }, {
            readonly internalType: "uint256[]";
            readonly name: "_claimTopics";
            readonly type: "uint256[]";
        }];
        readonly name: "updateIssuerClaimTopics";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): ITrustedIssuersRegistryInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ITrustedIssuersRegistry;
}
