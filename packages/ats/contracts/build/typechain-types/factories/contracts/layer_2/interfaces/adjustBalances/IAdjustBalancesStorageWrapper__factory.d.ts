import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IAdjustBalancesStorageWrapper, IAdjustBalancesStorageWrapperInterface } from "../../../../../contracts/layer_2/interfaces/adjustBalances/IAdjustBalancesStorageWrapper";
export declare class IAdjustBalancesStorageWrapper__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "FactorIsZero";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "factor";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint8";
            readonly name: "decimals";
            readonly type: "uint8";
        }];
        readonly name: "AdjustmentBalanceSet";
        readonly type: "event";
    }];
    static createInterface(): IAdjustBalancesStorageWrapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IAdjustBalancesStorageWrapper;
}
