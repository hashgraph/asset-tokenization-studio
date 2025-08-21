import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { DiamondLoupeFacet, DiamondLoupeFacetInterface } from "../../../../../contracts/resolver/resolverProxy/facets/DiamondLoupeFacet";
type DiamondLoupeFacetConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class DiamondLoupeFacet__factory extends ContractFactory {
    constructor(...args: DiamondLoupeFacetConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string;
    }): Promise<DiamondLoupeFacet>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): DiamondLoupeFacet;
    connect(signer: Signer): DiamondLoupeFacet__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50611454806100206000396000f3fe608060405234801561001057600080fd5b50600436106100eb5760003560e01c80638214de3e116100925780638214de3e146101e55780639fea53e7146101f8578063b378cf371461020b578063b3fd689414610213578063bf02c5b914610226578063c1f0d74214610239578063ca1f70ec14610241578063cd25d53514610254578063e317d12f1461025c57600080fd5b806301ffc9a7146100f05780631ef2fdc81461011857806320202e6d1461014857806339a9e956146101685780633bed2f4914610188578063430720f91461019d578063662ea47d146101a55780637a070c2d146101ba575b600080fd5b6101036100fe366004610d4b565b61027c565b60405190151581526020015b60405180910390f35b7f086a1dd0b9bfa39267d1de30445a8edeb3a1f50c8a0a82c91f9dee3608e835675b60405190815260200161010f565b61015b610156366004610d68565b610295565b60405161010f9190610d8a565b61017b610176366004610dce565b6102b0565b60405161010f9190610dfa565b6101906102cd565b60405161010f9190610e3c565b61013a6102f5565b6101ad61030c565b60405161010f9190610f0c565b6101cd6101c8366004610d4b565b61032e565b6040516001600160a01b03909116815260200161010f565b61017b6101f3366004610f6e565b610341565b610190610206366004610d68565b610365565b61017b610379565b61013a610221366004610d4b565b61041b565b6101ad610234366004610d68565b61042e565b61017b610442565b61013a61024f366004610f6e565b610778565b61015b61078b565b61026f61026a366004610f6e565b6107ad565b60405161010f9190610f87565b600061028f6102896107e1565b83610805565b92915050565b60606102a96102a26107e1565b8484610880565b9392505050565b60606102c56102bd6107e1565b85858561090f565b949350505050565b606060006102d96107e1565b90506102ef8160006102ea846109ae565b610a30565b91505090565b60006103076103026107e1565b6109ae565b905090565b606060006103186107e1565b90506102ef816000610329846109ae565b610abf565b600061028f61033b6107e1565b83610b4e565b6060600061034d6107e1565b90506102a9818460006103608588610bc9565b61090f565b60606102a96103726107e1565b8484610a30565b6040805160028082526060808301845292602083019080368337019050509050600063886634d960e01b82826103ae81610fb0565b9350815181106103c0576103c0610fd7565b6001600160e01b0319909216602092830291909101909101526301ffc9a760e01b82826103ec81610fb0565b9350815181106103fe576103fe610fd7565b6001600160e01b0319909216602092830291909101909101525090565b600061028f6104286107e1565b83610c4e565b60606102a961043b6107e1565b8484610abf565b60408051600e8082526101e08201909252606091602082016101c0803683375050815191925060019163662ea47d60e01b9150839060009061048657610486610fd7565b6001600160e01b0319909216602092830291909101909101528151600182019163430720f960e01b9184919081106104c0576104c0610fd7565b6001600160e01b0319909216602092830291909101909101528151600182019163bf02c5b960e01b9184919081106104fa576104fa610fd7565b6001600160e01b0319909216602092830291909101909101528151600182019163410a6f1f60e11b91849190811061053457610534610fd7565b6001600160e01b03199092166020928302919091019091015281516001820191633287dc3b60e21b91849190811061056e5761056e610fd7565b6001600160e01b03199092166020928302919091019091015281516001820191631cd4f4ab60e11b9184919081106105a8576105a8610fd7565b6001600160e01b0319909216602092830291909101909101528151600182019163cd25d53560e01b9184919081106105e2576105e2610fd7565b6001600160e01b031990921660209283029190910190910152815160018201916320202e6d60e01b91849190811061061c5761061c610fd7565b6001600160e01b03199092166020928302919091019091015281516001820191633bed2f4960e01b91849190811061065657610656610fd7565b6001600160e01b03199092166020928302919091019091015281516001820191639fea53e760e01b91849190811061069057610690610fd7565b6001600160e01b03199092166020928302919091019091015281516001820191632cff5a2560e21b9184919081106106ca576106ca610fd7565b6001600160e01b0319909216602092830291909101909101528151600182019163e317d12f60e01b91849190811061070457610704610fd7565b6001600160e01b03199092166020928302919091019091015281516001820191637a070c2d60e01b91849190811061073e5761073e610fd7565b6001600160e01b031990921660209283029190910190910152815160018201916301ffc9a760e01b9184919081106103fe576103fe610fd7565b600061028f6107856107e1565b83610bc9565b606060006107976107e1565b90506102ef8160006107a8846109ae565b610880565b604080516080810182526000808252602082015260609181018290528181019190915261028f6107db6107e1565b83610c88565b7f4833864335c8f29dd85e3f7a36869cb90d5dc7167ae5000f7e1ce4d7c15d14ad90565b81546001830154600284015460405163099ecdbd60e41b81526000936001600160a01b0316926399ecdbd09261083f928790600401610fed565b602060405180830381865afa15801561085c573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102a9919061100d565b825460018401546002850154604051633973345f60e21b81526004810192909252602482015260448101849052606481018390526060916001600160a01b03169063e5ccd17c90608401600060405180830381865afa1580156108e7573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526102c59190810190611082565b8354600185015460028601546040516322b09d2960e11b8152600481019290925260248201526044810185905260648101849052608481018390526060916001600160a01b0316906345613a529060a401600060405180830381865afa15801561097d573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526109a59190810190611186565b95945050505050565b8054600182015460028301546040516308a6917b60e31b81526000936001600160a01b0316926345348bd8926109ef92600401918252602082015260400190565b602060405180830381865afa158015610a0c573d6000803e3d6000fd5b505050506040513d601f19601f8201168201806040525081019061028f91906111ba565b8254600184015460028501546040516308499c1b60e11b81526004810192909252602482015260448101849052606481018390526060916001600160a01b031690631093383690608401600060405180830381865afa158015610a97573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526102c591908101906111ef565b825460018401546002850154604051636118ce2b60e01b81526004810192909252602482015260448101849052606481018390526060916001600160a01b031690636118ce2b90608401600060405180830381865afa158015610b26573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526102c5919081019061131f565b8154600183015460028401546040516305cf613160e51b81526000936001600160a01b03169263b9ec262092610b88928790600401610fed565b602060405180830381865afa158015610ba5573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102a991906113cf565b81546001830154600284015460405163f1d3d2f960e01b815260048101929092526024820152604481018390526000916001600160a01b03169063f1d3d2f9906064015b602060405180830381865afa158015610c2a573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102a991906111ba565b815460018301546002840154604051636204479f60e01b81526000936001600160a01b031692636204479f92610c0d928790600401610fed565b6040805160808101825260008082526020820152606091810182905281810191909152825460018401546002850154604051639e6030d160e01b815260048101929092526024820152604481018490526001600160a01b0390911690639e6030d190606401600060405180830381865afa158015610d0a573d6000803e3d6000fd5b505050506040513d6000823e601f3d908101601f191682016040526102a991908101906113ea565b6001600160e01b031981168114610d4857600080fd5b50565b600060208284031215610d5d57600080fd5b81356102a981610d32565b60008060408385031215610d7b57600080fd5b50508035926020909101359150565b6020808252825182820181905260009190848201906040850190845b81811015610dc257835183529284019291840191600101610da6565b50909695505050505050565b600080600060608486031215610de357600080fd5b505081359360208301359350604090920135919050565b6020808252825182820181905260009190848201906040850190845b81811015610dc25783516001600160e01b03191683529284019291840191600101610e16565b6020808252825182820181905260009190848201906040850190845b81811015610dc25783516001600160a01b031683529284019291840191600101610e58565b600081518084526020808501945080840160005b83811015610eb75781516001600160e01b03191687529582019590820190600101610e91565b509495945050505050565b8051825260018060a01b0360208201511660208301526000604082015160806040850152610ef36080850182610e7d565b9050606083015184820360608601526109a58282610e7d565b6000602080830181845280855180835260408601915060408160051b870101925083870160005b82811015610f6157603f19888603018452610f4f858351610ec2565b94509285019290850190600101610f33565b5092979650505050505050565b600060208284031215610f8057600080fd5b5035919050565b6020815260006102a96020830184610ec2565b634e487b7160e01b600052604160045260246000fd5b600060018201610fd057634e487b7160e01b600052601160045260246000fd5b5060010190565b634e487b7160e01b600052603260045260246000fd5b92835260208301919091526001600160e01b031916604082015260600190565b60006020828403121561101f57600080fd5b815180151581146102a957600080fd5b604051601f8201601f191681016001600160401b038111828210171561105757611057610f9a565b604052919050565b60006001600160401b0382111561107857611078610f9a565b5060051b60200190565b6000602080838503121561109557600080fd5b82516001600160401b038111156110ab57600080fd5b8301601f810185136110bc57600080fd5b80516110cf6110ca8261105f565b61102f565b81815260059190911b820183019083810190878311156110ee57600080fd5b928401925b8284101561110c578351825292840192908401906110f3565b979650505050505050565b600082601f83011261112857600080fd5b815160206111386110ca8361105f565b82815260059290921b8401810191818101908684111561115757600080fd5b8286015b8481101561117b57805161116e81610d32565b835291830191830161115b565b509695505050505050565b60006020828403121561119857600080fd5b81516001600160401b038111156111ae57600080fd5b6102c584828501611117565b6000602082840312156111cc57600080fd5b5051919050565b80516001600160a01b03811681146111ea57600080fd5b919050565b6000602080838503121561120257600080fd5b82516001600160401b0381111561121857600080fd5b8301601f8101851361122957600080fd5b80516112376110ca8261105f565b81815260059190911b8201830190838101908783111561125657600080fd5b928401925b8284101561110c5761126c846111d3565b8252928401929084019061125b565b60006080828403121561128d57600080fd5b604051608081016001600160401b0382821081831117156112b0576112b0610f9a565b81604052829350845183526112c7602086016111d3565b602084015260408501519150808211156112e057600080fd5b6112ec86838701611117565b6040840152606085015191508082111561130557600080fd5b5061131285828601611117565b6060830152505092915050565b6000602080838503121561133257600080fd5b82516001600160401b038082111561134957600080fd5b818501915085601f83011261135d57600080fd5b815161136b6110ca8261105f565b81815260059190911b8301840190848101908883111561138a57600080fd5b8585015b838110156113c2578051858111156113a65760008081fd5b6113b48b89838a010161127b565b84525091860191860161138e565b5098975050505050505050565b6000602082840312156113e157600080fd5b6102a9826111d3565b6000602082840312156113fc57600080fd5b81516001600160401b0381111561141257600080fd5b6102c58482850161127b56fea2646970667358221220f9d308db122c774eb62ecc2cb2455ce3e6dec72bdefe32c06febf9b63181f22164736f6c63430008120033";
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
    }];
    static createInterface(): DiamondLoupeFacetInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): DiamondLoupeFacet;
}
export {};
