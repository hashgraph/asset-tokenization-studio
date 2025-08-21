import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { IdentityRegistryMock, IdentityRegistryMockInterface } from "../../../../contracts/test/identity/IdentityRegistryMock";
type IdentityRegistryMockConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class IdentityRegistryMock__factory extends ContractFactory {
    constructor(...args: IdentityRegistryMockConstructorParams);
    deploy(_isVerifiedFlag: boolean, _revertFlag: boolean, overrides?: Overrides & {
        from?: string;
    }): Promise<IdentityRegistryMock>;
    getDeployTransaction(_isVerifiedFlag: boolean, _revertFlag: boolean, overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): IdentityRegistryMock;
    connect(signer: Signer): IdentityRegistryMock__factory;
    static readonly bytecode = "0x608060405234801561001057600080fd5b5060405161023538038061023583398101604081905261002f9161006b565b6000805461ffff191692151561ff001916929092176101009115159190910217905561009e565b8051801515811461006657600080fd5b919050565b6000806040838503121561007e57600080fd5b61008783610056565b915061009560208401610056565b90509250929050565b610188806100ad6000396000f3fe608060405234801561001057600080fd5b50600436106100365760003560e01c8063b9209e331461003b578063c1194e7e14610062575b600080fd5b61004e6100493660046100da565b610096565b604051901515815260200160405180910390f35b61009461007036600461011f565b6000805461ffff191692151561ff0019169290921761010091151591909102179055565b005b60008054610100900460ff16156100cf576040516309e996a760e21b81526001600160a01b038316600482015260240160405180910390fd5b505060005460ff1690565b6000602082840312156100ec57600080fd5b81356001600160a01b038116811461010357600080fd5b9392505050565b8035801515811461011a57600080fd5b919050565b6000806040838503121561013257600080fd5b61013b8361010a565b91506101496020840161010a565b9050925092905056fea2646970667358221220dcb2ae8d79d9d7cf82f07362091b364cb65a1ee59e31c9f903b1d0f9f9d2f7db64736f6c63430008120033";
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "bool";
            readonly name: "_isVerifiedFlag";
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
            readonly name: "_userAddress";
            readonly type: "address";
        }];
        readonly name: "MockErrorVerified";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_userAddress";
            readonly type: "address";
        }];
        readonly name: "isVerified";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bool";
            readonly name: "_isVerifiedFlag";
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
    }];
    static createInterface(): IdentityRegistryMockInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IdentityRegistryMock;
}
export {};
