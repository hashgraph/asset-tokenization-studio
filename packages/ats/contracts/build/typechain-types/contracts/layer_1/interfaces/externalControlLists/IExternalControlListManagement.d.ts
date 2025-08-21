import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface IExternalControlListManagementInterface extends utils.Interface {
    functions: {
        "addExternalControlList(address)": FunctionFragment;
        "getExternalControlListsCount()": FunctionFragment;
        "getExternalControlListsMembers(uint256,uint256)": FunctionFragment;
        "initialize_ExternalControlLists(address[])": FunctionFragment;
        "isExternalControlList(address)": FunctionFragment;
        "removeExternalControlList(address)": FunctionFragment;
        "updateExternalControlLists(address[],bool[])": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addExternalControlList" | "getExternalControlListsCount" | "getExternalControlListsMembers" | "initialize_ExternalControlLists" | "isExternalControlList" | "removeExternalControlList" | "updateExternalControlLists"): FunctionFragment;
    encodeFunctionData(functionFragment: "addExternalControlList", values: [string]): string;
    encodeFunctionData(functionFragment: "getExternalControlListsCount", values?: undefined): string;
    encodeFunctionData(functionFragment: "getExternalControlListsMembers", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "initialize_ExternalControlLists", values: [string[]]): string;
    encodeFunctionData(functionFragment: "isExternalControlList", values: [string]): string;
    encodeFunctionData(functionFragment: "removeExternalControlList", values: [string]): string;
    encodeFunctionData(functionFragment: "updateExternalControlLists", values: [string[], boolean[]]): string;
    decodeFunctionResult(functionFragment: "addExternalControlList", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getExternalControlListsCount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getExternalControlListsMembers", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "initialize_ExternalControlLists", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isExternalControlList", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeExternalControlList", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateExternalControlLists", data: BytesLike): Result;
    events: {
        "AddedToExternalControlLists(address,address)": EventFragment;
        "ExternalControlListsUpdated(address,address[],bool[])": EventFragment;
        "RemovedFromExternalControlLists(address,address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "AddedToExternalControlLists"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ExternalControlListsUpdated"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RemovedFromExternalControlLists"): EventFragment;
}
export interface AddedToExternalControlListsEventObject {
    operator: string;
    controlList: string;
}
export type AddedToExternalControlListsEvent = TypedEvent<[
    string,
    string
], AddedToExternalControlListsEventObject>;
export type AddedToExternalControlListsEventFilter = TypedEventFilter<AddedToExternalControlListsEvent>;
export interface ExternalControlListsUpdatedEventObject {
    operator: string;
    controlLists: string[];
    actives: boolean[];
}
export type ExternalControlListsUpdatedEvent = TypedEvent<[
    string,
    string[],
    boolean[]
], ExternalControlListsUpdatedEventObject>;
export type ExternalControlListsUpdatedEventFilter = TypedEventFilter<ExternalControlListsUpdatedEvent>;
export interface RemovedFromExternalControlListsEventObject {
    operator: string;
    controlList: string;
}
export type RemovedFromExternalControlListsEvent = TypedEvent<[
    string,
    string
], RemovedFromExternalControlListsEventObject>;
export type RemovedFromExternalControlListsEventFilter = TypedEventFilter<RemovedFromExternalControlListsEvent>;
export interface IExternalControlListManagement extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IExternalControlListManagementInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {
        addExternalControlList(_controlList: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        getExternalControlListsCount(overrides?: CallOverrides): Promise<[BigNumber] & {
            externalControlListsCount_: BigNumber;
        }>;
        getExternalControlListsMembers(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<[string[]] & {
            members_: string[];
        }>;
        initialize_ExternalControlLists(_controlLists: string[], overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        isExternalControlList(_controlList: string, overrides?: CallOverrides): Promise<[boolean]>;
        removeExternalControlList(_controlList: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        updateExternalControlLists(_controlLists: string[], _actives: boolean[], overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    addExternalControlList(_controlList: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    getExternalControlListsCount(overrides?: CallOverrides): Promise<BigNumber>;
    getExternalControlListsMembers(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
    initialize_ExternalControlLists(_controlLists: string[], overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    isExternalControlList(_controlList: string, overrides?: CallOverrides): Promise<boolean>;
    removeExternalControlList(_controlList: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    updateExternalControlLists(_controlLists: string[], _actives: boolean[], overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        addExternalControlList(_controlList: string, overrides?: CallOverrides): Promise<boolean>;
        getExternalControlListsCount(overrides?: CallOverrides): Promise<BigNumber>;
        getExternalControlListsMembers(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
        initialize_ExternalControlLists(_controlLists: string[], overrides?: CallOverrides): Promise<void>;
        isExternalControlList(_controlList: string, overrides?: CallOverrides): Promise<boolean>;
        removeExternalControlList(_controlList: string, overrides?: CallOverrides): Promise<boolean>;
        updateExternalControlLists(_controlLists: string[], _actives: boolean[], overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {
        "AddedToExternalControlLists(address,address)"(operator?: string | null, controlList?: null): AddedToExternalControlListsEventFilter;
        AddedToExternalControlLists(operator?: string | null, controlList?: null): AddedToExternalControlListsEventFilter;
        "ExternalControlListsUpdated(address,address[],bool[])"(operator?: string | null, controlLists?: null, actives?: null): ExternalControlListsUpdatedEventFilter;
        ExternalControlListsUpdated(operator?: string | null, controlLists?: null, actives?: null): ExternalControlListsUpdatedEventFilter;
        "RemovedFromExternalControlLists(address,address)"(operator?: string | null, controlList?: null): RemovedFromExternalControlListsEventFilter;
        RemovedFromExternalControlLists(operator?: string | null, controlList?: null): RemovedFromExternalControlListsEventFilter;
    };
    estimateGas: {
        addExternalControlList(_controlList: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        getExternalControlListsCount(overrides?: CallOverrides): Promise<BigNumber>;
        getExternalControlListsMembers(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        initialize_ExternalControlLists(_controlLists: string[], overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        isExternalControlList(_controlList: string, overrides?: CallOverrides): Promise<BigNumber>;
        removeExternalControlList(_controlList: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        updateExternalControlLists(_controlLists: string[], _actives: boolean[], overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        addExternalControlList(_controlList: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        getExternalControlListsCount(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getExternalControlListsMembers(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        initialize_ExternalControlLists(_controlLists: string[], overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        isExternalControlList(_controlList: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        removeExternalControlList(_controlList: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        updateExternalControlLists(_controlLists: string[], _actives: boolean[], overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
