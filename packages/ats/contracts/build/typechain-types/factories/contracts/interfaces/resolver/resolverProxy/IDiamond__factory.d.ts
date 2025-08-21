import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IDiamond, IDiamondInterface } from "../../../../../contracts/interfaces/resolver/resolverProxy/IDiamond";
export declare class IDiamond__factory {
    static readonly abi: readonly [{
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
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_facetId";
            readonly type: "bytes32";
        }];
        readonly name: "getFacet";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "id";
                readonly type: "bytes32";
            }, {
                readonly internalType: "address";
                readonly name: "addr";
                readonly type: "address";
            }, {
                readonly internalType: "bytes4[]";
                readonly name: "selectors";
                readonly type: "bytes4[]";
            }, {
                readonly internalType: "bytes4[]";
                readonly name: "interfaceIds";
                readonly type: "bytes4[]";
            }];
            readonly internalType: "struct IDiamondLoupe.Facet";
            readonly name: "facet_";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes4";
            readonly name: "_selector";
            readonly type: "bytes4";
        }];
        readonly name: "getFacetAddress";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "facetAddress_";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getFacetAddresses";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "facetAddresses_";
            readonly type: "address[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getFacetAddressesByPage";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "facetAddresses_";
            readonly type: "address[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes4";
            readonly name: "_selector";
            readonly type: "bytes4";
        }];
        readonly name: "getFacetIdBySelector";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "facetId_";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getFacetIds";
        readonly outputs: readonly [{
            readonly internalType: "bytes32[]";
            readonly name: "facetIds_";
            readonly type: "bytes32[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getFacetIdsByPage";
        readonly outputs: readonly [{
            readonly internalType: "bytes32[]";
            readonly name: "facetIds_";
            readonly type: "bytes32[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_facetId";
            readonly type: "bytes32";
        }];
        readonly name: "getFacetSelectors";
        readonly outputs: readonly [{
            readonly internalType: "bytes4[]";
            readonly name: "facetSelectors_";
            readonly type: "bytes4[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_facetId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getFacetSelectorsByPage";
        readonly outputs: readonly [{
            readonly internalType: "bytes4[]";
            readonly name: "facetSelectors_";
            readonly type: "bytes4[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_facetId";
            readonly type: "bytes32";
        }];
        readonly name: "getFacetSelectorsLength";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "facetSelectorsLength_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getFacets";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "id";
                readonly type: "bytes32";
            }, {
                readonly internalType: "address";
                readonly name: "addr";
                readonly type: "address";
            }, {
                readonly internalType: "bytes4[]";
                readonly name: "selectors";
                readonly type: "bytes4[]";
            }, {
                readonly internalType: "bytes4[]";
                readonly name: "interfaceIds";
                readonly type: "bytes4[]";
            }];
            readonly internalType: "struct IDiamondLoupe.Facet[]";
            readonly name: "facets_";
            readonly type: "tuple[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getFacetsByPage";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "id";
                readonly type: "bytes32";
            }, {
                readonly internalType: "address";
                readonly name: "addr";
                readonly type: "address";
            }, {
                readonly internalType: "bytes4[]";
                readonly name: "selectors";
                readonly type: "bytes4[]";
            }, {
                readonly internalType: "bytes4[]";
                readonly name: "interfaceIds";
                readonly type: "bytes4[]";
            }];
            readonly internalType: "struct IDiamondLoupe.Facet[]";
            readonly name: "facets_";
            readonly type: "tuple[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getFacetsLength";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "facetsLength_";
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
    static createInterface(): IDiamondInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IDiamond;
}
