// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title IOwnership
 * @author Asset Tokenization Studio Team
 * @notice Two-step ownership management interface scoped per diamond configuration.
 * @dev Each diamond `configId` carries its own owner and pending-owner slot. Ownership transfer
 *      follows the OpenZeppelin Ownable2Step pattern: the current owner nominates a successor
 *      via {transferOwnership}, and the nominee must call {acceptOwnership} to finalise the
 *      handover. This guards against transfers to addresses that cannot operate the
 *      configuration. Implementations are expected to gate the entrypoints behind the
 *      configuration owner / pending owner checks and the global pause switch.
 */
interface IOwnership {
    /**
     * @notice Emitted when the current owner nominates a new owner for a configuration.
     * @dev Fired by {transferOwnership} before the handover is accepted; the existing owner
     *      remains in control until {acceptOwnership} is invoked by `newOwner`.
     * @param configId Configuration whose ownership is being transferred.
     * @param owner Current owner that initiated the transfer.
     * @param pendingOwner Address nominated as the pending owner.
     */
    event OwnershipTransfered(bytes32 indexed configId, address owner, address pendingOwner);

    /**
     * @notice Emitted when the pending owner finalises the ownership handover.
     * @dev Fired by {acceptOwnership} after the configuration owner has been updated and the
     *      pending owner slot cleared.
     * @param configId Configuration whose ownership has changed.
     * @param previousOwner Address that previously owned the configuration.
     * @param newOwner Caller that accepted ownership and now holds the configuration.
     */
    event OwnershipAccepted(bytes32 indexed configId, address previousOwner, address newOwner);

    /**
     * @notice Raised when the caller is not the current owner of the configuration.
     * @param configId Configuration that was accessed.
     * @param sender Caller that attempted the owner-only action.
     * @param owner Address currently holding ownership of `configId`.
     */
    error NotOwner(bytes32 configId, address sender, address owner);

    /**
     * @notice Raised when the caller is not the pending owner of the configuration.
     * @param configId Configuration whose pending handover was targeted.
     * @param sender Caller that attempted to accept ownership.
     * @param pendingOwner Address currently nominated as pending owner of `configId`.
     */
    error NotPendingOwner(bytes32 configId, address sender, address pendingOwner);

    /**
     * @notice Nominates `_newOwner` as the pending owner of `_configId`.
     * @dev Step one of the two-step transfer. The current owner remains in control until
     *      `_newOwner` accepts the handover via {acceptOwnership}. Calling this again before
     *      acceptance overwrites the prior nomination. Emits {OwnershipTransfered}.
     * @param _configId Configuration whose ownership is being handed over.
     * @param _newOwner Address to record as pending owner.
     */
    function transferOwnership(bytes32 _configId, address _newOwner) external;

    /**
     * @notice Finalises an ownership handover initiated by the current owner.
     * @dev Step two of the two-step transfer. Promotes the pending owner to owner and clears
     *      the pending slot. Emits {OwnershipAccepted}.
     * @param _configId Configuration whose pending handover is being accepted.
     */
    function acceptOwnership(bytes32 _configId) external;

    /**
     * @notice Returns the current owner of a configuration.
     * @param _configId Configuration to query.
     * @return owner_ Address that currently owns `configId`, or the zero address when no
     *         owner has been recorded.
     */
    function getOwner(bytes32 _configId) external view returns (address owner_);

    /**
     * @notice Returns the pending owner of a configuration, if any.
     * @param _configId Configuration to query.
     * @return pendingOwner_ Address currently nominated to accept ownership, or the zero
     *         address when no transfer is in flight.
     */
    function getPendingOwner(bytes32 _configId) external view returns (address pendingOwner_);
}
