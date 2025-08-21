import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../common";
export interface ComplianceMockInterface extends utils.Interface {
    functions: {
        "canTransfer(address,address,uint256)": FunctionFragment;
        "created(address,uint256)": FunctionFragment;
        "createdHit()": FunctionFragment;
        "destroyed(address,uint256)": FunctionFragment;
        "destroyedHit()": FunctionFragment;
        "setFlags(bool,bool)": FunctionFragment;
        "setFlagsByMethod(bool[],bytes32[],bool[],bytes32[])": FunctionFragment;
        "transferred(address,address,uint256)": FunctionFragment;
        "transferredHit()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "canTransfer" | "created" | "createdHit" | "destroyed" | "destroyedHit" | "setFlags" | "setFlagsByMethod" | "transferred" | "transferredHit"): FunctionFragment;
    encodeFunctionData(functionFragment: "canTransfer", values: [string, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "created", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "createdHit", values?: undefined): string;
    encodeFunctionData(functionFragment: "destroyed", values: [string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "destroyedHit", values?: undefined): string;
    encodeFunctionData(functionFragment: "setFlags", values: [boolean, boolean]): string;
    encodeFunctionData(functionFragment: "setFlagsByMethod", values: [boolean[], BytesLike[], boolean[], BytesLike[]]): string;
    encodeFunctionData(functionFragment: "transferred", values: [string, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "transferredHit", values?: undefined): string;
    decodeFunctionResult(functionFragment: "canTransfer", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "created", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createdHit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "destroyed", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "destroyedHit", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setFlags", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setFlagsByMethod", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferred", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "transferredHit", data: BytesLike): Result;
    events: {};
}
export interface ComplianceMock extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ComplianceMockInterface;
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
        canTransfer(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<[boolean]>;
        created(_to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        createdHit(overrides?: CallOverrides): Promise<[BigNumber]>;
        destroyed(_from: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        destroyedHit(overrides?: CallOverrides): Promise<[BigNumber]>;
        setFlags(_canTransferFlag: boolean, _revertFlag: boolean, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        setFlagsByMethod(_canTransferFlag: boolean[], _canTransferKey: BytesLike[], _revertFlag: boolean[], _revertKey: BytesLike[], overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        transferred(_from: string, _to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        transferredHit(overrides?: CallOverrides): Promise<[BigNumber]>;
    };
    canTransfer(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
    created(_to: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    createdHit(overrides?: CallOverrides): Promise<BigNumber>;
    destroyed(_from: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    destroyedHit(overrides?: CallOverrides): Promise<BigNumber>;
    setFlags(_canTransferFlag: boolean, _revertFlag: boolean, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    setFlagsByMethod(_canTransferFlag: boolean[], _canTransferKey: BytesLike[], _revertFlag: boolean[], _revertKey: BytesLike[], overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    transferred(_from: string, _to: string, _amount: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    transferredHit(overrides?: CallOverrides): Promise<BigNumber>;
    callStatic: {
        canTransfer(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        created(_to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        createdHit(overrides?: CallOverrides): Promise<BigNumber>;
        destroyed(_from: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        destroyedHit(overrides?: CallOverrides): Promise<BigNumber>;
        setFlags(_canTransferFlag: boolean, _revertFlag: boolean, overrides?: CallOverrides): Promise<void>;
        setFlagsByMethod(_canTransferFlag: boolean[], _canTransferKey: BytesLike[], _revertFlag: boolean[], _revertKey: BytesLike[], overrides?: CallOverrides): Promise<void>;
        transferred(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        transferredHit(overrides?: CallOverrides): Promise<BigNumber>;
    };
    filters: {};
    estimateGas: {
        canTransfer(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        created(_to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        createdHit(overrides?: CallOverrides): Promise<BigNumber>;
        destroyed(_from: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        destroyedHit(overrides?: CallOverrides): Promise<BigNumber>;
        setFlags(_canTransferFlag: boolean, _revertFlag: boolean, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        setFlagsByMethod(_canTransferFlag: boolean[], _canTransferKey: BytesLike[], _revertFlag: boolean[], _revertKey: BytesLike[], overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        transferred(_from: string, _to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        transferredHit(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        canTransfer(_from: string, _to: string, _amount: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        created(_to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        createdHit(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        destroyed(_from: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        destroyedHit(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        setFlags(_canTransferFlag: boolean, _revertFlag: boolean, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        setFlagsByMethod(_canTransferFlag: boolean[], _canTransferKey: BytesLike[], _revertFlag: boolean[], _revertKey: BytesLike[], overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        transferred(_from: string, _to: string, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        transferredHit(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
