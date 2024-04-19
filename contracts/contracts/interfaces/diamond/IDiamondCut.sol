pragma solidity 0.8.18;
// SPDX-License-Identifier: BSD-3-Clause-Attribution

import {IDiamond} from './IDiamond.sol';
import {IStaticFunctionSelectors} from './IStaticFunctionSelectors.sol';

interface IDiamondCut is IDiamond, IStaticFunctionSelectors {
    error InvalidBusinessLogicKey(
        bytes32 providedBusinesLogicKey,
        bytes32 contractBusinessLogicKey,
        address businessLogicAddress
    );
    error DiamondFacetNotFoundInRegistry(bytes32 facetKey);

    event FacetsRegistered(bytes32[] businessLogicKeys);

    function registerFacets(bytes32[] calldata _businessLogicKeys) external;
}
