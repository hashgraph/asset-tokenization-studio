// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../internals/OldInternals.sol";
import "../../diamond/Interfaces.sol";

/**
 * OLD ARCHITECTURE - TokenFacet
 *
 * This facet needs token + pause + access logic.
 * The inheritance actually makes sense here since it uses most features.
 * But it still gets things it doesn't need (like role management functions).
 */
contract OldTokenFacet is OldInternals, ITokenFacet {

    function name() external view override returns (string memory) {
        return _name();
    }

    function symbol() external view override returns (string memory) {
        return _symbol();
    }

    function decimals() external view override returns (uint8) {
        return _decimals();
    }

    function totalSupply() external view override returns (uint256) {
        return _totalSupply();
    }

    function balanceOf(address account) external view override returns (uint256) {
        return _balanceOf(account);
    }

    function allowance(address owner, address spender) external view override returns (uint256) {
        return _allowance(owner, spender);
    }

    function transfer(address to, uint256 amount) external override whenNotPaused returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external override whenNotPaused returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external override whenNotPaused returns (bool) {
        _spendAllowance(from, msg.sender, amount);
        _transfer(from, to, amount);
        return true;
    }
}
