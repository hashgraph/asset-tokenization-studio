// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "../../facets/layer_2/bond/IBondRead.sol";
import { IBondTypes } from "../../facets/layer_2/bond/IBondTypes.sol";

contract MockBond is IBondRead {
    IBondTypes.BondDetailsData private _bondDetails;
    mapping(address => IBondTypes.PrincipalFor) private _principalFor;

    // solhint-disable func-name-mixedcase
    function mock__setBondDetails(IBondTypes.BondDetailsData calldata data) external {
        _bondDetails = data;
    }

    function mock__setPrincipalFor(address account, IBondTypes.PrincipalFor calldata data) external {
        _principalFor[account] = data;
    }
    // solhint-enable func-name-mixedcase

    function getBondDetails() external view override returns (IBondTypes.BondDetailsData memory) {
        return _bondDetails;
    }

    function getPrincipalFor(address account) external view override returns (IBondTypes.PrincipalFor memory) {
        return _principalFor[account];
    }
}
