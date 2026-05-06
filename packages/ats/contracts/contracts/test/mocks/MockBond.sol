// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "../../facets/layer_2/bond/IBondRead.sol";
import { IBondTypes } from "../../facets/layer_2/bond/IBondTypes.sol";
import { IPrincipal } from "../../facets/principal/IPrincipal.sol";

contract MockBond is IBondRead, IPrincipal {
    IBondTypes.BondDetailsData private _bondDetails;
    mapping(address => IPrincipal.PrincipalFor) private _principalFor;

    // solhint-disable func-name-mixedcase
    function mock__setBondDetails(IBondTypes.BondDetailsData calldata data) external {
        _bondDetails = data;
    }

    function mock__setPrincipalFor(address account, IPrincipal.PrincipalFor calldata data) external {
        _principalFor[account] = data;
    }
    // solhint-enable func-name-mixedcase

    function getBondDetails() external view override returns (IBondTypes.BondDetailsData memory) {
        return _bondDetails;
    }

    function getPrincipalFor(address account) external view override returns (IPrincipal.PrincipalFor memory) {
        return _principalFor[account];
    }
}
