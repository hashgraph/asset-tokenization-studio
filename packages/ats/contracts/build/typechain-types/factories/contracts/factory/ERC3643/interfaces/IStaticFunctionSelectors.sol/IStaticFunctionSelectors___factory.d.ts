import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IStaticFunctionSelectors_, IStaticFunctionSelectors_Interface } from "../../../../../../contracts/factory/ERC3643/interfaces/IStaticFunctionSelectors.sol/IStaticFunctionSelectors_";
export declare class IStaticFunctionSelectors___factory {
    static readonly abi: readonly [{
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
    }];
    static createInterface(): IStaticFunctionSelectors_Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): IStaticFunctionSelectors_;
}
