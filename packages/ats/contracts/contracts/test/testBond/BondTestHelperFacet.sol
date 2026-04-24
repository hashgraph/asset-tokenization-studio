// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { BondStorageWrapper } from "../../domain/asset/BondStorageWrapper.sol";
import { IStaticFunctionSelectors } from "../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { IBondTestHelperFacet } from "./IBondTestHelperFacet.sol";
import { _BOND_TEST_HELPER_RESOLVER_KEY } from "../constants/resolverKeys.sol";

contract BondTestHelperFacet is IStaticFunctionSelectors, IBondTestHelperFacet {
    // solhint-disable-next-line func-name-mixedcase
    function testOnlyAddDeprecatedCoupon(uint256 _couponID) external override {
        BondStorageWrapper.DEPRECATED_pushCouponOrderedListId(_couponID);
    }

    function getStaticResolverKey() external pure virtual override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _BOND_TEST_HELPER_RESOLVER_KEY;
    }

    function getStaticFunctionSelectors()
        external
        pure
        virtual
        override
        returns (bytes4[] memory staticFunctionSelectors_)
    {
        uint256 selectorIndex;
        staticFunctionSelectors_ = new bytes4[](1);
        staticFunctionSelectors_[selectorIndex++] = this.testOnlyAddDeprecatedCoupon.selector;
    }

    function getStaticInterfaceIds() external pure virtual override returns (bytes4[] memory staticInterfaceIds_) {
        staticInterfaceIds_ = new bytes4[](1);
        uint256 selectorsIndex;
        staticInterfaceIds_[selectorsIndex++] = type(IBondTestHelperFacet).interfaceId;
    }
}
