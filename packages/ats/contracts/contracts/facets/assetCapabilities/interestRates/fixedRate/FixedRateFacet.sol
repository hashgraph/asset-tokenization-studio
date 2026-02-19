// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IFixedRate } from "../../interfaces/interestRates/fixedRate/IFixedRate.sol";
import { IStaticFunctionSelectors } from "../../../../infrastructure/interfaces/IStaticFunctionSelectors.sol";
import { LibInterestRate } from "../../../../lib/domain/LibInterestRate.sol";
import { LibPause } from "../../../../lib/core/LibPause.sol";
import { LibAccess } from "../../../../lib/core/LibAccess.sol";
import { _FIXED_RATE_RESOLVER_KEY } from "../../../../constants/resolverKeys/assets.sol";
import { _INTEREST_RATE_MANAGER_ROLE } from "../../../../constants/roles.sol";

contract FixedRateFacet is IFixedRate, IStaticFunctionSelectors {
    error AlreadyInitialized();

    // solhint-disable-next-line func-name-mixedcase
    function initialize_FixedRate(FixedRateData calldata _initData) external override {
        if (LibInterestRate.isFixedRateInitialized()) revert AlreadyInitialized();
        LibInterestRate.initializeFixedRate(_initData.rate, _initData.rateDecimals);
    }

    function setRate(uint256 _newRate, uint8 _newRateDecimals) external override {
        LibAccess.checkRole(_INTEREST_RATE_MANAGER_ROLE);
        LibPause.requireNotPaused();
        LibInterestRate.setFixedRate(_newRate, _newRateDecimals);
        emit RateUpdated(msg.sender, _newRate, _newRateDecimals);
    }

    function getRate() external view override returns (uint256 rate_, uint8 decimals_) {
        return LibInterestRate.getFixedRate();
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
