// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

import {Security} from '../security/Security.sol';
import {IEquityUSA} from '../interfaces/IEquityUSA.sol';
import {Equity} from '../../layer_2/equity/Equity.sol';
import {
    RegulationData,
    AdditionalSecurityData
} from '../constants/regulation.sol';
import {_EQUITY_RESOLVER_KEY} from '../../layer_2/constants/resolverKeys.sol';
import {IEquity} from '../../layer_2/interfaces/equity/IEquity.sol';
import {ISecurity} from '../interfaces/ISecurity.sol';

contract EquityUSA is IEquityUSA, Equity, Security {
    // solhint-disable func-name-mixedcase
    // solhint-disable-next-line private-vars-leading-underscore
    function _initialize_equityUSA(
        EquityDetailsData calldata _equityDetailsData,
        RegulationData memory _regulationData,
        AdditionalSecurityData calldata _additionalSecurityData
    )
        external
        override
        onlyUninitialized(_equityStorage().initialized)
        returns (bool)
    {
        return
            _initializeEquity(_equityDetailsData) &&
            _initializeSecurity(_regulationData, _additionalSecurityData);
    }

    function getStaticResolverKey()
        external
        pure
        virtual
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _EQUITY_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](11);
        staticFunctionSelectors_[selectorIndex++] = this
            ._initialize_equityUSA
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getEquityDetails
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.setDividends.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getDividends.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getDividendsFor
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getDividendsCount
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this.setVoting.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getVoting.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getVotingFor.selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getVotingCount
            .selector;
        staticFunctionSelectors_[selectorIndex++] = this
            .getSecurityRegulationData
            .selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](3);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IEquity).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(ISecurity).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IEquityUSA).interfaceId;
    }
}
