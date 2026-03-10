// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProceedRecipients } from "./IProceedRecipients.sol";
import { ProceedRecipientsStorageWrapper } from "../../../domain/asset/ProceedRecipientsStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../domain/core/AccessStorageWrapper.sol";
import { ERC1410StorageWrapper } from "../../../domain/asset/ERC1410StorageWrapper.sol";
import { _PROCEED_RECIPIENT_MANAGER_ROLE } from "../../../constants/roles.sol";

/// @title ProceedRecipients
/// @notice Abstract contract for managing proceed recipients using library calls
/// @dev Implements IProceedRecipients interface via ProceedRecipientsStorageWrapper library
abstract contract ProceedRecipients is IProceedRecipients {
    // Custom error for initialization check
    error AlreadyInitialized();

    /// @notice Initializes the proceedRecipients contract with a list of initial proceedRecipients
    /// @param _proceedRecipients An array of addresses representing the initial proceedRecipients
    /// @param _data An array of bytes data for each proceed recipient
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ProceedRecipients(
        address[] calldata _proceedRecipients,
        bytes[] calldata _data
    ) external override {
        if (ProceedRecipientsStorageWrapper.isInitialized()) {
            revert AlreadyInitialized();
        }

        ProceedRecipientsStorageWrapper.initialize(_proceedRecipients, _data);
    }

    /// @notice Adds a new proceed recipient
    /// @param _proceedRecipient The address of the proceed recipient
    /// @param _data Additional data for the proceed recipient
    function addProceedRecipient(address _proceedRecipient, bytes calldata _data) external virtual override {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_PROCEED_RECIPIENT_MANAGER_ROLE);
        ERC1410StorageWrapper.requireValidAddress(_proceedRecipient);
        ProceedRecipientsStorageWrapper.checkNotProceedRecipient(_proceedRecipient);

        ProceedRecipientsStorageWrapper.addProceedRecipient(_proceedRecipient, _data);
        emit ProceedRecipientAdded(msg.sender, _proceedRecipient, _data);
    }

    /// @notice Removes a proceed recipient
    /// @param _proceedRecipient The address of the proceed recipient to remove
    function removeProceedRecipient(address _proceedRecipient) external virtual override {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_PROCEED_RECIPIENT_MANAGER_ROLE);
        ProceedRecipientsStorageWrapper.checkIsProceedRecipient(_proceedRecipient);

        ProceedRecipientsStorageWrapper.removeProceedRecipient(_proceedRecipient);
        emit ProceedRecipientRemoved(msg.sender, _proceedRecipient);
    }

    /// @notice Updates the data associated with a proceed recipient
    /// @param _proceedRecipient The address of the proceed recipient
    /// @param _data The new data for the proceed recipient
    function updateProceedRecipientData(address _proceedRecipient, bytes calldata _data) external override {
        PauseStorageWrapper.requireNotPaused();
        AccessStorageWrapper.checkRole(_PROCEED_RECIPIENT_MANAGER_ROLE);
        ERC1410StorageWrapper.requireValidAddress(_proceedRecipient);
        ProceedRecipientsStorageWrapper.checkIsProceedRecipient(_proceedRecipient);

        ProceedRecipientsStorageWrapper.setProceedRecipientData(_proceedRecipient, _data);
        emit ProceedRecipientDataUpdated(msg.sender, _proceedRecipient, _data);
    }

    /// @notice Checks if an address is a proceed recipient
    /// @param _proceedRecipient The address to check
    /// @return True if the address is a proceed recipient, false otherwise
    function isProceedRecipient(address _proceedRecipient) external view override returns (bool) {
        return ProceedRecipientsStorageWrapper.isProceedRecipient(_proceedRecipient);
    }

    /// @notice Retrieves the data associated with a proceed recipient
    /// @param _proceedRecipient The address of the proceed recipient
    /// @return The data associated with the proceed recipient
    function getProceedRecipientData(address _proceedRecipient) external view override returns (bytes memory) {
        return ProceedRecipientsStorageWrapper.getProceedRecipientData(_proceedRecipient);
    }

    /// @notice Gets the total count of proceed recipients
    /// @return The total number of proceed recipients
    function getProceedRecipientsCount() external view override returns (uint256) {
        return ProceedRecipientsStorageWrapper.getProceedRecipientsCount();
    }

    /// @notice Retrieves a paginated list of proceed recipients
    /// @param _pageIndex The page index (0-based)
    /// @param _pageLength The number of entries per page
    /// @return proceedRecipients_ An array of proceed recipient addresses
    function getProceedRecipients(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory proceedRecipients_) {
        return ProceedRecipientsStorageWrapper.getProceedRecipients(_pageIndex, _pageLength);
    }
}
