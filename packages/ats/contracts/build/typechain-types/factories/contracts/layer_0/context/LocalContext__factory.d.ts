import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { LocalContext, LocalContextInterface } from "../../../../contracts/layer_0/context/LocalContext";
export declare class LocalContext__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "ExpirationNotReached";
        readonly type: "error";
    }];
    static createInterface(): LocalContextInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): LocalContext;
}
