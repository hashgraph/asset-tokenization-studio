import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { MockedBlacklist, MockedBlacklistInterface } from "../../../../contracts/mocks/MockedExternalBlacklist.sol/MockedBlacklist";
type MockedBlacklistConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class MockedBlacklist__factory extends ContractFactory {
    constructor(...args: MockedBlacklistConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string;
    }): Promise<MockedBlacklist>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): MockedBlacklist;
    connect(signer: Signer): MockedBlacklist__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b506101aa806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c806344337ea114610046578063537df3b61461005b578063fe9fbb801461006e575b600080fd5b610059610054366004610144565b6100af565b005b610059610069366004610144565b6100fb565b61009b61007c366004610144565b6001600160a01b031660009081526020819052604090205460ff161590565b604051901515815260200160405180910390f35b6001600160a01b038116600081815260208190526040808220805460ff19166001179055517ff9b68063b051b82957fa193585681240904fed808db8b30fc5a2d2202c6ed6279190a250565b6001600160a01b038116600081815260208190526040808220805460ff19169055517f2b6bf71b58b3583add364b3d9060ebf8019650f65f5be35f5464b9cb3e4ba2d49190a250565b60006020828403121561015657600080fd5b81356001600160a01b038116811461016d57600080fd5b939250505056fea264697066735822122045e10da2a65d5fae1d9676a6ecb59792de35c8377ad799b20b03c19f15e6439564736f6c63430008120033";
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "AddedToBlacklist";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "RemovedFromBlacklist";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "addToBlacklist";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "isAuthorized";
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
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "removeFromBlacklist";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): MockedBlacklistInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): MockedBlacklist;
}
export {};
