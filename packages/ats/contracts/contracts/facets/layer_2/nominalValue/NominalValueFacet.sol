// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { NominalValue } from "./NominalValue.sol";
import { INominalValue } from "./INominalValue.sol";
import { IStaticFunctionSelectors } from "../../../infrastructure/proxy/IStaticFunctionSelectors.sol";
import { Bytes4Builder } from "../../../infrastructure/proxy/Bytes4Builder.sol";
import { _NOMINAL_VALUE_RESOLVER_KEY } from "../../../constants/resolverKeys.sol";

/**
 * @title NominalValueFacet
 * @author Asset Tokenization Studio Team
 * @notice Diamond facet that exposes the nominal value capability (`INominalValue`) on a token.
 * @dev Implements `IStaticFunctionSelectors` so the BusinessLogicResolver can register the facet's
 *      selectors against the deterministic resolver key declared in `constants/resolverKeys.sol`.
 */
contract NominalValueFacet is NominalValue, IStaticFunctionSelectors {
    /// @inheritdoc IStaticFunctionSelectors
    function getStaticResolverKey() external pure override returns (bytes32 staticResolverKey_) {
        staticResolverKey_ = _NOMINAL_VALUE_RESOLVER_KEY;
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticFunctionSelectors() external pure override returns (bytes4[] memory) {
        return
            Bytes4Builder.build(
                this.getNominalValue.selector,
                this.getNominalValueCurrency.selector,
                this.getNominalValueDecimals.selector,
                this.initializeNominalValue.selector,
                this.setNominalValue.selector,
                this.setNominalValueCurrency.selector
            );
    }

    /// @inheritdoc IStaticFunctionSelectors
    function getStaticInterfaceIds() external pure override returns (bytes4[] memory) {
        return Bytes4Builder.build(type(INominalValue).interfaceId);
    }
}
