import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { DiamondFacet, DiamondFacetInterface } from "../../../../../contracts/resolver/resolverProxy/facets/DiamondFacet";
type DiamondFacetConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class DiamondFacet__factory extends ContractFactory {
    constructor(...args: DiamondFacetConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string;
    }): Promise<DiamondFacet>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): DiamondFacet;
    connect(signer: Signer): DiamondFacet__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b5061192a806100206000396000f3fe608060405234801561001057600080fd5b50600436106101365760003560e01c80637a070c2d116100b8578063bf02c5b91161007c578063bf02c5b9146102c6578063c1f0d742146102d9578063ca1f70ec146102e1578063cd25d535146102f4578063e317d12f146102fc578063e5d3a8721461031c57600080fd5b80637a070c2d1461025a5780638214de3e146102855780639fea53e714610298578063b378cf37146102ab578063b3fd6894146102b357600080fd5b806339a9e956116100ff57806339a9e956146101db5780633bed2f49146101fb578063430720f914610210578063662ea47d1461021857806378a1bf051461022d57600080fd5b80622eeb221461013b57806301ffc9a7146101505780630b3bad61146101785780631ef2fdc81461018b57806320202e6d146101bb575b600080fd5b61014e6101493660046111d1565b61032f565b005b61016361015e366004611203565b6103ba565b60405190151581526020015b60405180910390f35b61014e610186366004611220565b6103d3565b7f1b5212ea37fb29e99afa2812a5d7d7e662a477424d3de1a18cc3871a2ee94d785b60405190815260200161016f565b6101ce6101c9366004611220565b61045f565b60405161016f9190611242565b6101ee6101e9366004611286565b61047a565b60405161016f91906112b2565b610203610497565b60405161016f91906112f4565b6101ad6104bf565b6102206104d6565b60405161016f91906113c4565b6102356104f8565b604080516001600160a01b03909416845260208401929092529082015260600161016f565b61026d610268366004611203565b610529565b6040516001600160a01b03909116815260200161016f565b6101ee6102933660046111d1565b61053c565b6102036102a6366004611220565b610560565b6101ee610574565b6101ad6102c1366004611203565b61068e565b6102206102d4366004611220565b6106a1565b6101ee6106b5565b6101ad6102ef3660046111d1565b610ace565b6101ce610ae1565b61030f61030a3660046111d1565b610b03565b60405161016f9190611426565b61014e61032a36600461144e565b610b37565b600061033b8133610bde565b6000610345610c80565b805460018201546040516362cacc9560e11b81526004810191909152602481018690529192506001600160a01b03169063c595992a90604401600060405180830381600087803b15801561039857600080fd5b505af11580156103ac573d6000803e3d6000fd5b505050506002019190915550565b60006103cd6103c7610c80565b83610ca4565b92915050565b60006103df8133610bde565b60006103e9610c80565b80546040516362cacc9560e11b815260048101879052602481018690529192506001600160a01b03169063c595992a90604401600060405180830381600087803b15801561043657600080fd5b505af115801561044a573d6000803e3d6000fd5b50505050600181019390935550600290910155565b606061047361046c610c80565b8484610d1f565b9392505050565b606061048f610487610c80565b858585610dae565b949350505050565b606060006104a3610c80565b90506104b98160006104b484610e4d565b610ecf565b91505090565b60006104d16104cc610c80565b610e4d565b905090565b606060006104e2610c80565b90506104b98160006104f384610e4d565b610f5e565b600080600080610506610c80565b805460018201546002909201546001600160a01b03909116969195509350915050565b60006103cd610536610c80565b83610fed565b60606000610548610c80565b90506104738184600061055b8588611068565b610dae565b606061047361056d610c80565b8484610ecf565b60408051600480825260a082019092526060916020820160808036833701905050905060008082816105a581611499565b9350815181106105b7576105b76114c0565b6001600160e01b031990921660209283029190910190910152632599d44d60e21b82826105e381611499565b9350815181106105f5576105f56114c0565b6001600160e01b03199092166020928302919091019091015263886634d960e01b828261062181611499565b935081518110610633576106336114c0565b6001600160e01b0319909216602092830291909101909101526301ffc9a760e01b828261065f81611499565b935081518110610671576106716114c0565b6001600160e01b0319909216602092830291909101909101525090565b60006103cd61069b610c80565b836110ed565b60606104736106ae610c80565b8484610f5e565b6040805160128082526102608201909252606091602082016102408036833701905050905060006217759160e11b82826106ee81611499565b935081518110610700576107006114c0565b6001600160e01b031990921660209283029190910190910152630b3bad6160e01b828261072c81611499565b93508151811061073e5761073e6114c0565b6001600160e01b0319909216602092830291909101909101526372e9d43960e11b828261076a81611499565b93508151811061077c5761077c6114c0565b6001600160e01b0319909216602092830291909101909101526378a1bf0560e01b82826107a881611499565b9350815181106107ba576107ba6114c0565b6001600160e01b03199092166020928302919091019091015263662ea47d60e01b82826107e681611499565b9350815181106107f8576107f86114c0565b6001600160e01b03199092166020928302919091019091015263430720f960e01b828261082481611499565b935081518110610836576108366114c0565b6001600160e01b03199092166020928302919091019091015263bf02c5b960e01b828261086281611499565b935081518110610874576108746114c0565b6001600160e01b03199092166020928302919091019091015263410a6f1f60e11b82826108a081611499565b9350815181106108b2576108b26114c0565b6001600160e01b031990921660209283029190910190910152633287dc3b60e21b82826108de81611499565b9350815181106108f0576108f06114c0565b6001600160e01b031990921660209283029190910190910152631cd4f4ab60e11b828261091c81611499565b93508151811061092e5761092e6114c0565b6001600160e01b03199092166020928302919091019091015263cd25d53560e01b828261095a81611499565b93508151811061096c5761096c6114c0565b6001600160e01b0319909216602092830291909101909101526320202e6d60e01b828261099881611499565b9350815181106109aa576109aa6114c0565b6001600160e01b031990921660209283029190910190910152633bed2f4960e01b82826109d681611499565b9350815181106109e8576109e86114c0565b6001600160e01b031990921660209283029190910190910152639fea53e760e01b8282610a1481611499565b935081518110610a2657610a266114c0565b6001600160e01b031990921660209283029190910190910152632cff5a2560e21b8282610a5281611499565b935081518110610a6457610a646114c0565b6001600160e01b03199092166020928302919091019091015263e317d12f60e01b8282610a9081611499565b935081518110610aa257610aa26114c0565b6001600160e01b031990921660209283029190910190910152637a070c2d60e01b828261062181611499565b60006103cd610adb610c80565b83611068565b60606000610aed610c80565b90506104b9816000610afe84610e4d565b610d1f565b60408051608081018252600080825260208201526060918101829052818101919091526103cd610b31610c80565b83611127565b6000610b438133610bde565b6040516362cacc9560e11b815260048101849052602481018390526001600160a01b0385169063c595992a90604401600060405180830381600087803b158015610b8c57600080fd5b505af1158015610ba0573d6000803e3d6000fd5b505050506000610bae610c80565b80546001600160a01b0319166001600160a01b038716178155905060018101849055600281018390555050505050565b610c49828260006104737f4765bbd856d800638d39a79262ebc6fdfb5833d0e59f32c5d482fe4c4a3554c184846001600160a01b0381166000908152600184016020526040812061048f90846000610473838360009081526001919091016020526040902054151590565b610c7c5760405163a1180aad60e01b81526001600160a01b03821660048201526024810183905260440160405180910390fd5b5050565b7f4833864335c8f29dd85e3f7a36869cb90d5dc7167ae5000f7e1ce4d7c15d14ad90565b81546001830154600284015460405163099ecdbd60e41b81526000936001600160a01b0316926399ecdbd092610cde9287906004016114d6565b602060405180830381865afa158015610cfb573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061047391906114f6565b825460018401546002850154604051633973345f60e21b81526004810192909252602482015260448101849052606481018390526060916001600160a01b03169063e5ccd17c90608401600060405180830381865afa158015610d86573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261048f919081019061156b565b8354600185015460028601546040516322b09d2960e11b8152600481019290925260248201526044810185905260648101849052608481018390526060916001600160a01b0316906345613a529060a401600060405180830381865afa158015610e1c573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f19168201604052610e44919081019061166f565b95945050505050565b8054600182015460028301546040516308a6917b60e31b81526000936001600160a01b0316926345348bd892610e8e92600401918252602082015260400190565b602060405180830381865afa158015610eab573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906103cd91906116a3565b8254600184015460028501546040516308499c1b60e11b81526004810192909252602482015260448101849052606481018390526060916001600160a01b031690631093383690608401600060405180830381865afa158015610f36573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261048f91908101906116bc565b825460018401546002850154604051636118ce2b60e01b81526004810192909252602482015260448101849052606481018390526060916001600160a01b031690636118ce2b90608401600060405180830381865afa158015610fc5573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261048f91908101906117f3565b8154600183015460028401546040516305cf613160e51b81526000936001600160a01b03169263b9ec2620926110279287906004016114d6565b602060405180830381865afa158015611044573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061047391906118a3565b81546001830154600284015460405163f1d3d2f960e01b815260048101929092526024820152604481018390526000916001600160a01b03169063f1d3d2f9906064015b602060405180830381865afa1580156110c9573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061047391906116a3565b815460018301546002840154604051636204479f60e01b81526000936001600160a01b031692636204479f926110ac9287906004016114d6565b6040805160808101825260008082526020820152606091810182905281810191909152825460018401546002850154604051639e6030d160e01b815260048101929092526024820152604481018490526001600160a01b0390911690639e6030d190606401600060405180830381865afa1580156111a9573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f1916820160405261047391908101906118c0565b6000602082840312156111e357600080fd5b5035919050565b6001600160e01b03198116811461120057600080fd5b50565b60006020828403121561121557600080fd5b8135610473816111ea565b6000806040838503121561123357600080fd5b50508035926020909101359150565b6020808252825182820181905260009190848201906040850190845b8181101561127a5783518352928401929184019160010161125e565b50909695505050505050565b60008060006060848603121561129b57600080fd5b505081359360208301359350604090920135919050565b6020808252825182820181905260009190848201906040850190845b8181101561127a5783516001600160e01b031916835292840192918401916001016112ce565b6020808252825182820181905260009190848201906040850190845b8181101561127a5783516001600160a01b031683529284019291840191600101611310565b600081518084526020808501945080840160005b8381101561136f5781516001600160e01b03191687529582019590820190600101611349565b509495945050505050565b8051825260018060a01b03602082015116602083015260006040820151608060408501526113ab6080850182611335565b905060608301518482036060860152610e448282611335565b6000602080830181845280855180835260408601915060408160051b870101925083870160005b8281101561141957603f1988860301845261140785835161137a565b945092850192908501906001016113eb565b5092979650505050505050565b602081526000610473602083018461137a565b6001600160a01b038116811461120057600080fd5b60008060006060848603121561146357600080fd5b833561146e81611439565b95602085013595506040909401359392505050565b634e487b7160e01b600052604160045260246000fd5b6000600182016114b957634e487b7160e01b600052601160045260246000fd5b5060010190565b634e487b7160e01b600052603260045260246000fd5b92835260208301919091526001600160e01b031916604082015260600190565b60006020828403121561150857600080fd5b8151801515811461047357600080fd5b604051601f8201601f191681016001600160401b038111828210171561154057611540611483565b604052919050565b60006001600160401b0382111561156157611561611483565b5060051b60200190565b6000602080838503121561157e57600080fd5b82516001600160401b0381111561159457600080fd5b8301601f810185136115a557600080fd5b80516115b86115b382611548565b611518565b81815260059190911b820183019083810190878311156115d757600080fd5b928401925b828410156115f5578351825292840192908401906115dc565b979650505050505050565b600082601f83011261161157600080fd5b815160206116216115b383611548565b82815260059290921b8401810191818101908684111561164057600080fd5b8286015b84811015611664578051611657816111ea565b8352918301918301611644565b509695505050505050565b60006020828403121561168157600080fd5b81516001600160401b0381111561169757600080fd5b61048f84828501611600565b6000602082840312156116b557600080fd5b5051919050565b600060208083850312156116cf57600080fd5b82516001600160401b038111156116e557600080fd5b8301601f810185136116f657600080fd5b80516117046115b382611548565b81815260059190911b8201830190838101908783111561172357600080fd5b928401925b828410156115f557835161173b81611439565b82529284019290840190611728565b60006080828403121561175c57600080fd5b604051608081016001600160401b03828210818311171561177f5761177f611483565b81604052829350845183526020850151915061179a82611439565b81602084015260408501519150808211156117b457600080fd5b6117c086838701611600565b604084015260608501519150808211156117d957600080fd5b506117e685828601611600565b6060830152505092915050565b6000602080838503121561180657600080fd5b82516001600160401b038082111561181d57600080fd5b818501915085601f83011261183157600080fd5b815161183f6115b382611548565b81815260059190911b8301840190848101908883111561185e57600080fd5b8585015b838110156118965780518581111561187a5760008081fd5b6118888b89838a010161174a565b845250918601918601611862565b5098975050505050505050565b6000602082840312156118b557600080fd5b815161047381611439565b6000602082840312156118d257600080fd5b81516001600160401b038111156118e857600080fd5b61048f8482850161174a56fea26469706673582212206acdc66d17d6a0a8ba94865c799b574c9bb3720c0bdef7391ab698647e6c693664736f6c63430008120033";
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
        readonly inputs: readonly [];
        readonly name: "TokenIsPaused";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "TokenIsUnpaused";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "WrongSignature";
        readonly type: "error";
    }, {
        readonly inputs: readonly [];
        readonly name: "ZeroKeyNotValidForBusinessLogic";
        readonly type: "error";
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
        readonly inputs: readonly [];
        readonly name: "getConfigInfo";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "resolver_";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "configurationId_";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "version_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_facetId";
            readonly type: "bytes32";
        }];
        readonly name: "getFacet";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "id";
                readonly type: "bytes32";
            }, {
                readonly internalType: "address";
                readonly name: "addr";
                readonly type: "address";
            }, {
                readonly internalType: "bytes4[]";
                readonly name: "selectors";
                readonly type: "bytes4[]";
            }, {
                readonly internalType: "bytes4[]";
                readonly name: "interfaceIds";
                readonly type: "bytes4[]";
            }];
            readonly internalType: "struct IDiamondLoupe.Facet";
            readonly name: "facet_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes4";
            readonly name: "_selector";
            readonly type: "bytes4";
        }];
        readonly name: "getFacetAddress";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "facetAddress_";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getFacetAddresses";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "facetAddresses_";
            readonly type: "address[]";
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
        readonly name: "getFacetAddressesByPage";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "facetAddresses_";
            readonly type: "address[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes4";
            readonly name: "_selector";
            readonly type: "bytes4";
        }];
        readonly name: "getFacetIdBySelector";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "facetId_";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getFacetIds";
        readonly outputs: readonly [{
            readonly internalType: "bytes32[]";
            readonly name: "facetIds_";
            readonly type: "bytes32[]";
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
        readonly name: "getFacetIdsByPage";
        readonly outputs: readonly [{
            readonly internalType: "bytes32[]";
            readonly name: "facetIds_";
            readonly type: "bytes32[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_facetId";
            readonly type: "bytes32";
        }];
        readonly name: "getFacetSelectors";
        readonly outputs: readonly [{
            readonly internalType: "bytes4[]";
            readonly name: "facetSelectors_";
            readonly type: "bytes4[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_facetId";
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
        readonly name: "getFacetSelectorsByPage";
        readonly outputs: readonly [{
            readonly internalType: "bytes4[]";
            readonly name: "facetSelectors_";
            readonly type: "bytes4[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_facetId";
            readonly type: "bytes32";
        }];
        readonly name: "getFacetSelectorsLength";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "facetSelectorsLength_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getFacets";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "id";
                readonly type: "bytes32";
            }, {
                readonly internalType: "address";
                readonly name: "addr";
                readonly type: "address";
            }, {
                readonly internalType: "bytes4[]";
                readonly name: "selectors";
                readonly type: "bytes4[]";
            }, {
                readonly internalType: "bytes4[]";
                readonly name: "interfaceIds";
                readonly type: "bytes4[]";
            }];
            readonly internalType: "struct IDiamondLoupe.Facet[]";
            readonly name: "facets_";
            readonly type: "tuple[]";
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
        readonly name: "getFacetsByPage";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "id";
                readonly type: "bytes32";
            }, {
                readonly internalType: "address";
                readonly name: "addr";
                readonly type: "address";
            }, {
                readonly internalType: "bytes4[]";
                readonly name: "selectors";
                readonly type: "bytes4[]";
            }, {
                readonly internalType: "bytes4[]";
                readonly name: "interfaceIds";
                readonly type: "bytes4[]";
            }];
            readonly internalType: "struct IDiamondLoupe.Facet[]";
            readonly name: "facets_";
            readonly type: "tuple[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getFacetsLength";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "facetsLength_";
            readonly type: "uint256";
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
            readonly internalType: "bytes4";
            readonly name: "_interfaceId";
            readonly type: "bytes4";
        }];
        readonly name: "supportsInterface";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_newConfigurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_newVersion";
            readonly type: "uint256";
        }];
        readonly name: "updateConfig";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_newVersion";
            readonly type: "uint256";
        }];
        readonly name: "updateConfigVersion";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "contract IBusinessLogicResolver";
            readonly name: "_newResolver";
            readonly type: "address";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_newConfigurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_newVersion";
            readonly type: "uint256";
        }];
        readonly name: "updateResolver";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): DiamondFacetInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): DiamondFacet;
}
export {};
