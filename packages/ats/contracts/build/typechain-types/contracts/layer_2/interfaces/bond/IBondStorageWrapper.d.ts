import type { BaseContract, BigNumber, BigNumberish, Signer, utils } from "ethers";
import type { EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface IBondStorageWrapperInterface extends utils.Interface {
    functions: {};
    events: {
        "CouponSet(bytes32,uint256,address,uint256,uint256,uint256)": EventFragment;
        "MaturityDateUpdated(address,uint256,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "CouponSet"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "MaturityDateUpdated"): EventFragment;
}
export interface CouponSetEventObject {
    corporateActionId: string;
    couponId: BigNumber;
    operator: string;
    recordDate: BigNumber;
    executionDate: BigNumber;
    rate: BigNumber;
}
export type CouponSetEvent = TypedEvent<[
    string,
    BigNumber,
    string,
    BigNumber,
    BigNumber,
    BigNumber
], CouponSetEventObject>;
export type CouponSetEventFilter = TypedEventFilter<CouponSetEvent>;
export interface MaturityDateUpdatedEventObject {
    bondId: string;
    maturityDate: BigNumber;
    previousMaturityDate: BigNumber;
}
export type MaturityDateUpdatedEvent = TypedEvent<[
    string,
    BigNumber,
    BigNumber
], MaturityDateUpdatedEventObject>;
export type MaturityDateUpdatedEventFilter = TypedEventFilter<MaturityDateUpdatedEvent>;
export interface IBondStorageWrapper extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IBondStorageWrapperInterface;
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
        "CouponSet(bytes32,uint256,address,uint256,uint256,uint256)"(corporateActionId?: null, couponId?: null, operator?: string | null, recordDate?: BigNumberish | null, executionDate?: BigNumberish | null, rate?: null): CouponSetEventFilter;
        CouponSet(corporateActionId?: null, couponId?: null, operator?: string | null, recordDate?: BigNumberish | null, executionDate?: BigNumberish | null, rate?: null): CouponSetEventFilter;
        "MaturityDateUpdated(address,uint256,uint256)"(bondId?: string | null, maturityDate?: BigNumberish | null, previousMaturityDate?: BigNumberish | null): MaturityDateUpdatedEventFilter;
        MaturityDateUpdated(bondId?: string | null, maturityDate?: BigNumberish | null, previousMaturityDate?: BigNumberish | null): MaturityDateUpdatedEventFilter;
    };
    estimateGas: {};
    populateTransaction: {};
}
