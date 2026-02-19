// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProceedRecipients } from "../interfaces/proceedRecipients/IProceedRecipients.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { LibProceedRecipients } from "../../../lib/domain/LibProceedRecipients.sol";
import { LibPause } from "../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../lib/core/LibAccess.sol";
import { LibERC1410 } from "../../../lib/domain/LibERC1410.sol";
import { _PROCEED_RECIPIENT_MANAGER_ROLE } from "../../../constants/roles.sol";

/// @title ProceedRecipientsFacetBase
/// @notice Diamond facet for managing proceed recipients using library calls
/// @dev Implements IProceedRecipients interface via LibProceedRecipients library
abstract contract ProceedRecipientsFacetBase is IProceedRecipients, IStaticFunctionSelectors {
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
        if (LibProceedRecipients.isInitialized()) {
            revert AlreadyInitialized();
        }

        LibProceedRecipients.initialize(_proceedRecipients, _data);
    }

    /// @notice Adds a new proceed recipient
    /// @param _proceedRecipient The address of the proceed recipient
    /// @param _data Additional data for the proceed recipient
    function addProceedRecipient(address _proceedRecipient, bytes calldata _data) external virtual override {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_PROCEED_RECIPIENT_MANAGER_ROLE);
        LibERC1410.requireValidAddress(_proceedRecipient);
        LibProceedRecipients.checkNotProceedRecipient(_proceedRecipient);

        LibProceedRecipients.addProceedRecipient(_proceedRecipient, _data);
        emit ProceedRecipientAdded(msg.sender, _proceedRecipient, _data);
    }

    /// @notice Removes a proceed recipient
    /// @param _proceedRecipient The address of the proceed recipient to remove
    function removeProceedRecipient(address _proceedRecipient) external virtual override {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_PROCEED_RECIPIENT_MANAGER_ROLE);
        LibProceedRecipients.checkIsProceedRecipient(_proceedRecipient);

        LibProceedRecipients.removeProceedRecipient(_proceedRecipient);
        emit ProceedRecipientRemoved(msg.sender, _proceedRecipient);
    }

    /// @notice Updates the data associated with a proceed recipient
    /// @param _proceedRecipient The address of the proceed recipient
    /// @param _data The new data for the proceed recipient
    function updateProceedRecipientData(address _proceedRecipient, bytes calldata _data) external override {
        LibPause.requireNotPaused();
        LibAccess.checkRole(_PROCEED_RECIPIENT_MANAGER_ROLE);
        LibERC1410.requireValidAddress(_proceedRecipient);
        LibProceedRecipients.checkIsProceedRecipient(_proceedRecipient);

        LibProceedRecipients.setProceedRecipientData(_proceedRecipient, _data);
        emit ProceedRecipientDataUpdated(msg.sender, _proceedRecipient, _data);
    }

    /// @notice Checks if an address is a proceed recipient
    /// @param _proceedRecipient The address to check
    /// @return True if the address is a proceed recipient, false otherwise
    function isProceedRecipient(address _proceedRecipient) external view override returns (bool) {
        return LibProceedRecipients.isProceedRecipient(_proceedRecipient);
    }

    /// @notice Retrieves the data associated with a proceed recipient
    /// @param _proceedRecipient The address of the proceed recipient
    /// @return The data associated with the proceed recipient
    function getProceedRecipientData(address _proceedRecipient) external view override returns (bytes memory) {
        return LibProceedRecipients.getProceedRecipientData(_proceedRecipient);
    }

    /// @notice Gets the total count of proceed recipients
    /// @return The total number of proceed recipients
    function getProceedRecipientsCount() external view override returns (uint256) {
        return LibProceedRecipients.getProceedRecipientsCount();
    }

    /// @notice Retrieves a paginated list of proceed recipients
    /// @param _pageIndex The page index (0-based)
    /// @param _pageLength The number of entries per page
    /// @return proceedRecipients_ An array of proceed recipient addresses
    function getProceedRecipients(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view override returns (address[] memory proceedRecipients_) {
        return LibProceedRecipients.getProceedRecipients(_pageIndex, _pageLength);
    }

    /// @notice Returns the function selectors for this facet
    /// @return staticFunctionSelectors_ Array of function selectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](8);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_ProceedRecipients.selector;
        staticFunctionSelectors_[selectorIndex++] = this.addProceedRecipient.selector;
        staticFunctionSelectors_[selectorIndex++] = this.removeProceedRecipient.selector;
        staticFunctionSelectors_[selectorIndex++] = this.updateProceedRecipientData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.isProceedRecipient.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getProceedRecipientData.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getProceedRecipientsCount.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getProceedRecipients.selector;
    }

    /// @notice Returns the interface IDs supported by this facet
    /// @return staticInterfaceIds_ Array of interface IDs
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IProceedRecipients).interfaceId;
    }
}
