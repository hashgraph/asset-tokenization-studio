// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INonces, RESOLVER_KEY_NONCES } from "./INonces.sol";
import { NonceStorageWrapper } from "../../domain/core/NonceStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { InitializerStorageWrapper } from "../../domain/core/InitializerStorageWrapper.sol";

/**
 * @title Nonces
 * @author Asset Tokenization Studio Team
 * @notice Abstract contract implementing per-account nonce reads for off-chain signature schemes
 *         such as EIP-2612 permit.
 * @dev Implements `INonces`. Nonce state is stored in diamond storage via `NonceStorageWrapper`.
 *      Nonces are incremented by other facets (e.g. ERC-20 permit) after consuming a valid
 *      signature; this contract exposes only the read path. Intended to be inherited exclusively
 *      by `NoncesFacet`.
 */
abstract contract Nonces is INonces, Modifiers {
    /// @inheritdoc INonces
    function initializeNonces()
        external
        override
        onlyRole(DEFAULT_ADMIN_ROLE)
        onlyFacetNotRegistered(RESOLVER_KEY_NONCES)
    {
        InitializerStorageWrapper.setFacetToReady(RESOLVER_KEY_NONCES);
        emit NoncesInitialized();
    }

    /// @inheritdoc INonces
    function nonces(address owner) external view returns (uint256) {
        return NonceStorageWrapper.getNonceFor(owner);
    }
}
