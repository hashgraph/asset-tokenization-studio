import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IDiamondCut, IDiamondCutInterface } from "../../../../../contracts/interfaces/resolver/resolverProxy/IDiamondCut";
export declare class IDiamondCut__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "getConfigInfo";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "resolver_";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "configurationId_";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "version_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getStaticFunctionSelectors";
        readonly outputs: readonly [{
            readonly internalType: "bytes4[]";
            readonly name: "staticFunctionSelectors_";
            readonly type: "bytes4[]";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getStaticInterfaceIds";
        readonly outputs: readonly [{
            readonly internalType: "bytes4[]";
            readonly name: "staticInterfaceIds_";
            readonly type: "bytes4[]";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getStaticResolverKey";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "staticResolverKey_";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_newConfigurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_newVersion";
            readonly type: "uint256";
        }];
        readonly name: "updateConfig";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_newVersion";
            readonly type: "uint256";
        }];
        readonly name: "updateConfigVersion";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IBusinessLogicResolver";
            readonly name: "_newResolver";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_newConfigurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_newVersion";
            readonly type: "uint256";
        }];
        readonly name: "updateResolver";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IDiamondCutInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IDiamondCut;
}
