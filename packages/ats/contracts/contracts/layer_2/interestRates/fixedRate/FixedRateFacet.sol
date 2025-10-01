// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;
import {
    IFixedRate
} from '../../interfaces/interestRates/fixedRate/IFixedRate.sol';
import {_FIXED_RATE_RESOLVER_KEY} from '../../constants/resolverKeys.sol';
import {
    IStaticFunctionSelectors
} from '../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';
import {FixedRate} from './FixedRate.sol';

contract FixedRateFacet is FixedRate, IStaticFunctionSelectors {
    function getStaticResolverKey()
        external
        pure
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _FIXED_RATE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](3);
        staticFunctionSelectors_[selectorIndex++] = this
            .initialize_FixedRate
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.setRate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getRate.selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IFixedRate).interfaceId;
    }
}
