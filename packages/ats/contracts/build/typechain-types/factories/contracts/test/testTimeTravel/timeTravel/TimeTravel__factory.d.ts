import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { TimeTravel, TimeTravelInterface } from "../../../../../contracts/test/testTimeTravel/timeTravel/TimeTravel";
type TimeTravelConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class TimeTravel__factory extends ContractFactory {
    constructor(...args: TimeTravelConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string;
    }): Promise<TimeTravel>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): TimeTravel;
    connect(signer: Signer): TimeTravel__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b5061001a4661001f565b610043565b8061053914610040576040516217e1ef60ea1b815260040160405180910390fd5b50565b61042f806100526000396000f3fe608060405234801561001057600080fd5b506004361061006d5760003560e01c80631ef2fdc8146100725780638f145250146100a7578063adb61832146100b1578063b378cf37146100b9578063c0f0f67e146100ce578063c1f0d742146100e1578063d939398c146100e9575b600080fd5b7fba344464ddfb79287323340a7abdc770d353bd7dfd2695345419903dbb9918c85b6040519081526020015b60405180910390f35b6100af6100fc565b005b610094610106565b6100c1610115565b60405161009e9190610355565b6100af6100dc3660046103a3565b61017b565b6100c1610187565b6100af6100f73660046103a3565b61027b565b610104610284565b565b60006101106102b2565b905090565b604080516001808252818301909252606091602080830190803683370190505090506000633894af0760e21b828261014c816103bc565b93508151811061015e5761015e6103e3565b6001600160e01b0319909216602092830291909101909101525090565b610184816102c7565b50565b60408051600480825260a0820190925260609160009190602082016080803683370190505091506360787b3f60e11b82826101c1816103bc565b9350815181106101d3576101d36103e3565b6001600160e01b0319909216602092830291909101909101526308f1452560e41b82826101ff816103bc565b935081518110610211576102116103e3565b6001600160e01b0319909216602092830291909101909101526356db0c1960e11b828261023d816103bc565b93508151811061024f5761024f6103e3565b6001600160e01b03199092166020928302919091019091015263364e4e6360e21b828261014c816103bc565b61018481610334565b60008080556040517f93e7a31ca0d8810d390d6a3fc6ad83d230a5677c142d9aea7331a87794d11c119190a1565b60008054156102c2575060005490565b504290565b806000036102ef576040516304b8410560e31b81526004810182905260240160405180910390fd5b600080549082905560408051828152602081018490527f42ae45afbacb5d1779b65d1bf0fe5ed8ea40e9dd166cc8b80bcb3fa2daf222a1910160405180910390a15050565b8061053914610184576040516217e1ef60ea1b815260040160405180910390fd5b6020808252825182820181905260009190848201906040850190845b818110156103975783516001600160e01b03191683529284019291840191600101610371565b50909695505050505050565b6000602082840312156103b557600080fd5b5035919050565b6000600182016103dc57634e487b7160e01b600052601160045260246000fd5b5060010190565b634e487b7160e01b600052603260045260246000fdfea26469706673582212206a8a48d1b66f029803c6972c034b7cd3748507e1b134159567a869a0e055d21a64736f6c63430008120033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "ExpirationNotReached";
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
        readonly name: "WrongChainId";
        readonly type: "error";
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
        readonly inputs: readonly [];
        readonly name: "blockTimestamp";
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
            readonly name: "newTimestamp";
            readonly type: "uint256";
        }];
        readonly name: "changeSystemTimestamp";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "chainId";
            readonly type: "uint256";
        }];
        readonly name: "checkBlockChainid";
        readonly outputs: readonly [];
        readonly stateMutability: "pure";
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
        readonly inputs: readonly [];
        readonly name: "resetSystemTimestamp";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): TimeTravelInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): TimeTravel;
}
export {};
