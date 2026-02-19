// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// ═══════════════════════════════════════════════════════════════════════════════
// EXTERNAL STORAGE — Centralized storage accessor for library-based diamond migration
// ═══════════════════════════════════════════════════════════════════════════════
//
// This file provides ONLY struct definitions and free function accessors for
// external-facing storage (ERC3643, ResolverProxy, ProceedRecipients).
//
// NO logic, NO inheritance, NO abstract contracts — just structs and accessors.
//
// ═══════════════════════════════════════════════════════════════════════════════

import { _ERC3643_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _RESOLVER_PROXY_STORAGE_POSITION } from "../constants/storagePositions.sol";
import { _PROCEED_RECIPIENTS_DATA_STORAGE_POSITION } from "../constants/storagePositions.sol";

import { IERC3643Management } from "../facets/features/interfaces/ERC3643/IERC3643Management.sol";
import { IBusinessLogicResolver } from "../infrastructure/interfaces/IBusinessLogicResolver.sol";

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE STRUCTS
// ═══════════════════════════════════════════════════════════════════════════════

/// @dev ResolverProxy storage for diamond pattern state
struct ResolverProxyStorage {
    IBusinessLogicResolver resolver;
    bytes32 resolverProxyConfigurationId;
    uint256 version;
}

/// @dev Facet ID and selector position mapping
struct FacetIdsAndSelectorPosition {
    bytes32 facetId;
    uint16 selectorPosition;
}

/// @dev Proceed recipients data storage (mapping of addresses to data)
struct ProceedRecipientsDataStorage {
    mapping(address => bytes) proceedRecipientData;
}

// ═══════════════════════════════════════════════════════════════════════════════
// STORAGE ACCESSOR FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/// @dev Access ERC3643 storage
function erc3643Storage() pure returns (IERC3643Management.ERC3643Storage storage erc3643_) {
    bytes32 pos = _ERC3643_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        erc3643_.slot := pos
    }
}

/// @dev Access resolver proxy storage
function resolverProxyStorage() pure returns (ResolverProxyStorage storage resolverProxy_) {
    bytes32 pos = _RESOLVER_PROXY_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        resolverProxy_.slot := pos
    }
}

/// @dev Access proceed recipients data storage
function proceedRecipientsDataStorage() pure returns (ProceedRecipientsDataStorage storage proceedRecipientsData_) {
    bytes32 pos = _PROCEED_RECIPIENTS_DATA_STORAGE_POSITION;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        proceedRecipientsData_.slot := pos
    }
}
