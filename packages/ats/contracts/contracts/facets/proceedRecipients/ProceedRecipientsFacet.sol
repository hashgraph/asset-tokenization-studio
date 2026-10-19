// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IProceedRecipients, RESOLVER_KEY_PROCEED_RECIPIENTS } from "./IProceedRecipients.sol";
import { ProceedRecipients } from "./ProceedRecipients.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";

/**
 * @title ProceedRecipientsFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes proceed-recipient management operations through the
 *         `IProceedRecipients` interface, registered under `RESOLVER_KEY_PROCEED_RECIPIENTS`.
 */
contract ProceedRecipientsFacet is ProceedRecipients, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = RESOLVER_KEY_PROCEED_RECIPIENTS;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.initializeProceedRecipients.selector,
                this.addProceedRecipient.selector,
                this.removeProceedRecipient.selector,
                this.updateProceedRecipientData.selector,
                this.isProceedRecipient.selector,
                this.getProceedRecipientData.selector,
                this.getProceedRecipientsCount.selector,
                this.getProceedRecipients.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(IProceedRecipients).interfaceId);
    }
}
