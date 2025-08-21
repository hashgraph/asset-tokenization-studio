import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { DefaultCompliance, DefaultComplianceInterface } from "../../../../../../@tokenysolutions/t-rex/contracts/compliance/legacy/DefaultCompliance";
type DefaultComplianceConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class DefaultCompliance__factory extends ContractFactory {
    constructor(...args: DefaultComplianceConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string;
    }): Promise<DefaultCompliance>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): DefaultCompliance;
    connect(signer: Signer): DefaultCompliance__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b5061001a3361001f565b61006f565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b610b518061007e6000396000f3fe608060405234801561001057600080fd5b50600436106100eb5760003560e01c80638d2ea772116100925780638d2ea772146101535780638da5cb5b1461019357806393e62f07146101ad57806397a6278e146101c0578063993e8b95146101d3578063cdde2932146101e6578063e46638e6146101f9578063f2fde38b14610210578063ff3e69541461022357600080fd5b80631ffbb064146100f0578063346531fa146101185780633ff5aa021461012b57806340db3b50146101405780635f8dead314610153578063715018a61461016557806384e798421461016d5780638baf29b414610180575b600080fd5b6101036100fe3660046109ef565b610236565b60405190151581526020015b60405180910390f35b6101036101263660046109ef565b610249565b61013e6101393660046109ef565b6102f5565b005b61013e61014e3660046109ef565b6103b4565b61013e610161366004610a11565b5050565b61013e610497565b61013e61017b3660046109ef565b6104ab565b61013e61018e366004610a3b565b505050565b6000546001600160a01b03165b60405161010f9190610a77565b6003546101a0906001600160a01b031681565b61013e6101ce3660046109ef565b61051b565b6101036101e13660046109ef565b61058b565b61013e6101f43660046109ef565b6105ab565b610103610207366004610a3b565b60019392505050565b61013e61021e3660046109ef565b61066b565b61013e6102313660046109ef565b6106e4565b60006102436001836107a8565b92915050565b6001600160a01b03811660009081526002602052604081205460ff161580156102e057506003546040516307feec1960e21b81526001600160a01b0390911690631ffbb0649061029d908590600401610a77565b602060405180830381865afa1580156102ba573d6000803e3d6000fd5b505050506040513d601f19601f820116820180604052508101906102de9190610a8b565b155b156102ed57506000919050565b506001919050565b336103086000546001600160a01b031690565b6001600160a01b0316148061033957506003546001600160a01b03161580156103395750336001600160a01b038216145b61035e5760405162461bcd60e51b815260040161035590610aad565b60405180910390fd5b600380546001600160a01b0319166001600160a01b0383161790556040517f2de35142b19ed5a07796cf30791959c592018f70b1d2d7c460eef8ffe713692b906103a9908390610a77565b60405180910390a150565b336103c76000546001600160a01b031690565b6001600160a01b031614806103e45750336001600160a01b038216145b6104005760405162461bcd60e51b815260040161035590610aad565b6003546001600160a01b038281169116146104575760405162461bcd60e51b8152602060048201526017602482015276151a1a5cc81d1bdad95b881a5cc81b9bdd08189bdd5b99604a1b6044820152606401610355565b600380546001600160a01b03191690556040517f28a4ca7134a3b3f9aff286e79ad3daadb4a06d1b43d037a3a98bdc074edd9b7a906103a9908390610a77565b61049f61082b565b6104a96000610885565b565b6104b361082b565b6001600160a01b0381166104d95760405162461bcd60e51b815260040161035590610ae4565b6104e46001826108d5565b6040516001600160a01b038216907ff68e73cec97f2d70aa641fb26e87a4383686e2efacb648f2165aeb02ac562ec590600090a250565b61052361082b565b6001600160a01b0381166105495760405162461bcd60e51b815260040161035590610ae4565b610554600182610951565b6040516001600160a01b038216907fed9c8ad8d5a0a66898ea49d2956929c93ae2e8bd50281b2ed897c5d1a6737e0b90600090a250565b6003546000906001600160a01b038381169116146102ed57506000919050565b6105b361082b565b6001600160a01b03811660009081526002602052604090205460ff1661061b5760405162461bcd60e51b815260206004820181905260248201527f54686973204167656e74206973206e6f742072656769737465726564207965746044820152606401610355565b6001600160a01b03811660009081526002602052604090819020805460ff19169055517f6a659bb87bb23efbdc295f8eed8ae8c4379bfb77660ced2ef0f3d7d26b05c6a6906103a9908390610a77565b61067361082b565b6001600160a01b0381166106d85760405162461bcd60e51b815260206004820152602660248201527f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160448201526564647265737360d01b6064820152608401610355565b6106e181610885565b50565b6106ec61082b565b6001600160a01b03811660009081526002602052604090205460ff16156107555760405162461bcd60e51b815260206004820181905260248201527f54686973204167656e7420697320616c726561647920726567697374657265646044820152606401610355565b6001600160a01b03811660009081526002602052604090819020805460ff19166001179055517fd62c45e13ac30396aceb3ad37c89bd1ba9048032fe61679000e92eb93dbfd67d906103a9908390610a77565b60006001600160a01b03821661080b5760405162461bcd60e51b815260206004820152602260248201527f526f6c65733a206163636f756e7420697320746865207a65726f206164647265604482015261737360f01b6064820152608401610355565b506001600160a01b03166000908152602091909152604090205460ff1690565b6000546001600160a01b031633146104a95760405162461bcd60e51b815260206004820181905260248201527f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726044820152606401610355565b600080546001600160a01b038381166001600160a01b0319831681178455604051919092169283917f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e09190a35050565b6108df82826107a8565b1561092c5760405162461bcd60e51b815260206004820152601f60248201527f526f6c65733a206163636f756e7420616c72656164792068617320726f6c65006044820152606401610355565b6001600160a01b0316600090815260209190915260409020805460ff19166001179055565b61095b82826107a8565b6109b15760405162461bcd60e51b815260206004820152602160248201527f526f6c65733a206163636f756e7420646f6573206e6f74206861766520726f6c6044820152606560f81b6064820152608401610355565b6001600160a01b0316600090815260209190915260409020805460ff19169055565b80356001600160a01b03811681146109ea57600080fd5b919050565b600060208284031215610a0157600080fd5b610a0a826109d3565b9392505050565b60008060408385031215610a2457600080fd5b610a2d836109d3565b946020939093013593505050565b600080600060608486031215610a5057600080fd5b610a59846109d3565b9250610a67602085016109d3565b9150604084013590509250925092565b6001600160a01b0391909116815260200190565b600060208284031215610a9d57600080fd5b81518015158114610a0a57600080fd5b6020808252601c908201527f6f6e6c79206f776e6572206f7220746f6b656e2063616e2063616c6c00000000604082015260600190565b6020808252601f908201527f696e76616c696420617267756d656e74202d207a65726f20616464726573730060408201526060019056fea264697066735822122062c7d66a5b73713df34c162047e173dd97333575be38027e00ced6f42ae811ed64736f6c63430008110033";
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_agent";
            readonly type: "address";
        }];
        readonly name: "AgentAdded";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_agent";
            readonly type: "address";
        }];
        readonly name: "AgentRemoved";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "previousOwner";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "newOwner";
            readonly type: "address";
        }];
        readonly name: "OwnershipTransferred";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_agentAddress";
            readonly type: "address";
        }];
        readonly name: "TokenAgentAdded";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_agentAddress";
            readonly type: "address";
        }];
        readonly name: "TokenAgentRemoved";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_token";
            readonly type: "address";
        }];
        readonly name: "TokenBound";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "_token";
            readonly type: "address";
        }];
        readonly name: "TokenUnbound";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_agent";
            readonly type: "address";
        }];
        readonly name: "addAgent";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_agentAddress";
            readonly type: "address";
        }];
        readonly name: "addTokenAgent";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_token";
            readonly type: "address";
        }];
        readonly name: "bindToken";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly name: "canTransfer";
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
            readonly name: "_to";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_value";
            readonly type: "uint256";
        }];
        readonly name: "created";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_from";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_value";
            readonly type: "uint256";
        }];
        readonly name: "destroyed";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_agent";
            readonly type: "address";
        }];
        readonly name: "isAgent";
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
            readonly name: "_agentAddress";
            readonly type: "address";
        }];
        readonly name: "isTokenAgent";
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
            readonly name: "_token";
            readonly type: "address";
        }];
        readonly name: "isTokenBound";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "owner";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_agent";
            readonly type: "address";
        }];
        readonly name: "removeAgent";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_agentAddress";
            readonly type: "address";
        }];
        readonly name: "removeTokenAgent";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "renounceOwnership";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "tokenBound";
        readonly outputs: readonly [{
            readonly internalType: "contract IToken";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "newOwner";
            readonly type: "address";
        }];
        readonly name: "transferOwnership";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_from";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "_to";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_value";
            readonly type: "uint256";
        }];
        readonly name: "transferred";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_token";
            readonly type: "address";
        }];
        readonly name: "unbindToken";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): DefaultComplianceInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): DefaultCompliance;
}
export {};
