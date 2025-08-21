import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IEquity, IEquityInterface } from "../../../../../contracts/layer_2/interfaces/equity/IEquity";
export declare class IEquity__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_dividendID";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getDividendHolders";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "holders_";
            readonly type: "address[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_dividendID";
            readonly type: "uint256";
        }];
        readonly name: "getDividends";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "recordDate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "executionDate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "amount";
                    readonly type: "uint256";
                }];
                readonly internalType: "struct IEquity.Dividend";
                readonly name: "dividend";
                readonly type: "tuple";
            }, {
                readonly internalType: "uint256";
                readonly name: "snapshotId";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IEquity.RegisteredDividend";
            readonly name: "registeredDividend_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getDividendsCount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "dividendCount_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_dividendID";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_account";
            readonly type: "address";
        }];
        readonly name: "getDividendsFor";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "tokenBalance";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "recordDate";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "executionDate";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint8";
                readonly name: "decimals";
                readonly type: "uint8";
            }, {
                readonly internalType: "bool";
                readonly name: "recordDateReached";
                readonly type: "bool";
            }];
            readonly internalType: "struct IEquity.DividendFor";
            readonly name: "dividendFor_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getEquityDetails";
        readonly outputs: readonly [{
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
                readonly internalType: "enum IEquity.DividendType";
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
            readonly internalType: "struct IEquity.EquityDetailsData";
            readonly name: "equityDetailsData_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_balanceAdjustmentID";
            readonly type: "uint256";
        }];
        readonly name: "getScheduledBalanceAdjustment";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "executionDate";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "factor";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint8";
                readonly name: "decimals";
                readonly type: "uint8";
            }];
            readonly internalType: "struct IEquity.ScheduledBalanceAdjustment";
            readonly name: "balanceAdjustment_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getScheduledBalanceAdjustmentCount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "balanceAdjustmentCount_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_dividendID";
            readonly type: "uint256";
        }];
        readonly name: "getTotalDividendHolders";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_voteID";
            readonly type: "uint256";
        }];
        readonly name: "getTotalVotingHolders";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_voteID";
            readonly type: "uint256";
        }];
        readonly name: "getVoting";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "uint256";
                    readonly name: "recordDate";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "bytes";
                    readonly name: "data";
                    readonly type: "bytes";
                }];
                readonly internalType: "struct IEquity.Voting";
                readonly name: "voting";
                readonly type: "tuple";
            }, {
                readonly internalType: "uint256";
                readonly name: "snapshotId";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IEquity.RegisteredVoting";
            readonly name: "registeredVoting_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getVotingCount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "votingCount_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_voteID";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_account";
            readonly type: "address";
        }];
        readonly name: "getVotingFor";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "tokenBalance";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "recordDate";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }, {
                readonly internalType: "uint8";
                readonly name: "decimals";
                readonly type: "uint8";
            }, {
                readonly internalType: "bool";
                readonly name: "recordDateReached";
                readonly type: "bool";
            }];
            readonly internalType: "struct IEquity.VotingFor";
            readonly name: "votingFor_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_voteID";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getVotingHolders";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "holders_";
            readonly type: "address[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "recordDate";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "executionDate";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IEquity.Dividend";
            readonly name: "_newDividend";
            readonly type: "tuple";
        }];
        readonly name: "setDividends";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }, {
            readonly internalType: "uint256";
            readonly name: "dividendID_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "executionDate";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "factor";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint8";
                readonly name: "decimals";
                readonly type: "uint8";
            }];
            readonly internalType: "struct IEquity.ScheduledBalanceAdjustment";
            readonly name: "_newBalanceAdjustment";
            readonly type: "tuple";
        }];
        readonly name: "setScheduledBalanceAdjustment";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }, {
            readonly internalType: "uint256";
            readonly name: "balanceAdjustmentID_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "recordDate";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }];
            readonly internalType: "struct IEquity.Voting";
            readonly name: "_newVoting";
            readonly type: "tuple";
        }];
        readonly name: "setVoting";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }, {
            readonly internalType: "uint256";
            readonly name: "voteID_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): IEquityInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IEquity;
}
