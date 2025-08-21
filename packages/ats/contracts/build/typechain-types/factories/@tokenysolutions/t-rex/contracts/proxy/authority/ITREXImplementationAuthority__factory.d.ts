import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { ITREXImplementationAuthority, ITREXImplementationAuthorityInterface } from "../../../../../../@tokenysolutions/t-rex/contracts/proxy/authority/ITREXImplementationAuthority";
export declare class ITREXImplementationAuthority__factory {
    static readonly abi: readonly [{
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "iaFactory";
            readonly type: "address";
        }];
        readonly name: "IAFactorySet";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_token";
            readonly type: "address";
        }, {
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "_newImplementationAuthority";
            readonly type: "address";
        }];
        readonly name: "ImplementationAuthorityChanged";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: false;
            readonly internalType: "bool";
            readonly name: "referenceStatus";
            readonly type: "bool";
        }, {
            readonly indexed: false;
            readonly internalType: "address";
            readonly name: "trexFactory";
            readonly type: "address";
        }];
        readonly name: "ImplementationAuthoritySet";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly indexed: true;
            readonly internalType: "address";
            readonly name: "trexFactory";
            readonly type: "address";
        }];
        readonly name: "TREXFactorySet";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint8";
                readonly name: "major";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "minor";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "patch";
                readonly type: "uint8";
            }];
            readonly indexed: true;
            readonly internalType: "struct ITREXImplementationAuthority.Version";
            readonly name: "version";
            readonly type: "tuple";
        }, {
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "tokenImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "ctrImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "irImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "irsImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "tirImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "mcImplementation";
                readonly type: "address";
            }];
            readonly indexed: true;
            readonly internalType: "struct ITREXImplementationAuthority.TREXContracts";
            readonly name: "trex";
            readonly type: "tuple";
        }];
        readonly name: "TREXVersionAdded";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint8";
                readonly name: "major";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "minor";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "patch";
                readonly type: "uint8";
            }];
            readonly indexed: true;
            readonly internalType: "struct ITREXImplementationAuthority.Version";
            readonly name: "version";
            readonly type: "tuple";
        }, {
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "tokenImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "ctrImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "irImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "irsImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "tirImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "mcImplementation";
                readonly type: "address";
            }];
            readonly indexed: true;
            readonly internalType: "struct ITREXImplementationAuthority.TREXContracts";
            readonly name: "trex";
            readonly type: "tuple";
        }];
        readonly name: "TREXVersionFetched";
        readonly type: "event";
    }, {
        readonly anonymous: false;
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint8";
                readonly name: "major";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "minor";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "patch";
                readonly type: "uint8";
            }];
            readonly indexed: true;
            readonly internalType: "struct ITREXImplementationAuthority.Version";
            readonly name: "version";
            readonly type: "tuple";
        }];
        readonly name: "VersionUpdated";
        readonly type: "event";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint8";
                readonly name: "major";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "minor";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "patch";
                readonly type: "uint8";
            }];
            readonly internalType: "struct ITREXImplementationAuthority.Version";
            readonly name: "_version";
            readonly type: "tuple";
        }, {
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "tokenImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "ctrImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "irImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "irsImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "tirImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "mcImplementation";
                readonly type: "address";
            }];
            readonly internalType: "struct ITREXImplementationAuthority.TREXContracts";
            readonly name: "_trex";
            readonly type: "tuple";
        }];
        readonly name: "addAndUseTREXVersion";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint8";
                readonly name: "major";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "minor";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "patch";
                readonly type: "uint8";
            }];
            readonly internalType: "struct ITREXImplementationAuthority.Version";
            readonly name: "_version";
            readonly type: "tuple";
        }, {
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "tokenImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "ctrImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "irImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "irsImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "tirImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "mcImplementation";
                readonly type: "address";
            }];
            readonly internalType: "struct ITREXImplementationAuthority.TREXContracts";
            readonly name: "_trex";
            readonly type: "tuple";
        }];
        readonly name: "addTREXVersion";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "_token";
            readonly type: "address";
        }, {
            readonly internalType: "address";
            readonly name: "_newImplementationAuthority";
            readonly type: "address";
        }];
        readonly name: "changeImplementationAuthority";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint8";
                readonly name: "major";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "minor";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "patch";
                readonly type: "uint8";
            }];
            readonly internalType: "struct ITREXImplementationAuthority.Version";
            readonly name: "_version";
            readonly type: "tuple";
        }];
        readonly name: "fetchVersion";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getCTRImplementation";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint8";
                readonly name: "major";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "minor";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "patch";
                readonly type: "uint8";
            }];
            readonly internalType: "struct ITREXImplementationAuthority.Version";
            readonly name: "_version";
            readonly type: "tuple";
        }];
        readonly name: "getContracts";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "address";
                readonly name: "tokenImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "ctrImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "irImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "irsImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "tirImplementation";
                readonly type: "address";
            }, {
                readonly internalType: "address";
                readonly name: "mcImplementation";
                readonly type: "address";
            }];
            readonly internalType: "struct ITREXImplementationAuthority.TREXContracts";
            readonly name: "";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getCurrentVersion";
        readonly outputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint8";
                readonly name: "major";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "minor";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "patch";
                readonly type: "uint8";
            }];
            readonly internalType: "struct ITREXImplementationAuthority.Version";
            readonly name: "";
            readonly type: "tuple";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getIRImplementation";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getIRSImplementation";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getMCImplementation";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getReferenceContract";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getTIRImplementation";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getTREXFactory";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "getTokenImplementation";
        readonly outputs: readonly [{
            readonly internalType: "address";
            readonly name: "";
            readonly type: "address";
        }];
        readonly stateMutability: "view";
        readonly type: "function";
    }, {
        readonly inputs: readonly [];
        readonly name: "isReferenceContract";
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
            readonly name: "iaFactory";
            readonly type: "address";
        }];
        readonly name: "setIAFactory";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly internalType: "address";
            readonly name: "trexFactory";
            readonly type: "address";
        }];
        readonly name: "setTREXFactory";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }, {
        readonly inputs: readonly [{
            readonly components: readonly [{
                readonly internalType: "uint8";
                readonly name: "major";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "minor";
                readonly type: "uint8";
            }, {
                readonly internalType: "uint8";
                readonly name: "patch";
                readonly type: "uint8";
            }];
            readonly internalType: "struct ITREXImplementationAuthority.Version";
            readonly name: "_version";
            readonly type: "tuple";
        }];
        readonly name: "useTREXVersion";
        readonly outputs: readonly [];
        readonly stateMutability: "nonpayable";
        readonly type: "function";
    }];
    static createInterface(): ITREXImplementationAuthorityInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): ITREXImplementationAuthority;
}
