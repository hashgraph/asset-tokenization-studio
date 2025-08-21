import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IClaimTopicsRegistry, IClaimTopicsRegistryInterface } from "../../../../../../@tokenysolutions/t-rex/contracts/registry/interface/IClaimTopicsRegistry";
export declare class IClaimTopicsRegistry__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "claimTopic";
            readonly type: "uint256";
        }];
        readonly name: "ClaimTopicAdded";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "claimTopic";
            readonly type: "uint256";
        }];
        readonly name: "ClaimTopicRemoved";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_claimTopic";
            readonly type: "uint256";
        }];
        readonly name: "addClaimTopic";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getClaimTopics";
        readonly outputs: readonly [{
            readonly internalType: "uint256[]";
            readonly name: "";
            readonly type: "uint256[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_claimTopic";
            readonly type: "uint256";
        }];
        readonly name: "removeClaimTopic";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IClaimTopicsRegistryInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IClaimTopicsRegistry;
}
