import type { BaseContract, BigNumber, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface ITimeTravelStorageWrapperInterface extends utils.Interface {
    functions: {};
    events: {
        "SystemTimestampChanged(uint256,uint256)": EventFragment;
        "SystemTimestampReset()": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "SystemTimestampChanged"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "SystemTimestampReset"): EventFragment;
}
export interface SystemTimestampChangedEventObject {
    legacySystemTime: BigNumber;
    newSystemTime: BigNumber;
}
export type SystemTimestampChangedEvent = TypedEvent<[
    BigNumber,
    BigNumber
], SystemTimestampChangedEventObject>;
export type SystemTimestampChangedEventFilter = TypedEventFilter<SystemTimestampChangedEvent>;
export interface SystemTimestampResetEventObject {
}
export type SystemTimestampResetEvent = TypedEvent<[
], SystemTimestampResetEventObject>;
export type SystemTimestampResetEventFilter = TypedEventFilter<SystemTimestampResetEvent>;
export interface ITimeTravelStorageWrapper extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ITimeTravelStorageWrapperInterface;
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
        "SystemTimestampChanged(uint256,uint256)"(legacySystemTime?: null, newSystemTime?: null): SystemTimestampChangedEventFilter;
        SystemTimestampChanged(legacySystemTime?: null, newSystemTime?: null): SystemTimestampChangedEventFilter;
        "SystemTimestampReset()"(): SystemTimestampResetEventFilter;
        SystemTimestampReset(): SystemTimestampResetEventFilter;
    };
    estimateGas: {};
    populateTransaction: {};
}
