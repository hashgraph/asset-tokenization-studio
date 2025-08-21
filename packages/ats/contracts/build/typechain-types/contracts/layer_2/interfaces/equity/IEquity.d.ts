import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../../common";
export declare namespace IEquity {
    type DividendStruct = {
        recordDate: BigNumberish;
        executionDate: BigNumberish;
        amount: BigNumberish;
    };
    type DividendStructOutput = [BigNumber, BigNumber, BigNumber] & {
        recordDate: BigNumber;
        executionDate: BigNumber;
        amount: BigNumber;
    };
    type RegisteredDividendStruct = {
        dividend: IEquity.DividendStruct;
        snapshotId: BigNumberish;
    };
    type RegisteredDividendStructOutput = [
        IEquity.DividendStructOutput,
        BigNumber
    ] & {
        dividend: IEquity.DividendStructOutput;
        snapshotId: BigNumber;
    };
    type DividendForStruct = {
        tokenBalance: BigNumberish;
        amount: BigNumberish;
        recordDate: BigNumberish;
        executionDate: BigNumberish;
        decimals: BigNumberish;
        recordDateReached: boolean;
    };
    type DividendForStructOutput = [
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        number,
        boolean
    ] & {
        tokenBalance: BigNumber;
        amount: BigNumber;
        recordDate: BigNumber;
        executionDate: BigNumber;
        decimals: number;
        recordDateReached: boolean;
    };
    type EquityDetailsDataStruct = {
        votingRight: boolean;
        informationRight: boolean;
        liquidationRight: boolean;
        subscriptionRight: boolean;
        conversionRight: boolean;
        redemptionRight: boolean;
        putRight: boolean;
        dividendRight: BigNumberish;
        currency: BytesLike;
        nominalValue: BigNumberish;
    };
    type EquityDetailsDataStructOutput = [
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        boolean,
        number,
        string,
        BigNumber
    ] & {
        votingRight: boolean;
        informationRight: boolean;
        liquidationRight: boolean;
        subscriptionRight: boolean;
        conversionRight: boolean;
        redemptionRight: boolean;
        putRight: boolean;
        dividendRight: number;
        currency: string;
        nominalValue: BigNumber;
    };
    type ScheduledBalanceAdjustmentStruct = {
        executionDate: BigNumberish;
        factor: BigNumberish;
        decimals: BigNumberish;
    };
    type ScheduledBalanceAdjustmentStructOutput = [
        BigNumber,
        BigNumber,
        number
    ] & {
        executionDate: BigNumber;
        factor: BigNumber;
        decimals: number;
    };
    type VotingStruct = {
        recordDate: BigNumberish;
        data: BytesLike;
    };
    type VotingStructOutput = [BigNumber, string] & {
        recordDate: BigNumber;
        data: string;
    };
    type RegisteredVotingStruct = {
        voting: IEquity.VotingStruct;
        snapshotId: BigNumberish;
    };
    type RegisteredVotingStructOutput = [
        IEquity.VotingStructOutput,
        BigNumber
    ] & {
        voting: IEquity.VotingStructOutput;
        snapshotId: BigNumber;
    };
    type VotingForStruct = {
        tokenBalance: BigNumberish;
        recordDate: BigNumberish;
        data: BytesLike;
        decimals: BigNumberish;
        recordDateReached: boolean;
    };
    type VotingForStructOutput = [
        BigNumber,
        BigNumber,
        string,
        number,
        boolean
    ] & {
        tokenBalance: BigNumber;
        recordDate: BigNumber;
        data: string;
        decimals: number;
        recordDateReached: boolean;
    };
}
export interface IEquityInterface extends utils.Interface {
    functions: {
        "getDividendHolders(uint256,uint256,uint256)": FunctionFragment;
        "getDividends(uint256)": FunctionFragment;
        "getDividendsCount()": FunctionFragment;
        "getDividendsFor(uint256,address)": FunctionFragment;
        "getEquityDetails()": FunctionFragment;
        "getScheduledBalanceAdjustment(uint256)": FunctionFragment;
        "getScheduledBalanceAdjustmentCount()": FunctionFragment;
        "getTotalDividendHolders(uint256)": FunctionFragment;
        "getTotalVotingHolders(uint256)": FunctionFragment;
        "getVoting(uint256)": FunctionFragment;
        "getVotingCount()": FunctionFragment;
        "getVotingFor(uint256,address)": FunctionFragment;
        "getVotingHolders(uint256,uint256,uint256)": FunctionFragment;
        "setDividends((uint256,uint256,uint256))": FunctionFragment;
        "setScheduledBalanceAdjustment((uint256,uint256,uint8))": FunctionFragment;
        "setVoting((uint256,bytes))": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "getDividendHolders" | "getDividends" | "getDividendsCount" | "getDividendsFor" | "getEquityDetails" | "getScheduledBalanceAdjustment" | "getScheduledBalanceAdjustmentCount" | "getTotalDividendHolders" | "getTotalVotingHolders" | "getVoting" | "getVotingCount" | "getVotingFor" | "getVotingHolders" | "setDividends" | "setScheduledBalanceAdjustment" | "setVoting"): FunctionFragment;
    encodeFunctionData(functionFragment: "getDividendHolders", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getDividends", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getDividendsCount", values?: undefined): string;
    encodeFunctionData(functionFragment: "getDividendsFor", values: [BigNumberish, string]): string;
    encodeFunctionData(functionFragment: "getEquityDetails", values?: undefined): string;
    encodeFunctionData(functionFragment: "getScheduledBalanceAdjustment", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getScheduledBalanceAdjustmentCount", values?: undefined): string;
    encodeFunctionData(functionFragment: "getTotalDividendHolders", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getTotalVotingHolders", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getVoting", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getVotingCount", values?: undefined): string;
    encodeFunctionData(functionFragment: "getVotingFor", values: [BigNumberish, string]): string;
    encodeFunctionData(functionFragment: "getVotingHolders", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "setDividends", values: [IEquity.DividendStruct]): string;
    encodeFunctionData(functionFragment: "setScheduledBalanceAdjustment", values: [IEquity.ScheduledBalanceAdjustmentStruct]): string;
    encodeFunctionData(functionFragment: "setVoting", values: [IEquity.VotingStruct]): string;
    decodeFunctionResult(functionFragment: "getDividendHolders", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getDividends", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getDividendsCount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getDividendsFor", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getEquityDetails", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getScheduledBalanceAdjustment", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getScheduledBalanceAdjustmentCount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTotalDividendHolders", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTotalVotingHolders", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getVoting", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getVotingCount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getVotingFor", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getVotingHolders", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setDividends", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setScheduledBalanceAdjustment", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setVoting", data: BytesLike): Result;
    events: {};
}
export interface IEquity extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IEquityInterface;
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
        getDividendHolders(_dividendID: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<[string[]] & {
            holders_: string[];
        }>;
        getDividends(_dividendID: BigNumberish, overrides?: CallOverrides): Promise<[
            IEquity.RegisteredDividendStructOutput
        ] & {
            registeredDividend_: IEquity.RegisteredDividendStructOutput;
        }>;
        getDividendsCount(overrides?: CallOverrides): Promise<[BigNumber] & {
            dividendCount_: BigNumber;
        }>;
        getDividendsFor(_dividendID: BigNumberish, _account: string, overrides?: CallOverrides): Promise<[
            IEquity.DividendForStructOutput
        ] & {
            dividendFor_: IEquity.DividendForStructOutput;
        }>;
        getEquityDetails(overrides?: CallOverrides): Promise<[
            IEquity.EquityDetailsDataStructOutput
        ] & {
            equityDetailsData_: IEquity.EquityDetailsDataStructOutput;
        }>;
        getScheduledBalanceAdjustment(_balanceAdjustmentID: BigNumberish, overrides?: CallOverrides): Promise<[
            IEquity.ScheduledBalanceAdjustmentStructOutput
        ] & {
            balanceAdjustment_: IEquity.ScheduledBalanceAdjustmentStructOutput;
        }>;
        getScheduledBalanceAdjustmentCount(overrides?: CallOverrides): Promise<[BigNumber] & {
            balanceAdjustmentCount_: BigNumber;
        }>;
        getTotalDividendHolders(_dividendID: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;
        getTotalVotingHolders(_voteID: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;
        getVoting(_voteID: BigNumberish, overrides?: CallOverrides): Promise<[
            IEquity.RegisteredVotingStructOutput
        ] & {
            registeredVoting_: IEquity.RegisteredVotingStructOutput;
        }>;
        getVotingCount(overrides?: CallOverrides): Promise<[BigNumber] & {
            votingCount_: BigNumber;
        }>;
        getVotingFor(_voteID: BigNumberish, _account: string, overrides?: CallOverrides): Promise<[
            IEquity.VotingForStructOutput
        ] & {
            votingFor_: IEquity.VotingForStructOutput;
        }>;
        getVotingHolders(_voteID: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<[string[]] & {
            holders_: string[];
        }>;
        setDividends(_newDividend: IEquity.DividendStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        setScheduledBalanceAdjustment(_newBalanceAdjustment: IEquity.ScheduledBalanceAdjustmentStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        setVoting(_newVoting: IEquity.VotingStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    getDividendHolders(_dividendID: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
    getDividends(_dividendID: BigNumberish, overrides?: CallOverrides): Promise<IEquity.RegisteredDividendStructOutput>;
    getDividendsCount(overrides?: CallOverrides): Promise<BigNumber>;
    getDividendsFor(_dividendID: BigNumberish, _account: string, overrides?: CallOverrides): Promise<IEquity.DividendForStructOutput>;
    getEquityDetails(overrides?: CallOverrides): Promise<IEquity.EquityDetailsDataStructOutput>;
    getScheduledBalanceAdjustment(_balanceAdjustmentID: BigNumberish, overrides?: CallOverrides): Promise<IEquity.ScheduledBalanceAdjustmentStructOutput>;
    getScheduledBalanceAdjustmentCount(overrides?: CallOverrides): Promise<BigNumber>;
    getTotalDividendHolders(_dividendID: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    getTotalVotingHolders(_voteID: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    getVoting(_voteID: BigNumberish, overrides?: CallOverrides): Promise<IEquity.RegisteredVotingStructOutput>;
    getVotingCount(overrides?: CallOverrides): Promise<BigNumber>;
    getVotingFor(_voteID: BigNumberish, _account: string, overrides?: CallOverrides): Promise<IEquity.VotingForStructOutput>;
    getVotingHolders(_voteID: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
    setDividends(_newDividend: IEquity.DividendStruct, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    setScheduledBalanceAdjustment(_newBalanceAdjustment: IEquity.ScheduledBalanceAdjustmentStruct, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    setVoting(_newVoting: IEquity.VotingStruct, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        getDividendHolders(_dividendID: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
        getDividends(_dividendID: BigNumberish, overrides?: CallOverrides): Promise<IEquity.RegisteredDividendStructOutput>;
        getDividendsCount(overrides?: CallOverrides): Promise<BigNumber>;
        getDividendsFor(_dividendID: BigNumberish, _account: string, overrides?: CallOverrides): Promise<IEquity.DividendForStructOutput>;
        getEquityDetails(overrides?: CallOverrides): Promise<IEquity.EquityDetailsDataStructOutput>;
        getScheduledBalanceAdjustment(_balanceAdjustmentID: BigNumberish, overrides?: CallOverrides): Promise<IEquity.ScheduledBalanceAdjustmentStructOutput>;
        getScheduledBalanceAdjustmentCount(overrides?: CallOverrides): Promise<BigNumber>;
        getTotalDividendHolders(_dividendID: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getTotalVotingHolders(_voteID: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getVoting(_voteID: BigNumberish, overrides?: CallOverrides): Promise<IEquity.RegisteredVotingStructOutput>;
        getVotingCount(overrides?: CallOverrides): Promise<BigNumber>;
        getVotingFor(_voteID: BigNumberish, _account: string, overrides?: CallOverrides): Promise<IEquity.VotingForStructOutput>;
        getVotingHolders(_voteID: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
        setDividends(_newDividend: IEquity.DividendStruct, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            dividendID_: BigNumber;
        }>;
        setScheduledBalanceAdjustment(_newBalanceAdjustment: IEquity.ScheduledBalanceAdjustmentStruct, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            balanceAdjustmentID_: BigNumber;
        }>;
        setVoting(_newVoting: IEquity.VotingStruct, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            voteID_: BigNumber;
        }>;
    };
    filters: {};
    estimateGas: {
        getDividendHolders(_dividendID: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getDividends(_dividendID: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getDividendsCount(overrides?: CallOverrides): Promise<BigNumber>;
        getDividendsFor(_dividendID: BigNumberish, _account: string, overrides?: CallOverrides): Promise<BigNumber>;
        getEquityDetails(overrides?: CallOverrides): Promise<BigNumber>;
        getScheduledBalanceAdjustment(_balanceAdjustmentID: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getScheduledBalanceAdjustmentCount(overrides?: CallOverrides): Promise<BigNumber>;
        getTotalDividendHolders(_dividendID: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getTotalVotingHolders(_voteID: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getVoting(_voteID: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getVotingCount(overrides?: CallOverrides): Promise<BigNumber>;
        getVotingFor(_voteID: BigNumberish, _account: string, overrides?: CallOverrides): Promise<BigNumber>;
        getVotingHolders(_voteID: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        setDividends(_newDividend: IEquity.DividendStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        setScheduledBalanceAdjustment(_newBalanceAdjustment: IEquity.ScheduledBalanceAdjustmentStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        setVoting(_newVoting: IEquity.VotingStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        getDividendHolders(_dividendID: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getDividends(_dividendID: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getDividendsCount(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getDividendsFor(_dividendID: BigNumberish, _account: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getEquityDetails(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getScheduledBalanceAdjustment(_balanceAdjustmentID: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getScheduledBalanceAdjustmentCount(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getTotalDividendHolders(_dividendID: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getTotalVotingHolders(_voteID: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getVoting(_voteID: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getVotingCount(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getVotingFor(_voteID: BigNumberish, _account: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getVotingHolders(_voteID: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        setDividends(_newDividend: IEquity.DividendStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        setScheduledBalanceAdjustment(_newBalanceAdjustment: IEquity.ScheduledBalanceAdjustmentStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        setVoting(_newVoting: IEquity.VotingStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
