import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export interface IClearingReadInterface extends utils.Interface {
    functions: {
        "getClearedAmountFor(address)": FunctionFragment;
        "getClearedAmountForByPartition(bytes32,address)": FunctionFragment;
        "getClearingCountForByPartition(bytes32,address,uint8)": FunctionFragment;
        "getClearingThirdParty(bytes32,address,uint8,uint256)": FunctionFragment;
        "getClearingsIdForByPartition(bytes32,address,uint8,uint256,uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "getClearedAmountFor" | "getClearedAmountForByPartition" | "getClearingCountForByPartition" | "getClearingThirdParty" | "getClearingsIdForByPartition"): FunctionFragment;
    encodeFunctionData(functionFragment: "getClearedAmountFor", values: [string]): string;
    encodeFunctionData(functionFragment: "getClearedAmountForByPartition", values: [BytesLike, string]): string;
    encodeFunctionData(functionFragment: "getClearingCountForByPartition", values: [BytesLike, string, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getClearingThirdParty", values: [BytesLike, string, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getClearingsIdForByPartition", values: [BytesLike, string, BigNumberish, BigNumberish, BigNumberish]): string;
    decodeFunctionResult(functionFragment: "getClearedAmountFor", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getClearedAmountForByPartition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getClearingCountForByPartition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getClearingThirdParty", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getClearingsIdForByPartition", data: BytesLike): Result;
    events: {};
}
export interface IClearingRead extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IClearingReadInterface;
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
        getClearedAmountFor(_tokenHolder: string, overrides?: CallOverrides): Promise<[BigNumber] & {
            amount_: BigNumber;
        }>;
        getClearedAmountForByPartition(_partition: BytesLike, _tokenHolder: string, overrides?: CallOverrides): Promise<[BigNumber] & {
            amount_: BigNumber;
        }>;
        getClearingCountForByPartition(_partition: BytesLike, _tokenHolder: string, _clearingOperationType: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber] & {
            clearingCount_: BigNumber;
        }>;
        getClearingThirdParty(_partition: BytesLike, _tokenHolder: string, _clearingOperationType: BigNumberish, clearingId_: BigNumberish, overrides?: CallOverrides): Promise<[string] & {
            thirdParty_: string;
        }>;
        getClearingsIdForByPartition(_partition: BytesLike, _tokenHolder: string, _clearingOperationType: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber[]] & {
            clearingsId_: BigNumber[];
        }>;
    };
    getClearedAmountFor(_tokenHolder: string, overrides?: CallOverrides): Promise<BigNumber>;
    getClearedAmountForByPartition(_partition: BytesLike, _tokenHolder: string, overrides?: CallOverrides): Promise<BigNumber>;
    getClearingCountForByPartition(_partition: BytesLike, _tokenHolder: string, _clearingOperationType: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    getClearingThirdParty(_partition: BytesLike, _tokenHolder: string, _clearingOperationType: BigNumberish, clearingId_: BigNumberish, overrides?: CallOverrides): Promise<string>;
    getClearingsIdForByPartition(_partition: BytesLike, _tokenHolder: string, _clearingOperationType: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber[]>;
    callStatic: {
        getClearedAmountFor(_tokenHolder: string, overrides?: CallOverrides): Promise<BigNumber>;
        getClearedAmountForByPartition(_partition: BytesLike, _tokenHolder: string, overrides?: CallOverrides): Promise<BigNumber>;
        getClearingCountForByPartition(_partition: BytesLike, _tokenHolder: string, _clearingOperationType: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getClearingThirdParty(_partition: BytesLike, _tokenHolder: string, _clearingOperationType: BigNumberish, clearingId_: BigNumberish, overrides?: CallOverrides): Promise<string>;
        getClearingsIdForByPartition(_partition: BytesLike, _tokenHolder: string, _clearingOperationType: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber[]>;
    };
    filters: {};
    estimateGas: {
        getClearedAmountFor(_tokenHolder: string, overrides?: CallOverrides): Promise<BigNumber>;
        getClearedAmountForByPartition(_partition: BytesLike, _tokenHolder: string, overrides?: CallOverrides): Promise<BigNumber>;
        getClearingCountForByPartition(_partition: BytesLike, _tokenHolder: string, _clearingOperationType: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getClearingThirdParty(_partition: BytesLike, _tokenHolder: string, _clearingOperationType: BigNumberish, clearingId_: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getClearingsIdForByPartition(_partition: BytesLike, _tokenHolder: string, _clearingOperationType: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    };
    populateTransaction: {
        getClearedAmountFor(_tokenHolder: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getClearedAmountForByPartition(_partition: BytesLike, _tokenHolder: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getClearingCountForByPartition(_partition: BytesLike, _tokenHolder: string, _clearingOperationType: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getClearingThirdParty(_partition: BytesLike, _tokenHolder: string, _clearingOperationType: BigNumberish, clearingId_: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getClearingsIdForByPartition(_partition: BytesLike, _tokenHolder: string, _clearingOperationType: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
    };
}
