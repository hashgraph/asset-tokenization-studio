import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../common";
export interface MockedExternalKycListInterface extends utils.Interface {
    functions: {
        "getKycStatus(address)": FunctionFragment;
        "grantKyc(address)": FunctionFragment;
        "revokeKyc(address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "getKycStatus" | "grantKyc" | "revokeKyc"): FunctionFragment;
    encodeFunctionData(functionFragment: "getKycStatus", values: [string]): string;
    encodeFunctionData(functionFragment: "grantKyc", values: [string]): string;
    encodeFunctionData(functionFragment: "revokeKyc", values: [string]): string;
    decodeFunctionResult(functionFragment: "getKycStatus", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "grantKyc", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "revokeKyc", data: BytesLike): Result;
    events: {
        "KycGranted(address)": EventFragment;
        "KycRevoked(address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "KycGranted"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "KycRevoked"): EventFragment;
}
export interface KycGrantedEventObject {
    account: string;
}
export type KycGrantedEvent = TypedEvent<[string], KycGrantedEventObject>;
export type KycGrantedEventFilter = TypedEventFilter<KycGrantedEvent>;
export interface KycRevokedEventObject {
    account: string;
}
export type KycRevokedEvent = TypedEvent<[string], KycRevokedEventObject>;
export type KycRevokedEventFilter = TypedEventFilter<KycRevokedEvent>;
export interface MockedExternalKycList extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: MockedExternalKycListInterface;
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
        getKycStatus(account: string, overrides?: CallOverrides): Promise<[number]>;
        grantKyc(account: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        revokeKyc(account: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    getKycStatus(account: string, overrides?: CallOverrides): Promise<number>;
    grantKyc(account: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    revokeKyc(account: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        getKycStatus(account: string, overrides?: CallOverrides): Promise<number>;
        grantKyc(account: string, overrides?: CallOverrides): Promise<void>;
        revokeKyc(account: string, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "KycGranted(address)"(account?: string | null): KycGrantedEventFilter;
        KycGranted(account?: string | null): KycGrantedEventFilter;
        "KycRevoked(address)"(account?: string | null): KycRevokedEventFilter;
        KycRevoked(account?: string | null): KycRevokedEventFilter;
    };
    estimateGas: {
        getKycStatus(account: string, overrides?: CallOverrides): Promise<BigNumber>;
        grantKyc(account: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        revokeKyc(account: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        getKycStatus(account: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        grantKyc(account: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        revokeKyc(account: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
