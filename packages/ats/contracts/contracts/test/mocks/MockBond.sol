// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "../../facets/layer_2/bond/IBondRead.sol";

contract MockBond is IBondRead {
    // --- Storage ---
    BondDetailsData private _bondDetails;
    mapping(uint256 => bool) private _isDisabled;
    mapping(address => PrincipalFor) private _principalFor;

    // --- Errors ---
    error IndexOutOfBounds(uint256 index, uint256 length);

    // --- Setters (mock__ prefix to avoid naming collisions with IBondRead) ---
    // solhint-disable func-name-mixedcase
    function mock__setBondDetails(BondDetailsData calldata data) external {
        _bondDetails = data;
    }

    function mock__setPrincipalFor(address account, PrincipalFor calldata data) external {
        _principalFor[account] = data;
    }

    // solhint-enable func-name-mixedcase

    // --- IBondRead view functions ---
    function getBondDetails() external view override returns (BondDetailsData memory) {
        return _bondDetails;
    }
    function getPrincipalFor(address account) external view override returns (PrincipalFor memory) {
        return _principalFor[account];
    }
}
