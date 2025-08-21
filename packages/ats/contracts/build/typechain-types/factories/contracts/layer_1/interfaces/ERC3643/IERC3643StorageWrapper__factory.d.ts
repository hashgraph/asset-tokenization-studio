import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IERC3643StorageWrapper, IERC3643StorageWrapperInterface } from "../../../../../contracts/layer_1/interfaces/ERC3643/IERC3643StorageWrapper";
export declare class IERC3643StorageWrapper__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "requestedUnfreeze";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "availableFrozen";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }];
        readonly name: "InsufficientFrozenBalance";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "compliance";
            readonly type: "address";
        }];
        readonly name: "ComplianceAdded";
        readonly type: "event";
    }];
    static createInterface(): IERC3643StorageWrapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IERC3643StorageWrapper;
}
