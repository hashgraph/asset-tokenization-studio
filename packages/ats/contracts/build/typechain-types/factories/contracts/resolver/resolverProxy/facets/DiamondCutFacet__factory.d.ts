import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { DiamondCutFacet, DiamondCutFacetInterface } from "../../../../../contracts/resolver/resolverProxy/facets/DiamondCutFacet";
type DiamondCutFacetConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class DiamondCutFacet__factory extends ContractFactory {
    constructor(...args: DiamondCutFacetConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string;
    }): Promise<DiamondCutFacet>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): DiamondCutFacet;
    connect(signer: Signer): DiamondCutFacet__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50610682806100206000396000f3fe608060405234801561001057600080fd5b506004361061006c5760003560e01c80622eeb22146100715780630b3bad61146100865780631ef2fdc81461009957806378a1bf05146100cc578063b378cf37146100f9578063c1f0d7421461010e578063e5d3a87214610116575b600080fd5b61008461007f366004610545565b610129565b005b61008461009436600461055e565b6101b4565b6040517fb66fc45b2670ed2c4ce03061121e6c8e53bce06e161f95afad8e57671b64fca881526020015b60405180910390f35b6100d4610240565b604080516001600160a01b0390941684526020840192909252908201526060016100c3565b610101610271565b6040516100c39190610580565b6101016102d7565b6100846101243660046105ce565b6103c6565b6000610135813361046d565b600061013f6104ae565b805460018201546040516362cacc9560e11b81526004810191909152602481018690529192506001600160a01b03169063c595992a90604401600060405180830381600087803b15801561019257600080fd5b505af11580156101a6573d6000803e3d6000fd5b505050506002019190915550565b60006101c0813361046d565b60006101ca6104ae565b80546040516362cacc9560e11b815260048101879052602481018690529192506001600160a01b03169063c595992a90604401600060405180830381600087803b15801561021757600080fd5b505af115801561022b573d6000803e3d6000fd5b50505050600181019390935550600290910155565b60008060008061024e6104ae565b805460018201546002909201546001600160a01b03909116969195509350915050565b604080516001808252818301909252606091602080830190803683370190505090506000632599d44d60e21b82826102a88161060f565b9350815181106102ba576102ba610636565b6001600160e01b0319909216602092830291909101909101525090565b60408051600480825260a0820190925260609160208201608080368337505081519192506001916217759160e11b9150839060009061031857610318610636565b6001600160e01b03199092166020928302919091019091015281516001820191630b3bad6160e01b91849190811061035257610352610636565b6001600160e01b031990921660209283029190910190910152815160018201916372e9d43960e11b91849190811061038c5761038c610636565b6001600160e01b031990921660209283029190910190910152815160018201916378a1bf0560e01b9184919081106102ba576102ba610636565b60006103d2813361046d565b6040516362cacc9560e11b815260048101849052602481018390526001600160a01b0385169063c595992a90604401600060405180830381600087803b15801561041b57600080fd5b505af115801561042f573d6000803e3d6000fd5b50505050600061043d6104ae565b80546001600160a01b0319166001600160a01b038716178155905060018101849055600281018390555050505050565b61047782826104d2565b6104aa5760405163a1180aad60e01b81526001600160a01b03821660048201526024810183905260440160405180910390fd5b5050565b7f4833864335c8f29dd85e3f7a36869cb90d5dc7167ae5000f7e1ce4d7c15d14ad90565b60006104ff7f4765bbd856d800638d39a79262ebc6fdfb5833d0e59f32c5d482fe4c4a3554c18484610506565b9392505050565b6001600160a01b0381166000908152600184016020526040812061053d9084600081815260018301602052604081205415156104ff565b949350505050565b60006020828403121561055757600080fd5b5035919050565b6000806040838503121561057157600080fd5b50508035926020909101359150565b6020808252825182820181905260009190848201906040850190845b818110156105c25783516001600160e01b0319168352928401929184019160010161059c565b50909695505050505050565b6000806000606084860312156105e357600080fd5b83356001600160a01b03811681146105fa57600080fd5b95602085013595506040909401359392505050565b60006001820161062f57634e487b7160e01b600052601160045260246000fd5b5060010190565b634e487b7160e01b600052603260045260246000fdfea26469706673582212209e654e069715611ae5b264eb27eb9966bf42ac4d368f7619796ac480add1cdda64736f6c63430008120033";
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
    static createInterface(): DiamondCutFacetInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): DiamondCutFacet;
}
export {};
