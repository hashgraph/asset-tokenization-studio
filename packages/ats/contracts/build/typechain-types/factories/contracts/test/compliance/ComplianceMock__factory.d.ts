import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { ComplianceMock, ComplianceMockInterface } from "../../../../contracts/test/compliance/ComplianceMock";
type ComplianceMockConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class ComplianceMock__factory extends ContractFactory {
    constructor(...args: ComplianceMockConstructorParams);
    deploy(_canTransferFlag: boolean, _revertFlag: boolean, overrides?: Overrides & {
        from?: string;
    }): Promise<ComplianceMock>;
    getDeployTransaction(_canTransferFlag: boolean, _revertFlag: boolean, overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): ComplianceMock;
    connect(signer: Signer): ComplianceMock__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b50604051610bb7380380610bb783398101604081905261002f916101a7565b61018b82827f6815eee1f4ee39d95cc634f7365602353b0df69f7c2926920d5b1f8c9cc41db3805492151560ff1993841681179091557f9cf0e9da4389dddf6c99f5fc4c960bb9341c4f783d0205325aa07fd6636fc29680548416821790557f53a125b58448203ee6d9b507d2e1c8e9d5ef7d373329de15c45afc568d43520d80548416909117905560046020527f9d68433e826043aa85032e8a675181e9a1c17d8e36c97dd50c0cafd2cee0a47b8054911515918316821790557fdad00cc4b5922f31a620bb326a9d3bbe3d3ba7ddac5babf84086f5fc28896e9680548316821790557f0c395b4b71d68803fdbdfcec79ffbe6fbd32c0b2789ec837d7fc17b4d850e24b80548316821790557fa61555d5df768e42e6fd0b123b3ecf0d97b3c9e2a9fc28c3a3070f275ef2e4566000527f9543d146ac94da53123c627ee580f227774ae057ee5868f899769e50f6a680548054909216179055565b50506101da565b805180151581146101a257600080fd5b919050565b600080604083850312156101ba57600080fd5b6101c383610192565b91506101d160208401610192565b90509250929050565b6109ce806101e96000396000f3fe608060405234801561001057600080fd5b50600436106100835760003560e01c806329abd82e146100885780635a61e0a5146100a45780635f8dead3146100ad5780638baf29b4146100c25780638d2ea772146100d5578063c1194e7e146100e8578063e46638e61461024d578063e98940a114610270578063f3ff925214610283575b600080fd5b61009160015481565b6040519081526020015b60405180910390f35b61009160005481565b6100c06100bb3660046106a9565b61028c565b005b6100c06100d03660046106d3565b610326565b6100c06100e33660046106a9565b6103af565b6100c06100f636600461071f565b7f6815eee1f4ee39d95cc634f7365602353b0df69f7c2926920d5b1f8c9cc41db3805492151560ff1993841681179091557f9cf0e9da4389dddf6c99f5fc4c960bb9341c4f783d0205325aa07fd6636fc29680548416821790557f53a125b58448203ee6d9b507d2e1c8e9d5ef7d373329de15c45afc568d43520d80548416909117905560046020527f9d68433e826043aa85032e8a675181e9a1c17d8e36c97dd50c0cafd2cee0a47b8054911515918316821790557fdad00cc4b5922f31a620bb326a9d3bbe3d3ba7ddac5babf84086f5fc28896e9680548316821790557f0c395b4b71d68803fdbdfcec79ffbe6fbd32c0b2789ec837d7fc17b4d850e24b80548316821790557fa61555d5df768e42e6fd0b123b3ecf0d97b3c9e2a9fc28c3a3070f275ef2e4566000527f9543d146ac94da53123c627ee580f227774ae057ee5868f899769e50f6a680548054909216179055565b61026061025b3660046106d3565b61043c565b604051901515815260200161009b565b6100c061027e36600461088a565b61058d565b61009160025481565b7f76253669260cf524e3db8d89857f289f85025242f93be69d3ee9d2847880376860005260046020527fdad00cc4b5922f31a620bb326a9d3bbe3d3ba7ddac5babf84086f5fc28896e965460ff161561030f57604051630b4e233960e01b81526001600160a01b0383166004820152602481018290526044015b60405180910390fd5b60016000815461031e90610937565b909155505050565b7f6d9625130a25cfb39370cebdb8f6b8cfd41b31f1f48adfcc7eb55fb0a3df29d660005260046020527f9d68433e826043aa85032e8a675181e9a1c17d8e36c97dd50c0cafd2cee0a47b5460ff16156103985782828260405163b361830d60e01b81526004016103069392919061095e565b60008081546103a690610937565b90915550505050565b7f52a9fe8aabf21104327134612ceb7cb576fcc51ecd5c84b47a18e763fcec628f60005260046020527f0c395b4b71d68803fdbdfcec79ffbe6fbd32c0b2789ec837d7fc17b4d850e24b5460ff161561042d576040516304aacecf60e21b81526001600160a01b038316600482015260248101829052604401610306565b60026000815461031e90610937565b7fa61555d5df768e42e6fd0b123b3ecf0d97b3c9e2a9fc28c3a3070f275ef2e456600090815260046020527f9543d146ac94da53123c627ee580f227774ae057ee5868f899769e50f6a680545460ff16156104b0578383836040516363aa11b760e11b81526004016103069392919061095e565b6001600160a01b03841615610519577f45a915e4d060149eb4365960e6a7a45f334393093061116b197e3240065ff2d860005260036020527f6815eee1f4ee39d95cc634f7365602353b0df69f7c2926920d5b1f8c9cc41db35460ff1661051957506000610586565b6001600160a01b03831615610582577f1b56e27094b67facb247d55c7c05912fc4cbffd28f63f412fcdd194991f8db4860005260036020527f9cf0e9da4389dddf6c99f5fc4c960bb9341c4f783d0205325aa07fd6636fc2965460ff1661058257506000610586565b5060015b9392505050565b60005b8451811015610609578481815181106105ab576105ab610982565b6020026020010151600360008684815181106105c9576105c9610982565b6020026020010151815260200190815260200160002060006101000a81548160ff021916908315150217905550808061060190610937565b915050610590565b5060005b82518110156106865782818151811061062857610628610982565b60200260200101516004600084848151811061064657610646610982565b6020026020010151815260200190815260200160002060006101000a81548160ff021916908315150217905550808061067e90610937565b91505061060d565b5050505050565b80356001600160a01b03811681146106a457600080fd5b919050565b600080604083850312156106bc57600080fd5b6106c58361068d565b946020939093013593505050565b6000806000606084860312156106e857600080fd5b6106f18461068d565b92506106ff6020850161068d565b9150604084013590509250925092565b803580151581146106a457600080fd5b6000806040838503121561073257600080fd5b61073b8361070f565b91506107496020840161070f565b90509250929050565b634e487b7160e01b600052604160045260246000fd5b604051601f8201601f1916810167ffffffffffffffff8111828210171561079157610791610752565b604052919050565b600067ffffffffffffffff8211156107b3576107b3610752565b5060051b60200190565b600082601f8301126107ce57600080fd5b813560206107e36107de83610799565b610768565b82815260059290921b8401810191818101908684111561080257600080fd5b8286015b84811015610824576108178161070f565b8352918301918301610806565b509695505050505050565b600082601f83011261084057600080fd5b813560206108506107de83610799565b82815260059290921b8401810191818101908684111561086f57600080fd5b8286015b848110156108245780358352918301918301610873565b600080600080608085870312156108a057600080fd5b843567ffffffffffffffff808211156108b857600080fd5b6108c4888389016107bd565b955060208701359150808211156108da57600080fd5b6108e68883890161082f565b945060408701359150808211156108fc57600080fd5b610908888389016107bd565b9350606087013591508082111561091e57600080fd5b5061092b8782880161082f565b91505092959194509250565b60006001820161095757634e487b7160e01b600052601160045260246000fd5b5060010190565b6001600160a01b039384168152919092166020820152604081019190915260600190565b634e487b7160e01b600052603260045260246000fdfea264697066735822122047bba6a8437ba17964170b79c0a8f82ea1ea7599e6bf3893eb8a6aa3c16035f364736f6c63430008120033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "bool";
            readonly name: "_canTransferFlag";
            readonly type: "bool";
        }, {
            readonly internalType: "bool";
            readonly name: "_revertFlag";
            readonly type: "bool";
        }];
        readonly stateMutability: "nonpayable";
        readonly type: "constructor";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_from";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "MockErrorBurn";
        readonly type: "error";
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
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "MockErrorCanTransfer";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_to";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "MockErrorMint";
        readonly type: "error";
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
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "MockErrorTransfer";
        readonly type: "error";
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
            readonly name: "_amount";
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
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "created";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "createdHit";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_from";
            readonly type: "address";
        }, {
            readonly internalType: "uint256";
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "destroyed";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "destroyedHit";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bool";
            readonly name: "_canTransferFlag";
            readonly type: "bool";
        }, {
            readonly internalType: "bool";
            readonly name: "_revertFlag";
            readonly type: "bool";
        }];
        readonly name: "setFlags";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bool[]";
            readonly name: "_canTransferFlag";
            readonly type: "bool[]";
        }, {
            readonly internalType: "bytes32[]";
            readonly name: "_canTransferKey";
            readonly type: "bytes32[]";
        }, {
            readonly internalType: "bool[]";
            readonly name: "_revertFlag";
            readonly type: "bool[]";
        }, {
            readonly internalType: "bytes32[]";
            readonly name: "_revertKey";
            readonly type: "bytes32[]";
        }];
        readonly name: "setFlagsByMethod";
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
            readonly name: "_amount";
            readonly type: "uint256";
        }];
        readonly name: "transferred";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "transferredHit";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): ComplianceMockInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ComplianceMock;
}
export {};
