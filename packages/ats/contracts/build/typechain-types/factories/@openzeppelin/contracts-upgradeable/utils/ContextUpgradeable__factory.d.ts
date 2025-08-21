import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ContextUpgradeable, ContextUpgradeableInterface } from "../../../../@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable";
export declare class ContextUpgradeable__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "uint8";
            readonly name: "version";
            readonly type: "uint8";
        }];
        readonly name: "Initialized";
        readonly type: "event";
    }];
    static createInterface(): ContextUpgradeableInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ContextUpgradeable;
}
