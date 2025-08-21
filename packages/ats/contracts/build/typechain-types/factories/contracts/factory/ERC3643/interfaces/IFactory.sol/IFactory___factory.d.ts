import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IFactory_, IFactory_Interface } from "../../../../../../contracts/factory/ERC3643/interfaces/IFactory.sol/IFactory_";
export declare class IFactory___factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "contract IBusinessLogicResolver_";
            readonly name: "resolver";
            readonly type: "address";
        }];
        readonly name: "EmptyResolver";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "NoInitialAdmins";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "deployer";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "bondAddress";
            readonly type: "address";
        }, {
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "bool";
                    readonly name: "arePartitionsProtected";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "isMultiPartition";
                    readonly type: "bool";
                }, {
                    readonly internalType: "contract IBusinessLogicResolver_";
                    readonly name: "resolver";
                    readonly type: "address";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "bytes32";
                        readonly name: "key";
                        readonly type: "bytes32";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "version";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct IFactory_.ResolverProxyConfiguration";
                    readonly name: "resolverProxyConfiguration";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "bytes32";
                        readonly name: "role";
                        readonly type: "bytes32";
                    }, {
                        readonly internalType: "address[]";
                        readonly name: "members";
                        readonly type: "address[]";
                    }];
                    readonly internalType: "struct IResolverProxy_.Rbac[]";
                    readonly name: "rbacs";
                    readonly type: "tuple[]";
                }, {
                    readonly internalType: "bool";
                    readonly name: "isControllable";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "isWhiteList";
                    readonly type: "bool";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "maxSupply";
                    readonly type: "uint256";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "string";
                        readonly name: "name";
                        readonly type: "string";
                    }, {
                        readonly internalType: "string";
                        readonly name: "symbol";
                        readonly type: "string";
                    }, {
                        readonly internalType: "string";
                        readonly name: "isin";
                        readonly type: "string";
                    }, {
                        readonly internalType: "uint8";
                        readonly name: "decimals";
                        readonly type: "uint8";
                    }];
                    readonly internalType: "struct IFactory_.ERC20MetadataInfo";
                    readonly name: "erc20MetadataInfo";
                    readonly type: "tuple";
                }, {
                    readonly internalType: "bool";
                    readonly name: "clearingActive";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "internalKycActivated";
                    readonly type: "bool";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "externalPauses";
                    readonly type: "address[]";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "externalControlLists";
                    readonly type: "address[]";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "externalKycLists";
                    readonly type: "address[]";
                }, {
                    readonly internalType: "address";
                    readonly name: "compliance";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "identityRegistry";
                    readonly type: "address";
                }];
                readonly internalType: "struct IFactory_.SecurityData";
                readonly name: "security";
                readonly type: "tuple";
            }, {
                readonly components: readonly [{
                    readonly internalType: "bytes3";
                    readonly name: "currency";
                    readonly type: "bytes3";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "nominalValue";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "startingDate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "maturityDate";
                    readonly type: "uint256";
                }];
                readonly internalType: "struct IBond_.BondDetailsData";
                readonly name: "bondDetails";
                readonly type: "tuple";
            }, {
                readonly components: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "couponFrequency";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "couponRate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "firstCouponDate";
                    readonly type: "uint256";
                }];
                readonly internalType: "struct IBond_.CouponDetailsData";
                readonly name: "couponDetails";
                readonly type: "tuple";
            }];
            readonly indexed: false;
            readonly internalType: "struct IFactory_.BondData";
            readonly name: "bondData";
            readonly type: "tuple";
        }, {
            readonly components: readonly [{
                readonly internalType: "enum RegulationType";
                readonly name: "regulationType";
                readonly type: "uint8";
            }, {
                readonly internalType: "enum RegulationSubType";
                readonly name: "regulationSubType";
                readonly type: "uint8";
            }, {
                readonly components: readonly [{
                    readonly internalType: "bool";
                    readonly name: "countriesControlListType";
                    readonly type: "bool";
                }, {
                    readonly internalType: "string";
                    readonly name: "listOfCountries";
                    readonly type: "string";
                }, {
                    readonly internalType: "string";
                    readonly name: "info";
                    readonly type: "string";
                }];
                readonly internalType: "struct AdditionalSecurityData";
                readonly name: "additionalSecurityData";
                readonly type: "tuple";
            }];
            readonly indexed: false;
            readonly internalType: "struct FactoryRegulationData";
            readonly name: "regulationData";
            readonly type: "tuple";
        }];
        readonly name: "BondDeployed";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "deployer";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "equityAddress";
            readonly type: "address";
        }, {
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "bool";
                    readonly name: "arePartitionsProtected";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "isMultiPartition";
                    readonly type: "bool";
                }, {
                    readonly internalType: "contract IBusinessLogicResolver_";
                    readonly name: "resolver";
                    readonly type: "address";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "bytes32";
                        readonly name: "key";
                        readonly type: "bytes32";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "version";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct IFactory_.ResolverProxyConfiguration";
                    readonly name: "resolverProxyConfiguration";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "bytes32";
                        readonly name: "role";
                        readonly type: "bytes32";
                    }, {
                        readonly internalType: "address[]";
                        readonly name: "members";
                        readonly type: "address[]";
                    }];
                    readonly internalType: "struct IResolverProxy_.Rbac[]";
                    readonly name: "rbacs";
                    readonly type: "tuple[]";
                }, {
                    readonly internalType: "bool";
                    readonly name: "isControllable";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "isWhiteList";
                    readonly type: "bool";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "maxSupply";
                    readonly type: "uint256";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "string";
                        readonly name: "name";
                        readonly type: "string";
                    }, {
                        readonly internalType: "string";
                        readonly name: "symbol";
                        readonly type: "string";
                    }, {
                        readonly internalType: "string";
                        readonly name: "isin";
                        readonly type: "string";
                    }, {
                        readonly internalType: "uint8";
                        readonly name: "decimals";
                        readonly type: "uint8";
                    }];
                    readonly internalType: "struct IFactory_.ERC20MetadataInfo";
                    readonly name: "erc20MetadataInfo";
                    readonly type: "tuple";
                }, {
                    readonly internalType: "bool";
                    readonly name: "clearingActive";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "internalKycActivated";
                    readonly type: "bool";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "externalPauses";
                    readonly type: "address[]";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "externalControlLists";
                    readonly type: "address[]";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "externalKycLists";
                    readonly type: "address[]";
                }, {
                    readonly internalType: "address";
                    readonly name: "compliance";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "identityRegistry";
                    readonly type: "address";
                }];
                readonly internalType: "struct IFactory_.SecurityData";
                readonly name: "security";
                readonly type: "tuple";
            }, {
                readonly components: readonly [{
                    readonly internalType: "bool";
                    readonly name: "votingRight";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "informationRight";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "liquidationRight";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "subscriptionRight";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "conversionRight";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "redemptionRight";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "putRight";
                    readonly type: "bool";
                }, {
                    readonly internalType: "enum IEquity_.DividendType";
                    readonly name: "dividendRight";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "bytes3";
                    readonly name: "currency";
                    readonly type: "bytes3";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "nominalValue";
                    readonly type: "uint256";
                }];
                readonly internalType: "struct IEquity_.EquityDetailsData";
                readonly name: "equityDetails";
                readonly type: "tuple";
            }];
            readonly indexed: false;
            readonly internalType: "struct IFactory_.EquityData";
            readonly name: "equityData";
            readonly type: "tuple";
        }, {
            readonly components: readonly [{
                readonly internalType: "enum RegulationType";
                readonly name: "regulationType";
                readonly type: "uint8";
            }, {
                readonly internalType: "enum RegulationSubType";
                readonly name: "regulationSubType";
                readonly type: "uint8";
            }, {
                readonly components: readonly [{
                    readonly internalType: "bool";
                    readonly name: "countriesControlListType";
                    readonly type: "bool";
                }, {
                    readonly internalType: "string";
                    readonly name: "listOfCountries";
                    readonly type: "string";
                }, {
                    readonly internalType: "string";
                    readonly name: "info";
                    readonly type: "string";
                }];
                readonly internalType: "struct AdditionalSecurityData";
                readonly name: "additionalSecurityData";
                readonly type: "tuple";
            }];
            readonly indexed: false;
            readonly internalType: "struct FactoryRegulationData";
            readonly name: "regulationData";
            readonly type: "tuple";
        }];
        readonly name: "EquityDeployed";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "bool";
                    readonly name: "arePartitionsProtected";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "isMultiPartition";
                    readonly type: "bool";
                }, {
                    readonly internalType: "contract IBusinessLogicResolver_";
                    readonly name: "resolver";
                    readonly type: "address";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "bytes32";
                        readonly name: "key";
                        readonly type: "bytes32";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "version";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct IFactory_.ResolverProxyConfiguration";
                    readonly name: "resolverProxyConfiguration";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "bytes32";
                        readonly name: "role";
                        readonly type: "bytes32";
                    }, {
                        readonly internalType: "address[]";
                        readonly name: "members";
                        readonly type: "address[]";
                    }];
                    readonly internalType: "struct IResolverProxy_.Rbac[]";
                    readonly name: "rbacs";
                    readonly type: "tuple[]";
                }, {
                    readonly internalType: "bool";
                    readonly name: "isControllable";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "isWhiteList";
                    readonly type: "bool";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "maxSupply";
                    readonly type: "uint256";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "string";
                        readonly name: "name";
                        readonly type: "string";
                    }, {
                        readonly internalType: "string";
                        readonly name: "symbol";
                        readonly type: "string";
                    }, {
                        readonly internalType: "string";
                        readonly name: "isin";
                        readonly type: "string";
                    }, {
                        readonly internalType: "uint8";
                        readonly name: "decimals";
                        readonly type: "uint8";
                    }];
                    readonly internalType: "struct IFactory_.ERC20MetadataInfo";
                    readonly name: "erc20MetadataInfo";
                    readonly type: "tuple";
                }, {
                    readonly internalType: "bool";
                    readonly name: "clearingActive";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "internalKycActivated";
                    readonly type: "bool";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "externalPauses";
                    readonly type: "address[]";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "externalControlLists";
                    readonly type: "address[]";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "externalKycLists";
                    readonly type: "address[]";
                }, {
                    readonly internalType: "address";
                    readonly name: "compliance";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "identityRegistry";
                    readonly type: "address";
                }];
                readonly internalType: "struct IFactory_.SecurityData";
                readonly name: "security";
                readonly type: "tuple";
            }, {
                readonly components: readonly [{
                    readonly internalType: "bytes3";
                    readonly name: "currency";
                    readonly type: "bytes3";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "nominalValue";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "startingDate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "maturityDate";
                    readonly type: "uint256";
                }];
                readonly internalType: "struct IBond_.BondDetailsData";
                readonly name: "bondDetails";
                readonly type: "tuple";
            }, {
                readonly components: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "couponFrequency";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "couponRate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "firstCouponDate";
                    readonly type: "uint256";
                }];
                readonly internalType: "struct IBond_.CouponDetailsData";
                readonly name: "couponDetails";
                readonly type: "tuple";
            }];
            readonly internalType: "struct IFactory_.BondData";
            readonly name: "_bondData";
            readonly type: "tuple";
        }, {
            readonly components: readonly [{
                readonly internalType: "enum RegulationType";
                readonly name: "regulationType";
                readonly type: "uint8";
            }, {
                readonly internalType: "enum RegulationSubType";
                readonly name: "regulationSubType";
                readonly type: "uint8";
            }, {
                readonly components: readonly [{
                    readonly internalType: "bool";
                    readonly name: "countriesControlListType";
                    readonly type: "bool";
                }, {
                    readonly internalType: "string";
                    readonly name: "listOfCountries";
                    readonly type: "string";
                }, {
                    readonly internalType: "string";
                    readonly name: "info";
                    readonly type: "string";
                }];
                readonly internalType: "struct AdditionalSecurityData";
                readonly name: "additionalSecurityData";
                readonly type: "tuple";
            }];
            readonly internalType: "struct FactoryRegulationData";
            readonly name: "_factoryRegulationData";
            readonly type: "tuple";
        }];
        readonly name: "deployBond";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "bondAddress_";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "bool";
                    readonly name: "arePartitionsProtected";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "isMultiPartition";
                    readonly type: "bool";
                }, {
                    readonly internalType: "contract IBusinessLogicResolver_";
                    readonly name: "resolver";
                    readonly type: "address";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "bytes32";
                        readonly name: "key";
                        readonly type: "bytes32";
                    }, {
                        readonly internalType: "uint256";
                        readonly name: "version";
                        readonly type: "uint256";
                    }];
                    readonly internalType: "struct IFactory_.ResolverProxyConfiguration";
                    readonly name: "resolverProxyConfiguration";
                    readonly type: "tuple";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "bytes32";
                        readonly name: "role";
                        readonly type: "bytes32";
                    }, {
                        readonly internalType: "address[]";
                        readonly name: "members";
                        readonly type: "address[]";
                    }];
                    readonly internalType: "struct IResolverProxy_.Rbac[]";
                    readonly name: "rbacs";
                    readonly type: "tuple[]";
                }, {
                    readonly internalType: "bool";
                    readonly name: "isControllable";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "isWhiteList";
                    readonly type: "bool";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "maxSupply";
                    readonly type: "uint256";
                }, {
                    readonly components: readonly [{
                        readonly internalType: "string";
                        readonly name: "name";
                        readonly type: "string";
                    }, {
                        readonly internalType: "string";
                        readonly name: "symbol";
                        readonly type: "string";
                    }, {
                        readonly internalType: "string";
                        readonly name: "isin";
                        readonly type: "string";
                    }, {
                        readonly internalType: "uint8";
                        readonly name: "decimals";
                        readonly type: "uint8";
                    }];
                    readonly internalType: "struct IFactory_.ERC20MetadataInfo";
                    readonly name: "erc20MetadataInfo";
                    readonly type: "tuple";
                }, {
                    readonly internalType: "bool";
                    readonly name: "clearingActive";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "internalKycActivated";
                    readonly type: "bool";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "externalPauses";
                    readonly type: "address[]";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "externalControlLists";
                    readonly type: "address[]";
                }, {
                    readonly internalType: "address[]";
                    readonly name: "externalKycLists";
                    readonly type: "address[]";
                }, {
                    readonly internalType: "address";
                    readonly name: "compliance";
                    readonly type: "address";
                }, {
                    readonly internalType: "address";
                    readonly name: "identityRegistry";
                    readonly type: "address";
                }];
                readonly internalType: "struct IFactory_.SecurityData";
                readonly name: "security";
                readonly type: "tuple";
            }, {
                readonly components: readonly [{
                    readonly internalType: "bool";
                    readonly name: "votingRight";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "informationRight";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "liquidationRight";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "subscriptionRight";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "conversionRight";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "redemptionRight";
                    readonly type: "bool";
                }, {
                    readonly internalType: "bool";
                    readonly name: "putRight";
                    readonly type: "bool";
                }, {
                    readonly internalType: "enum IEquity_.DividendType";
                    readonly name: "dividendRight";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "bytes3";
                    readonly name: "currency";
                    readonly type: "bytes3";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "nominalValue";
                    readonly type: "uint256";
                }];
                readonly internalType: "struct IEquity_.EquityDetailsData";
                readonly name: "equityDetails";
                readonly type: "tuple";
            }];
            readonly internalType: "struct IFactory_.EquityData";
            readonly name: "_equityData";
            readonly type: "tuple";
        }, {
            readonly components: readonly [{
                readonly internalType: "enum RegulationType";
                readonly name: "regulationType";
                readonly type: "uint8";
            }, {
                readonly internalType: "enum RegulationSubType";
                readonly name: "regulationSubType";
                readonly type: "uint8";
            }, {
                readonly components: readonly [{
                    readonly internalType: "bool";
                    readonly name: "countriesControlListType";
                    readonly type: "bool";
                }, {
                    readonly internalType: "string";
                    readonly name: "listOfCountries";
                    readonly type: "string";
                }, {
                    readonly internalType: "string";
                    readonly name: "info";
                    readonly type: "string";
                }];
                readonly internalType: "struct AdditionalSecurityData";
                readonly name: "additionalSecurityData";
                readonly type: "tuple";
            }];
            readonly internalType: "struct FactoryRegulationData";
            readonly name: "_factoryRegulationData";
            readonly type: "tuple";
        }];
        readonly name: "deployEquity";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "equityAddress_";
            readonly type: "address";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "enum RegulationType";
            readonly name: "_regulationType";
            readonly type: "uint8";
        }, {
            readonly internalType: "enum RegulationSubType";
            readonly name: "_regulationSubType";
            readonly type: "uint8";
        }];
        readonly name: "getAppliedRegulationData";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "enum RegulationType";
                readonly name: "regulationType";
                readonly type: "uint8";
            }, {
                readonly internalType: "enum RegulationSubType";
                readonly name: "regulationSubType";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint256";
                readonly name: "dealSize";
                readonly type: "uint256";
            }, {
                readonly internalType: "enum AccreditedInvestors";
                readonly name: "accreditedInvestors";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint256";
                readonly name: "maxNonAccreditedInvestors";
                readonly type: "uint256";
            }, {
                readonly internalType: "enum ManualInvestorVerification";
                readonly name: "manualInvestorVerification";
                readonly type: "uint8";
            }, {
                readonly internalType: "enum InternationalInvestors";
                readonly name: "internationalInvestors";
                readonly type: "uint8";
            }, {
                readonly internalType: "enum ResaleHoldPeriod";
                readonly name: "resaleHoldPeriod";
                readonly type: "uint8";
            }];
            readonly internalType: "struct RegulationData";
            readonly name: "regulationData_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }];
    static createInterface(): IFactory_Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): IFactory_;
}
