import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { CorporateActionsTimeTravel, CorporateActionsTimeTravelInterface } from "../../../../../contracts/test/testTimeTravel/facetsTimeTravel/CorporateActionsTimeTravel";
type CorporateActionsTimeTravelConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class CorporateActionsTimeTravel__factory extends ContractFactory {
    constructor(...args: CorporateActionsTimeTravelConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string;
    }): Promise<CorporateActionsTimeTravel>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): CorporateActionsTimeTravel;
    connect(signer: Signer): CorporateActionsTimeTravel__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b5061001a4661001f565b610043565b8061053914610040576040516217e1ef60ea1b815260040160405180910390fd5b50565b61152e806100526000396000f3fe608060405234801561001057600080fd5b50600436106100835760003560e01c80631b56ea1e146100885780631ef2fdc8146100b1578063539b4e0b146100e15780638859794c146100f4578063911181da146100fc578063b378cf371461011d578063c1f0d74214610132578063d9e4d92c1461013a578063e73bbddb1461016a575b600080fd5b61009b610096366004610e42565b61017d565b6040516100a89190610e64565b60405180910390f35b7f3cc74200ccfb5d585a6d170f8824979dbf1b592e0a41eef41cf6d86cf48820775b6040519081526020016100a8565b6100d36100ef366004610ea8565b610190565b6100d36101a1565b61010f61010a366004610ea8565b6101b0565b6040516100a8929190610f11565b6101256101c7565b6040516100a89190610f2a565b61012561022d565b61014d610148366004611023565b61039d565b6040805193151584526020840192909252908201526060016100a8565b61009b6101783660046110ac565b61045e565b60606101898383610473565b9392505050565b600061019b82610489565b92915050565b60006101ab6104ad565b905090565b600060606101bd836104bf565b9094909350915050565b604080516001808252818301909252606091602080830190803683370190505090506000631bd68e1d60e21b82826101fe816110ee565b93508151811061021057610210611107565b6001600160e01b0319909216602092830291909101909101525090565b60408051600680825260e08201909252606091600091906020820160c080368337019050509150633679364b60e21b8282610267816110ee565b93508151811061027957610279611107565b6001600160e01b031990921660209283029190910190910152634888c0ed60e11b82826102a5816110ee565b9350815181106102b7576102b7611107565b6001600160e01b0319909216602092830291909101909101526322165e5360e21b82826102e3816110ee565b9350815181106102f5576102f5611107565b6001600160e01b031990921660209283029190910190910152630dab750f60e11b8282610321816110ee565b93508151811061033357610333611107565b6001600160e01b03199092166020928302919091019091015263539b4e0b60e01b828261035f816110ee565b93508151811061037157610371611107565b6001600160e01b03199092166020928302919091019091015263e73bbddb60e01b82826101fe816110ee565b60008060006103aa61057b565b7f8a139eeb747b9809192ae3de1b88acfd2568c15241a5c4f85db0443a536d77d66103d581336105a3565b6103df86866105e0565b9195509350915083610411578585604051633266e9e360e01b8152600401610408929190610f11565b60405180910390fd5b8286336001600160a01b03167f5874a7cfb402f641e9d5e7fe4da2993095f1d4d397e7291daa27fd6c29dd3f1a858960405161044e929190610f11565b60405180910390a4509250925092565b606061046b848484610674565b949350505050565b6060610189838361048261069c565b91906106c0565b600061019b61049661069c565b600084815260039190910160205260409020610788565b60006101ab6104ba61069c565b610788565b6000606060006104cd61069c565b600085815260028201602052604090208054600190910180549195509192506104f59061111d565b80601f01602080910402602001604051908101604052809291908181526020018280546105219061111d565b801561056e5780601f106105435761010080835404028352916020019161056e565b820191906000526020600020905b81548152906001019060200180831161055157829003601f168201915b5050505050915050915091565b610583610792565b156105a15760405163649815a560e01b815260040160405180910390fd5b565b6105ad82826107c7565b6105dc5760405163a1180aad60e01b81526001600160a01b038216600482015260248101839052604401610408565b5050565b6000806000806105ee61069c565b90506105f981610788565b610604906001611157565b925061061081846107f4565b801561063157506000868152600382016020526040902061063190846107f4565b6000848152600283016020526040902087815590945060010161065486826111cd565b5061065e86610489565b915061066c86858588610800565b509250925092565b606061046b838361068361069c565b60008881526003919091016020526040902091906106c0565b7f9db84024bbea48a7580380e27785cf3e0d08fada233c84760c8a5aff47f86e1290565b606060006106cd85610788565b90506000806106dc86866108d3565b915091506106eb8282856108f5565b6001600160401b0381111561070257610702610f6c565b60405190808252806020026020018201604052801561072b578160200160208202803683370190505b50935060005b845181101561077d5761074e6107478285611157565b899061092b565b85828151811061076057610760611107565b602090810291909101015280610775816110ee565b915050610731565b505050509392505050565b600061019b825490565b60007f5a5b295532a8b6e97bc9d45d68fc49b85a099545bac8f91f77706d392a1cea715460ff16806101ab57506101ab610937565b60006101897f4765bbd856d800638d39a79262ebc6fdfb5833d0e59f32c5d482fe4c4a3554c18484610a0b565b60006101898383610a42565b7fe3d62f60780d4f37e6d588e65d5320205cdf23d7ca4a5fc671a42723cb3eb4f2840161083757610832838383610a91565b6108cd565b7fdaf241da54d0f94c646c9a8d5981e240316e04ea90add7f6017e80764097bfb9840161086957610832838383610b35565b7fb9a84ef0c353a82c629d72ad18b8c72f023523e4d07d6a7347caf7e0e44d99e0840161089b57610832838383610b68565b7feda955e4c9b7c359ae0a27345048fcc234ab78d5182dbbbd4711b455c0b655d184016108cd57610832838383610b86565b50505050565b6000806108e08385611286565b91506108ec8383611157565b90509250929050565b600082841061090657506000610189565b81841061091557506000610189565b81831115610921578192505b61046b848461129d565b60006101898383610c19565b60007f80cd138137fb7aaf8068b75b39b6681af39401f81721b6420d44eb588baaeeb98161096482610c43565b905060005b81811015610a015761097e600184018261092b565b6001600160a01b031663b187bd266040518163ffffffff1660e01b8152600401602060405180830381865afa1580156109bb573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906109df91906112b0565b156109ee576001935050505090565b6001016109fa816110ee565b9050610969565b5060009250505090565b6001600160a01b0381166000908152600184016020526040812061046b908460008181526001830160205260408120541515610189565b6000818152600183016020526040812054610a895750815460018181018455600084815260208082209093018490558454848252828601909352604090209190915561019b565b50600061019b565b82610aaf5760405163204df96960e11b815260040160405180910390fd5b600081806020019051810190610ac5919061130c565b8051604080517f322c4b500b27950e00c27e3a40ca8f9ffacbc81a3b4e3c9516717391fd54234c6020820152929350610b0e92015b604051602081830303815290604052610c51565b805160408051602081018690526108cd929101604051602081830303815290604052610c7d565b82610b5257604051620660b360e91b815260040160405180910390fd5b600081806020019051810190610ac59190611328565b82610aaf57604051633a11c78b60e01b815260040160405180910390fd5b82610ba3576040516263473360e51b815260040160405180910390fd5b600081806020019051810190610bb991906113dc565b8051604080517f9ce9cffaccaf68fc544ce4df9e5e2774249df2f0b3c9cf940a53a6827465db9d6020820152929350610bf29201610afa565b805160408051602081018690526108cd929101604051602081830303815290604052610ca6565b6000826000018281548110610c3057610c30611107565b9060005260206000200154905092915050565b600061019b82600101610788565b6105dc7f2352c39c61abb4e922588a7d46fb5c925b9a205577be135537479031648c86fe5b8383610ccf565b6105dc7fe5334ddaa6268d55c7efe63975567949a7fb208c02c0bd15007703db04a9ba4f610c76565b6105dc7faf4aaa3de473ec9b58645d40f5a2fe4e176157e247b2d875db61f1a70935ac68610c76565b60408051808201909152828152602081018290526000610cf0856001015490565b90508060008115610d705760015b838111610d6e576000610d11828661129d565b600081815260208b90526040902054909150881115610d3957610d348982610d8a565b610d5b565b610d44816001611157565b9350610d51898588610dfe565b6001925050610d6e565b5080610d66816110ee565b915050610cfe565b505b80610d8157610d8187600086610dfe565b50505050505050565b600081815260208390526040812054908390610da7846001611157565b815260208082019290925260409081016000908120939093558383529084905281206001908101918491610ddc908590611157565b81526020019081526020016000206001019081610df99190611424565b505050565b8051600083815260208581526040909120918255820151600190910190610e2590826111cd565b50600183018054906000610e38836110ee565b9190505550505050565b60008060408385031215610e5557600080fd5b50508035926020909101359150565b6020808252825182820181905260009190848201906040850190845b81811015610e9c57835183529284019291840191600101610e80565b50909695505050505050565b600060208284031215610eba57600080fd5b5035919050565b60005b83811015610edc578181015183820152602001610ec4565b50506000910152565b60008151808452610efd816020860160208601610ec1565b601f01601f19169290920160200192915050565b82815260406020820152600061046b6040830184610ee5565b6020808252825182820181905260009190848201906040850190845b81811015610e9c5783516001600160e01b03191683529284019291840191600101610f46565b634e487b7160e01b600052604160045260246000fd5b604051606081016001600160401b0381118282101715610fa457610fa4610f6c565b60405290565b604080519081016001600160401b0381118282101715610fa457610fa4610f6c565b604051601f8201601f191681016001600160401b0381118282101715610ff457610ff4610f6c565b604052919050565b60006001600160401b0382111561101557611015610f6c565b50601f01601f191660200190565b6000806040838503121561103657600080fd5b8235915060208301356001600160401b0381111561105357600080fd5b8301601f8101851361106457600080fd5b803561107761107282610ffc565b610fcc565b81815286602083850101111561108c57600080fd5b816020840160208301376000602083830101528093505050509250929050565b6000806000606084860312156110c157600080fd5b505081359360208301359350604090920135919050565b634e487b7160e01b600052601160045260246000fd5b600060018201611100576111006110d8565b5060010190565b634e487b7160e01b600052603260045260246000fd5b600181811c9082168061113157607f821691505b60208210810361115157634e487b7160e01b600052602260045260246000fd5b50919050565b8082018082111561019b5761019b6110d8565b601f821115610df957600081815260208120601f850160051c810160208610156111915750805b601f850160051c820191505b818110156111b05782815560010161119d565b505050505050565b600019600383901b1c191660019190911b1790565b81516001600160401b038111156111e6576111e6610f6c565b6111fa816111f4845461111d565b8461116a565b602080601f83116001811461122957600084156112175750858301515b61122185826111b8565b8655506111b0565b600085815260208120601f198616915b8281101561125857888601518255948401946001909101908401611239565b50858210156112765787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b808202811582820484141761019b5761019b6110d8565b8181038181111561019b5761019b6110d8565b6000602082840312156112c257600080fd5b8151801515811461018957600080fd5b6000606082840312156112e457600080fd5b6112ec610f82565b905081518152602082015160208201526040820151604082015292915050565b60006060828403121561131e57600080fd5b61018983836112d2565b6000602080838503121561133b57600080fd5b82516001600160401b038082111561135257600080fd5b908401906040828703121561136657600080fd5b61136e610faa565b82518152838301518281111561138357600080fd5b80840193505086601f84011261139857600080fd5b825191506113a861107283610ffc565b82815287858486010111156113bc57600080fd5b6113cb83868301878701610ec1565b938101939093525090949350505050565b6000606082840312156113ee57600080fd5b6113f6610f82565b8251815260208301516020820152604083015160ff8116811461141857600080fd5b60408201529392505050565b81810361142f575050565b611439825461111d565b6001600160401b0381111561145057611450610f6c565b61145e816111f4845461111d565b6000601f82116001811461148c576000831561147a5750848201545b61148484826111b8565b8555506114f1565b600085815260209020601f19841690600086815260209020845b838110156114c657828601548255600195860195909101906020016114a6565b50858310156114e45781850154600019600388901b60f8161c191681555b50505060018360011b0184555b505050505056fea26469706673582212206fd3fe8e52a4690954cc1f5af0afff3b0a3f55b8945b89bd602f1fa4892bbeb764736f6c63430008120033";
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
        readonly inputs: readonly [];
        readonly name: "BalanceAdjustmentCreationFailed";
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
        readonly name: "CouponCreationFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "DividendCreationFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "actionType";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly name: "DuplicatedCorporateAction";
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
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "newSystemTime";
            readonly type: "uint256";
        }];
        readonly name: "InvalidTimestamp";
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
        readonly name: "VotingRightsCreationFailed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "WrongChainId";
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
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "actionType";
            readonly type: "bytes32";
        }, {
            readonly indexed: true;
            readonly internalType: "bytes32";
            readonly name: "corporateActionId";
            readonly type: "bytes32";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "corporateActionIndexByType";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "bytes";
            readonly name: "data";
            readonly type: "bytes";
        }];
        readonly name: "CorporateActionAdded";
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
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "legacySystemTime";
            readonly type: "uint256";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "newSystemTime";
            readonly type: "uint256";
        }];
        readonly name: "SystemTimestampChanged";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [];
        readonly name: "SystemTimestampReset";
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
            readonly internalType: "bytes32";
            readonly name: "_actionType";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "_data";
            readonly type: "bytes";
        }];
        readonly name: "addCorporateAction";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }, {
            readonly internalType: "bytes32";
            readonly name: "corporateActionId_";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "corporateActionIndexByType_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_corporateActionId";
            readonly type: "bytes32";
        }];
        readonly name: "getCorporateAction";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "actionType_";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes";
            readonly name: "data_";
            readonly type: "bytes";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getCorporateActionCount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "corporateActionCount_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_actionType";
            readonly type: "bytes32";
        }];
        readonly name: "getCorporateActionCountByType";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "corporateActionCount_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
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
        readonly name: "getCorporateActionIds";
        readonly outputs: readonly [{
            readonly internalType: "bytes32[]";
            readonly name: "corporateActionIds_";
            readonly type: "bytes32[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_actionType";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getCorporateActionIdsByType";
        readonly outputs: readonly [{
            readonly internalType: "bytes32[]";
            readonly name: "corporateActionIds_";
            readonly type: "bytes32[]";
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
    }];
    static createInterface(): CorporateActionsTimeTravelInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): CorporateActionsTimeTravel;
}
export {};
