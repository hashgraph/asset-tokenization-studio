import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Kyc, KycInterface } from "../../../../contracts/layer_1/kyc/Kyc";
type KycConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class Kyc__factory extends ContractFactory {
    constructor(...args: KycConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string;
    }): Promise<Kyc>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): Kyc;
    connect(signer: Signer): Kyc__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50611bad806100206000396000f3fe608060405234801561001057600080fd5b50600436106100be5760003560e01c806381bea54d1161007c57806381bea54d1461017b57806390b6c7981461018e578063b378cf3714610196578063c1f0d742146101ab578063df353624146101b3578063e788a736146101c8578063fbb08f50146101e857600080fd5b8062497afb146100c357806312283191146100ed5780631ef2fdc81461011057806341322840146101405780634a5df31d146101605780635b712c4b14610168575b600080fd5b6100d66100d13660046115a1565b6101f0565b6040516100e49291906116ad565b60405180910390f35b6101006100fb36600461176a565b61020a565b60405190151581526020016100e4565b7ff516a0f6b4726244ae916c590cd26c2b593d7d448e46e43714fb9f9435c46e325b6040519081526020016100e4565b61015361014e36600461176a565b610292565b6040516100e49190611785565b6101006102a9565b610132610176366004611798565b610326565b6101006101893660046117cb565b610331565b6101006103e9565b61019e6103f8565b6040516100e491906118b1565b61019e61045e565b6101c66101c136600461190d565b6106c7565b005b6101db6101d636600461176a565b61070a565b6040516100e4919061192a565b610100610715565b6060806101fe85858561078a565b90969095509350505050565b60007f6fbd421e041603fa367357d79ffc3b2f9fd37a6fc4eec661aa5537a9ae75f93d6102378133610895565b61023f6108d7565b82610249816108ff565b61025284610929565b60405190935033906001600160a01b038616907f5d9279616441228548cfb67f31b7b9b131fd30de1b3c54a6dd0062a74ce638a690600090a35050919050565b61029a6114fe565b6102a3826109a1565b92915050565b60007f3916c5c9e68488134c2ee70660332559707c133d0a295a25971da4085441522e6102d68133610895565b6102de6108d7565b6102e86000610ac7565b6040516000815290925033907fa9f463ccc72d9e8aa9a317345756d652481f06b5ddf8aa4057f38086024a168c906020015b60405180910390a25090565b60006102a382610af3565b60007f6fbd421e041603fa367357d79ffc3b2f9fd37a6fc4eec661aa5537a9ae75f93d61035e8133610895565b6103666108d7565b86610370816108ff565b60008861037d8282610b3b565b87876103898282610b62565b8761039381610b8d565b6103a08d8d8d8d8d610bbe565b60405190985033906001600160a01b038f16907f0cc42ba172587888529a0b89cc75bd6914b337cf10757fd80e3246330e55ad9490600090a35050505050505095945050505050565b60006103f3610cc6565b905090565b60408051600180825281830190925260609160208083019080368337019050509050600063907ac0eb60e01b828261042f8161194e565b93508151811061044157610441611967565b6001600160e01b0319909216602092830291909101909101525090565b60408051600a80825261016082019092526060916000919060208201610140803683370190505091506337cd4d8960e21b828261049a8161194e565b9350815181106104ac576104ac611967565b6001600160e01b031990921660209283029190910190910152630fbb08f560e41b82826104d88161194e565b9350815181106104ea576104ea611967565b6001600160e01b031990921660209283029190910190910152634a5df31d60e01b82826105168161194e565b93508151811061052857610528611967565b6001600160e01b0319909216602092830291909101909101526381bea54d60e01b82826105548161194e565b93508151811061056657610566611967565b6001600160e01b031990921660209283029190910190910152631228319160e01b82826105928161194e565b9350815181106105a4576105a4611967565b6001600160e01b031990921660209283029190910190910152630104c8a160e61b82826105d08161194e565b9350815181106105e2576105e2611967565b6001600160e01b0319909216602092830291909101909101526373c4539b60e11b828261060e8161194e565b93508151811061062057610620611967565b6001600160e01b031990921660209283029190910190910152635b712c4b60e01b828261064c8161194e565b93508151811061065e5761065e611967565b6001600160e01b03199092166020928302919091019091015262497afb60e01b82826106898161194e565b93508151811061069b5761069b611967565b6001600160e01b031990921660209283029190910190910152631216d8f360e31b828261042f8161194e565b6106cf610ce1565b6002015460ff166106df81610d05565b60006106e9610ce1565b60020180549315156101000261ffff19909416939093176001179092555050565b60006102a382610d23565b60007f3916c5c9e68488134c2ee70660332559707c133d0a295a25971da4085441522e6107428133610895565b61074a6108d7565b6107546001610ac7565b6040516001815290925033907fa9f463ccc72d9e8aa9a317345756d652481f06b5ddf8aa4057f38086024a168c9060200161031a565b6060806107df848461079a610ce1565b60010160008960018111156107b1576107b161161c565b60018111156107c2576107c261161c565b8152602001908152602001600020610edc9092919063ffffffff16565b80519092508067ffffffffffffffff8111156107fd576107fd6117b5565b60405190808252806020026020018201604052801561083657816020015b6108236114fe565b81526020019060019003908161081b5790505b50915060005b8181101561088b5761086684828151811061085957610859611967565b60200260200101516109a1565b83828151811061087857610878611967565b602090810291909101015260010161083c565b5050935093915050565b61089f8282610fb2565b6108d35760405163a1180aad60e01b81526001600160a01b0382166004820152602481018390526044015b60405180910390fd5b5050565b6108df610fe6565b156108fd5760405163649815a560e01b815260040160405180910390fd5b565b6001600160a01b038116610926576040516342bcdf7f60e11b815260040160405180910390fd5b50565b6000610933610ce1565b6001600160a01b03831660009081526020919091526040812081815560018101829055906109646002830182611546565b5060030180546001600160a81b031916905561099882610982610ce1565b600160008181529101602052604090209061101b565b50600192915050565b6109a96114fe565b6109b1610ce1565b6001600160a01b03831660009081526020918252604090819020815160a0810183528154815260018201549381019390935260028101805491928401916109f79061197d565b80601f0160208091040260200160405190810160405280929190818152602001828054610a239061197d565b8015610a705780601f10610a4557610100808354040283529160200191610a70565b820191906000526020600020905b815481529060010190602001808311610a5357829003601f168201915b505050918352505060038201546001600160a01b0381166020830152604090910190600160a01b900460ff166001811115610aad57610aad61161c565b6001811115610abe57610abe61161c565b90525092915050565b600081610ad2610ce1565b60020180549115156101000261ff0019909216919091179055506001919050565b60006102a3610b00610ce1565b6001016000846001811115610b1757610b1761161c565b6001811115610b2857610b2861161c565b8152602001908152602001600020611030565b610b45828261103a565b6108d35760405163fc855b1b60e01b815260040160405180910390fd5b80821180610b6f57504281105b156108d35760405163364dd21b60e21b815260040160405180910390fd5b610b96816110aa565b6109265760405163cd324f5360e01b81526001600160a01b03821660048201526024016108ca565b60006040518060a00160405280858152602001848152602001868152602001836001600160a01b03168152602001600180811115610bfe57610bfe61161c565b9052610c08610ce1565b6001600160a01b03881660009081526020918252604090819020835181559183015160018301558201516002820190610c419082611a06565b5060608201516003820180546001600160a01b039092166001600160a01b03198316811782556080850151926001600160a81b03191617600160a01b836001811115610c8f57610c8f61161c565b0217905550905050610cb986610ca3610ce1565b60016000818152910160205260409020906110d6565b5060019695505050505050565b6000610cd0610ce1565b60020154610100900460ff16919050565b7f589d3365cb6f9141f65f568666d0e4cb837c3b1edc1527dd31a1aa423ad940c790565b80156109265760405162dc149f60e41b815260040160405180910390fd5b600080610d2f836109a1565b90504281602001511015610d465750600092915050565b4281511115610d585750600092915050565b610d6581606001516110aa565b610d725750600092915050565b6000610da57fdbde0b1f7457f92983806323b8056e5eabfce9a23b8924af999a4df0e4154e1a546001600160a01b031690565b90506001600160a01b03811615801590610e2f575060608201516040808401519051636e5f638960e11b81526001600160a01b0384169263dcbec71292610dee92600401611ac6565b602060405180830381865afa158015610e0b573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610e2f9190611aea565b15610e3e575060009392505050565b6001600160a01b03811615610ed15760608201516040808401519051636e5f638960e11b81526001600160a01b0384169263dcbec71292610e8192600401611ac6565b602060405180830381865afa158015610e9e573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610ec29190611aea565b15610ed1575060009392505050565b506080015192915050565b60606000610ee985611030565b9050600080610ef886866110eb565b91509150610f0782828561110d565b67ffffffffffffffff811115610f1f57610f1f6117b5565b604051908082528060200260200182016040528015610f48578160200160208202803683370190505b50935060005b8451811015610fa757610f6b610f648285611b07565b899061114b565b858281518110610f7d57610f7d611967565b6001600160a01b039092166020928302919091019091015280610f9f8161194e565b915050610f4e565b505050509392505050565b6000610fdf7f4765bbd856d800638d39a79262ebc6fdfb5833d0e59f32c5d482fe4c4a3554c18484611157565b9392505050565b60007f5a5b295532a8b6e97bc9d45d68fc49b85a099545bac8f91f77706d392a1cea715460ff16806103f357506103f361117b565b6000610fdf836001600160a01b03841661124f565b60006102a3825490565b600080611045610ce1565b6002810154909150600090610100900460ff16158061108d57508460018111156110715761107161161c565b61107a85610d23565b600181111561108b5761108b61161c565b145b90508080156110a157506110a18486611342565b95945050505050565b60006102a37fdbde0b1f7457f92983806323b8056e5eabfce9a23b8924af999a4df0e4154e188361143d565b6000610fdf836001600160a01b03841661145f565b6000806110f88385611b1a565b91506111048383611b07565b90509250929050565b600082841061111e57506000610fdf565b81841061112d57506000610fdf565b81831115611139578192505b6111438484611b31565b949350505050565b6000610fdf83836114ae565b6001600160a01b0381166000908152600184016020526040812061114390846114d8565b60007f80cd138137fb7aaf8068b75b39b6681af39401f81721b6420d44eb588baaeeb9816111a8826114f0565b905060005b81811015611245576111c2600184018261114b565b6001600160a01b031663b187bd266040518163ffffffff1660e01b8152600401602060405180830381865afa1580156111ff573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906112239190611aea565b15611232576001935050505090565b60010161123e8161194e565b90506111ad565b5060009250505090565b60008181526001830160205260408120548015611338576000611273600183611b31565b855490915060009061128790600190611b31565b90508181146112ec5760008660000182815481106112a7576112a7611967565b90600052602060002001549050808760000184815481106112ca576112ca611967565b6000918252602080832090910192909255918252600188019052604090208390555b85548690806112fd576112fd611b44565b6001900381819060005260206000200160009055905585600101600086815260200190815260200160002060009055600193505050506102a3565b60009150506102a3565b60007f57364604d3fde2768df7beea76ca84783455ba461f6f84450864597901db12b98161136f826114f0565b905060005b818110156114315784600181111561138e5761138e61161c565b61139b600185018361114b565b60405163be88ff4960e01b81526001600160a01b038981166004830152919091169063be88ff4990602401602060405180830381865afa1580156113e3573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906114079190611b5a565b60018111156114185761141861161c565b1461142957600093505050506102a3565b600101611374565b50600195945050505050565b6001600160a01b03811660009081526001830160205260408120541515610fdf565b60008181526001830160205260408120546114a6575081546001818101845560008481526020808220909301849055845484825282860190935260409020919091556102a3565b5060006102a3565b60008260000182815481106114c5576114c5611967565b9060005260206000200154905092915050565b60008181526001830160205260408120541515610fdf565b60006102a382600101611030565b6040518060a0016040528060008152602001600081526020016060815260200160006001600160a01b03168152602001600060018111156115415761154161161c565b905290565b5080546115529061197d565b6000825580601f10611562575050565b601f01602090049060005260206000209081019061092691905b80821115611590576000815560010161157c565b5090565b6002811061092657600080fd5b6000806000606084860312156115b657600080fd5b83356115c181611594565b95602085013595506040909401359392505050565b6000815180845260005b818110156115fc576020818501810151868301820152016115e0565b506000602082860101526020601f19601f83011685010191505092915050565b634e487b7160e01b600052602160045260246000fd5b6002811061165057634e487b7160e01b600052602160045260246000fd5b9052565b80518252602081015160208301526000604082015160a0604085015261167d60a08501826115d6565b6060848101516001600160a01b0316908601526080808501519192506116a590860182611632565b509392505050565b604080825283519082018190526000906020906060840190828701845b828110156116ef5781516001600160a01b0316845292840192908401906001016116ca565b50505083810382850152845180825282820190600581901b8301840187850160005b8381101561173f57601f1986840301855261172d838351611654565b94870194925090860190600101611711565b50909998505050505050505050565b80356001600160a01b038116811461176557600080fd5b919050565b60006020828403121561177c57600080fd5b610fdf8261174e565b602081526000610fdf6020830184611654565b6000602082840312156117aa57600080fd5b8135610fdf81611594565b634e487b7160e01b600052604160045260246000fd5b600080600080600060a086880312156117e357600080fd5b6117ec8661174e565b9450602086013567ffffffffffffffff8082111561180957600080fd5b818801915088601f83011261181d57600080fd5b81358181111561182f5761182f6117b5565b604051601f8201601f19908116603f01168101908382118183101715611857576118576117b5565b816040528281528b602084870101111561187057600080fd5b82602086016020830137600060208483010152809850505050505060408601359250606086013591506118a56080870161174e565b90509295509295909350565b6020808252825182820181905260009190848201906040850190845b818110156118f35783516001600160e01b031916835292840192918401916001016118cd565b50909695505050505050565b801515811461092657600080fd5b60006020828403121561191f57600080fd5b8135610fdf816118ff565b602081016102a38284611632565b634e487b7160e01b600052601160045260246000fd5b60006001820161196057611960611938565b5060010190565b634e487b7160e01b600052603260045260246000fd5b600181811c9082168061199157607f821691505b6020821081036119b157634e487b7160e01b600052602260045260246000fd5b50919050565b601f821115611a0157600081815260208120601f850160051c810160208610156119de5750805b601f850160051c820191505b818110156119fd578281556001016119ea565b5050505b505050565b815167ffffffffffffffff811115611a2057611a206117b5565b611a3481611a2e845461197d565b846119b7565b602080601f831160018114611a695760008415611a515750858301515b600019600386901b1c1916600185901b1785556119fd565b600085815260208120601f198616915b82811015611a9857888601518255948401946001909101908401611a79565b5085821015611ab65787850151600019600388901b60f8161c191681555b5050505050600190811b01905550565b6001600160a01b0383168152604060208201819052600090611143908301846115d6565b600060208284031215611afc57600080fd5b8151610fdf816118ff565b808201808211156102a3576102a3611938565b80820281158282048414176102a3576102a3611938565b818103818111156102a3576102a3611938565b634e487b7160e01b600052603160045260246000fd5b600060208284031215611b6c57600080fd5b8151610fdf8161159456fea264697066735822122006857a786b63672886bf88150115db0498a456da69d51d4fe5af77a64fbd999464736f6c63430008120033";
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
    static createInterface(): KycInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): Kyc;
}
export {};
