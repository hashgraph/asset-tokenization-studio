import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IAdjustBalances, IAdjustBalancesInterface } from "../../../../../contracts/layer_2/interfaces/adjustBalances/IAdjustBalances";
export declare class IAdjustBalances__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "factor";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint8";
            readonly name: "decimals";
            readonly type: "uint8";
        }];
        readonly name: "adjustBalances";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IAdjustBalancesInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IAdjustBalances;
}
