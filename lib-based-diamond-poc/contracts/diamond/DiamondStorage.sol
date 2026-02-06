// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

// =============================================================================
// DIAMOND STORAGE - Shared by ALL facets (both OLD and NEW architectures)
// =============================================================================

// Storage slot positions (collision-free)
bytes32 constant DIAMOND_STORAGE_POSITION = keccak256("diamond.standard.diamond.storage");
bytes32 constant PAUSE_STORAGE_POSITION = keccak256("diamond.storage.pause");
bytes32 constant ACCESS_STORAGE_POSITION = keccak256("diamond.storage.access");
bytes32 constant TOKEN_STORAGE_POSITION = keccak256("diamond.storage.token");

// Role constants
bytes32 constant DEFAULT_ADMIN_ROLE = 0x00;
bytes32 constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
bytes32 constant MINTER_ROLE = keccak256("MINTER_ROLE");

// =============================================================================
// STORAGE STRUCTS
// =============================================================================

struct DiamondStorage {
    mapping(bytes4 => address) selectorToFacet;
    bytes4[] selectors;
    mapping(bytes4 => uint256) selectorToIndex;
}

struct PauseStorage {
    bool paused;
}

struct AccessStorage {
    mapping(bytes32 => mapping(address => bool)) roles;
}

struct TokenStorage {
    string name;
    string symbol;
    uint8 decimals;
    uint256 totalSupply;
    mapping(address => uint256) balances;
    mapping(address => mapping(address => uint256)) allowances;
}

// =============================================================================
// STORAGE ACCESSORS (free functions - usable by both architectures)
// =============================================================================

function diamondStorage() pure returns (DiamondStorage storage ds) {
    bytes32 position = DIAMOND_STORAGE_POSITION;
    assembly { ds.slot := position }
}

function pauseStorage() pure returns (PauseStorage storage ps) {
    bytes32 position = PAUSE_STORAGE_POSITION;
    assembly { ps.slot := position }
}

function accessStorage() pure returns (AccessStorage storage acs) {
    bytes32 position = ACCESS_STORAGE_POSITION;
    assembly { acs.slot := position }
}

function tokenStorage() pure returns (TokenStorage storage ts) {
    bytes32 position = TOKEN_STORAGE_POSITION;
    assembly { ts.slot := position }
}
