import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IBondStorageWrapper, IBondStorageWrapperInterface } from "../../../../../contracts/layer_2/interfaces/bond/IBondStorageWrapper";
export declare class IBondStorageWrapper__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "BondMaturityDateWrong";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "CouponCreationFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "CouponFirstDateWrong";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "CouponFrequencyWrong";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "corporateActionId";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "couponId";
            readonly type: "uint256";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "recordDate";
            readonly type: "uint256";
        }, {
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "executionDate";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "rate";
            readonly type: "uint256";
        }];
        readonly name: "CouponSet";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "bondId";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "maturityDate";
            readonly type: "uint256";
        }, {
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "previousMaturityDate";
            readonly type: "uint256";
        }];
        readonly name: "MaturityDateUpdated";
        readonly type: "event";
    }];
    static createInterface(): IBondStorageWrapperInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IBondStorageWrapper;
}
