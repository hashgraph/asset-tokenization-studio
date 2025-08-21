import type { BaseContract, BigNumber, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface IIdFactoryInterface extends utils.Interface {
    functions: {
        "addTokenFactory(address)": FunctionFragment;
        "createIdentity(address,string)": FunctionFragment;
        "createIdentityWithManagementKeys(address,string,bytes32[])": FunctionFragment;
        "createTokenIdentity(address,address,string)": FunctionFragment;
        "getIdentity(address)": FunctionFragment;
        "getToken(address)": FunctionFragment;
        "getWallets(address)": FunctionFragment;
        "implementationAuthority()": FunctionFragment;
        "isSaltTaken(string)": FunctionFragment;
        "isTokenFactory(address)": FunctionFragment;
        "linkWallet(address)": FunctionFragment;
        "removeTokenFactory(address)": FunctionFragment;
        "unlinkWallet(address)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addTokenFactory" | "createIdentity" | "createIdentityWithManagementKeys" | "createTokenIdentity" | "getIdentity" | "getToken" | "getWallets" | "implementationAuthority" | "isSaltTaken" | "isTokenFactory" | "linkWallet" | "removeTokenFactory" | "unlinkWallet"): FunctionFragment;
    encodeFunctionData(functionFragment: "addTokenFactory", values: [string]): string;
    encodeFunctionData(functionFragment: "createIdentity", values: [string, string]): string;
    encodeFunctionData(functionFragment: "createIdentityWithManagementKeys", values: [string, string, BytesLike[]]): string;
    encodeFunctionData(functionFragment: "createTokenIdentity", values: [string, string, string]): string;
    encodeFunctionData(functionFragment: "getIdentity", values: [string]): string;
    encodeFunctionData(functionFragment: "getToken", values: [string]): string;
    encodeFunctionData(functionFragment: "getWallets", values: [string]): string;
    encodeFunctionData(functionFragment: "implementationAuthority", values?: undefined): string;
    encodeFunctionData(functionFragment: "isSaltTaken", values: [string]): string;
    encodeFunctionData(functionFragment: "isTokenFactory", values: [string]): string;
    encodeFunctionData(functionFragment: "linkWallet", values: [string]): string;
    encodeFunctionData(functionFragment: "removeTokenFactory", values: [string]): string;
    encodeFunctionData(functionFragment: "unlinkWallet", values: [string]): string;
    decodeFunctionResult(functionFragment: "addTokenFactory", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createIdentity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createIdentityWithManagementKeys", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "createTokenIdentity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getIdentity", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getToken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getWallets", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "implementationAuthority", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isSaltTaken", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isTokenFactory", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "linkWallet", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeTokenFactory", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "unlinkWallet", data: BytesLike): Result;
    events: {
        "Deployed(address)": EventFragment;
        "TokenFactoryAdded(address)": EventFragment;
        "TokenFactoryRemoved(address)": EventFragment;
        "TokenLinked(address,address)": EventFragment;
        "WalletLinked(address,address)": EventFragment;
        "WalletUnlinked(address,address)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "Deployed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenFactoryAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenFactoryRemoved"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "TokenLinked"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "WalletLinked"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "WalletUnlinked"): EventFragment;
}
export interface DeployedEventObject {
    _addr: string;
}
export type DeployedEvent = TypedEvent<[string], DeployedEventObject>;
export type DeployedEventFilter = TypedEventFilter<DeployedEvent>;
export interface TokenFactoryAddedEventObject {
    factory: string;
}
export type TokenFactoryAddedEvent = TypedEvent<[
    string
], TokenFactoryAddedEventObject>;
export type TokenFactoryAddedEventFilter = TypedEventFilter<TokenFactoryAddedEvent>;
export interface TokenFactoryRemovedEventObject {
    factory: string;
}
export type TokenFactoryRemovedEvent = TypedEvent<[
    string
], TokenFactoryRemovedEventObject>;
export type TokenFactoryRemovedEventFilter = TypedEventFilter<TokenFactoryRemovedEvent>;
export interface TokenLinkedEventObject {
    token: string;
    identity: string;
}
export type TokenLinkedEvent = TypedEvent<[
    string,
    string
], TokenLinkedEventObject>;
export type TokenLinkedEventFilter = TypedEventFilter<TokenLinkedEvent>;
export interface WalletLinkedEventObject {
    wallet: string;
    identity: string;
}
export type WalletLinkedEvent = TypedEvent<[
    string,
    string
], WalletLinkedEventObject>;
export type WalletLinkedEventFilter = TypedEventFilter<WalletLinkedEvent>;
export interface WalletUnlinkedEventObject {
    wallet: string;
    identity: string;
}
export type WalletUnlinkedEvent = TypedEvent<[
    string,
    string
], WalletUnlinkedEventObject>;
export type WalletUnlinkedEventFilter = TypedEventFilter<WalletUnlinkedEvent>;
export interface IIdFactory extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IIdFactoryInterface;
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
        addTokenFactory(_factory: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        createIdentity(_wallet: string, _salt: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        createIdentityWithManagementKeys(_wallet: string, _salt: string, _managementKeys: BytesLike[], overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        createTokenIdentity(_token: string, _tokenOwner: string, _salt: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        getIdentity(_wallet: string, overrides?: CallOverrides): Promise<[string]>;
        getToken(_identity: string, overrides?: CallOverrides): Promise<[string]>;
        getWallets(_identity: string, overrides?: CallOverrides): Promise<[string[]]>;
        implementationAuthority(overrides?: CallOverrides): Promise<[string]>;
        isSaltTaken(_salt: string, overrides?: CallOverrides): Promise<[boolean]>;
        isTokenFactory(_factory: string, overrides?: CallOverrides): Promise<[boolean]>;
        linkWallet(_newWallet: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        removeTokenFactory(_factory: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        unlinkWallet(_oldWallet: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    addTokenFactory(_factory: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    createIdentity(_wallet: string, _salt: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    createIdentityWithManagementKeys(_wallet: string, _salt: string, _managementKeys: BytesLike[], overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    createTokenIdentity(_token: string, _tokenOwner: string, _salt: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    getIdentity(_wallet: string, overrides?: CallOverrides): Promise<string>;
    getToken(_identity: string, overrides?: CallOverrides): Promise<string>;
    getWallets(_identity: string, overrides?: CallOverrides): Promise<string[]>;
    implementationAuthority(overrides?: CallOverrides): Promise<string>;
    isSaltTaken(_salt: string, overrides?: CallOverrides): Promise<boolean>;
    isTokenFactory(_factory: string, overrides?: CallOverrides): Promise<boolean>;
    linkWallet(_newWallet: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    removeTokenFactory(_factory: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    unlinkWallet(_oldWallet: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        addTokenFactory(_factory: string, overrides?: CallOverrides): Promise<void>;
        createIdentity(_wallet: string, _salt: string, overrides?: CallOverrides): Promise<string>;
        createIdentityWithManagementKeys(_wallet: string, _salt: string, _managementKeys: BytesLike[], overrides?: CallOverrides): Promise<string>;
        createTokenIdentity(_token: string, _tokenOwner: string, _salt: string, overrides?: CallOverrides): Promise<string>;
        getIdentity(_wallet: string, overrides?: CallOverrides): Promise<string>;
        getToken(_identity: string, overrides?: CallOverrides): Promise<string>;
        getWallets(_identity: string, overrides?: CallOverrides): Promise<string[]>;
        implementationAuthority(overrides?: CallOverrides): Promise<string>;
        isSaltTaken(_salt: string, overrides?: CallOverrides): Promise<boolean>;
        isTokenFactory(_factory: string, overrides?: CallOverrides): Promise<boolean>;
        linkWallet(_newWallet: string, overrides?: CallOverrides): Promise<void>;
        removeTokenFactory(_factory: string, overrides?: CallOverrides): Promise<void>;
        unlinkWallet(_oldWallet: string, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "Deployed(address)"(_addr?: string | null): DeployedEventFilter;
        Deployed(_addr?: string | null): DeployedEventFilter;
        "TokenFactoryAdded(address)"(factory?: string | null): TokenFactoryAddedEventFilter;
        TokenFactoryAdded(factory?: string | null): TokenFactoryAddedEventFilter;
        "TokenFactoryRemoved(address)"(factory?: string | null): TokenFactoryRemovedEventFilter;
        TokenFactoryRemoved(factory?: string | null): TokenFactoryRemovedEventFilter;
        "TokenLinked(address,address)"(token?: string | null, identity?: string | null): TokenLinkedEventFilter;
        TokenLinked(token?: string | null, identity?: string | null): TokenLinkedEventFilter;
        "WalletLinked(address,address)"(wallet?: string | null, identity?: string | null): WalletLinkedEventFilter;
        WalletLinked(wallet?: string | null, identity?: string | null): WalletLinkedEventFilter;
        "WalletUnlinked(address,address)"(wallet?: string | null, identity?: string | null): WalletUnlinkedEventFilter;
        WalletUnlinked(wallet?: string | null, identity?: string | null): WalletUnlinkedEventFilter;
    };
    estimateGas: {
        addTokenFactory(_factory: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        createIdentity(_wallet: string, _salt: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        createIdentityWithManagementKeys(_wallet: string, _salt: string, _managementKeys: BytesLike[], overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        createTokenIdentity(_token: string, _tokenOwner: string, _salt: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        getIdentity(_wallet: string, overrides?: CallOverrides): Promise<BigNumber>;
        getToken(_identity: string, overrides?: CallOverrides): Promise<BigNumber>;
        getWallets(_identity: string, overrides?: CallOverrides): Promise<BigNumber>;
        implementationAuthority(overrides?: CallOverrides): Promise<BigNumber>;
        isSaltTaken(_salt: string, overrides?: CallOverrides): Promise<BigNumber>;
        isTokenFactory(_factory: string, overrides?: CallOverrides): Promise<BigNumber>;
        linkWallet(_newWallet: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        removeTokenFactory(_factory: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        unlinkWallet(_oldWallet: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        addTokenFactory(_factory: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        createIdentity(_wallet: string, _salt: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        createIdentityWithManagementKeys(_wallet: string, _salt: string, _managementKeys: BytesLike[], overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        createTokenIdentity(_token: string, _tokenOwner: string, _salt: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        getIdentity(_wallet: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getToken(_identity: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getWallets(_identity: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        implementationAuthority(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isSaltTaken(_salt: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isTokenFactory(_factory: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        linkWallet(_newWallet: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        removeTokenFactory(_factory: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        unlinkWallet(_oldWallet: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
