// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFixedRate } from "../../interestRate/fixedRate/IFixedRate.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/diamond/IStaticFunctionSelectors.sol";
import { InterestRateStorageWrapper } from "../../../../domain/asset/InterestRateStorageWrapper.sol";
import { PauseStorageWrapper } from "../../../../domain/core/PauseStorageWrapper.sol";
import { AccessStorageWrapper } from "../../../../domain/core/AccessStorageWrapper.sol";
import { _FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys.sol";
import { _INTEREST_RATE_MANAGER_ROLE } from "../../../../constants/roles.sol";

contract FixedRateFacet is IFixedRate, IStaticFunctionSelectors {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_FixedRate(FixedRateData calldata _initData) external override {
        if (InterestRateStorageWrapper.isFixedRateInitialized()) revert AlreadyInitialized();
        InterestRateStorageWrapper.initializeFixedRate(_initData.rate, _initData.rateDecimals);
    }

    function setRate(uint256 _newRate, uint8 _newRateDecimals) external override {
        AccessStorageWrapper.checkRole(_INTEREST_RATE_MANAGER_ROLE);
        PauseStorageWrapper.requireNotPaused();
        InterestRateStorageWrapper.setFixedRate(_newRate, _newRateDecimals);
        emit RateUpdated(msg.sender, _newRate, _newRateDecimals);
    }

    function getRate() external view override returns (uint256 rate_, uint8 decimals_) {
        return InterestRateStorageWrapper.getFixedRate();
    }

    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _FIXED_RATE_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory staticFunctionSelectors_) {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](3);
        staticFunctionSelectors_[selectorIndex++] = this.initialize_FixedRate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.setRate.selector;
        staticFunctionSelectors_[selectorIndex++] = this.getRate.selector;
    }

    function getStaticInterfaceIds() external pure override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IFixedRate).interfaceId;
    }
}
