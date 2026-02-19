// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// ═══════════════════════════════════════════════════════════════════════════════
// TOKEN STORAGE — Centralized storage accessor for ERC1400/ERC20/ERC1594 standards
// ═══════════════════════════════════════════════════════════════════════════════
//
// This file provides ONLY struct definitions and free function accessors for
// token-related storage (ERC1410, ERC20, ERC20Permit, ERC20Votes, ERC1594,
// ERC1643, ERC1644, and ERC1410 operator approvals).
//
// NO logic, NO inheritance, NO abstract contracts — just structs and accessors.
//
// ═══════════════════════════════════════════════════════════════════════════════

import { _ERC1410_BASIC_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _ERC20_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _ERC20PERMIT_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _ERC20VOTES_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _ERC1594_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _ERC1643_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _ERC1410_OPERATOR_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _ERC1644_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { IFactory } from "../factory/IFactory.sol";
import { LibCheckpoints } from "../infrastructure/lib/LibCheckpoints.sol";

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE STRUCTS
// ═══════════════════════════════════════════════════════════════════════════════

/// @dev Represents a fungible set of tokens
struct Partition {
    uint256 amount;
    bytes32 partition;
}

/// @dev ERC1410 basic token storage (partitions, balances, token holders)
/// @dev CRITICAL: Field ordering MUST match ERC1410BasicStorageWrapperRead.sol exactly
///      to preserve storage layout compatibility with deployed contracts.
struct ERC1410BasicStorage {
    uint256 totalSupply;
    mapping(bytes32 => uint256) totalSupplyByPartition;
    mapping(address => uint256) balances;
    mapping(address => Partition[]) partitions;
    mapping(address => mapping(bytes32 => uint256)) partitionToIndex;
    bool multiPartition;
    bool initialized;
    mapping(address => uint256) tokenHolderIndex;
    mapping(uint256 => address) tokenHolders;
    uint256 totalTokenHolders;
}

/// @dev ERC1410 operator approvals storage
struct ERC1410OperatorStorage {
    mapping(address => mapping(bytes32 => mapping(address => bool))) partitionApprovals;
    mapping(address => mapping(address => bool)) approvals;
}

/// @dev ERC20 metadata storage
struct ERC20Storage {
    string name;
    string symbol;
    string isin;
    uint8 decimals;
    bool initialized;
    mapping(address => mapping(address => uint256)) allowed;
    IFactory.SecurityType securityType;
}

/// @dev ERC20 Permit storage (deprecated fields only)
struct ERC20PermitStorage {
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractName;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractVersion;
    // solhint-disable-next-line var-name-mixedcase
    bool DEPRECATED_initialized;
}

/// @dev ERC20 Votes storage (delegation and checkpoint voting power)
struct ERC20VotesStorage {
    bool activated;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractName;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractVersion;
    mapping(address => address) delegates;
    mapping(address => LibCheckpoints.Checkpoint[]) checkpoints;
    LibCheckpoints.Checkpoint[] totalSupplyCheckpoints;
    LibCheckpoints.Checkpoint[] abafCheckpoints;
    bool initialized;
}

/// @dev ERC1594 issuance/redemption storage
struct ERC1594Storage {
    bool issuance;
    bool initialized;
}

/// @dev ERC1643 document storage
struct ERC1643Storage {
    mapping(bytes32 => IERC1643Document) documents;
    mapping(bytes32 => uint256) docIndexes;
    bytes32[] docNames;
}

/// @dev ERC1644 controller storage
struct ERC1644Storage {
    bool isControllable;
    bool initialized;
}

// ═══════════════════════════════════════════════════════════════════════════════
// NESTED STRUCT FOR ERC1643
// ═══════════════════════════════════════════════════════════════════════════════

/// @dev Document details for ERC1643
struct IERC1643Document {
    bytes32 docHash;
    uint256 lastModified;
    string uri;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE ACCESSOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/// @dev Access ERC1410 basic storage
function erc1410BasicStorage() pure returns (ERC1410BasicStorage storage erc1410Basic_) {
    bytes32 pos = _ERC1410_BASIC_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc1410Basic_.slot := pos
    }
}

/// @dev Access ERC1410 operator storage
function erc1410OperatorStorage() pure returns (ERC1410OperatorStorage storage erc1410Operator_) {
    bytes32 pos = _ERC1410_OPERATOR_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc1410Operator_.slot := pos
    }
}

/// @dev Access ERC20 metadata storage
function erc20Storage() pure returns (ERC20Storage storage erc20_) {
    bytes32 pos = _ERC20_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc20_.slot := pos
    }
}

/// @dev Access ERC20 Permit storage
function erc20PermitStorage() pure returns (ERC20PermitStorage storage erc20Permit_) {
    bytes32 pos = _ERC20PERMIT_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc20Permit_.slot := pos
    }
}

/// @dev Access ERC20 Votes storage
function erc20VotesStorage() pure returns (ERC20VotesStorage storage erc20Votes_) {
    bytes32 pos = _ERC20VOTES_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc20Votes_.slot := pos
    }
}

/// @dev Access ERC1594 issuance storage
function erc1594Storage() pure returns (ERC1594Storage storage erc1594_) {
    bytes32 pos = _ERC1594_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc1594_.slot := pos
    }
}

/// @dev Access ERC1643 document storage
function erc1643Storage() pure returns (ERC1643Storage storage erc1643_) {
    bytes32 pos = _ERC1643_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc1643_.slot := pos
    }
}

/// @dev Access ERC1644 controller storage
function erc1644Storage() pure returns (ERC1644Storage storage erc1644_) {
    bytes32 pos = _ERC1644_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc1644_.slot := pos
    }
}
