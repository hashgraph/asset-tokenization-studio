// SPDX-License-Identifier: Apache-2.0
// Contract copy-pasted form OZ and extended
pragma solidity >=0.8.0 <0.9.0;

import {Common} from '../../common/Common.sol';
import {IERC20Votes} from '../../interfaces/ERC1400/IERC20Votes.sol';
import {IERC5805} from '@openzeppelin/contracts/interfaces/IERC5805.sol';
import {IERC6372} from '@openzeppelin/contracts/interfaces/IERC6372.sol';
import {IVotes} from '@openzeppelin/contracts/governance/utils/IVotes.sol';
import {
    _CONTRACT_NAME_ERC20VOTES,
    _CONTRACT_VERSION_ERC20VOTES
} from '../../constants/values.sol';
import {
    IStaticFunctionSelectors
} from '../../../interfaces/resolver/resolverProxy/IStaticFunctionSelectors.sol';
import {_ERC20VOTES_RESOLVER_KEY} from '../../constants/resolverKeys.sol';

contract ERC20Votes is IERC20Votes, IStaticFunctionSelectors, Common {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC20Votes(
        bool _activated
    ) external override onlyUninitialized(_erc20VotesStorage().initialized) {
        ERC20VotesStorage storage erc20VotesStorage = _erc20VotesStorage();
        _setActivate(_activated);
        erc20VotesStorage.initialized = true;
        erc20VotesStorage.contractName = _CONTRACT_NAME_ERC20VOTES;
        erc20VotesStorage.contractVersion = _CONTRACT_VERSION_ERC20VOTES;
    }

    function delegate(address _delegatee) external override onlyUnpaused {
        _delegate(_delegatee);
    }

    function clock() external view override returns (uint48) {
        return _clock();
    }

    // solhint-disable-next-line func-name-mixedcase
    function CLOCK_MODE() external view override returns (string memory) {
        return _CLOCK_MODE();
    }

    function getVotes(
        address _account
    ) external view override returns (uint256) {
        return _getVotes(_account);
    }

    function getPastVotes(
        address _account,
        uint256 _timepoint
    ) external view override returns (uint256) {
        return _getPastVotes(_account, _timepoint);
    }

    function getPastTotalSupply(
        uint256 _timepoint
    ) external view override returns (uint256) {
        return _getPastTotalSupply(_timepoint);
    }

    function delegates(
        address _account
    ) external view override returns (address) {
        return _delegates(_account);
    }

    function checkpoints(
        address _account,
        uint256 _pos
    ) external view override returns (Checkpoint memory) {
        return _checkpoints(_account, _pos);
    }

    function numCheckpoints(
        address _account
    ) external view override returns (uint256) {
        return _numCheckpoints(_account);
    }

    function isActivated() external view returns (bool) {
        return _isActivated();
    }

    function getStaticResolverKey()
        external
        pure
        override
        returns (bytes32 staticResolverKey_)
    {
        staticResolverKey_ = _ERC20VOTES_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        staticFunctionSelectors_ = new bytes4[](11);
        uint256 selectorsIndex;
        staticFunctionSelectors_[selectorsIndex++] = this
            .initialize_ERC20Votes
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this.delegate.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.clock.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.CLOCK_MODE.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getVotes.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.getPastVotes.selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .getPastTotalSupply
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this.delegates.selector;
        staticFunctionSelectors_[selectorsIndex++] = this.checkpoints.selector;
        staticFunctionSelectors_[selectorsIndex++] = this
            .numCheckpoints
            .selector;
        staticFunctionSelectors_[selectorsIndex++] = this.isActivated.selector;
    }

    function getStaticInterfaceIds()
        external
        pure
        override
        returns (bytes4[] memory staticInterfaceIds_)
    {
        staticInterfaceIds_ = new bytes4[](4);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IERC20Votes).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IERC5805).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IERC6372).interfaceId;
        staticInterfaceIds_[selectorsIndex++] = type(IVotes).interfaceId;
    }
}
