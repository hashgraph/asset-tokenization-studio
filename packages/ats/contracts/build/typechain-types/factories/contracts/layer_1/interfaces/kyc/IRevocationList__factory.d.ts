import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IRevocationList, IRevocationListInterface } from "../../../../../contracts/layer_1/interfaces/kyc/IRevocationList";
export declare class IRevocationList__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }, {
            readonly internalType: "string";
            readonly name: "";
            readonly type: "string";
        }];
        readonly name: "revoked";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IRevocationListInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IRevocationList;
}
