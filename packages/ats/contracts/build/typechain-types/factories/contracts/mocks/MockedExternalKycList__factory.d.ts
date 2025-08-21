import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { MockedExternalKycList, MockedExternalKycListInterface } from "../../../contracts/mocks/MockedExternalKycList";
type MockedExternalKycListConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class MockedExternalKycList__factory extends ContractFactory {
    constructor(...args: MockedExternalKycListConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string;
    }): Promise<MockedExternalKycList>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): MockedExternalKycList;
    connect(signer: Signer): MockedExternalKycList__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b506101d3806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80631228319114610046578063be88ff491461005b578063bef498131461009d575b600080fd5b610059610054366004610145565b6100b0565b005b610087610069366004610145565b6001600160a01b031660009081526020819052604090205460ff1690565b6040516100949190610175565b60405180910390f35b6100596100ab366004610145565b6100f9565b6001600160a01b038116600081815260208190526040808220805460ff19169055517ff1c17763556df78bc208351a44a3321884a234d46c5f9a055d0bf24740f5745c9190a250565b6001600160a01b038116600081815260208190526040808220805460ff19166001179055517f33653a691ed9b70652580828a39004dea3874a9991033514ea132272b4b57eab9190a250565b60006020828403121561015757600080fd5b81356001600160a01b038116811461016e57600080fd5b9392505050565b602081016002831061019757634e487b7160e01b600052602160045260246000fd5b9190529056fea2646970667358221220dd96573fe373f9feaa074a9bc3efbaac47d647d1efcfa20c6e8a0d639a2d8d5864736f6c63430008120033";
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "account";
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
        }];
        readonly name: "KycRevoked";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "getKycStatus";
        readonly outputs: readonly [{
            readonly internalType: "enum IKyc.KycStatus";
            readonly name: "";
            readonly type: "uint8";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "grantKyc";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "revokeKyc";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): MockedExternalKycListInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): MockedExternalKycList;
}
export {};
