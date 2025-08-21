import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ISecurity, ISecurityInterface } from "../../../../contracts/layer_3/interfaces/ISecurity";
export declare class ISecurity__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getSecurityHolders";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "holders_";
            readonly type: "address[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getSecurityRegulationData";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly components: readonly [{
                    readonly internalType: "enum RegulationType";
                    readonly name: "regulationType";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "enum RegulationSubType";
                    readonly name: "regulationSubType";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "dealSize";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "enum AccreditedInvestors";
                    readonly name: "accreditedInvestors";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "uint256";
                    readonly name: "maxNonAccreditedInvestors";
                    readonly type: "uint256";
                }, {
                    readonly internalType: "enum ManualInvestorVerification";
                    readonly name: "manualInvestorVerification";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "enum InternationalInvestors";
                    readonly name: "internationalInvestors";
                    readonly type: "uint8";
                }, {
                    readonly internalType: "enum ResaleHoldPeriod";
                    readonly name: "resaleHoldPeriod";
                    readonly type: "uint8";
                }];
                readonly internalType: "struct RegulationData";
                readonly name: "regulationData";
                readonly type: "tuple";
            }, {
                readonly components: readonly [{
                    readonly internalType: "bool";
                    readonly name: "countriesControlListType";
                    readonly type: "bool";
                }, {
                    readonly internalType: "string";
                    readonly name: "listOfCountries";
                    readonly type: "string";
                }, {
                    readonly internalType: "string";
                    readonly name: "info";
                    readonly type: "string";
                }];
                readonly internalType: "struct AdditionalSecurityData";
                readonly name: "additionalSecurityData";
                readonly type: "tuple";
            }];
            readonly internalType: "struct ISecurity.SecurityRegulationData";
            readonly name: "securityRegulationData_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getTotalSecurityHolders";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): ISecurityInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ISecurity;
}
