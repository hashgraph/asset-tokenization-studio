// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { _AGENT_ROLE } from "../../../constants/roles.sol";
import { IERC3643Read } from "./IERC3643Read.sol";
import { ICompliance } from "./ICompliance.sol";
import { IIdentityRegistry } from "./IIdentityRegistry.sol";
import { AccessControlStorageWrapper } from "../../../domain/core/AccessControlStorageWrapper.sol";
import { ERC3643StorageWrapper } from "../../../domain/core/ERC3643StorageWrapper.sol";

/**
 * @title  ERC3643Read
 * @notice Abstract implementation of the ERC3643 read interface, exposing view functions
 *         for the token's compliance module, identity registry, on-chain identity,
 *         agent role membership, wallet recovery status, and protocol version.
 * @dev    Implements `IERC3643Read` and delegates all state reads to
 *         `ERC3643StorageWrapper` and `AccessControlStorageWrapper`. Contains no
 *         mutable state of its own; all data is sourced from Diamond Storage via the
 *         respective storage wrapper libraries.
 *
 *         Inheriting contracts must ensure that `ERC3643StorageWrapper` and
 *         `AccessControlStorageWrapper` are properly initialised before any of these
 *         view functions are called, as uninitialised storage will return zero-value
 *         defaults without reverting.
 * @author Hashgraph
 */
abstract contract ERC3643Read is IERC3643Read {
    /**
     * @notice Returns whether the given address holds the agent role.
     * @dev    Delegates to `AccessControlStorageWrapper.hasRole` with `_AGENT_ROLE`.
     *         Returns `false` for any address not explicitly granted the role, including
     *         `address(0)`.
     * @param _agent  Address to check for agent role membership.
     * @return True if `_agent` holds `_AGENT_ROLE`; false otherwise.
     */
    function isAgent(address _agent) external view returns (bool) {
        return AccessControlStorageWrapper.hasRole(_AGENT_ROLE, _agent);
    }

    /**
     * @notice Returns the identity registry contract associated with this token.
     * @dev    Wraps the address returned by `ERC3643StorageWrapper.getIdentityRegistry`
     *         as an `IIdentityRegistry` interface. Returns a zero-address-wrapped
     *         interface if the registry has not been set.
     * @return The `IIdentityRegistry` instance currently configured for this token.
     */
    function identityRegistry() external view override returns (IIdentityRegistry) {
        return IIdentityRegistry(ERC3643StorageWrapper.getIdentityRegistry());
    }

    /**
     * @notice Returns the on-chain identity address associated with this token.
     * @dev    Reads directly from `ERC3643StorageWrapper`. Returns `address(0)` if no
     *         on-chain identity has been set.
     * @return Address of the token's on-chain identity contract.
     */
    function onchainID() external view override returns (address) {
        return ERC3643StorageWrapper.getOnchainID();
    }

    /**
     * @notice Returns the compliance module contract associated with this token.
     * @dev    Wraps the address returned by `ERC3643StorageWrapper.getCompliance` as an
     *         `ICompliance` interface. Returns a zero-address-wrapped interface if the
     *         compliance module has not been set.
     * @return The `ICompliance` instance currently configured for this token.
     */
    function compliance() external view override returns (ICompliance) {
        return ICompliance(ERC3643StorageWrapper.getCompliance());
    }

    /**
     * @notice Returns whether the given wallet address has been marked as recovered.
     * @dev    Delegates to `ERC3643StorageWrapper.isRecovered`. A `true` return indicates
     *         the wallet has been superseded by a recovery operation and should no longer
     *         be considered a valid active address for token operations.
     * @param _wallet  Address to check for recovered status.
     * @return True if `_wallet` has been recovered; false otherwise.
     */
    function isAddressRecovered(address _wallet) external view returns (bool) {
        return ERC3643StorageWrapper.isRecovered(_wallet);
    }

    /**
     * @notice Returns the current protocol version string for this token implementation.
     * @dev    Reads directly from `ERC3643StorageWrapper.version`. The format and
     *         semantics of the version string are defined by the storage wrapper and the
     *         wider ERC3643 implementation.
     * @return Human-readable version string for the token protocol.
     */
    function version() external view returns (string memory) {
        return ERC3643StorageWrapper.version();
    }
}
