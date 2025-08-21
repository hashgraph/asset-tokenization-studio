import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { MockedWhitelist, MockedWhitelistInterface } from "../../../../contracts/mocks/MockedExternalWhitelist.sol/MockedWhitelist";
type MockedWhitelistConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class MockedWhitelist__factory extends ContractFactory {
    constructor(...args: MockedWhitelistConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string;
    }): Promise<MockedWhitelist>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): MockedWhitelist;
    connect(signer: Signer): MockedWhitelist__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b506101a9806100206000396000f3fe608060405234801561001057600080fd5b50600436106100415760003560e01c80638ab1d68114610046578063e43252d71461005b578063fe9fbb801461006e575b600080fd5b610059610054366004610143565b6100ae565b005b610059610069366004610143565b6100f7565b61009a61007c366004610143565b6001600160a01b031660009081526020819052604090205460ff1690565b604051901515815260200160405180910390f35b6001600160a01b038116600081815260208190526040808220805460ff19169055517fcdd2e9b91a56913d370075169cefa1602ba36be5301664f752192bb1709df7579190a250565b6001600160a01b038116600081815260208190526040808220805460ff19166001179055517fa850ae9193f515cbae8d35e8925bd2be26627fc91bce650b8652ed254e9cab039190a250565b60006020828403121561015557600080fd5b81356001600160a01b038116811461016c57600080fd5b939250505056fea2646970667358221220a1b1a3688316eaf7998be6ee7a2973576b68a6565531ea66f4d1cce498eacff764736f6c63430008120033";
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "AddedToWhitelist";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "RemovedFromWhitelist";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "account";
            readonly type: "address";
        }];
        readonly name: "addToWhitelist";
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
        readonly name: "removeFromWhitelist";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): MockedWhitelistInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): MockedWhitelist;
}
export {};
