import { Signer, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { Eip1066, Eip1066Interface } from "../../../../../contracts/layer_0/constants/eip1066.sol/Eip1066";
type Eip1066ConstructorParams = [signer?: Signer] | ConstructorParameters<typeof ContractFactory>;
export declare class Eip1066__factory extends ContractFactory {
    constructor(...args: Eip1066ConstructorParams);
    deploy(overrides?: Overrides & {
        from?: string;
    }): Promise<Eip1066>;
    getDeployTransaction(overrides?: Overrides & {
        from?: string;
    }): TransactionRequest;
    attach(address: string): Eip1066;
    connect(signer: Signer): Eip1066__factory;
    static readonly bytecode = "0x610dd361003a600b82828239805160001a60731461002d57634e487b7160e01b600052600060045260246000fd5b30600052607381538281f3fe730000000000000000000000000000000000000000301460806040526004361061074a5760003560e01c806382145143116103c1578063c0bb325911610200578063e490652911610125578063f25e376a116100bd578063f25e376a14610d3a578063f47c73a414610d45578063f49a159d14610d50578063f7a7183514610d5b578063f91d108114610d66578063f9c683b814610d71578063fba08d1914610d7c578063fbb7319c14610d87578063ffcb253214610d9257600080fd5b8063e490652914610cd7578063e753fd7114610ce2578063e793143814610ced578063e86a14ac14610cf8578063eb20971114610d03578063ecd1faa914610d0e578063ed3e370514610d19578063f193bba114610d24578063f1a82a9f14610d2f57600080fd5b8063d273a78811610198578063d273a78814610c74578063d321219514610c7f578063d386cfc914610c8a578063d6b41a9c14610c95578063db8a383214610ca0578063dff4682a14610cab578063e3bcf23914610cb6578063e3f4e1e114610cc1578063e405de1314610ccc57600080fd5b8063c0bb325914610c11578063c169022a14610c1c578063c985bace14610c27578063c9d9584114610c32578063ccc6d28914610c3d578063ce68271d14610c48578063d0a6d1a614610c53578063d0bdaca414610c5e578063d1496a4c14610c6957600080fd5b8063a2b57916116102e6578063aba0a2f01161027e578063aba0a2f014610bae578063ad4f3dab14610bb9578063af8f39f514610bc4578063b03ac60814610bcf578063b0e8163114610bda578063b734a54614610be5578063bc9497d314610bf0578063bdea746514610bfb578063c0a6872814610c0657600080fd5b8063a2b5791614610b4b578063a2dc236514610b56578063a311b47514610b61578063a31e1e5d14610b6c578063a477294714610b77578063a4ba4dc414610b82578063a9aad58c14610b8d578063a9c8e1d914610b98578063aa87074114610ba357600080fd5b806393bd65df1161035957806393bd65df14610ae8578063949d3ec414610af35780639547ae5814610afe5780639bcae07e14610b095780639c5e6f6a14610b145780639cb586e014610b1f5780639d9264a814610b2a578063a08961b514610b35578063a0fc86d314610b4057600080fd5b80638214514314610a85578063858a720a14610a905780638890fab114610a9b578063892b6b5c14610aa65780638cd514ac14610ab157806391100e7514610abc5780639128465514610ac757806391aa618714610ad2578063927c6e2214610add57600080fd5b806341b9eac61161058d5780636961caa0116104b2578063702b12531161044a578063702b125314610a2257806375ef1a5b14610a2d57806378754e2f14610a3857806379886ac114610a435780637a12b8db14610a4e5780637b4cf69914610a595780637e44cc0d14610a645780637f30811e14610a6f5780638143db0d14610a7a57600080fd5b80636961caa0146109c25780636b43b9c3146109cd5780636c2c70e8146109d85780636c8ef9eb146109e05780636d7400ba146109eb5780636dbfeab7146109f65780636ddf9cd114610a015780636f4c730f14610a0c5780636fcaf8db14610a1757600080fd5b806351e899421161052557806351e899421461095f5780635221aef41461096a57806352bb9f84146109755780635599d44c1461098057806356716b551461098b57806357de840b146109965780635fe1a328146109a1578063602b9eed146109ac57806366a96210146109b757600080fd5b806341b9eac6146108fc5780634324efd71461090757806344550799146109125780634479d1111461091d57806345a0c7d514610928578063463eac491461093357806347f9fc331461093e5780634956ce17146109495780634be75c971461095457600080fd5b806314601d8811610673578063399bb0be1161060b578063399bb0be146108995780633bdfc509146108a45780633c06e050146108af5780633d6bf758146108ba5780633f4ab80e146108c5578063409e5ecb146108d057806341124f47146108db578063414ac85b146108e657806341ad8e96146108f157600080fd5b806314601d8814610836578063172fdd47146108415780631a9471811461084c5780631c400e4a146108575780632332421614610862578063258060661461086d578063349a57c814610878578063383eb43614610883578063397e99d11461088e57600080fd5b80630b029a79116106e65780630b029a79146107cf5780630b870686146107de5780630bc950b6146107e95780630f17de64146107f45780630f20306d146107ff578063108aefc41461080a57806312de650a1461081557806312fd5cda14610820578063130afd791461082b57600080fd5b80630102e1f41461074f578063031dceba1461077757806303677d791461078257806304c75aa71461078d578063065e268d1461079857806306e57ce9146107a357806307757222146107ae57806307b0d8a5146107b9578063096d081d146107c4575b600080fd5b61075a60f760f81b81565b6040516001600160f81b0319909116815260200160405180910390f35b61075a601360f91b81565b61075a602760f81b81565b61075a602d60f91b81565b61075a60a560f81b81565b61075a604560f81b81565b61075a602560f81b81565b61075a601360f81b81565b61075a603160f81b81565b61075a6001600160f81b031981565b61075a604960f81b81565b61075a601760fa1b81565b61075a602b60f91b81565b61075a603b60f81b81565b61075a60ab60f81b81565b61075a60a360f81b81565b61075a602d60f81b81565b61075a60a760f81b81565b61075a603b60fa1b81565b61075a601560f91b81565b61075a600160fb1b81565b61075a600360fa1b81565b61075a600160fd1b81565b61075a602960f81b81565b61075a600f60fc1b81565b61075a603960f81b81565b61075a602b60f81b81565b61075a605560f81b81565b61075a605160f81b81565b61075a604760f81b81565b61075a60ef60f81b81565b61075a600560fc1b81565b61075a60ed60f81b81565b61075a607760f91b81565b61075a602360f91b81565b61075a60eb60f81b81565b61075a600b60fa1b81565b61075a600360f81b81565b61075a600b60f91b81565b61075a600f60fa1b81565b61075a600b60fb1b81565b61075a601160fa1b81565b61075a607160f91b81565b61075a607960f91b81565b61075a605f60f81b81565b61075a600160fc1b81565b61075a600b60f81b81565b61075a601560f81b81565b61075a601d60fb1b81565b61075a602760f91b81565b61075a60f160f81b81565b61075a600960f81b81565b61075a603560f81b81565b61075a602f60f81b81565b61075a601360fa1b81565b61075a600560fb1b81565b61075a600081565b61075a600360f91b81565b61075a607f60f91b81565b61075a604f60f81b81565b61075a601b60f91b81565b61075a602f60f91b81565b61075a600d60f91b81565b61075a60ad60f81b81565b61075a600560fd1b81565b61075a601f60f81b81565b61075a600360fb1b81565b61075a604d60f81b81565b61075a601b60f81b81565b61075a604b60f81b81565b61075a601d60f81b81565b61075a60fd60f81b81565b61075a600160f91b81565b61075a60a160f81b81565b61075a600560f81b81565b61075a600560fa1b81565b61075a601f60f91b81565b61075a603f60fa1b81565b61075a601f60fb1b81565b61075a60a960f81b81565b61075a60fb60f81b81565b61075a607560f91b81565b61075a605760f81b81565b61075a60f560f81b81565b61075a60e360f81b81565b61075a600960fa1b81565b61075a600760f81b81565b61075a602360f81b81565b61075a601560fb1b81565b61075a605360f91b81565b61075a60f960f81b81565b61075a604160f81b81565b61075a601960f81b81565b61075a600760f91b81565b61075a600760fd1b81565b61075a603360f81b81565b61075a602160f91b81565b61075a602560f91b81565b61075a607b60f91b81565b61075a605d60f81b81565b61075a601760f91b81565b61075a605160f91b81565b61075a600d60f81b81565b61075a605360f81b81565b61075a600f60f91b81565b61075a60e160f81b81565b61075a602160f81b81565b61075a605760f91b81565b61075a600960f91b81565b61075a607d60f91b81565b61075a603d60f81b81565b61075a603f60f81b81565b61075a60e760f81b81565b61075a600160fe1b81565b61075a600160f81b81565b61075a600d60fa1b81565b61075a602960f91b81565b61075a60af60f81b81565b61075a600160fa1b81565b61075a602960fa1b81565b61075a601160f91b81565b61075a60e960f81b81565b61075a600f60f81b81565b61075a601960f91b81565b61075a605960f81b81565b61075a600960fb1b81565b61075a604360f81b81565b61075a603d60fa1b81565b61075a601560fa1b81565b61075a601160f81b81565b61075a600760fb1b81565b61075a605560f91b81565b61075a603960fa1b81565b61075a603760f81b81565b61075a601760f81b81565b61075a60e560f81b81565b61075a607360f91b81565b61075a605b60f81b81565b61075a602b60fa1b81565b61075a601d60f91b81565b61075a60f360f81b81565b61075a600360fc1b81565b61075a600560f91b81565b61075a600760fa1b8156fea264697066735822122085b33b3c60731e6bf62030f97fb925b63da9f3c06427926062ee66ca3fe675a264736f6c63430008120033";
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "ABOVE_RANGE_OR_OVERFLOW";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "ACCEPTED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "ALLOWED_OR_GO";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "ALREADY_DONE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "ALREADY_SIGNED_OR_NOT_ENCRYPTED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "ALREADY_VOTED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "APP_SPECIFIC_ACCEPTANCE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "APP_SPECIFIC_AWAITING_OTHERS";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "APP_SPECIFIC_BELOW_CONDITION";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "APP_SPECIFIC_EXPIRY_OR_LIMIT";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "APP_SPECIFIC_FAILURE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "APP_SPECIFIC_INAPPLICABLE_CONDITION";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "APP_SPECIFIC_META_OR_INFO";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "APP_SPECIFIC_RECEIVER_ACTION_REQUESTED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "APP_SPECIFIC_SUCCESS";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "AVAILABILITY_RULES_OR_INFO";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "AVAILABLE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "AWAITING_MATCH";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "AWAITING_OFF_CHAIN_PROCESS";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "AWAITING_OTHERS";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "AWAITING_OTHERS_PERMISSION";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "AWAITING_OTHER_SIGNATURES_OR_KEYS";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "AWAITING_PAYMENT_FROM_OTHERS";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "AWAITING_RATIFICATION";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "AWAITING_YOUR_AVAILABILITY";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "BELOW_RANGE_OR_UNDERFLOW";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "CRYPTOGRAPHY_ID_OR_PROOF_METADATA";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "DECRYPT_FAILURE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "DECRYPT_SUCCESS";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "DISALLOWED_OR_STOP";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "DUPLICATE_CONFLICT_OR_COLLISION";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "DUPLICATE_OFF_CHAIN_REQUEST";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "DUPLICATE_UNNECESSARY_OR_INAPPLICABLE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "EXPIRED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "FAILURE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "FOUND_EQUAL_OR_IN_RANGE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "FUNDS_NOT_REQUIRED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "FUNDS_REQUESTED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "HOLD_OR_ESCROW";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "INFORMATIONAL_OR_METADATA";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "INSUFFICIENT_FUNDS";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "KNOWN_TO_BE_COMPROMISED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "LOWER_LIMIT_OR_INSUFFICIENT";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "MATCHING_META_OR_INFO";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "MATCH_REQUEST_SENT";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "NEEDS_YOUR_PERMISSION_OR_CONTINUATION";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "NEGOTIATION_RULES_OR_PARTICIPATION_INFO";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "NOT_APPLICABLE_TO_CURRENT_STATE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "NOT_AVAILABLE_YET";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "OFFER_OR_VOTE_LIMIT_REACHED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "OFFER_SENT_OR_VOTED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "OFF_CHAIN_ACTION_REQUIRED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "OFF_CHAIN_EXPIRY_OR_LIMIT_REACHED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "OFF_CHAIN_FAILURE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "OFF_CHAIN_INFO_OR_META";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "OFF_CHAIN_PROCESS_STARTED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "OFF_CHAIN_SERVICE_UNREACHABLE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "OFF_CHAIN_SUCCESS";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "PAUSED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "PERMISSION_DETAILS_OR_CONTROL_CONDITIONS";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "PERMISSION_REQUESTED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "QUEUED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "QUORUM_NOT_REACHED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RECEIVER_ACTION_REQUESTED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RECEIVER_RATIFICATION_REQUESTED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "REQUEST_FOR_MATCH";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_07";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_09";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_0A";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_0B";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_0C";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_0D";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_0E";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_17";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_19";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_1A";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_1B";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_1C";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_1D";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_1E";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_27";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_29";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_2A";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_2B";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_2C";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_2D";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_2E";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_37";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_39";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_3A";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_3B";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_3C";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_3D";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_3E";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_47";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_49";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_4A";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_4B";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_4C";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_4D";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_4E";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_57";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_59";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_5A";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_5B";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_5C";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_5D";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_5E";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_A7";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_A9";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_AA";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_AB";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_AC";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_AD";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_AE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_E7";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_E9";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_EA";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_EB";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_EC";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_ED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_EE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_F7";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_F9";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_FA";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_FB";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_FC";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_FD";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "RESERVED_FE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "REVOKED_OR_BANNED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "SENDER_AGREES_OR_YEA";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "SENDER_DISAGREES_OR_NAY";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "SIGNATURE_REQUIRED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "SIGNED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "SUCCESS";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "TOKEN_OR_FINANCIAL_INFORMATION";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "TOO_OPEN_OR_INSECURE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "TRANSFER_FAILED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "TRANSFER_SUCCESSFUL";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "TRANSFER_VOLUME_EXCEEDED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "UNAVAILABLE";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "UNSIGNED_OR_UNTRUSTED";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "UPPER_LIMIT";
        readonly outputs: readonly [{
            readonly internalType: "bytes1";
            readonly name: "";
            readonly type: "bytes1";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): Eip1066Interface;
    static connect(address: string, signerOrProvider: Signer | Provider): Eip1066;
}
export {};
