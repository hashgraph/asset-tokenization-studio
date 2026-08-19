// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { INonces, RESOLVER_KEY_NONCES } from "./INonces.sol";
import {
    NONCE_KEY_PROTECTED_TRANSFER_FROM_BY_PARTITION,
    NONCE_KEY_PROTECTED_REDEEM_FROM_BY_PARTITION
} from "../../facets/protectedByPartition/IProtectedByPartition.sol";
import {
    NONCE_KEY_PROTECTED_CLEARING_TRANSFER_BY_PARTITION,
    NONCE_KEY_PROTECTED_CLEARING_REDEEM_BY_PARTITION,
    NONCE_KEY_PROTECTED_CLEARING_CREATE_HOLD_BY_PARTITION
} from "../../facets/protectedClearingByPartition/IProtectedClearingByPartition.sol";
import {
    NONCE_KEY_PROTECTED_CREATE_HOLD_BY_PARTITION
} from "../../facets/protectedHoldByPartition/IProtectedHoldByPartition.sol";
import { NonceStorageWrapper } from "../../domain/core/NonceStorageWrapper.sol";
import { Modifiers } from "../../services/Modifiers.sol";
import { DEFAULT_ADMIN_ROLE } from "../../constants/roles.sol";
import { EMPTY_BYTES32 } from "../../constants/values.sol";
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
    function nonces(address _owner) external view override returns (uint256) {
        return NonceStorageWrapper.getNonceFor(_owner, EMPTY_BYTES32);
    }

    /// @inheritdoc INonces
    function protectedTransferFromByPartitionNonce(address _owner) external view override returns (uint256) {
        return NonceStorageWrapper.getNonceFor(_owner, NONCE_KEY_PROTECTED_TRANSFER_FROM_BY_PARTITION);
    }

    /// @inheritdoc INonces
    function protectedRedeemFromByPartitionNonce(address _owner) external view override returns (uint256) {
        return NonceStorageWrapper.getNonceFor(_owner, NONCE_KEY_PROTECTED_REDEEM_FROM_BY_PARTITION);
    }

    /// @inheritdoc INonces
    function protectedCreateHoldByPartitionNonce(address _owner) external view override returns (uint256) {
        return NonceStorageWrapper.getNonceFor(_owner, NONCE_KEY_PROTECTED_CREATE_HOLD_BY_PARTITION);
    }

    /// @inheritdoc INonces
    function protectedClearingCreateHoldByPartitionNonce(address _owner) external view override returns (uint256) {
        return NonceStorageWrapper.getNonceFor(_owner, NONCE_KEY_PROTECTED_CLEARING_CREATE_HOLD_BY_PARTITION);
    }

    /// @inheritdoc INonces
    function protectedClearingTransferByPartitionNonce(address _owner) external view override returns (uint256) {
        return NonceStorageWrapper.getNonceFor(_owner, NONCE_KEY_PROTECTED_CLEARING_TRANSFER_BY_PARTITION);
    }

    /// @inheritdoc INonces
    function protectedClearingRedeemByPartitionNonce(address _owner) external view override returns (uint256) {
        return NonceStorageWrapper.getNonceFor(_owner, NONCE_KEY_PROTECTED_CLEARING_REDEEM_BY_PARTITION);
    }
}
