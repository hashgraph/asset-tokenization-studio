import type { BaseContract, BigNumber, BytesLike, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface ICapStorageWrapperInterface extends utils.Interface {
    functions: {};
    events: {
        "MaxSupplyByPartitionSet(address,bytes32,uint256,uint256)": EventFragment;
        "MaxSupplySet(address,uint256,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "MaxSupplyByPartitionSet"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "MaxSupplySet"): EventFragment;
}
export interface MaxSupplyByPartitionSetEventObject {
    operator: string;
    partition: string;
    newMaxSupply: BigNumber;
    previousMaxSupply: BigNumber;
}
export type MaxSupplyByPartitionSetEvent = TypedEvent<[
    string,
    string,
    BigNumber,
    BigNumber
], MaxSupplyByPartitionSetEventObject>;
export type MaxSupplyByPartitionSetEventFilter = TypedEventFilter<MaxSupplyByPartitionSetEvent>;
export interface MaxSupplySetEventObject {
    operator: string;
    newMaxSupply: BigNumber;
    previousMaxSupply: BigNumber;
}
export type MaxSupplySetEvent = TypedEvent<[
    string,
    BigNumber,
    BigNumber
], MaxSupplySetEventObject>;
export type MaxSupplySetEventFilter = TypedEventFilter<MaxSupplySetEvent>;
export interface ICapStorageWrapper extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ICapStorageWrapperInterface;
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
        "MaxSupplyByPartitionSet(address,bytes32,uint256,uint256)"(operator?: string | null, partition?: BytesLike | null, newMaxSupply?: null, previousMaxSupply?: null): MaxSupplyByPartitionSetEventFilter;
        MaxSupplyByPartitionSet(operator?: string | null, partition?: BytesLike | null, newMaxSupply?: null, previousMaxSupply?: null): MaxSupplyByPartitionSetEventFilter;
        "MaxSupplySet(address,uint256,uint256)"(operator?: string | null, newMaxSupply?: null, previousMaxSupply?: null): MaxSupplySetEventFilter;
        MaxSupplySet(operator?: string | null, newMaxSupply?: null, previousMaxSupply?: null): MaxSupplySetEventFilter;
    };
    estimateGas: {};
    populateTransaction: {};
}
