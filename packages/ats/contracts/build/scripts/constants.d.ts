export declare const ZERO: import("ethers").BigNumber;
export declare const HASH_ZERO = "0x0000000000000000000000000000000000000000000000000000000000000000";
export declare const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";
export declare const EMPTY_STRING = "";
export declare const EMPTY_HEX_BYTES = "0x";
export declare const MAX_UINT256: bigint;
export declare const DEFAULT_PARTITION = "0x0000000000000000000000000000000000000000000000000000000000000001";
export declare const EQUITY_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000001";
export declare const BOND_CONFIG_ID = "0x0000000000000000000000000000000000000000000000000000000000000002";
export declare const CONTRACTS_DIR = "contracts";
export declare const OUTPUT_FILE = "extracted-methods.txt";
export declare const REGEX_SELECTOR: RegExp;
export declare const DEFAULT_ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export declare const CONTROL_LIST_ROLE = "0xca537e1c88c9f52dc5692c96c482841c3bea25aafc5f3bfe96f645b5f800cac3";
export declare const CORPORATE_ACTION_ROLE = "0x8a139eeb747b9809192ae3de1b88acfd2568c15241a5c4f85db0443a536d77d6";
export declare const ISSUER_ROLE = "0x4be32e8849414d19186807008dabd451c1d87dae5f8e22f32f5ce94d486da842";
export declare const DOCUMENTER_ROLE = "0x83ace103a76d3729b4ba1350ad27522bbcda9a1a589d1e5091f443e76abccf41";
export declare const CONTROLLER_ROLE = "0xa72964c08512ad29f46841ce735cff038789243c2b506a89163cc99f76d06c0f";
export declare const PAUSER_ROLE = "0x6f65556918c1422809d0d567462eafeb371be30159d74b38ac958dc58864faeb";
export declare const PAUSE_MANAGER_ROLE = "0xbc36fbd776e95c4811506a63b650c876b4159cb152d827a5f717968b67c69b84";
export declare const CAP_ROLE = "0xb60cac52541732a1020ce6841bc7449e99ed73090af03b50911c75d631476571";
export declare const SNAPSHOT_ROLE = "0x3fbb44760c0954eea3f6cb9f1f210568f5ae959dcbbef66e72f749dbaa7cc2da";
export declare const LOCKER_ROLE = "0xd8aa8c6f92fe8ac3f3c0f88216e25f7c08b3a6c374b4452a04d200c29786ce88";
export declare const ADJUSTMENT_BALANCE_ROLE = "0x6d0d63b623e69df3a6ea8aebd01f360a0250a880cbc44f7f10c49726a80a78a9";
export declare const BOND_MANAGER_ROLE = "0x8e99f55d84328dd46dd7790df91f368b44ea448d246199c88b97896b3f83f65d";
export declare const PROTECTED_PARTITIONS_ROLE = "0x8e359333991af626d1f6087d9bc57221ef1207a053860aaa78b7609c2c8f96b6";
export declare const PROTECTED_PARTITIONS_PARTICIPANT_ROLE = "0xdaba153046c65d49da6a7597abc24374aa681e3eee7004426ca6185b3927a3f5";
export declare const WILD_CARD_ROLE = "0x96658f163b67573bbf1e3f9e9330b199b3ac2f6ec0139ea95f622e20a5df2f46";
export declare const SSI_MANAGER_ROLE = "0x0995a089e16ba792fdf9ec5a4235cba5445a9fb250d6e96224c586678b81ebd0";
export declare const KYC_ROLE = "0x6fbd421e041603fa367357d79ffc3b2f9fd37a6fc4eec661aa5537a9ae75f93d";
export declare const CLEARING_ROLE = "0x2292383e7bb988fb281e5195ab88da11e62fec74cf43e8685cff613d6b906450";
export declare const CLEARING_VALIDATOR_ROLE = "0x7b688898673e16c47810f5da9ce1262a3d7d022dfe27c8ff9305371cd435c619";
export declare const _PAUSE_MANAGER_ROLE = "0xbc36fbd776e95c4811506a63b650c876b4159cb152d827a5f717968b67c69b84";
export declare const _CONTROL_LIST_MANAGER_ROLE = "0x0e625647b832ec7d4146c12550c31c065b71e0a698095568fd8320dd2aa72e75";
export declare const FREEZE_MANAGER_ROLE = "0xd0e5294c1fc630933e135c5b668c5d577576754d33964d700bbbcdbfd7e1361b";
export declare const BALANCE_ADJUSTMENT_TASK_TYPE = "0x9ce9cffaccaf68fc544ce4df9e5e2774249df2f0b3c9cf940a53a6827465db9d";
export declare const SNAPSHOT_TASK_TYPE = "0x322c4b500b27950e00c27e3a40ca8f9ffacbc81a3b4e3c9516717391fd54234c";
export declare const KYC_MANAGER_ROLE = "0x8ebae577938c1afa7fb3dc7b06459c79c86ffd2ac9805b6da92ee4cbbf080449";
export declare const INTERNAL_KYC_MANAGER_ROLE = "0x3916c5c9e68488134c2ee70660332559707c133d0a295a25971da4085441522e";
export declare const AGENT_ROLE = "0xc4aed0454da9bde6defa5baf93bb49d4690626fc243d138104e12d1def783ea6";
export declare const MATURITY_REDEEMER_ROLE = "0xa0d696902e9ed231892dc96649f0c62b808a1cb9dd1269e78e0adc1cc4b8358c";
export declare const TREX_OWNER_ROLE = "0x03ce2fdc316501dd97f5219e6ad908a3238f1e90f910aa17b627f801a6aafab7";
export declare const IS_PAUSED_ERROR_ID = "0x40";
export declare const OPERATOR_ACCOUNT_BLOCKED_ERROR_ID = "0x41";
export declare const FROM_ACCOUNT_BLOCKED_ERROR_ID = "0x42";
export declare const TO_ACCOUNT_BLOCKED_ERROR_ID = "0x43";
export declare const FROM_ACCOUNT_NULL_ERROR_ID = "0x44";
export declare const TO_ACCOUNT_NULL_ERROR_ID = "0x45";
export declare const NOT_ENOUGH_BALANCE_BLOCKED_ERROR_ID = "0x46";
export declare const IS_NOT_OPERATOR_ERROR_ID = "0x47";
export declare const WRONG_PARTITION_ERROR_ID = "0x48";
export declare const ALLOWANCE_REACHED_ERROR_ID = "0x49";
export declare const FROM_ACCOUNT_KYC_ERROR_ID = "0x50";
export declare const TO_ACCOUNT_KYC_ERROR_ID = "0x51";
export declare const CLEARING_ACTIVE_ERROR_ID = "0x52";
export declare const ADDRESS_RECOVERED_OPERATOR_ERROR_ID = "0x53";
export declare const ADDRESS_RECOVERED_FROM_ERROR_ID = "0x54";
export declare const ADDRESS_RECOVERED_TO_ERROR_ID = "0x55";
export declare const SUCCESS = "0x00";
export declare const EVENTS: {
    businessLogicResolver: {
        registered: string;
        configurationCreated: string;
    };
    equity: {
        deployed: string;
    };
    bond: {
        deployed: string;
    };
};
export declare const REGEX: {
    contractId: RegExp;
    address: RegExp;
    bytes32: RegExp;
    bytes: RegExp;
};
export declare const GAS_LIMIT: {
    max: number;
    default: number;
    low: number;
    high: number;
    initialize: {
        businessLogicResolver: number;
    };
    proxyAdmin: {
        upgrade: number;
    };
    businessLogicResolver: {
        getStaticResolverKey: number;
        registerBusinessLogics: number;
        createConfiguration: number;
    };
};
export declare const MESSAGES: {
    blockchain: {
        validateTxResponse: {
            error: string[];
        };
    };
    deploy: {
        success: string;
        error: string;
    };
    businessLogicResolver: {
        info: {
            initializing: string;
            registering: string;
            creatingConfigurations: string;
            configured: string;
        };
        error: {
            notFound: string;
            proxyNotFound: string;
            initializing: string;
            registering: string;
            creatingConfigurations: string;
        };
    };
    factory: {
        info: {
            deploying: string;
            deployed: string;
        };
    };
    timeTravel: {
        error: {
            notSupported: string;
        };
    };
};
export declare const EIP1066_CODES: {
    readonly FAILURE: "0x00";
    readonly SUCCESS: "0x01";
    readonly AWAITING_OTHERS: "0x02";
    readonly ACCEPTED: "0x03";
    readonly LOWER_LIMIT_OR_INSUFFICIENT: "0x04";
    readonly RECEIVER_ACTION_REQUESTED: "0x05";
    readonly UPPER_LIMIT: "0x06";
    readonly DUPLICATE_UNNECESSARY_OR_INAPPLICABLE: "0x08";
    readonly INFORMATIONAL_OR_METADATA: "0x0f";
    readonly DISALLOWED_OR_STOP: "0x10";
    readonly ALLOWED_OR_GO: "0x11";
    readonly AWAITING_OTHERS_PERMISSION: "0x12";
    readonly PERMISSION_REQUESTED: "0x13";
    readonly TOO_OPEN_OR_INSECURE: "0x14";
    readonly NEEDS_YOUR_PERMISSION_OR_CONTINUATION: "0x15";
    readonly REVOKED_OR_BANNED: "0x16";
    readonly NOT_APPLICABLE_TO_CURRENT_STATE: "0x18";
    readonly PERMISSION_DETAILS_OR_CONTROL_CONDITIONS: "0x1f";
    readonly NOT_FOUND_UNEQUAL_OR_OUT_OF_RANGE: "0x20";
    readonly FOUND_EQUAL_OR_IN_RANGE: "0x21";
    readonly AWAITING_MATCH: "0x22";
    readonly MATCH_REQUEST_SENT: "0x23";
    readonly BELOW_RANGE_OR_UNDERFLOW: "0x24";
    readonly REQUEST_FOR_MATCH: "0x25";
    readonly ABOVE_RANGE_OR_OVERFLOW: "0x26";
    readonly DUPLICATE_CONFLICT_OR_COLLISION: "0x28";
    readonly MATCHING_META_OR_INFO: "0x2f";
    readonly SENDER_DISAGREES_OR_NAY: "0x30";
    readonly SENDER_AGREES_OR_YEA: "0x31";
    readonly AWAITING_RATIFICATION: "0x32";
    readonly OFFER_SENT_OR_VOTED: "0x33";
    readonly QUORUM_NOT_REACHED: "0x34";
    readonly RECEIVER_RATIFICATION_REQUESTED: "0x35";
    readonly OFFER_OR_VOTE_LIMIT_REACHED: "0x36";
    readonly ALREADY_VOTED: "0x38";
    readonly NEGOTIATION_RULES_OR_PARTICIPATION_INFO: "0x3f";
    readonly UNAVAILABLE: "0x40";
    readonly AVAILABLE: "0x41";
    readonly PAUSED: "0x42";
    readonly QUEUED: "0x43";
    readonly NOT_AVAILABLE_YET: "0x44";
    readonly AWAITING_YOUR_AVAILABILITY: "0x45";
    readonly EXPIRED: "0x46";
    readonly ALREADY_DONE: "0x48";
    readonly AVAILABILITY_RULES_OR_INFO: "0x4f";
    readonly TRANSFER_FAILED: "0x50";
    readonly TRANSFER_SUCCESSFUL: "0x51";
    readonly AWAITING_PAYMENT_FROM_OTHERS: "0x52";
    readonly HOLD_OR_ESCROW: "0x53";
    readonly INSUFFICIENT_FUNDS: "0x54";
    readonly FUNDS_REQUESTED: "0x55";
    readonly TRANSFER_VOLUME_EXCEEDED: "0x56";
    readonly FUNDS_NOT_REQUIRED: "0x58";
    readonly TOKEN_OR_FINANCIAL_INFORMATION: "0x5f";
    readonly APP_SPECIFIC_FAILURE: "0xa0";
    readonly APP_SPECIFIC_SUCCESS: "0xa1";
    readonly APP_SPECIFIC_AWAITING_OTHERS: "0xa2";
    readonly APP_SPECIFIC_ACCEPTANCE: "0xa3";
    readonly APP_SPECIFIC_BELOW_CONDITION: "0xa4";
    readonly APP_SPECIFIC_RECEIVER_ACTION_REQUESTED: "0xa5";
    readonly APP_SPECIFIC_EXPIRY_OR_LIMIT: "0xa6";
    readonly APP_SPECIFIC_INAPPLICABLE_CONDITION: "0xa8";
    readonly APP_SPECIFIC_META_OR_INFO: "0xaf";
    readonly DECRYPT_FAILURE: "0xe0";
    readonly DECRYPT_SUCCESS: "0xe1";
    readonly AWAITING_OTHER_SIGNATURES_OR_KEYS: "0xe2";
    readonly SIGNED: "0xe3";
    readonly UNSIGNED_OR_UNTRUSTED: "0xe4";
    readonly SIGNATURE_REQUIRED: "0xe5";
    readonly KNOWN_TO_BE_COMPROMISED: "0xe6";
    readonly ALREADY_SIGNED_OR_NOT_ENCRYPTED: "0xe8";
    readonly CRYPTOGRAPHY_ID_OR_PROOF_METADATA: "0xef";
    readonly OFF_CHAIN_FAILURE: "0xf0";
    readonly OFF_CHAIN_SUCCESS: "0xf1";
    readonly AWAITING_OFF_CHAIN_PROCESS: "0xf2";
    readonly OFF_CHAIN_PROCESS_STARTED: "0xf3";
    readonly OFF_CHAIN_SERVICE_UNREACHABLE: "0xf4";
    readonly OFF_CHAIN_ACTION_REQUIRED: "0xf5";
    readonly OFF_CHAIN_EXPIRY_OR_LIMIT_REACHED: "0xf6";
    readonly DUPLICATE_OFF_CHAIN_REQUEST: "0xf8";
    readonly OFF_CHAIN_INFO_OR_META: "0xff";
};
