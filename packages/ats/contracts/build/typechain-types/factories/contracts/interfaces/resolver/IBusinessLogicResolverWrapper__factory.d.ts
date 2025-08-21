import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IBusinessLogicResolverWrapper, IBusinessLogicResolverWrapperInterface } from "../../../../contracts/interfaces/resolver/IBusinessLogicResolverWrapper";
export declare class IBusinessLogicResolverWrapper__factory {
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
    static createInterface(): IBusinessLogicResolverWrapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IBusinessLogicResolverWrapper;
}
