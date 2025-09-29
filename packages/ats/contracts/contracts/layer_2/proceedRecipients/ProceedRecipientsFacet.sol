// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IStaticFunctionSelectors
} from '../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';
import {ProceedRecipients} from './ProceedRecipients.sol';
import {
    IProceedRecipients
} from '../interfaces/proceedRecipients/IProceedRecipients.sol';
import {_PROCEED_RECIPIENTS_RESOLVER_KEY} from '../constants/resolverKeys.sol';

contract ProceedRecipientsFacet is ProceedRecipients, IStaticFunctionSelectors {
    function getStaticResolverKey()
        external
        pure
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _PROCEED_RECIPIENTS_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](8);
        staticFunctionSelectors_[selectorIndex++] = this
            .initialize_ProceedRecipients
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .addProceedRecipient
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .removeProceedRecipient
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .updateProceedRecipientData
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .isProceedRecipient
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getProceedRecipientData
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getProceedRecipientsCount
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getProceedRecipients
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IProceedRecipients)
            .interfaceId;
    }
}
