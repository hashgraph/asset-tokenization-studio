import type { BaseContract, BigNumber, BigNumberish, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface ISnapshotsStorageWrapperInterface extends utils.Interface {
    functions: {};
    events: {
        "SnapshotTaken(address,uint256)": EventFragment;
        "SnapshotTriggered(address,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "SnapshotTaken"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SnapshotTriggered"): EventFragment;
}
export interface SnapshotTakenEventObject {
    operator: string;
    snapshotID: BigNumber;
}
export type SnapshotTakenEvent = TypedEvent<[
    string,
    BigNumber
], SnapshotTakenEventObject>;
export type SnapshotTakenEventFilter = TypedEventFilter<SnapshotTakenEvent>;
export interface SnapshotTriggeredEventObject {
    operator: string;
    snapshotId: BigNumber;
}
export type SnapshotTriggeredEvent = TypedEvent<[
    string,
    BigNumber
], SnapshotTriggeredEventObject>;
export type SnapshotTriggeredEventFilter = TypedEventFilter<SnapshotTriggeredEvent>;
export interface ISnapshotsStorageWrapper extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ISnapshotsStorageWrapperInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {};
    callStatic: {};
    filters: {
        "SnapshotTaken(address,uint256)"(operator?: string | null, snapshotID?: BigNumberish | null): SnapshotTakenEventFilter;
        SnapshotTaken(operator?: string | null, snapshotID?: BigNumberish | null): SnapshotTakenEventFilter;
        "SnapshotTriggered(address,uint256)"(operator?: string | null, snapshotId?: null): SnapshotTriggeredEventFilter;
        SnapshotTriggered(operator?: string | null, snapshotId?: null): SnapshotTriggeredEventFilter;
    };
    estimateGas: {};
    populateTransaction: {};
}
