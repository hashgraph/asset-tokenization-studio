// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { ProceedRecipients } from "./ProceedRecipients.sol";
import { IProceedRecipients } from "../interfaces/proceedRecipients/IProceedRecipients.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { _PROCEED_RECIPIENTS_RESOLVER_KEY } from "../../../constants/resolverKeys/assets.sol";

/// @title ProceedRecipientsFacet
/// @notice Diamond facet for managing proceed recipients
/// @dev Concrete implementation with resolver key and static function selectors
contract ProceedRecipientsFacet is ProceedRecipients, IStaticFunctionSelectors {
    /// @notice Returns the resolver key for this facet
    /// @return staticResolverKey_ The resolver key
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _PROCEED_RECIPIENTS_RESOLVER_KEY;
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
        staticInterfaceIds_[0] = type(IProceedRecipients).interfaceId;
    }
}
