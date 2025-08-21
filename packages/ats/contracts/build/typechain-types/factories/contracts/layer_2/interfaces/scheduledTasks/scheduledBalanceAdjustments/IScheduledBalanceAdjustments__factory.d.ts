import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IScheduledBalanceAdjustments, IScheduledBalanceAdjustmentsInterface } from "../../../../../../contracts/layer_2/interfaces/scheduledTasks/scheduledBalanceAdjustments/IScheduledBalanceAdjustments";
export declare class IScheduledBalanceAdjustments__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getScheduledBalanceAdjustments";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "scheduledTimestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }];
            readonly internalType: "struct ScheduledTasksLib.ScheduledTask[]";
            readonly name: "scheduledBalanceAdjustment_";
            readonly type: "tuple[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_pos";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_scheduledTasksLength";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }];
        readonly name: "onScheduledBalanceAdjustmentTriggered";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "scheduledBalanceAdjustmentCount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IScheduledBalanceAdjustmentsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IScheduledBalanceAdjustments;
}
