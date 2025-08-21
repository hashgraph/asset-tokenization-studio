import type { BaseContract, BigNumber, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface IERC1594StorageWrapperInterface extends utils.Interface {
    functions: {};
    events: {
        "Issued(address,address,uint256,bytes)": EventFragment;
        "Redeemed(address,address,uint256,bytes)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "Issued"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Redeemed"): EventFragment;
}
export interface IssuedEventObject {
    _operator: string;
    _to: string;
    _value: BigNumber;
    _data: string;
}
export type IssuedEvent = TypedEvent<[
    string,
    string,
    BigNumber,
    string
], IssuedEventObject>;
export type IssuedEventFilter = TypedEventFilter<IssuedEvent>;
export interface RedeemedEventObject {
    _operator: string;
    _from: string;
    _value: BigNumber;
    _data: string;
}
export type RedeemedEvent = TypedEvent<[
    string,
    string,
    BigNumber,
    string
], RedeemedEventObject>;
export type RedeemedEventFilter = TypedEventFilter<RedeemedEvent>;
export interface IERC1594StorageWrapper extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IERC1594StorageWrapperInterface;
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
        "Issued(address,address,uint256,bytes)"(_operator?: string | null, _to?: string | null, _value?: null, _data?: null): IssuedEventFilter;
        Issued(_operator?: string | null, _to?: string | null, _value?: null, _data?: null): IssuedEventFilter;
        "Redeemed(address,address,uint256,bytes)"(_operator?: string | null, _from?: string | null, _value?: null, _data?: null): RedeemedEventFilter;
        Redeemed(_operator?: string | null, _from?: string | null, _value?: null, _data?: null): RedeemedEventFilter;
    };
    estimateGas: {};
    populateTransaction: {};
}
