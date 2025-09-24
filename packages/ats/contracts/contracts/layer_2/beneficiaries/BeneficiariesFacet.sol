// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {
    IStaticFunctionSelectors
} from '../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';
import {Beneficiaries} from './Beneficiaries.sol';
import {IBeneficiaries} from '../interfaces/beneficiaries/IBeneficiaries.sol';
import {_BENEFICIARIES_RESOLVER_KEY} from '../constants/resolverKeys.sol';

contract BeneficiariesFacet is Beneficiaries, IStaticFunctionSelectors {
    function getStaticResolverKey()
        external
        pure
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _BENEFICIARIES_RESOLVER_KEY;
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
            .initialize_Beneficiaries
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .addBeneficiary
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .removeBeneficiary
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .updateBeneficiaryData
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.isBeneficiary.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getBeneficiaryData
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getBeneficiariesCount
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getBeneficiaries
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
        staticInterfaceIds_[selectorsIndex++] = type(IBeneficiaries)
            .interfaceId;
    }
}
