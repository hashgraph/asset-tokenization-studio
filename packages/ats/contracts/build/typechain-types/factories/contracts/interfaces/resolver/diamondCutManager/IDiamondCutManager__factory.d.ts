import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { IDiamondCutManager, IDiamondCutManagerInterface } from "../../../../../contracts/interfaces/resolver/diamondCutManager/IDiamondCutManager";
export declare class IDiamondCutManager__factory {
    static readonly abi: readonly [{
        readonly inputs: readonly [];
        readonly name: "DefaultValueForConfigurationIdNotPermitted";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "facetId";
            readonly type: "bytes32";
        }];
        readonly name: "DuplicatedFacetInConfiguration";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "configurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "bytes32";
            readonly name: "facetId";
            readonly type: "bytes32";
        }];
        readonly name: "FacetIdNotRegistered";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "resolverProxyConfigurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "version";
            readonly type: "uint256";
        }];
        readonly name: "ResolverProxyConfigurationNoRegistered";
        readonly type: "error";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes4";
            readonly name: "selector";
            readonly type: "bytes4";
        }];
        readonly name: "SelectorBlacklisted";
        readonly type: "error";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "configurationId";
            readonly type: "bytes32";
        }];
        readonly name: "DiamondBatchConfigurationCanceled";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "configurationId";
            readonly type: "bytes32";
        }, {
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "id";
                readonly type: "bytes32";
            }, {
                readonly internalType: "uint256";
                readonly name: "version";
                readonly type: "uint256";
            }];
            readonly indexed: false;
            readonly internalType: "struct IDiamondCutManager.FacetConfiguration[]";
            readonly name: "facetConfigurations";
            readonly type: "tuple[]";
        }, {
            readonly indexed: false;
            readonly internalType: "bool";
            readonly name: "_isLastBatch";
            readonly type: "bool";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "version";
            readonly type: "uint256";
        }];
        readonly name: "DiamondBatchConfigurationCreated";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "bytes32";
            readonly name: "configurationId";
            readonly type: "bytes32";
        }, {
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "id";
                readonly type: "bytes32";
            }, {
                readonly internalType: "uint256";
                readonly name: "version";
                readonly type: "uint256";
            }];
            readonly indexed: false;
            readonly internalType: "struct IDiamondCutManager.FacetConfiguration[]";
            readonly name: "facetConfigurations";
            readonly type: "tuple[]";
        }, {
            readonly indexed: false;
            readonly internalType: "uint256";
            readonly name: "version";
            readonly type: "uint256";
        }];
        readonly name: "DiamondConfigurationCreated";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }];
        readonly name: "cancelBatchConfiguration";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_version";
            readonly type: "uint256";
        }];
        readonly name: "checkResolverProxyConfigurationRegistered";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }, {
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "id";
                readonly type: "bytes32";
            }, {
                readonly internalType: "uint256";
                readonly name: "version";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IDiamondCutManager.FacetConfiguration[]";
            readonly name: "_facetConfigurations";
            readonly type: "tuple[]";
        }, {
            readonly internalType: "bool";
            readonly name: "_isLastBatch";
            readonly type: "bool";
        }];
        readonly name: "createBatchConfiguration";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }, {
            readonly components: readonly [{
                readonly internalType: "bytes32";
                readonly name: "id";
                readonly type: "bytes32";
            }, {
                readonly internalType: "uint256";
                readonly name: "version";
                readonly type: "uint256";
            }];
            readonly internalType: "struct IDiamondCutManager.FacetConfiguration[]";
            readonly name: "_facetConfigurations";
            readonly type: "tuple[]";
        }];
        readonly name: "createConfiguration";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
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
        readonly name: "getConfigurations";
        readonly outputs: readonly [{
            readonly internalType: "bytes32[]";
            readonly name: "configurationIds_";
            readonly type: "bytes32[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getConfigurationsLength";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "configurationsLength_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_version";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_facetId";
            readonly type: "bytes32";
        }];
        readonly name: "getFacetAddressByConfigurationIdVersionAndFacetId";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "facetAddress_";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_version";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getFacetAddressesByConfigurationIdAndVersion";
        readonly outputs: readonly [{
            readonly internalType: "address[]";
            readonly name: "facetAddresses_";
            readonly type: "address[]";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_version";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_facetId";
            readonly type: "bytes32";
        }];
        readonly name: "getFacetByConfigurationIdVersionAndFacetId";
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
            readonly internalType: "bytes32";
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_version";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes4";
            readonly name: "_selector";
            readonly type: "bytes4";
        }];
        readonly name: "getFacetIdByConfigurationIdVersionAndSelector";
        readonly outputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "facetId_";
            readonly type: "bytes32";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_version";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getFacetIdsByConfigurationIdAndVersion";
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
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_version";
            readonly type: "uint256";
        }, {
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
        readonly name: "getFacetSelectorsByConfigurationIdVersionAndFacetId";
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
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_version";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes32";
            readonly name: "_facetId";
            readonly type: "bytes32";
        }];
        readonly name: "getFacetSelectorsLengthByConfigurationIdVersionAndFacetId";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "facetSelectorsLength_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_version";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageIndex";
            readonly type: "uint256";
        }, {
            readonly internalType: "uint256";
            readonly name: "_pageLength";
            readonly type: "uint256";
        }];
        readonly name: "getFacetsByConfigurationIdAndVersion";
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
            readonly internalType: "bytes32";
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_version";
            readonly type: "uint256";
        }];
        readonly name: "getFacetsLengthByConfigurationIdAndVersion";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "facetsLength_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }];
        readonly name: "getLatestVersionByConfiguration";
        readonly outputs: readonly [{
            readonly internalType: "uint256";
            readonly name: "latestVersion_";
            readonly type: "uint256";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_version";
            readonly type: "uint256";
        }];
        readonly name: "isResolverProxyConfigurationRegistered";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_version";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes4";
            readonly name: "_selector";
            readonly type: "bytes4";
        }];
        readonly name: "resolveResolverProxyCall";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "facetAddress_";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "bytes32";
            readonly name: "_configurationId";
            readonly type: "bytes32";
        }, {
            readonly internalType: "uint256";
            readonly name: "_version";
            readonly type: "uint256";
        }, {
            readonly internalType: "bytes4";
            readonly name: "_interfaceId";
            readonly type: "bytes4";
        }];
        readonly name: "resolveSupportsInterface";
        readonly outputs: readonly [{
            readonly internalType: "bool";
            readonly name: "exists_";
            readonly type: "bool";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }];
    static createInterface(): IDiamondCutManagerInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): IDiamondCutManager;
}
