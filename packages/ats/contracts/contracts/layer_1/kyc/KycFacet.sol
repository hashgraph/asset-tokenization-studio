// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import {IKyc} from '../interfaces/kyc/IKyc.sol';
import {_KYC_RESOLVER_KEY} from '../constants/resolverKeys.sol';
import {
    IStaticFunctionSelectors
} from '../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';
import {Kyc} from './Kyc.sol';

contract KycFacet is Kyc, IStaticFunctionSelectors {
    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _KYC_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](10);
        staticFunctionSelectors_[selectorIndex++] = this
            .initializeInternalKyc
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .activateInternalKyc
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .deactivateInternalKyc
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.grantKyc.selector;
        staticFunctionSelectors_[selectorIndex++] = this.revokeKyc.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getKycFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getKycStatusFor
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getKycAccountsCount
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getKycAccountsData
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .isInternalKycActivated
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
        staticInterfaceIds_[selectorsIndex++] = type(IKyc).interfaceId;
    }
}
