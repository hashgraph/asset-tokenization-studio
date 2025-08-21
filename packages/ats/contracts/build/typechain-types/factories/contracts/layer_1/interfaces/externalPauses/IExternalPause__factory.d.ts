import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IExternalPause, IExternalPauseInterface } from "../../../../../contracts/layer_1/interfaces/externalPauses/IExternalPause";
export declare class IExternalPause__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "isPaused";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IExternalPauseInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IExternalPause;
}
