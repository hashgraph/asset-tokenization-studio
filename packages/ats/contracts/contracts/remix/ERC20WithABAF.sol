// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/**
 * @title ERC20WithABAF
 * @notice Minimal ERC20 with SCALE-normalized Aggregated Balance Adjustment Factor (ABAF).
 *
 * Designed for Remix IDE testing. Deploy, mint, then call `adjustBalances` with a
 * SCALE-relative factor to multiply every balance and totalSupply in one shot.
 *
 * ─── SCALE convention ───
 *   SCALE = 1e18   (the "1.0×" identity factor)
 *   factor = 2e18  → doubles all balances          (2×)
 *   factor = 5e17  → halves all balances            (0.5×)
 *   factor = 15e17 → multiplies all balances by 1.5 (1.5×)
 *
 * ─── How it works ───
 *   • Raw balances are stored once and never touched again after minting.
 *   • `adjustBalances(factor)` updates a single global accumulator:
 *       abaf = (abaf * factor) / SCALE
 *   • Each account keeps a snapshot of the abaf at its last interaction (labaf).
 *   • Effective balance = (rawBalance * abaf) / labaf
 *   • This lets the contract apply unlimited sequential adjustments without
 *     iterating over holders and without overflowing (as long as the accumulated
 *     product stays within uint256).
 *
 * ─── Quick Remix test plan ───
 *   1. Deploy
 *   2. mint(alice, 1000)
 *   3. mint(bob,   500)
 *   4. balanceOf(alice) → 1000
 *   5. adjustBalances(200)   // 2 × SCALE  →  ×2
 *   6. balanceOf(alice) → 2000
 *   7. balanceOf(bob)   → 1000
 *   8. totalSupply()    → 3000
 *   9. adjustBalances(50)    // 0.5 × SCALE →  ×0.5
 *  10. balanceOf(alice) → 1000  (back to original)
 *  11. transfer(bob, 100)
 *  12. balanceOf(alice) → 900
 *  13. adjustBalances(300)   // 3 × SCALE  →  ×3
 *  14. balanceOf(alice) → 2700
 *  15. balanceOf(bob)   → 1800
 */
contract ERC20WithABAF {
    // ───────── Constants ─────────
    uint256 public constant SCALE = 1e27;
    uint256 public constant FACTORSCALE = 1e25;

    // ───────── ERC20 metadata ─────────
    string public name = "AbafScaledToken";
    string public symbol = "AST";
    uint8 public decimals = 6;

    // ───────── ERC20 storage ─────────
    uint256 private _rawTotalSupply;
    mapping(address => uint256) private _rawBalances;
    mapping(address => mapping(address => uint256)) private _allowances;

    // ───────── ABAF storage ─────────
    uint256 private _abaf; // global accumulator
    mapping(address => uint256) private _labaf; // per-account snapshot
    uint256 private _labafTotalSupply; // snapshot for totalSupply
    mapping(address => mapping(address => uint256)) private _labafAllowance;

    // ───────── Owner (for mint / adjustBalances) ─────────
    address public owner;

    // ───────── Events ─────────
    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);
    event BalancesAdjusted(uint256 factor, uint256 newAbaf);

    // ───────── Errors ─────────
    error FactorIsZero();
    error NotOwner();
    error InsufficientBalance(address account, uint256 available, uint256 required);
    error InsufficientAllowance(address spender, uint256 available, uint256 required);

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor() {
        owner = msg.sender;
        _abaf = SCALE; // identity factor
    }

    function multipleAdjustBalances(uint256 rawFactor, uint256 times) external onlyOwner {
        for (uint256 i = 0; i < times; i++) {
            adjustBalances(rawFactor);
        }
    }

    // ══════════════════════════════════════════════
    //              ERC20  WRITE
    // ══════════════════════════════════════════════

    function transfer(address to, uint256 amount) external returns (bool) {
        _transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        _approve(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 currentAllowance = allowance(from, msg.sender);
        if (currentAllowance < amount) {
            revert InsufficientAllowance(msg.sender, currentAllowance, amount);
        }
        // Materialize and reduce allowance
        _materializeAllowance(from, msg.sender);
        _allowances[from][msg.sender] -= amount;
        _transfer(from, to, amount);
        return true;
    }

    // ══════════════════════════════════════════════
    //                   MINT
    // ══════════════════════════════════════════════

    function mint(address to, uint256 rawAmount) external onlyOwner {
        uint256 amount = rawAmount * (10 ** decimals);
        _materializeBalance(to);
        _rawBalances[to] += amount;
        _rawTotalSupply += amount;
        _labafTotalSupply = _abaf;
        emit Transfer(address(0), to, amount);
    }

    // ══════════════════════════════════════════════
    //                 ABAF  CORE
    // ══════════════════════════════════════════════

    /**
     * @return The current ABAF accumulator value.
     */
    function getAbaf() external view returns (uint256) {
        return _abaf;
    }
    /**
     * @notice Multiply every balance and totalSupply by `factor / SCALE`.
     * @param rawFactor  The multiplier in percentange units (e.g. 200 = ×2).
     */
    function adjustBalances(uint256 rawFactor) public onlyOwner {
        if (rawFactor == 0) revert FactorIsZero();

        uint256 factor = rawFactor * FACTORSCALE;

        // Update totalSupply with the pending factor before changing abaf
        _materializeTotalSupply();

        // Compound the global accumulator
        uint256 oldAbaf = _abaf;
        _abaf = (oldAbaf * factor) / SCALE;

        // Apply factor to raw totalSupply
        _rawTotalSupply = (_rawTotalSupply * factor) / SCALE;

        // Update totalSupply labaf to the new abaf
        _labafTotalSupply = _abaf;

        emit BalancesAdjusted(factor, _abaf);
    }

    // ══════════════════════════════════════════════
    //              ERC20  READ
    // ══════════════════════════════════════════════

    function totalSupply() public view returns (uint256) {
        return _rawTotalSupply;
    }

    function balanceOf(address account) public view returns (uint256) {
        uint256 raw = _rawBalances[account];
        if (raw == 0) return 0;
        uint256 labaf = _effectiveLabaf(account);
        // Adjust: effective = (raw * currentAbaf) / accountLabaf
        return (raw * _abaf) / labaf;
    }

    function allowance(address _owner, address spender) public view returns (uint256) {
        uint256 raw = _allowances[_owner][spender];
        if (raw == 0) return 0;
        uint256 labaf = _effectiveAllowanceLabaf(_owner, spender);
        return (raw * _abaf) / labaf;
    }

    // ══════════════════════════════════════════════
    //              INTERNAL HELPERS
    // ══════════════════════════════════════════════

    function _transfer(address from, address to, uint256 amount) internal {
        // Materialize both balances to current abaf
        _materializeBalance(from);
        _materializeBalance(to);

        if (_rawBalances[from] < amount) {
            revert InsufficientBalance(from, _rawBalances[from], amount);
        }
        _rawBalances[from] -= amount;
        _rawBalances[to] += amount;

        emit Transfer(from, to, amount);
    }

    function _approve(address _owner, address spender, uint256 amount) internal {
        _materializeAllowance(_owner, spender);
        _allowances[_owner][spender] = amount;
        emit Approval(_owner, spender, amount);
    }

    /**
     * @dev "Materializes" an account's balance: applies any pending ABAF
     *      adjustment so that _rawBalances[account] reflects the current effective
     *      balance, then resets the account's labaf to the current abaf.
     */
    function _materializeBalance(address account) internal {
        uint256 labaf = _effectiveLabaf(account);
        if (labaf != _abaf) {
            uint256 raw = _rawBalances[account];
            if (raw != 0) {
                _rawBalances[account] = (raw * _abaf) / labaf;
            }
            _labaf[account] = _abaf;
        }
    }

    function _materializeTotalSupply() internal {
        uint256 labaf = _labafTotalSupply == 0 ? SCALE : _labafTotalSupply;
        if (labaf != _abaf) {
            _rawTotalSupply = (_rawTotalSupply * _abaf) / labaf;
            _labafTotalSupply = _abaf;
        }
    }

    function _materializeAllowance(address _owner, address spender) internal {
        uint256 labaf = _effectiveAllowanceLabaf(_owner, spender);
        if (labaf != _abaf) {
            uint256 raw = _allowances[_owner][spender];
            if (raw != 0) {
                _allowances[_owner][spender] = (raw * _abaf) / labaf;
            }
            _labafAllowance[_owner][spender] = _abaf;
        }
    }

    function _effectiveLabaf(address account) internal view returns (uint256) {
        uint256 labaf = _labaf[account];
        return labaf == 0 ? SCALE : labaf;
    }

    function _effectiveAllowanceLabaf(address _owner, address spender) internal view returns (uint256) {
        uint256 labafAllowance = _labafAllowance[_owner][spender];
        return labafAllowance == 0 ? SCALE : labafAllowance;
    }
}
