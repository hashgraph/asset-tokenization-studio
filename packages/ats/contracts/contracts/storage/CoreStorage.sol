// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// ═══════════════════════════════════════════════════════════════════════════════
// CORE STORAGE — Centralized storage accessor for library-based diamond migration
// ═══════════════════════════════════════════════════════════════════════════════
//
// This file provides ONLY struct definitions and free function accessors for
// core infrastructure storage (Pause, AccessControl, Nonce, SSI, ProtectedPartitions,
// ControlList, KYC, and ExternalLists).
//
// NO logic, NO inheritance, NO abstract contracts — just structs and accessors.
//
// ═══════════════════════════════════════════════════════════════════════════════

import { _PAUSE_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _ACCESS_CONTROL_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _NONCE_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _SSI_MANAGEMENT_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _PROTECTED_PARTITIONS_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _CONTROL_LIST_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _KYC_STORAGE_POSITION } from "../constants/storagePositions.sol";

import { EnumerableSet } from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import { IKyc } from "../facets/features/interfaces/IKyc.sol";

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE STRUCTS
// ═══════════════════════════════════════════════════════════════════════════════

/// @dev Pause state storage
struct PauseDataStorage {
    bool paused;
}

/// @dev Role data for access control
struct RoleData {
    bytes32 roleAdmin;
    EnumerableSet.AddressSet roleMembers;
}

/// @dev Role-based access control storage
struct RoleDataStorage {
    mapping(bytes32 => RoleData) roles;
    mapping(address => EnumerableSet.Bytes32Set) memberRoles;
}

/// @dev Nonce tracking per address
struct NonceDataStorage {
    mapping(address => uint256) nonces;
}

/// @dev SSI (Self-Sovereign Identity) management storage
struct SsiManagementStorage {
    EnumerableSet.AddressSet issuerList;
    address revocationRegistry;
}

/// @dev Protected partitions storage
struct ProtectedPartitionsDataStorage {
    bool initialized;
    bool arePartitionsProtected;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractName;
    // solhint-disable-next-line var-name-mixedcase
    string DEPRECATED_contractVersion;
    // solhint-disable-next-line var-name-mixedcase
    mapping(address => uint256) DEPRECATED_nounces;
}

/// @dev Control list storage (whitelist or blacklist)
struct ControlListStorage {
    bool isWhiteList;
    bool initialized;
    EnumerableSet.AddressSet list;
}

/// @dev KYC (Know Your Customer) storage
struct KycStorage {
    mapping(address => IKyc.KycData) kyc;
    mapping(IKyc.KycStatus => EnumerableSet.AddressSet) kycAddressesByStatus;
    bool initialized;
    bool internalKycActivated;
}

/// @dev External list storage (generic, for pause/control-list/kyc management)
struct ExternalListDataStorage {
    bool initialized;
    EnumerableSet.AddressSet list;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE ACCESSOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/// @dev Access pause storage
function pauseStorage() pure returns (PauseDataStorage storage ps) {
    bytes32 pos = _PAUSE_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        ps.slot := pos
    }
}

/// @dev Access role-based access control storage
function rolesStorage() pure returns (RoleDataStorage storage roles_) {
    bytes32 pos = _ACCESS_CONTROL_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        roles_.slot := pos
    }
}

/// @dev Access nonce storage
function nonceStorage() pure returns (NonceDataStorage storage nonces_) {
    bytes32 pos = _NONCE_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        nonces_.slot := pos
    }
}

/// @dev Access SSI management storage
function ssiManagementStorage() pure returns (SsiManagementStorage storage ssiManagement_) {
    bytes32 pos = _SSI_MANAGEMENT_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        ssiManagement_.slot := pos
    }
}

/// @dev Access protected partitions storage
function protectedPartitionsStorage() pure returns (ProtectedPartitionsDataStorage storage protectedPartitions_) {
    bytes32 pos = _PROTECTED_PARTITIONS_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        protectedPartitions_.slot := pos
    }
}

/// @dev Access control list storage
function controlListStorage() pure returns (ControlListStorage storage controlList_) {
    bytes32 pos = _CONTROL_LIST_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        controlList_.slot := pos
    }
}

/// @dev Access KYC storage
function kycStorage() pure returns (KycStorage storage kyc_) {
    bytes32 pos = _KYC_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        kyc_.slot := pos
    }
}

/// @dev Generic external list accessor (for pause management, control list management, KYC management)
function externalListStorage(bytes32 _position) pure returns (ExternalListDataStorage storage externalList_) {
    // solhint-disable-next-line no-inline-assembly
    assembly {
        externalList_.slot := _position
    }
}
