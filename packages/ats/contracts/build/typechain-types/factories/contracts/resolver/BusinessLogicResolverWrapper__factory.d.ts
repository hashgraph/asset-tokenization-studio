import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { BusinessLogicResolverWrapper, BusinessLogicResolverWrapperInterface } from "../../../contracts/resolver/BusinessLogicResolverWrapper";
export declare class BusinessLogicResolverWrapper__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "AllBusinessLogicKeysMustBeenInformed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "businessLogicKey";
            readonly type: "bytes32";
        }];
        readonly name: "BusinessLogicKeyDuplicated";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "businessLogicKey";
            readonly type: "bytes32";
        }];
        readonly name: "BusinessLogicNotActive";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "version";
            readonly type: "uint256";
        }];
        readonly name: "BusinessLogicVersionDoesNotExist";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ZeroKeyNotValidForBusinessLogic";
        readonly type: "error";
    }];
    static createInterface(): BusinessLogicResolverWrapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): BusinessLogicResolverWrapper;
}
