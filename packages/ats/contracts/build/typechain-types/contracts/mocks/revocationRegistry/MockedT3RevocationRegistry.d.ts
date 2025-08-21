import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../common";
export interface MockedT3RevocationRegistryInterface extends utils.Interface {
    functions: {
        "cancelRevoke(string)": FunctionFragment;
        "revoke(string)": FunctionFragment;
        "revoked(address,string)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "cancelRevoke" | "revoke" | "revoked"): FunctionFragment;
    encodeFunctionData(functionFragment: "cancelRevoke", values: [string]): string;
    encodeFunctionData(functionFragment: "revoke", values: [string]): string;
    encodeFunctionData(functionFragment: "revoked", values: [string, string]): string;
    decodeFunctionResult(functionFragment: "cancelRevoke", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "revoke", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "revoked", data: BytesLike): Result;
    events: {};
}
export interface MockedT3RevocationRegistry extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: MockedT3RevocationRegistryInterface;
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
        cancelRevoke(vcId: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        revoke(vcId: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        revoked(arg0: string, arg1: string, overrides?: CallOverrides): Promise<[boolean]>;
    };
    cancelRevoke(vcId: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    revoke(vcId: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    revoked(arg0: string, arg1: string, overrides?: CallOverrides): Promise<boolean>;
    callStatic: {
        cancelRevoke(vcId: string, overrides?: CallOverrides): Promise<void>;
        revoke(vcId: string, overrides?: CallOverrides): Promise<void>;
        revoked(arg0: string, arg1: string, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {};
    estimateGas: {
        cancelRevoke(vcId: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        revoke(vcId: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        revoked(arg0: string, arg1: string, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        cancelRevoke(vcId: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        revoke(vcId: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        revoked(arg0: string, arg1: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
