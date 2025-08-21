import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ScheduledTasks, ScheduledTasksInterface } from "../../../../../contracts/layer_2/scheduledTasks/scheduledTasks/ScheduledTasks";
type ScheduledTasksConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class ScheduledTasks__factory extends ContractFactory {
    constructor(...args: ScheduledTasksConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string;
    }): Promise<ScheduledTasks>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): ScheduledTasks;
    connect(signer: Signer): ScheduledTasks__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50610e60806100206000396000f3fe608060405234801561001057600080fd5b50600436106100785760003560e01c80631507f2a41461007d5780631ef2fdc81461009857806328a5d769146100be5780636dfe790e146100d1578063b378cf37146100d9578063c1f0d742146100ee578063dcff09ba146100f6578063df1eb07114610116575b600080fd5b61008561012b565b6040519081526020015b60405180910390f35b7fa4934195ab83f1497ce5fc99b68d0f41694716bcfba5f232aa6c8e0d4d504f08610085565b6100856100cc366004610ab1565b610144565b61008561015d565b6100e1610167565b60405161008f9190610aca565b6100e16101cd565b610109610104366004610b18565b6102ff565b60405161008f9190610b8a565b610129610124366004610c14565b610312565b005b6000610135610339565b61013f6000610361565b905090565b600061014e610339565b61015782610361565b92915050565b600061013f61037d565b604080516001808252818301909252606091602080830190803683370190505090506000630a77bca160e31b828261019e81610cee565b9350815181106101b0576101b0610d07565b6001600160e01b0319909216602092830291909101909101525090565b60408051600580825260c08201909252606091600091906020820160a080368337019050509150630541fca960e21b828261020781610cee565b93508151811061021957610219610d07565b6001600160e01b0319909216602092830291909101909101526328a5d76960e01b828261024581610cee565b93508151811061025757610257610d07565b6001600160e01b0319909216602092830291909101909101526336ff3c8760e11b828261028381610cee565b93508151811061029557610295610d07565b6001600160e01b031990921660209283029190910190910152636e7f84dd60e11b82826102c181610cee565b9350815181106102d3576102d3610d07565b6001600160e01b03199092166020928302919091019091015263df1eb07160e01b828261019e81610cee565b606061030b8383610391565b9392505050565b61031a6103a5565b6002015460ff1661032a816103c9565b610333826103ea565b50505050565b61034161044b565b1561035f5760405163649815a560e01b815260040160405180910390fd5b565b600061015761036e6103a5565b63df1eb07160e01b8442610480565b600061013f61038a6103a5565b6001015490565b606061030b61039e6103a5565b8484610665565b7f2352c39c61abb4e922588a7d46fb5c925b9a205577be135537479031648c86fe90565b806103e7576040516367c7647360e01b815260040160405180910390fd5b50565b80516000036103f65750565b7f322c4b500b27950e00c27e3a40ca8f9ffacbc81a3b4e3c9516717391fd54234c60001b8180602001905181019061042e9190610d1d565b036104415761043d6001610747565b5050565b61043d600161077c565b60007f5a5b295532a8b6e97bc9d45d68fc49b85a099545bac8f91f77706d392a1cea715460ff168061013f575061013f6107b1565b60008061048e866001015490565b9050806000036104a257600091505061065d565b836000828211806104b1575081155b156104ba578291505b60015b8281116106575760006104d08286610d36565b905060006104de8b83610885565b9050878160000151101561063b576104f58b610954565b60028b01805460ff191660011790556020810151604051600091829130918e916105269188918d9190602401610d49565b60408051601f198184030181529181526020820180516001600160e01b03166001600160e01b03199094169390931790925290516105649190610d71565b600060405180830381855af49150503d806000811461059f576040519150601f19603f3d011682016040523d82523d6000602084013e6105a4565b606091505b509150915081610628578051156105be5780518082602001fd5b60405162461bcd60e51b815260206004820152603560248201527f6f6e5363686564756c65645461736b547269676765726564206d6574686f64206044820152743330b4b632b2103bb4ba3437baba103932b0b9b7b760591b606482015260840160405180910390fd5b505060028b01805460ff19169055610642565b5050610657565b5050808061064f90610cee565b9150506104bd565b50925050505b949350505050565b606060008061067485856109bd565b9150915061068d8282610688896001015490565b6109df565b67ffffffffffffffff8111156106a5576106a5610bfe565b6040519080825280602002602001820160405280156106eb57816020015b6040805180820190915260008152606060208201528152602001906001900390816106c35790505b50925060005b835181101561073d5761070d876107088386610d8d565b610885565b84828151811061071f5761071f610d07565b6020026020010181905250808061073590610cee565b9150506106f1565b5050509392505050565b60006101577fe5334ddaa6268d55c7efe63975567949a7fb208c02c0bd15007703db04a9ba4f638e51d75560e01b8442610480565b60006101577faf4aaa3de473ec9b58645d40f5a2fe4e176157e247b2d875db61f1a70935ac686369806f3d60e11b8442610480565b60007f80cd138137fb7aaf8068b75b39b6681af39401f81721b6420d44eb588baaeeb9816107de82610a15565b905060005b8181101561087b576107f86001840182610a23565b6001600160a01b031663b187bd266040518163ffffffff1660e01b8152600401602060405180830381865afa158015610835573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906108599190610da0565b15610868576001935050505090565b60010161087481610cee565b90506107e3565b5060009250505090565b6040805180820190915260008152606060208201526000828152602084815260409182902082518084019093528054835260018101805491928401916108ca90610dc2565b80601f01602080910402602001604051908101604052809291908181526020018280546108f690610dc2565b80156109435780601f1061091857610100808354040283529160200191610943565b820191906000526020600020905b81548152906001019060200180831161092657829003601f168201915b505050505081525050905092915050565b6000610961826001015490565b90508060000361096f575050565b81600061097d600184610d36565b815260208101919091526040016000908120818155906109a06001830182610a63565b50506001820180549060006109b483610dfc565b91905055505050565b6000806109ca8385610e13565b91506109d68383610d8d565b90509250929050565b60008284106109f05750600061030b565b8184106109ff5750600061030b565b81831115610a0b578192505b61065d8484610d36565b600061015782600101610a2f565b600061030b8383610a39565b6000610157825490565b6000826000018281548110610a5057610a50610d07565b9060005260206000200154905092915050565b508054610a6f90610dc2565b6000825580601f10610a7f575050565b601f0160209004906000526020600020908101906103e791905b80821115610aad5760008155600101610a99565b5090565b600060208284031215610ac357600080fd5b5035919050565b6020808252825182820181905260009190848201906040850190845b81811015610b0c5783516001600160e01b03191683529284019291840191600101610ae6565b50909695505050505050565b60008060408385031215610b2b57600080fd5b50508035926020909101359150565b60005b83811015610b55578181015183820152602001610b3d565b50506000910152565b60008151808452610b76816020860160208601610b3a565b601f01601f19169290920160200192915050565b60006020808301818452808551808352604092508286019150828160051b87010184880160005b83811015610bf057888303603f19018552815180518452870151878401879052610bdd87850182610b5e565b9588019593505090860190600101610bb1565b509098975050505050505050565b634e487b7160e01b600052604160045260246000fd5b600080600060608486031215610c2957600080fd5b8335925060208401359150604084013567ffffffffffffffff80821115610c4f57600080fd5b818601915086601f830112610c6357600080fd5b813581811115610c7557610c75610bfe565b604051601f8201601f19908116603f01168101908382118183101715610c9d57610c9d610bfe565b81604052828152896020848701011115610cb657600080fd5b8260208601602083013760006020848301015280955050505050509250925092565b634e487b7160e01b600052601160045260246000fd5b600060018201610d0057610d00610cd8565b5060010190565b634e487b7160e01b600052603260045260246000fd5b600060208284031215610d2f57600080fd5b5051919050565b8181038181111561015757610157610cd8565b838152826020820152606060408201526000610d686060830184610b5e565b95945050505050565b60008251610d83818460208701610b3a565b9190910192915050565b8082018082111561015757610157610cd8565b600060208284031215610db257600080fd5b8151801515811461030b57600080fd5b600181811c90821680610dd657607f821691505b602082108103610df657634e487b7160e01b600052602260045260246000fd5b50919050565b600081610e0b57610e0b610cd8565b506000190190565b808202811582820484141761015757610157610cd856fea2646970667358221220731f98dbe114074bca1f56df7dbe5ecf6ffdf2338931bd92c7e81d1305b6186a64736f6c63430008120033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "role";
            readonly type: "bytes32";
        }];
        readonly name: "AccountHasNoRole";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32[]";
            readonly name: "roles";
            readonly type: "bytes32[]";
        }];
        readonly name: "AccountHasNoRoles";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "AccountIsBlocked";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "AllBusinessLogicKeysMustBeenInformed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "AlreadyInitialized";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "businessLogicKey";
            readonly type: "bytes32";
        }];
        readonly name: "BusinessLogicKeyDuplicated";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "businessLogicKey";
            readonly type: "bytes32";
        }];
        readonly name: "BusinessLogicNotActive";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "version";
            readonly type: "uint256";
        }];
        readonly name: "BusinessLogicVersionDoesNotExist";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ExpirationNotReached";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "FactorIsZero";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "spender";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "from";
            readonly type: "address";
        }];
        readonly name: "InsufficientAllowance";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "balance";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "value";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }];
        readonly name: "InsufficientBalance";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "user";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "requestedUnfreeze";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "availableFrozen";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }];
        readonly name: "InsufficientFrozenBalance";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }];
        readonly name: "InvalidPartition";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "IssuanceIsClosed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "LockExpirationNotReached";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "maxSupply";
            readonly type: "uint256";
        }];
        readonly name: "MaxSupplyReached";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxSupply";
            readonly type: "uint256";
        }];
        readonly name: "MaxSupplyReachedForPartition";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "newMaxSupplyByPartition";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxSupply";
            readonly type: "uint256";
        }];
        readonly name: "NewMaxSupplyByPartitionTooHigh";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "NewMaxSupplyCannotBeZero";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "maxSupply";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "totalSupply";
            readonly type: "uint256";
        }];
        readonly name: "NewMaxSupplyForPartitionTooLow";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "maxSupply";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "totalSupply";
            readonly type: "uint256";
        }];
        readonly name: "NewMaxSupplyTooLow";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "NotAllowedInMultiPartitionMode";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "NotAutocalling";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "OnlyDelegateAllowed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }];
        readonly name: "PartitionNotAllowedInSinglePartitionMode";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "role";
            readonly type: "bytes32";
        }];
        readonly name: "PartitionsAreProtectedAndNoRole";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "PartitionsAreUnProtected";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "rolesLength";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "activesLength";
            readonly type: "uint256";
        }];
        readonly name: "RolesAndActivesLengthMismatch";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "snapshotId";
            readonly type: "uint256";
        }];
        readonly name: "SnapshotIdDoesNotExists";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "SnapshotIdNull";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "SpenderWithZeroAddress";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "TokenIsNotControllable";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "TokenIsPaused";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "TokenIsUnpaused";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }];
        readonly name: "Unauthorized";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "WrongExpirationTimestamp";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "WrongLockId";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "WrongSignature";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "timeStamp";
            readonly type: "uint256";
        }];
        readonly name: "WrongTimestamp";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ZeroAddressNotAllowed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ZeroKeyNotValidForBusinessLogic";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ZeroOwnerAddress";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ZeroPartition";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ZeroValue";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "factor";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint8";
            readonly name: "decimals";
            readonly type: "uint8";
        }];
        readonly name: "AdjustmentBalanceSet";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "owner";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "spender";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "value";
            readonly type: "uint256";
        }];
        readonly name: "Approval";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }];
        readonly name: "AuthorizedOperator";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }];
        readonly name: "AuthorizedOperatorByPartition";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "clearingId";
            readonly type: "uint256";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "expirationTimestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "address";
                readonly name: "escrow";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "to";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }];
            readonly indexed: false;
            readonly internalType: "struct Hold";
            readonly name: "hold";
            readonly type: "tuple";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "expirationDate";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "operatorData";
            readonly type: "bytes";
        }];
        readonly name: "ClearedHoldByPartition";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "clearingId";
            readonly type: "uint256";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "expirationTimestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "address";
                readonly name: "escrow";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "to";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }];
            readonly indexed: false;
            readonly internalType: "struct Hold";
            readonly name: "hold";
            readonly type: "tuple";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "expirationDate";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "operatorData";
            readonly type: "bytes";
        }];
        readonly name: "ClearedHoldFromByPartition";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "clearingId";
            readonly type: "uint256";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "expirationTimestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "address";
                readonly name: "escrow";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "to";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }];
            readonly indexed: false;
            readonly internalType: "struct Hold";
            readonly name: "hold";
            readonly type: "tuple";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "expirationDate";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "operatorData";
            readonly type: "bytes";
        }];
        readonly name: "ClearedOperatorHoldByPartition";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "clearingId";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "expirationDate";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "operatorData";
            readonly type: "bytes";
        }];
        readonly name: "ClearedOperatorRedeemByPartition";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "clearingId";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "expirationDate";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "operatorData";
            readonly type: "bytes";
        }];
        readonly name: "ClearedOperatorTransferByPartition";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "clearingId";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "expirationDate";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "operatorData";
            readonly type: "bytes";
        }];
        readonly name: "ClearedRedeemByPartition";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "clearingId";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "expirationDate";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "operatorData";
            readonly type: "bytes";
        }];
        readonly name: "ClearedRedeemFromByPartition";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "clearingId";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "expirationDate";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "operatorData";
            readonly type: "bytes";
        }];
        readonly name: "ClearedTransferByPartition";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "clearingId";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "expirationDate";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "operatorData";
            readonly type: "bytes";
        }];
        readonly name: "ClearedTransferFromByPartition";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "compliance";
            readonly type: "address";
        }];
        readonly name: "ComplianceAdded";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_controller";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_tokenHolder";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "_value";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "_operatorData";
            readonly type: "bytes";
        }];
        readonly name: "ControllerRedemption";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_controller";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_from";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_to";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "_value";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "_operatorData";
            readonly type: "bytes";
        }];
        readonly name: "ControllerTransfer";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }];
        readonly name: "FinalizedControllerFeature";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_to";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "_value";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }];
        readonly name: "Issued";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "value";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly name: "IssuedByPartition";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "newMaxSupply";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "previousMaxSupply";
            readonly type: "uint256";
        }];
        readonly name: "MaxSupplyByPartitionSet";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "newMaxSupply";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "previousMaxSupply";
            readonly type: "uint256";
        }];
        readonly name: "MaxSupplySet";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }];
        readonly name: "PartitionsProtected";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }];
        readonly name: "PartitionsUnProtected";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "clearingId";
            readonly type: "uint256";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "amount";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "expirationTimestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "address";
                readonly name: "escrow";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "to";
                readonly type: "address";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }];
            readonly indexed: false;
            readonly internalType: "struct Hold";
            readonly name: "hold";
            readonly type: "tuple";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "expirationDate";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "operatorData";
            readonly type: "bytes";
        }];
        readonly name: "ProtectedClearedHoldByPartition";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "clearingId";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "expirationDate";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "operatorData";
            readonly type: "bytes";
        }];
        readonly name: "ProtectedClearedRedeemByPartition";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "clearingId";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "amount";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "expirationDate";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "operatorData";
            readonly type: "bytes";
        }];
        readonly name: "ProtectedClearedTransferByPartition";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "from";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "value";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "deadline";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "nounce";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly name: "ProtectedRedeemFrom";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "from";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "value";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "deadline";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "nounce";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "signature";
            readonly type: "bytes";
        }];
        readonly name: "ProtectedTransferFrom";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_from";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "_value";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }];
        readonly name: "Redeemed";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "from";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "value";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "operatorData";
            readonly type: "bytes";
        }];
        readonly name: "RedeemedByPartition";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }];
        readonly name: "RevokedOperator";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "partition";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "tokenHolder";
            readonly type: "address";
        }];
        readonly name: "RevokedOperatorByPartition";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "role";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "previousAdminRole";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "newAdminRole";
            readonly type: "bytes32";
        }];
        readonly name: "RoleAdminChanged";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "uint256";
            readonly name: "snapshotID";
            readonly type: "uint256";
        }];
        readonly name: "SnapshotTaken";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "snapshotId";
            readonly type: "uint256";
        }];
        readonly name: "SnapshotTriggered";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }];
        readonly name: "TokenPaused";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }];
        readonly name: "TokenUnpaused";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "from";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "to";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "value";
            readonly type: "uint256";
        }];
        readonly name: "Transfer";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "_fromPartition";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_from";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_to";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "_value";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "_operatorData";
            readonly type: "bytes";
        }];
        readonly name: "TransferByPartition";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getScheduledTasks";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "scheduledTimestamp";
                readonly type: "uint256";
            }, {
                readonly internalType: "bytes";
                readonly name: "data";
                readonly type: "bytes";
            }];
            readonly internalType: "struct ScheduledTasksLib.ScheduledTask[]";
            readonly name: "scheduledTask_";
            readonly type: "tuple[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getStaticFunctionSelectors";
        readonly outputs: readonly [{
            readonly internalType: "bytes4[]";
            readonly name: "staticFunctionSelectors_";
            readonly type: "bytes4[]";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getStaticInterfaceIds";
        readonly outputs: readonly [{
            readonly internalType: "bytes4[]";
            readonly name: "staticInterfaceIds_";
            readonly type: "bytes4[]";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getStaticResolverKey";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "staticResolverKey_";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "pure";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }];
        readonly name: "onScheduledTaskTriggered";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "scheduledTaskCount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "triggerPendingScheduledTasks";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_max";
            readonly type: "uint256";
        }];
        readonly name: "triggerScheduledTasks";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): ScheduledTasksInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ScheduledTasks;
}
export {};
