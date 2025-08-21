import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PayableOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../common";
export interface ClaimIssuerInterface extends utils.Interface {
    functions: {
        "addClaim(uint256,uint256,address,bytes,bytes,string)": FunctionFragment;
        "addKey(bytes32,uint256,uint256)": FunctionFragment;
        "approve(uint256,bool)": FunctionFragment;
        "execute(address,uint256,bytes)": FunctionFragment;
        "getClaim(bytes32)": FunctionFragment;
        "getClaimIdsByTopic(uint256)": FunctionFragment;
        "getKey(bytes32)": FunctionFragment;
        "getKeyPurposes(bytes32)": FunctionFragment;
        "getKeysByPurpose(uint256)": FunctionFragment;
        "getRecoveredAddress(bytes,bytes32)": FunctionFragment;
        "initialize(address)": FunctionFragment;
        "isClaimRevoked(bytes)": FunctionFragment;
        "isClaimValid(address,uint256,bytes,bytes)": FunctionFragment;
        "keyHasPurpose(bytes32,uint256)": FunctionFragment;
        "removeClaim(bytes32)": FunctionFragment;
        "removeKey(bytes32,uint256)": FunctionFragment;
        "revokeClaim(bytes32,address)": FunctionFragment;
        "revokeClaimBySignature(bytes)": FunctionFragment;
        "revokedClaims(bytes)": FunctionFragment;
        "version()": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "addClaim" | "addKey" | "approve" | "execute" | "getClaim" | "getClaimIdsByTopic" | "getKey" | "getKeyPurposes" | "getKeysByPurpose" | "getRecoveredAddress" | "initialize" | "isClaimRevoked" | "isClaimValid" | "keyHasPurpose" | "removeClaim" | "removeKey" | "revokeClaim" | "revokeClaimBySignature" | "revokedClaims" | "version"): FunctionFragment;
    encodeFunctionData(functionFragment: "addClaim", values: [BigNumberish, BigNumberish, string, BytesLike, BytesLike, string]): string;
    encodeFunctionData(functionFragment: "addKey", values: [BytesLike, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "approve", values: [BigNumberish, boolean]): string;
    encodeFunctionData(functionFragment: "execute", values: [string, BigNumberish, BytesLike]): string;
    encodeFunctionData(functionFragment: "getClaim", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "getClaimIdsByTopic", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getKey", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "getKeyPurposes", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "getKeysByPurpose", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getRecoveredAddress", values: [BytesLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "initialize", values: [string]): string;
    encodeFunctionData(functionFragment: "isClaimRevoked", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "isClaimValid", values: [string, BigNumberish, BytesLike, BytesLike]): string;
    encodeFunctionData(functionFragment: "keyHasPurpose", values: [BytesLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "removeClaim", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "removeKey", values: [BytesLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "revokeClaim", values: [BytesLike, string]): string;
    encodeFunctionData(functionFragment: "revokeClaimBySignature", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "revokedClaims", values: [BytesLike]): string;
    encodeFunctionData(functionFragment: "version", values?: undefined): string;
    decodeFunctionResult(functionFragment: "addClaim", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "addKey", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "approve", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "execute", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getClaim", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getClaimIdsByTopic", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getKey", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getKeyPurposes", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getKeysByPurpose", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getRecoveredAddress", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "initialize", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isClaimRevoked", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "isClaimValid", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "keyHasPurpose", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeClaim", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeKey", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "revokeClaim", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "revokeClaimBySignature", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "revokedClaims", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "version", data: BytesLike): Result;
    events: {
        "Approved(uint256,bool)": EventFragment;
        "ClaimAdded(bytes32,uint256,uint256,address,bytes,bytes,string)": EventFragment;
        "ClaimChanged(bytes32,uint256,uint256,address,bytes,bytes,string)": EventFragment;
        "ClaimRemoved(bytes32,uint256,uint256,address,bytes,bytes,string)": EventFragment;
        "ClaimRevoked(bytes)": EventFragment;
        "Executed(uint256,address,uint256,bytes)": EventFragment;
        "ExecutionFailed(uint256,address,uint256,bytes)": EventFragment;
        "ExecutionRequested(uint256,address,uint256,bytes)": EventFragment;
        "KeyAdded(bytes32,uint256,uint256)": EventFragment;
        "KeyRemoved(bytes32,uint256,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "Approved"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClaimAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClaimChanged"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClaimRemoved"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ClaimRevoked"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "Executed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ExecutionFailed"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "ExecutionRequested"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "KeyAdded"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "KeyRemoved"): EventFragment;
}
export interface ApprovedEventObject {
    executionId: BigNumber;
    approved: boolean;
}
export type ApprovedEvent = TypedEvent<[
    BigNumber,
    boolean
], ApprovedEventObject>;
export type ApprovedEventFilter = TypedEventFilter<ApprovedEvent>;
export interface ClaimAddedEventObject {
    claimId: string;
    topic: BigNumber;
    scheme: BigNumber;
    issuer: string;
    signature: string;
    data: string;
    uri: string;
}
export type ClaimAddedEvent = TypedEvent<[
    string,
    BigNumber,
    BigNumber,
    string,
    string,
    string,
    string
], ClaimAddedEventObject>;
export type ClaimAddedEventFilter = TypedEventFilter<ClaimAddedEvent>;
export interface ClaimChangedEventObject {
    claimId: string;
    topic: BigNumber;
    scheme: BigNumber;
    issuer: string;
    signature: string;
    data: string;
    uri: string;
}
export type ClaimChangedEvent = TypedEvent<[
    string,
    BigNumber,
    BigNumber,
    string,
    string,
    string,
    string
], ClaimChangedEventObject>;
export type ClaimChangedEventFilter = TypedEventFilter<ClaimChangedEvent>;
export interface ClaimRemovedEventObject {
    claimId: string;
    topic: BigNumber;
    scheme: BigNumber;
    issuer: string;
    signature: string;
    data: string;
    uri: string;
}
export type ClaimRemovedEvent = TypedEvent<[
    string,
    BigNumber,
    BigNumber,
    string,
    string,
    string,
    string
], ClaimRemovedEventObject>;
export type ClaimRemovedEventFilter = TypedEventFilter<ClaimRemovedEvent>;
export interface ClaimRevokedEventObject {
    signature: string;
}
export type ClaimRevokedEvent = TypedEvent<[string], ClaimRevokedEventObject>;
export type ClaimRevokedEventFilter = TypedEventFilter<ClaimRevokedEvent>;
export interface ExecutedEventObject {
    executionId: BigNumber;
    to: string;
    value: BigNumber;
    data: string;
}
export type ExecutedEvent = TypedEvent<[
    BigNumber,
    string,
    BigNumber,
    string
], ExecutedEventObject>;
export type ExecutedEventFilter = TypedEventFilter<ExecutedEvent>;
export interface ExecutionFailedEventObject {
    executionId: BigNumber;
    to: string;
    value: BigNumber;
    data: string;
}
export type ExecutionFailedEvent = TypedEvent<[
    BigNumber,
    string,
    BigNumber,
    string
], ExecutionFailedEventObject>;
export type ExecutionFailedEventFilter = TypedEventFilter<ExecutionFailedEvent>;
export interface ExecutionRequestedEventObject {
    executionId: BigNumber;
    to: string;
    value: BigNumber;
    data: string;
}
export type ExecutionRequestedEvent = TypedEvent<[
    BigNumber,
    string,
    BigNumber,
    string
], ExecutionRequestedEventObject>;
export type ExecutionRequestedEventFilter = TypedEventFilter<ExecutionRequestedEvent>;
export interface KeyAddedEventObject {
    key: string;
    purpose: BigNumber;
    keyType: BigNumber;
}
export type KeyAddedEvent = TypedEvent<[
    string,
    BigNumber,
    BigNumber
], KeyAddedEventObject>;
export type KeyAddedEventFilter = TypedEventFilter<KeyAddedEvent>;
export interface KeyRemovedEventObject {
    key: string;
    purpose: BigNumber;
    keyType: BigNumber;
}
export type KeyRemovedEvent = TypedEvent<[
    string,
    BigNumber,
    BigNumber
], KeyRemovedEventObject>;
export type KeyRemovedEventFilter = TypedEventFilter<KeyRemovedEvent>;
export interface ClaimIssuer extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: ClaimIssuerInterface;
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
        addClaim(_topic: BigNumberish, _scheme: BigNumberish, _issuer: string, _signature: BytesLike, _data: BytesLike, _uri: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        addKey(_key: BytesLike, _purpose: BigNumberish, _type: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        approve(_id: BigNumberish, _approve: boolean, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        execute(_to: string, _value: BigNumberish, _data: BytesLike, overrides?: PayableOverrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        getClaim(_claimId: BytesLike, overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber,
            string,
            string,
            string,
            string
        ] & {
            topic: BigNumber;
            scheme: BigNumber;
            issuer: string;
            signature: string;
            data: string;
            uri: string;
        }>;
        getClaimIdsByTopic(_topic: BigNumberish, overrides?: CallOverrides): Promise<[string[]] & {
            claimIds: string[];
        }>;
        getKey(_key: BytesLike, overrides?: CallOverrides): Promise<[
            BigNumber[],
            BigNumber,
            string
        ] & {
            purposes: BigNumber[];
            keyType: BigNumber;
            key: string;
        }>;
        getKeyPurposes(_key: BytesLike, overrides?: CallOverrides): Promise<[BigNumber[]] & {
            _purposes: BigNumber[];
        }>;
        getKeysByPurpose(_purpose: BigNumberish, overrides?: CallOverrides): Promise<[string[]] & {
            keys: string[];
        }>;
        getRecoveredAddress(sig: BytesLike, dataHash: BytesLike, overrides?: CallOverrides): Promise<[string] & {
            addr: string;
        }>;
        initialize(initialManagementKey: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        isClaimRevoked(_sig: BytesLike, overrides?: CallOverrides): Promise<[boolean]>;
        isClaimValid(_identity: string, claimTopic: BigNumberish, sig: BytesLike, data: BytesLike, overrides?: CallOverrides): Promise<[boolean] & {
            claimValid: boolean;
        }>;
        keyHasPurpose(_key: BytesLike, _purpose: BigNumberish, overrides?: CallOverrides): Promise<[boolean] & {
            result: boolean;
        }>;
        removeClaim(_claimId: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        removeKey(_key: BytesLike, _purpose: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        revokeClaim(_claimId: BytesLike, _identity: string, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        revokeClaimBySignature(signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        revokedClaims(arg0: BytesLike, overrides?: CallOverrides): Promise<[boolean]>;
        version(overrides?: CallOverrides): Promise<[string]>;
    };
    addClaim(_topic: BigNumberish, _scheme: BigNumberish, _issuer: string, _signature: BytesLike, _data: BytesLike, _uri: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    addKey(_key: BytesLike, _purpose: BigNumberish, _type: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    approve(_id: BigNumberish, _approve: boolean, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    execute(_to: string, _value: BigNumberish, _data: BytesLike, overrides?: PayableOverrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    getClaim(_claimId: BytesLike, overrides?: CallOverrides): Promise<[
        BigNumber,
        BigNumber,
        string,
        string,
        string,
        string
    ] & {
        topic: BigNumber;
        scheme: BigNumber;
        issuer: string;
        signature: string;
        data: string;
        uri: string;
    }>;
    getClaimIdsByTopic(_topic: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
    getKey(_key: BytesLike, overrides?: CallOverrides): Promise<[
        BigNumber[],
        BigNumber,
        string
    ] & {
        purposes: BigNumber[];
        keyType: BigNumber;
        key: string;
    }>;
    getKeyPurposes(_key: BytesLike, overrides?: CallOverrides): Promise<BigNumber[]>;
    getKeysByPurpose(_purpose: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
    getRecoveredAddress(sig: BytesLike, dataHash: BytesLike, overrides?: CallOverrides): Promise<string>;
    initialize(initialManagementKey: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    isClaimRevoked(_sig: BytesLike, overrides?: CallOverrides): Promise<boolean>;
    isClaimValid(_identity: string, claimTopic: BigNumberish, sig: BytesLike, data: BytesLike, overrides?: CallOverrides): Promise<boolean>;
    keyHasPurpose(_key: BytesLike, _purpose: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
    removeClaim(_claimId: BytesLike, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    removeKey(_key: BytesLike, _purpose: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    revokeClaim(_claimId: BytesLike, _identity: string, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    revokeClaimBySignature(signature: BytesLike, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    revokedClaims(arg0: BytesLike, overrides?: CallOverrides): Promise<boolean>;
    version(overrides?: CallOverrides): Promise<string>;
    callStatic: {
        addClaim(_topic: BigNumberish, _scheme: BigNumberish, _issuer: string, _signature: BytesLike, _data: BytesLike, _uri: string, overrides?: CallOverrides): Promise<string>;
        addKey(_key: BytesLike, _purpose: BigNumberish, _type: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        approve(_id: BigNumberish, _approve: boolean, overrides?: CallOverrides): Promise<boolean>;
        execute(_to: string, _value: BigNumberish, _data: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        getClaim(_claimId: BytesLike, overrides?: CallOverrides): Promise<[
            BigNumber,
            BigNumber,
            string,
            string,
            string,
            string
        ] & {
            topic: BigNumber;
            scheme: BigNumber;
            issuer: string;
            signature: string;
            data: string;
            uri: string;
        }>;
        getClaimIdsByTopic(_topic: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
        getKey(_key: BytesLike, overrides?: CallOverrides): Promise<[
            BigNumber[],
            BigNumber,
            string
        ] & {
            purposes: BigNumber[];
            keyType: BigNumber;
            key: string;
        }>;
        getKeyPurposes(_key: BytesLike, overrides?: CallOverrides): Promise<BigNumber[]>;
        getKeysByPurpose(_purpose: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
        getRecoveredAddress(sig: BytesLike, dataHash: BytesLike, overrides?: CallOverrides): Promise<string>;
        initialize(initialManagementKey: string, overrides?: CallOverrides): Promise<void>;
        isClaimRevoked(_sig: BytesLike, overrides?: CallOverrides): Promise<boolean>;
        isClaimValid(_identity: string, claimTopic: BigNumberish, sig: BytesLike, data: BytesLike, overrides?: CallOverrides): Promise<boolean>;
        keyHasPurpose(_key: BytesLike, _purpose: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        removeClaim(_claimId: BytesLike, overrides?: CallOverrides): Promise<boolean>;
        removeKey(_key: BytesLike, _purpose: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
        revokeClaim(_claimId: BytesLike, _identity: string, overrides?: CallOverrides): Promise<boolean>;
        revokeClaimBySignature(signature: BytesLike, overrides?: CallOverrides): Promise<void>;
        revokedClaims(arg0: BytesLike, overrides?: CallOverrides): Promise<boolean>;
        version(overrides?: CallOverrides): Promise<string>;
    };
    filters: {
        "Approved(uint256,bool)"(executionId?: BigNumberish | null, approved?: null): ApprovedEventFilter;
        Approved(executionId?: BigNumberish | null, approved?: null): ApprovedEventFilter;
        "ClaimAdded(bytes32,uint256,uint256,address,bytes,bytes,string)"(claimId?: BytesLike | null, topic?: BigNumberish | null, scheme?: null, issuer?: string | null, signature?: null, data?: null, uri?: null): ClaimAddedEventFilter;
        ClaimAdded(claimId?: BytesLike | null, topic?: BigNumberish | null, scheme?: null, issuer?: string | null, signature?: null, data?: null, uri?: null): ClaimAddedEventFilter;
        "ClaimChanged(bytes32,uint256,uint256,address,bytes,bytes,string)"(claimId?: BytesLike | null, topic?: BigNumberish | null, scheme?: null, issuer?: string | null, signature?: null, data?: null, uri?: null): ClaimChangedEventFilter;
        ClaimChanged(claimId?: BytesLike | null, topic?: BigNumberish | null, scheme?: null, issuer?: string | null, signature?: null, data?: null, uri?: null): ClaimChangedEventFilter;
        "ClaimRemoved(bytes32,uint256,uint256,address,bytes,bytes,string)"(claimId?: BytesLike | null, topic?: BigNumberish | null, scheme?: null, issuer?: string | null, signature?: null, data?: null, uri?: null): ClaimRemovedEventFilter;
        ClaimRemoved(claimId?: BytesLike | null, topic?: BigNumberish | null, scheme?: null, issuer?: string | null, signature?: null, data?: null, uri?: null): ClaimRemovedEventFilter;
        "ClaimRevoked(bytes)"(signature?: BytesLike | null): ClaimRevokedEventFilter;
        ClaimRevoked(signature?: BytesLike | null): ClaimRevokedEventFilter;
        "Executed(uint256,address,uint256,bytes)"(executionId?: BigNumberish | null, to?: string | null, value?: BigNumberish | null, data?: null): ExecutedEventFilter;
        Executed(executionId?: BigNumberish | null, to?: string | null, value?: BigNumberish | null, data?: null): ExecutedEventFilter;
        "ExecutionFailed(uint256,address,uint256,bytes)"(executionId?: BigNumberish | null, to?: string | null, value?: BigNumberish | null, data?: null): ExecutionFailedEventFilter;
        ExecutionFailed(executionId?: BigNumberish | null, to?: string | null, value?: BigNumberish | null, data?: null): ExecutionFailedEventFilter;
        "ExecutionRequested(uint256,address,uint256,bytes)"(executionId?: BigNumberish | null, to?: string | null, value?: BigNumberish | null, data?: null): ExecutionRequestedEventFilter;
        ExecutionRequested(executionId?: BigNumberish | null, to?: string | null, value?: BigNumberish | null, data?: null): ExecutionRequestedEventFilter;
        "KeyAdded(bytes32,uint256,uint256)"(key?: BytesLike | null, purpose?: BigNumberish | null, keyType?: BigNumberish | null): KeyAddedEventFilter;
        KeyAdded(key?: BytesLike | null, purpose?: BigNumberish | null, keyType?: BigNumberish | null): KeyAddedEventFilter;
        "KeyRemoved(bytes32,uint256,uint256)"(key?: BytesLike | null, purpose?: BigNumberish | null, keyType?: BigNumberish | null): KeyRemovedEventFilter;
        KeyRemoved(key?: BytesLike | null, purpose?: BigNumberish | null, keyType?: BigNumberish | null): KeyRemovedEventFilter;
    };
    estimateGas: {
        addClaim(_topic: BigNumberish, _scheme: BigNumberish, _issuer: string, _signature: BytesLike, _data: BytesLike, _uri: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        addKey(_key: BytesLike, _purpose: BigNumberish, _type: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        approve(_id: BigNumberish, _approve: boolean, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        execute(_to: string, _value: BigNumberish, _data: BytesLike, overrides?: PayableOverrides & {
            from?: string;
        }): Promise<BigNumber>;
        getClaim(_claimId: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        getClaimIdsByTopic(_topic: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getKey(_key: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        getKeyPurposes(_key: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        getKeysByPurpose(_purpose: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getRecoveredAddress(sig: BytesLike, dataHash: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        initialize(initialManagementKey: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        isClaimRevoked(_sig: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        isClaimValid(_identity: string, claimTopic: BigNumberish, sig: BytesLike, data: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        keyHasPurpose(_key: BytesLike, _purpose: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        removeClaim(_claimId: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        removeKey(_key: BytesLike, _purpose: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        revokeClaim(_claimId: BytesLike, _identity: string, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        revokeClaimBySignature(signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        revokedClaims(arg0: BytesLike, overrides?: CallOverrides): Promise<BigNumber>;
        version(overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        addClaim(_topic: BigNumberish, _scheme: BigNumberish, _issuer: string, _signature: BytesLike, _data: BytesLike, _uri: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        addKey(_key: BytesLike, _purpose: BigNumberish, _type: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        approve(_id: BigNumberish, _approve: boolean, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        execute(_to: string, _value: BigNumberish, _data: BytesLike, overrides?: PayableOverrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        getClaim(_claimId: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getClaimIdsByTopic(_topic: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getKey(_key: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getKeyPurposes(_key: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getKeysByPurpose(_purpose: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getRecoveredAddress(sig: BytesLike, dataHash: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        initialize(initialManagementKey: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        isClaimRevoked(_sig: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        isClaimValid(_identity: string, claimTopic: BigNumberish, sig: BytesLike, data: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        keyHasPurpose(_key: BytesLike, _purpose: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        removeClaim(_claimId: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        removeKey(_key: BytesLike, _purpose: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        revokeClaim(_claimId: BytesLike, _identity: string, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        revokeClaimBySignature(signature: BytesLike, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        revokedClaims(arg0: BytesLike, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        version(overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
