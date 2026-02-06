// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

// =============================================================================
// ERC1410 DIAMOND STORAGE - Used by BOTH architectures
// =============================================================================

bytes32 constant ERC1410_STORAGE_POSITION = keccak256("diamond.storage.erc1410");
bytes32 constant PAUSE_STORAGE_POSITION = keccak256("diamond.storage.pause");
bytes32 constant ACCESS_STORAGE_POSITION = keccak256("diamond.storage.access");
bytes32 constant COMPLIANCE_STORAGE_POSITION = keccak256("diamond.storage.compliance");

// Role constants
bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;
bytes32 constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");

// Default partition
bytes32 constant DEFAULT_PARTITION = keccak256("DEFAULT");

struct BasicTransferInfo {
    address to;
    uint256 value;
}

struct ERC1410Storage {
    // Token metadata
    string name;
    string symbol;
    uint8 decimals;
    uint256 totalSupply;

    // Multi-partition balances
    mapping(bytes32 => mapping(address => uint256)) partitionBalances;
    mapping(bytes32 => uint256) partitionTotalSupply;

    // Operators
    mapping(address => mapping(address => bool)) operators;
    mapping(bytes32 => mapping(address => mapping(address => bool))) partitionOperators;

    // Partitions per holder
    mapping(address => bytes32[]) holderPartitions;

    // Protected partitions
    bool protectedPartitions;
    mapping(bytes32 => bool) isProtected;
}

struct PauseStorage {
    bool paused;
}

struct AccessStorage {
    mapping(bytes32 => mapping(address => bool)) roles;
}

struct ComplianceStorage {
    bool complianceEnabled;
    mapping(address => bool) compliant;
}

// Storage accessors
function erc1410Storage() pure returns (ERC1410Storage storage s) {
    bytes32 position = ERC1410_STORAGE_POSITION;
    assembly { s.slot := position }
}

function pauseStorage() pure returns (PauseStorage storage s) {
    bytes32 position = PAUSE_STORAGE_POSITION;
    assembly { s.slot := position }
}

function accessStorage() pure returns (AccessStorage storage s) {
    bytes32 position = ACCESS_STORAGE_POSITION;
    assembly { s.slot := position }
}

function complianceStorage() pure returns (ComplianceStorage storage s) {
    bytes32 position = COMPLIANCE_STORAGE_POSITION;
    assembly { s.slot := position }
}
