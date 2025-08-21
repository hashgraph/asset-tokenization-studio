import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent } from "../../../common";
export type RegulationDataStruct = {
    regulationType: BigNumberish;
    regulationSubType: BigNumberish;
    dealSize: BigNumberish;
    accreditedInvestors: BigNumberish;
    maxNonAccreditedInvestors: BigNumberish;
    manualInvestorVerification: BigNumberish;
    internationalInvestors: BigNumberish;
    resaleHoldPeriod: BigNumberish;
};
export type RegulationDataStructOutput = [
    number,
    number,
    BigNumber,
    number,
    BigNumber,
    number,
    number,
    number
] & {
    regulationType: number;
    regulationSubType: number;
    dealSize: BigNumber;
    accreditedInvestors: number;
    maxNonAccreditedInvestors: BigNumber;
    manualInvestorVerification: number;
    internationalInvestors: number;
    resaleHoldPeriod: number;
};
export type AdditionalSecurityDataStruct = {
    countriesControlListType: boolean;
    listOfCountries: string;
    info: string;
};
export type AdditionalSecurityDataStructOutput = [boolean, string, string] & {
    countriesControlListType: boolean;
    listOfCountries: string;
    info: string;
};
export declare namespace IBond {
    type BondDetailsDataStruct = {
        currency: BytesLike;
        nominalValue: BigNumberish;
        startingDate: BigNumberish;
        maturityDate: BigNumberish;
    };
    type BondDetailsDataStructOutput = [
        string,
        BigNumber,
        BigNumber,
        BigNumber
    ] & {
        currency: string;
        nominalValue: BigNumber;
        startingDate: BigNumber;
        maturityDate: BigNumber;
    };
    type CouponDetailsDataStruct = {
        couponFrequency: BigNumberish;
        couponRate: BigNumberish;
        firstCouponDate: BigNumberish;
    };
    type CouponDetailsDataStructOutput = [
        BigNumber,
        BigNumber,
        BigNumber
    ] & {
        couponFrequency: BigNumber;
        couponRate: BigNumber;
        firstCouponDate: BigNumber;
    };
    type CouponStruct = {
        recordDate: BigNumberish;
        executionDate: BigNumberish;
        rate: BigNumberish;
    };
    type CouponStructOutput = [BigNumber, BigNumber, BigNumber] & {
        recordDate: BigNumber;
        executionDate: BigNumber;
        rate: BigNumber;
    };
    type RegisteredCouponStruct = {
        coupon: IBond.CouponStruct;
        snapshotId: BigNumberish;
    };
    type RegisteredCouponStructOutput = [
        IBond.CouponStructOutput,
        BigNumber
    ] & {
        coupon: IBond.CouponStructOutput;
        snapshotId: BigNumber;
    };
    type CouponForStruct = {
        tokenBalance: BigNumberish;
        rate: BigNumberish;
        recordDate: BigNumberish;
        executionDate: BigNumberish;
        decimals: BigNumberish;
        recordDateReached: boolean;
    };
    type CouponForStructOutput = [
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        number,
        boolean
    ] & {
        tokenBalance: BigNumber;
        rate: BigNumber;
        recordDate: BigNumber;
        executionDate: BigNumber;
        decimals: number;
        recordDateReached: boolean;
    };
}
export declare namespace ISecurity {
    type SecurityRegulationDataStruct = {
        regulationData: RegulationDataStruct;
        additionalSecurityData: AdditionalSecurityDataStruct;
    };
    type SecurityRegulationDataStructOutput = [
        RegulationDataStructOutput,
        AdditionalSecurityDataStructOutput
    ] & {
        regulationData: RegulationDataStructOutput;
        additionalSecurityData: AdditionalSecurityDataStructOutput;
    };
}
export interface IBondUSAInterface extends utils.Interface {
    functions: {
        "_initialize_bondUSA((bytes3,uint256,uint256,uint256),(uint256,uint256,uint256),(uint8,uint8,uint256,uint8,uint256,uint8,uint8,uint8),(bool,string,string))": FunctionFragment;
        "getBondDetails()": FunctionFragment;
        "getCoupon(uint256)": FunctionFragment;
        "getCouponCount()": FunctionFragment;
        "getCouponDetails()": FunctionFragment;
        "getCouponFor(uint256,address)": FunctionFragment;
        "getCouponHolders(uint256,uint256,uint256)": FunctionFragment;
        "getSecurityHolders(uint256,uint256)": FunctionFragment;
        "getSecurityRegulationData()": FunctionFragment;
        "getTotalCouponHolders(uint256)": FunctionFragment;
        "getTotalSecurityHolders()": FunctionFragment;
        "redeemAtMaturityByPartition(address,bytes32,uint256)": FunctionFragment;
        "setCoupon((uint256,uint256,uint256))": FunctionFragment;
        "updateMaturityDate(uint256)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "_initialize_bondUSA" | "getBondDetails" | "getCoupon" | "getCouponCount" | "getCouponDetails" | "getCouponFor" | "getCouponHolders" | "getSecurityHolders" | "getSecurityRegulationData" | "getTotalCouponHolders" | "getTotalSecurityHolders" | "redeemAtMaturityByPartition" | "setCoupon" | "updateMaturityDate"): FunctionFragment;
    encodeFunctionData(functionFragment: "_initialize_bondUSA", values: [
        IBond.BondDetailsDataStruct,
        IBond.CouponDetailsDataStruct,
        RegulationDataStruct,
        AdditionalSecurityDataStruct
    ]): string;
    encodeFunctionData(functionFragment: "getBondDetails", values?: undefined): string;
    encodeFunctionData(functionFragment: "getCoupon", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getCouponCount", values?: undefined): string;
    encodeFunctionData(functionFragment: "getCouponDetails", values?: undefined): string;
    encodeFunctionData(functionFragment: "getCouponFor", values: [BigNumberish, string]): string;
    encodeFunctionData(functionFragment: "getCouponHolders", values: [BigNumberish, BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getSecurityHolders", values: [BigNumberish, BigNumberish]): string;
    encodeFunctionData(functionFragment: "getSecurityRegulationData", values?: undefined): string;
    encodeFunctionData(functionFragment: "getTotalCouponHolders", values: [BigNumberish]): string;
    encodeFunctionData(functionFragment: "getTotalSecurityHolders", values?: undefined): string;
    encodeFunctionData(functionFragment: "redeemAtMaturityByPartition", values: [string, BytesLike, BigNumberish]): string;
    encodeFunctionData(functionFragment: "setCoupon", values: [IBond.CouponStruct]): string;
    encodeFunctionData(functionFragment: "updateMaturityDate", values: [BigNumberish]): string;
    decodeFunctionResult(functionFragment: "_initialize_bondUSA", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getBondDetails", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getCoupon", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getCouponCount", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getCouponDetails", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getCouponFor", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getCouponHolders", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getSecurityHolders", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getSecurityRegulationData", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTotalCouponHolders", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTotalSecurityHolders", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "redeemAtMaturityByPartition", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "setCoupon", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "updateMaturityDate", data: BytesLike): Result;
    events: {};
}
export interface IBondUSA extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: IBondUSAInterface;
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
        _initialize_bondUSA(_bondDetailsData: IBond.BondDetailsDataStruct, _couponDetailsData: IBond.CouponDetailsDataStruct, _regulationData: RegulationDataStruct, _additionalSecurityData: AdditionalSecurityDataStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        getBondDetails(overrides?: CallOverrides): Promise<[
            IBond.BondDetailsDataStructOutput
        ] & {
            bondDetailsData_: IBond.BondDetailsDataStructOutput;
        }>;
        getCoupon(_couponID: BigNumberish, overrides?: CallOverrides): Promise<[
            IBond.RegisteredCouponStructOutput
        ] & {
            registeredCoupon_: IBond.RegisteredCouponStructOutput;
        }>;
        getCouponCount(overrides?: CallOverrides): Promise<[BigNumber] & {
            couponCount_: BigNumber;
        }>;
        getCouponDetails(overrides?: CallOverrides): Promise<[
            IBond.CouponDetailsDataStructOutput
        ] & {
            couponDetails_: IBond.CouponDetailsDataStructOutput;
        }>;
        getCouponFor(_couponID: BigNumberish, _account: string, overrides?: CallOverrides): Promise<[
            IBond.CouponForStructOutput
        ] & {
            couponFor_: IBond.CouponForStructOutput;
        }>;
        getCouponHolders(_couponID: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<[string[]] & {
            holders_: string[];
        }>;
        getSecurityHolders(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<[string[]] & {
            holders_: string[];
        }>;
        getSecurityRegulationData(overrides?: CallOverrides): Promise<[
            ISecurity.SecurityRegulationDataStructOutput
        ] & {
            securityRegulationData_: ISecurity.SecurityRegulationDataStructOutput;
        }>;
        getTotalCouponHolders(_couponID: BigNumberish, overrides?: CallOverrides): Promise<[BigNumber]>;
        getTotalSecurityHolders(overrides?: CallOverrides): Promise<[BigNumber]>;
        redeemAtMaturityByPartition(_tokenHolder: string, _partition: BytesLike, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        setCoupon(_newCoupon: IBond.CouponStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
        updateMaturityDate(_maturityDate: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<ContractTransaction>;
    };
    _initialize_bondUSA(_bondDetailsData: IBond.BondDetailsDataStruct, _couponDetailsData: IBond.CouponDetailsDataStruct, _regulationData: RegulationDataStruct, _additionalSecurityData: AdditionalSecurityDataStruct, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    getBondDetails(overrides?: CallOverrides): Promise<IBond.BondDetailsDataStructOutput>;
    getCoupon(_couponID: BigNumberish, overrides?: CallOverrides): Promise<IBond.RegisteredCouponStructOutput>;
    getCouponCount(overrides?: CallOverrides): Promise<BigNumber>;
    getCouponDetails(overrides?: CallOverrides): Promise<IBond.CouponDetailsDataStructOutput>;
    getCouponFor(_couponID: BigNumberish, _account: string, overrides?: CallOverrides): Promise<IBond.CouponForStructOutput>;
    getCouponHolders(_couponID: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
    getSecurityHolders(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
    getSecurityRegulationData(overrides?: CallOverrides): Promise<ISecurity.SecurityRegulationDataStructOutput>;
    getTotalCouponHolders(_couponID: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
    getTotalSecurityHolders(overrides?: CallOverrides): Promise<BigNumber>;
    redeemAtMaturityByPartition(_tokenHolder: string, _partition: BytesLike, _amount: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    setCoupon(_newCoupon: IBond.CouponStruct, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    updateMaturityDate(_maturityDate: BigNumberish, overrides?: Overrides & {
        from?: string;
    }): Promise<ContractTransaction>;
    callStatic: {
        _initialize_bondUSA(_bondDetailsData: IBond.BondDetailsDataStruct, _couponDetailsData: IBond.CouponDetailsDataStruct, _regulationData: RegulationDataStruct, _additionalSecurityData: AdditionalSecurityDataStruct, overrides?: CallOverrides): Promise<void>;
        getBondDetails(overrides?: CallOverrides): Promise<IBond.BondDetailsDataStructOutput>;
        getCoupon(_couponID: BigNumberish, overrides?: CallOverrides): Promise<IBond.RegisteredCouponStructOutput>;
        getCouponCount(overrides?: CallOverrides): Promise<BigNumber>;
        getCouponDetails(overrides?: CallOverrides): Promise<IBond.CouponDetailsDataStructOutput>;
        getCouponFor(_couponID: BigNumberish, _account: string, overrides?: CallOverrides): Promise<IBond.CouponForStructOutput>;
        getCouponHolders(_couponID: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
        getSecurityHolders(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<string[]>;
        getSecurityRegulationData(overrides?: CallOverrides): Promise<ISecurity.SecurityRegulationDataStructOutput>;
        getTotalCouponHolders(_couponID: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getTotalSecurityHolders(overrides?: CallOverrides): Promise<BigNumber>;
        redeemAtMaturityByPartition(_tokenHolder: string, _partition: BytesLike, _amount: BigNumberish, overrides?: CallOverrides): Promise<void>;
        setCoupon(_newCoupon: IBond.CouponStruct, overrides?: CallOverrides): Promise<[
            boolean,
            BigNumber
        ] & {
            success_: boolean;
            couponID_: BigNumber;
        }>;
        updateMaturityDate(_maturityDate: BigNumberish, overrides?: CallOverrides): Promise<boolean>;
    };
    filters: {};
    estimateGas: {
        _initialize_bondUSA(_bondDetailsData: IBond.BondDetailsDataStruct, _couponDetailsData: IBond.CouponDetailsDataStruct, _regulationData: RegulationDataStruct, _additionalSecurityData: AdditionalSecurityDataStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        getBondDetails(overrides?: CallOverrides): Promise<BigNumber>;
        getCoupon(_couponID: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getCouponCount(overrides?: CallOverrides): Promise<BigNumber>;
        getCouponDetails(overrides?: CallOverrides): Promise<BigNumber>;
        getCouponFor(_couponID: BigNumberish, _account: string, overrides?: CallOverrides): Promise<BigNumber>;
        getCouponHolders(_couponID: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getSecurityHolders(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getSecurityRegulationData(overrides?: CallOverrides): Promise<BigNumber>;
        getTotalCouponHolders(_couponID: BigNumberish, overrides?: CallOverrides): Promise<BigNumber>;
        getTotalSecurityHolders(overrides?: CallOverrides): Promise<BigNumber>;
        redeemAtMaturityByPartition(_tokenHolder: string, _partition: BytesLike, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        setCoupon(_newCoupon: IBond.CouponStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
        updateMaturityDate(_maturityDate: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        _initialize_bondUSA(_bondDetailsData: IBond.BondDetailsDataStruct, _couponDetailsData: IBond.CouponDetailsDataStruct, _regulationData: RegulationDataStruct, _additionalSecurityData: AdditionalSecurityDataStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        getBondDetails(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getCoupon(_couponID: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getCouponCount(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getCouponDetails(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getCouponFor(_couponID: BigNumberish, _account: string, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getCouponHolders(_couponID: BigNumberish, _pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getSecurityHolders(_pageIndex: BigNumberish, _pageLength: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getSecurityRegulationData(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getTotalCouponHolders(_couponID: BigNumberish, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getTotalSecurityHolders(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        redeemAtMaturityByPartition(_tokenHolder: string, _partition: BytesLike, _amount: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        setCoupon(_newCoupon: IBond.CouponStruct, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
        updateMaturityDate(_maturityDate: BigNumberish, overrides?: Overrides & {
            from?: string;
        }): Promise<PopulatedTransaction>;
    };
}
