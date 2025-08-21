import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { KycTimeTravel, KycTimeTravelInterface } from "../../../../../contracts/test/testTimeTravel/facetsTimeTravel/KycTimeTravel";
type KycTimeTravelConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class KycTimeTravel__factory extends ContractFactory {
    constructor(...args: KycTimeTravelConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string;
    }): Promise<KycTimeTravel>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): KycTimeTravel;
    connect(signer: Signer): KycTimeTravel__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b5061001a4661001f565b610043565b8061053914610040576040516217e1ef60ea1b815260040160405180910390fd5b50565b611be1806100526000396000f3fe608060405234801561001057600080fd5b50600436106100be5760003560e01c806381bea54d1161007c57806381bea54d1461017b57806390b6c7981461018e578063b378cf3714610196578063c1f0d742146101ab578063df353624146101b3578063e788a736146101c8578063fbb08f50146101e857600080fd5b8062497afb146100c357806312283191146100ed5780631ef2fdc81461011057806341322840146101405780634a5df31d146101605780635b712c4b14610168575b600080fd5b6100d66100d13660046115d5565b6101f0565b6040516100e49291906116e1565b60405180910390f35b6101006100fb36600461179e565b61020a565b60405190151581526020016100e4565b7ff516a0f6b4726244ae916c590cd26c2b593d7d448e46e43714fb9f9435c46e325b6040519081526020016100e4565b61015361014e36600461179e565b610292565b6040516100e491906117b9565b6101006102a9565b6101326101763660046117cc565b610326565b6101006101893660046117ff565b610331565b6101006103e9565b61019e6103f8565b6040516100e491906118e5565b61019e61045e565b6101c66101c1366004611941565b6106c7565b005b6101db6101d636600461179e565b61070a565b6040516100e4919061195e565b610100610715565b6060806101fe85858561078a565b90969095509350505050565b60007f6fbd421e041603fa367357d79ffc3b2f9fd37a6fc4eec661aa5537a9ae75f93d6102378133610895565b61023f6108d7565b82610249816108ff565b61025284610929565b60405190935033906001600160a01b038616907f5d9279616441228548cfb67f31b7b9b131fd30de1b3c54a6dd0062a74ce638a690600090a35050919050565b61029a611532565b6102a3826109a1565b92915050565b60007f3916c5c9e68488134c2ee70660332559707c133d0a295a25971da4085441522e6102d68133610895565b6102de6108d7565b6102e86000610ac7565b6040516000815290925033907fa9f463ccc72d9e8aa9a317345756d652481f06b5ddf8aa4057f38086024a168c906020015b60405180910390a25090565b60006102a382610af3565b60007f6fbd421e041603fa367357d79ffc3b2f9fd37a6fc4eec661aa5537a9ae75f93d61035e8133610895565b6103666108d7565b86610370816108ff565b60008861037d8282610b3b565b87876103898282610b62565b8761039381610b94565b6103a08d8d8d8d8d610bc5565b60405190985033906001600160a01b038f16907f0cc42ba172587888529a0b89cc75bd6914b337cf10757fd80e3246330e55ad9490600090a35050505050505095945050505050565b60006103f3610ccd565b905090565b60408051600180825281830190925260609160208083019080368337019050509050600063907ac0eb60e01b828261042f81611982565b9350815181106104415761044161199b565b6001600160e01b0319909216602092830291909101909101525090565b60408051600a80825261016082019092526060916000919060208201610140803683370190505091506337cd4d8960e21b828261049a81611982565b9350815181106104ac576104ac61199b565b6001600160e01b031990921660209283029190910190910152630fbb08f560e41b82826104d881611982565b9350815181106104ea576104ea61199b565b6001600160e01b031990921660209283029190910190910152634a5df31d60e01b828261051681611982565b9350815181106105285761052861199b565b6001600160e01b0319909216602092830291909101909101526381bea54d60e01b828261055481611982565b9350815181106105665761056661199b565b6001600160e01b031990921660209283029190910190910152631228319160e01b828261059281611982565b9350815181106105a4576105a461199b565b6001600160e01b031990921660209283029190910190910152630104c8a160e61b82826105d081611982565b9350815181106105e2576105e261199b565b6001600160e01b0319909216602092830291909101909101526373c4539b60e11b828261060e81611982565b9350815181106106205761062061199b565b6001600160e01b031990921660209283029190910190910152635b712c4b60e01b828261064c81611982565b93508151811061065e5761065e61199b565b6001600160e01b03199092166020928302919091019091015262497afb60e01b828261068981611982565b93508151811061069b5761069b61199b565b6001600160e01b031990921660209283029190910190910152631216d8f360e31b828261042f81611982565b6106cf610ce8565b6002015460ff166106df81610d0c565b60006106e9610ce8565b60020180549315156101000261ffff19909416939093176001179092555050565b60006102a382610d2a565b60007f3916c5c9e68488134c2ee70660332559707c133d0a295a25971da4085441522e6107428133610895565b61074a6108d7565b6107546001610ac7565b6040516001815290925033907fa9f463ccc72d9e8aa9a317345756d652481f06b5ddf8aa4057f38086024a168c9060200161031a565b6060806107df848461079a610ce8565b60010160008960018111156107b1576107b1611650565b60018111156107c2576107c2611650565b8152602001908152602001600020610ef19092919063ffffffff16565b80519092508067ffffffffffffffff8111156107fd576107fd6117e9565b60405190808252806020026020018201604052801561083657816020015b610823611532565b81526020019060019003908161081b5790505b50915060005b8181101561088b576108668482815181106108595761085961199b565b60200260200101516109a1565b8382815181106108785761087861199b565b602090810291909101015260010161083c565b5050935093915050565b61089f8282610fc7565b6108d35760405163a1180aad60e01b81526001600160a01b0382166004820152602481018390526044015b60405180910390fd5b5050565b6108df610ffb565b156108fd5760405163649815a560e01b815260040160405180910390fd5b565b6001600160a01b038116610926576040516342bcdf7f60e11b815260040160405180910390fd5b50565b6000610933610ce8565b6001600160a01b0383166000908152602091909152604081208181556001810182905590610964600283018261157a565b5060030180546001600160a81b031916905561099882610982610ce8565b6001600081815291016020526040902090611030565b50600192915050565b6109a9611532565b6109b1610ce8565b6001600160a01b03831660009081526020918252604090819020815160a0810183528154815260018201549381019390935260028101805491928401916109f7906119b1565b80601f0160208091040260200160405190810160405280929190818152602001828054610a23906119b1565b8015610a705780601f10610a4557610100808354040283529160200191610a70565b820191906000526020600020905b815481529060010190602001808311610a5357829003601f168201915b505050918352505060038201546001600160a01b0381166020830152604090910190600160a01b900460ff166001811115610aad57610aad611650565b6001811115610abe57610abe611650565b90525092915050565b600081610ad2610ce8565b60020180549115156101000261ff0019909216919091179055506001919050565b60006102a3610b00610ce8565b6001016000846001811115610b1757610b17611650565b6001811115610b2857610b28611650565b8152602001908152602001600020611045565b610b45828261104f565b6108d35760405163fc855b1b60e01b815260040160405180910390fd5b80821180610b765750610b736110bf565b81105b156108d35760405163364dd21b60e21b815260040160405180910390fd5b610b9d816110c9565b6109265760405163cd324f5360e01b81526001600160a01b03821660048201526024016108ca565b60006040518060a00160405280858152602001848152602001868152602001836001600160a01b03168152602001600180811115610c0557610c05611650565b9052610c0f610ce8565b6001600160a01b03881660009081526020918252604090819020835181559183015160018301558201516002820190610c489082611a3a565b5060608201516003820180546001600160a01b039092166001600160a01b03198316811782556080850151926001600160a81b03191617600160a01b836001811115610c9657610c96611650565b0217905550905050610cc086610caa610ce8565b60016000818152910160205260409020906110f5565b5060019695505050505050565b6000610cd7610ce8565b60020154610100900460ff16919050565b7f589d3365cb6f9141f65f568666d0e4cb837c3b1edc1527dd31a1aa423ad940c790565b80156109265760405162dc149f60e41b815260040160405180910390fd5b600080610d36836109a1565b9050610d406110bf565b81602001511015610d545750600092915050565b610d5c6110bf565b81511115610d6d5750600092915050565b610d7a81606001516110c9565b610d875750600092915050565b6000610dba7fdbde0b1f7457f92983806323b8056e5eabfce9a23b8924af999a4df0e4154e1a546001600160a01b031690565b90506001600160a01b03811615801590610e44575060608201516040808401519051636e5f638960e11b81526001600160a01b0384169263dcbec71292610e0392600401611afa565b602060405180830381865afa158015610e20573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e449190611b1e565b15610e53575060009392505050565b6001600160a01b03811615610ee65760608201516040808401519051636e5f638960e11b81526001600160a01b0384169263dcbec71292610e9692600401611afa565b602060405180830381865afa158015610eb3573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ed79190611b1e565b15610ee6575060009392505050565b506080015192915050565b60606000610efe85611045565b9050600080610f0d868661110a565b91509150610f1c82828561112c565b67ffffffffffffffff811115610f3457610f346117e9565b604051908082528060200260200182016040528015610f5d578160200160208202803683370190505b50935060005b8451811015610fbc57610f80610f798285611b3b565b899061116a565b858281518110610f9257610f9261199b565b6001600160a01b039092166020928302919091019091015280610fb481611982565b915050610f63565b505050509392505050565b6000610ff47f4765bbd856d800638d39a79262ebc6fdfb5833d0e59f32c5d482fe4c4a3554c18484611176565b9392505050565b60007f5a5b295532a8b6e97bc9d45d68fc49b85a099545bac8f91f77706d392a1cea715460ff16806103f357506103f361119a565b6000610ff4836001600160a01b03841661126e565b60006102a3825490565b60008061105a610ce8565b6002810154909150600090610100900460ff1615806110a2575084600181111561108657611086611650565b61108f85610d2a565b60018111156110a0576110a0611650565b145b90508080156110b657506110b68486611361565b95945050505050565b60006103f361145c565b60006102a37fdbde0b1f7457f92983806323b8056e5eabfce9a23b8924af999a4df0e4154e1883611471565b6000610ff4836001600160a01b038416611493565b6000806111178385611b4e565b91506111238383611b3b565b90509250929050565b600082841061113d57506000610ff4565b81841061114c57506000610ff4565b81831115611158578192505b6111628484611b65565b949350505050565b6000610ff483836114e2565b6001600160a01b03811660009081526001840160205260408120611162908461150c565b60007f80cd138137fb7aaf8068b75b39b6681af39401f81721b6420d44eb588baaeeb9816111c782611524565b905060005b81811015611264576111e1600184018261116a565b6001600160a01b031663b187bd266040518163ffffffff1660e01b8152600401602060405180830381865afa15801561121e573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112429190611b1e565b15611251576001935050505090565b60010161125d81611982565b90506111cc565b5060009250505090565b60008181526001830160205260408120548015611357576000611292600183611b65565b85549091506000906112a690600190611b65565b905081811461130b5760008660000182815481106112c6576112c661199b565b90600052602060002001549050808760000184815481106112e9576112e961199b565b6000918252602080832090910192909255918252600188019052604090208390555b855486908061131c5761131c611b78565b6001900381819060005260206000200160009055905585600101600086815260200190815260200160002060009055600193505050506102a3565b60009150506102a3565b60007f57364604d3fde2768df7beea76ca84783455ba461f6f84450864597901db12b98161138e82611524565b905060005b81811015611450578460018111156113ad576113ad611650565b6113ba600185018361116a565b60405163be88ff4960e01b81526001600160a01b038981166004830152919091169063be88ff4990602401602060405180830381865afa158015611402573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114269190611b8e565b600181111561143757611437611650565b1461144857600093505050506102a3565b600101611393565b50600195945050505050565b600080541561146c575060005490565b504290565b6001600160a01b03811660009081526001830160205260408120541515610ff4565b60008181526001830160205260408120546114da575081546001818101845560008481526020808220909301849055845484825282860190935260409020919091556102a3565b5060006102a3565b60008260000182815481106114f9576114f961199b565b9060005260206000200154905092915050565b60008181526001830160205260408120541515610ff4565b60006102a382600101611045565b6040518060a0016040528060008152602001600081526020016060815260200160006001600160a01b031681526020016000600181111561157557611575611650565b905290565b508054611586906119b1565b6000825580601f10611596575050565b601f01602090049060005260206000209081019061092691905b808211156115c457600081556001016115b0565b5090565b6002811061092657600080fd5b6000806000606084860312156115ea57600080fd5b83356115f5816115c8565b95602085013595506040909401359392505050565b6000815180845260005b8181101561163057602081850181015186830182015201611614565b506000602082860101526020601f19601f83011685010191505092915050565b634e487b7160e01b600052602160045260246000fd5b6002811061168457634e487b7160e01b600052602160045260246000fd5b9052565b80518252602081015160208301526000604082015160a060408501526116b160a085018261160a565b6060848101516001600160a01b0316908601526080808501519192506116d990860182611666565b509392505050565b604080825283519082018190526000906020906060840190828701845b828110156117235781516001600160a01b0316845292840192908401906001016116fe565b50505083810382850152845180825282820190600581901b8301840187850160005b8381101561177357601f19868403018552611761838351611688565b94870194925090860190600101611745565b50909998505050505050505050565b80356001600160a01b038116811461179957600080fd5b919050565b6000602082840312156117b057600080fd5b610ff482611782565b602081526000610ff46020830184611688565b6000602082840312156117de57600080fd5b8135610ff4816115c8565b634e487b7160e01b600052604160045260246000fd5b600080600080600060a0868803121561181757600080fd5b61182086611782565b9450602086013567ffffffffffffffff8082111561183d57600080fd5b818801915088601f83011261185157600080fd5b813581811115611863576118636117e9565b604051601f8201601f19908116603f0116810190838211818310171561188b5761188b6117e9565b816040528281528b60208487010111156118a457600080fd5b82602086016020830137600060208483010152809850505050505060408601359250606086013591506118d960808701611782565b90509295509295909350565b6020808252825182820181905260009190848201906040850190845b818110156119275783516001600160e01b03191683529284019291840191600101611901565b50909695505050505050565b801515811461092657600080fd5b60006020828403121561195357600080fd5b8135610ff481611933565b602081016102a38284611666565b634e487b7160e01b600052601160045260246000fd5b6000600182016119945761199461196c565b5060010190565b634e487b7160e01b600052603260045260246000fd5b600181811c908216806119c557607f821691505b6020821081036119e557634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115611a3557600081815260208120601f850160051c81016020861015611a125750805b601f850160051c820191505b81811015611a3157828155600101611a1e565b5050505b505050565b815167ffffffffffffffff811115611a5457611a546117e9565b611a6881611a6284546119b1565b846119eb565b602080601f831160018114611a9d5760008415611a855750858301515b600019600386901b1c1916600185901b178555611a31565b600085815260208120601f198616915b82811015611acc57888601518255948401946001909101908401611aad565b5085821015611aea5787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b6001600160a01b03831681526040602082018190526000906111629083018461160a565b600060208284031215611b3057600080fd5b8151610ff481611933565b808201808211156102a3576102a361196c565b80820281158282048414176102a3576102a361196c565b818103818111156102a3576102a361196c565b634e487b7160e01b600052603160045260246000fd5b600060208284031215611ba057600080fd5b8151610ff4816115c856fea264697066735822122022050358d4ce6fecb76476c438a0deab0d59e99de4d06310cd2184df2978462464736f6c63430008120033";
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
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "issuer";
            readonly type: "address";
        }];
        readonly name: "AccountIsNotIssuer";
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
        readonly inputs: readonly [];
        readonly name: "InvalidDates";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "InvalidKycStatus";
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
        readonly name: "InvalidZeroAddress";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "IssuanceIsClosed";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "KycIsNotGranted";
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
            readonly name: "operator";
            readonly type: "address";
        }, {
            readonly indexed: false;
            readonly internalType: "bool";
            readonly name: "activated";
            readonly type: "bool";
        }];
        readonly name: "InternalKycStatusUpdated";
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
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "issuer";
            readonly type: "address";
        }];
        readonly name: "KycGranted";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "issuer";
            readonly type: "address";
        }];
        readonly name: "KycRevoked";
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
        readonly inputs: readonly [];
        readonly name: "activateInternalKyc";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "deactivateInternalKyc";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "enum IKyc.KycStatus";
            readonly name: "_kycStatus";
            readonly type: "uint8";
        }];
        readonly name: "getKycAccountsCount";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "kycAccountsCount_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "enum IKyc.KycStatus";
            readonly name: "_kycStatus";
            readonly type: "uint8";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getKycAccountsData";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "accounts_";
            readonly type: "address[]";
        }, {
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "validFrom";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "validTo";
                readonly type: "uint256";
            }, {
                readonly internalType: "string";
                readonly name: "vcId";
                readonly type: "string";
            }, {
                readonly internalType: "address";
                readonly name: "issuer";
                readonly type: "address";
            }, {
                readonly internalType: "enum IKyc.KycStatus";
                readonly name: "status";
                readonly type: "uint8";
            }];
            readonly internalType: "struct IKyc.KycData[]";
            readonly name: "kycData_";
            readonly type: "tuple[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_account";
            readonly type: "address";
        }];
        readonly name: "getKycFor";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint256";
                readonly name: "validFrom";
                readonly type: "uint256";
            }, {
                readonly internalType: "uint256";
                readonly name: "validTo";
                readonly type: "uint256";
            }, {
                readonly internalType: "string";
                readonly name: "vcId";
                readonly type: "string";
            }, {
                readonly internalType: "address";
                readonly name: "issuer";
                readonly type: "address";
            }, {
                readonly internalType: "enum IKyc.KycStatus";
                readonly name: "status";
                readonly type: "uint8";
            }];
            readonly internalType: "struct IKyc.KycData";
            readonly name: "kyc_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_account";
            readonly type: "address";
        }];
        readonly name: "getKycStatusFor";
        readonly outputs: readonly [{
            readonly internalType: "enum IKyc.KycStatus";
            readonly name: "kycStatus_";
            readonly type: "uint8";
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
            readonly internalType: "address";
            readonly name: "_account";
            readonly type: "address";
        }, {
            readonly internalType: "string";
            readonly name: "_vcId";
            readonly type: "string";
        }, {
            readonly internalType: "uint256";
            readonly name: "_validFrom";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_validTo";
            readonly type: "uint256";
        }, {
            readonly internalType: "address";
            readonly name: "_issuer";
            readonly type: "address";
        }];
        readonly name: "grantKyc";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bool";
            readonly name: "_internalKycActivated";
            readonly type: "bool";
        }];
        readonly name: "initializeInternalKyc";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "isInternalKycActivated";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_account";
            readonly type: "address";
        }];
        readonly name: "revokeKyc";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "success_";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): KycTimeTravelInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): KycTimeTravel;
}
export {};
