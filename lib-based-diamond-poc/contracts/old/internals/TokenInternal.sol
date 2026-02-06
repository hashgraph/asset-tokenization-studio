// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "../../diamond/DiamondStorage.sol";

/**
 * OLD ARCHITECTURE - TokenInternal
 *
 * The largest piece of the inheritance monster.
 * Contains ALL token logic - even facets that only need mint()
 * will get transfer(), approve(), etc. compiled in.
 */
abstract contract TokenInternal {
    // =========================================================================
    // ERRORS
    // =========================================================================
    error ERC20InsufficientBalance(address sender, uint256 balance, uint256 needed);
    error ERC20InvalidSender(address sender);
    error ERC20InvalidReceiver(address receiver);
    error ERC20InsufficientAllowance(address spender, uint256 allowance, uint256 needed);
    error ERC20InvalidApprover(address approver);
    error ERC20InvalidSpender(address spender);

    // =========================================================================
    // EVENTS
    // =========================================================================
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event Mint(address indexed to, uint256 amount);
    event Burn(address indexed from, uint256 amount);

    // =========================================================================
    // INTERNAL VIEW FUNCTIONS
    // =========================================================================
    function _name() internal view returns (string memory) {
        return tokenStorage().name;
    }

    function _symbol() internal view returns (string memory) {
        return tokenStorage().symbol;
    }

    function _decimals() internal view returns (uint8) {
        return tokenStorage().decimals;
    }

    function _totalSupply() internal view returns (uint256) {
        return tokenStorage().totalSupply;
    }

    function _balanceOf(address account) internal view returns (uint256) {
        return tokenStorage().balances[account];
    }

    function _allowance(address owner, address spender) internal view returns (uint256) {
        return tokenStorage().allowances[owner][spender];
    }

    // =========================================================================
    // INTERNAL MUTATIVE FUNCTIONS
    // =========================================================================
    function _initializeToken(string memory name_, string memory symbol_, uint8 decimals_) internal {
        TokenStorage storage ts = tokenStorage();
        ts.name = name_;
        ts.symbol = symbol_;
        ts.decimals = decimals_;
    }

    function _transfer(address from, address to, uint256 amount) internal {
        if (from == address(0)) revert ERC20InvalidSender(address(0));
        if (to == address(0)) revert ERC20InvalidReceiver(address(0));
        _update(from, to, amount);
    }

    function _update(address from, address to, uint256 amount) internal {
        TokenStorage storage ts = tokenStorage();

        if (from == address(0)) {
            ts.totalSupply += amount;
        } else {
            uint256 fromBalance = ts.balances[from];
            if (fromBalance < amount) revert ERC20InsufficientBalance(from, fromBalance, amount);
            unchecked { ts.balances[from] = fromBalance - amount; }
        }

        if (to == address(0)) {
            unchecked { ts.totalSupply -= amount; }
        } else {
            unchecked { ts.balances[to] += amount; }
        }

        emit Transfer(from, to, amount);
    }

    function _mint(address account, uint256 amount) internal {
        if (account == address(0)) revert ERC20InvalidReceiver(address(0));
        _update(address(0), account, amount);
        emit Mint(account, amount);
    }

    function _burn(address account, uint256 amount) internal {
        if (account == address(0)) revert ERC20InvalidSender(address(0));
        _update(account, address(0), amount);
        emit Burn(account, amount);
    }

    function _approve(address owner, address spender, uint256 amount) internal {
        if (owner == address(0)) revert ERC20InvalidApprover(address(0));
        if (spender == address(0)) revert ERC20InvalidSpender(address(0));
        tokenStorage().allowances[owner][spender] = amount;
        emit Approval(owner, spender, amount);
    }

    function _spendAllowance(address owner, address spender, uint256 amount) internal {
        uint256 currentAllowance = _allowance(owner, spender);
        if (currentAllowance != type(uint256).max) {
            if (currentAllowance < amount) revert ERC20InsufficientAllowance(spender, currentAllowance, amount);
            unchecked { _approve(owner, spender, currentAllowance - amount); }
        }
    }
}
