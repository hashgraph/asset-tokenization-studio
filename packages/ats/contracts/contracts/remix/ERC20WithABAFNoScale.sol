// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.20;

/**
 * @title ERC20WithABAFNoScale
 * @notice Minimal ERC20 with raw (non-SCALE-normalized) ABAF.
 *
 * This is the ORIGINAL approach before SCALE normalization.
 * The factor is a raw integer multiplier: factor=2 doubles balances,
 * factor=3 triples them, etc.
 *
 * WARNING: This approach overflows uint256 after ~4-5 adjustments with
 * large factors because abaf compounds as `abaf = abaf * factor` without
 * any normalization. This contract exists to demonstrate the overflow
 * problem that SCALE normalization solves.
 *
 * ─── Quick Remix test plan ───
 *   1. Deploy
 *   2. mint(alice, 1000)                         // decimals=6 → raw=1000000000
 *   3. mint(bob,   500)
 *   4. balanceOf(alice) → 1000000000
 *   5. adjustBalances(2, 0)                      →  ×2
 *   6. balanceOf(alice) → 2000000000
 *   7. adjustBalances(5, 1)                      →  ×5 + 1 decimal = ×0.5
 *   8. balanceOf(alice) → 10000000000            (decimals now 7, so display = 1000.0)
 *   9. adjustBalances(333333, 6)                 →  ×0.333333 (+ 6 decimals)
 *  10. balanceOf(alice) → 3333330000000000       (decimals now 13)
 *  11. Repeat adjustBalances(253, 0) a few times → OVERFLOW!
 */
contract ERC20WithABAFNoScale {
    // ───────── ERC20 metadata ─────────
    string public name = "AbafNoScaledToken";
    string public symbol = "ASNT";
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
        _abaf = 1; // identity factor (raw)
    }

    function multipleAdjustBalances(uint256 factor, uint8 extraDecimals, uint256 times) external onlyOwner {
        for (uint256 i = 0; i < times; i++) {
            adjustBalances(factor, extraDecimals);
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
     * @notice Multiply every balance and totalSupply by `factor`, adding `extraDecimals`
     *         to the token's decimals.
     * @param factor         Raw integer multiplier (e.g. 2 = ×2, 5 = ×5).
     * @param extraDecimals  Additional decimals to add (0 for a pure multiply).
     *
     * To reduce balances: use factor + extra decimals. For example:
     *   - Halve balances:  factor=5, extraDecimals=1  → ×5 then /10 via decimals = ×0.5
     *   - Divide by 3:     factor=10, extraDecimals=2 → ×10 but 2 more decimals  ≈ ×(1/3) visually
     *   - Multiply by 1/3: factor=333333, extraDecimals=6 → ×0.333333
     */
    function adjustBalances(uint256 factor, uint8 extraDecimals) public onlyOwner {
        if (factor == 0) revert FactorIsZero();

        // Update totalSupply with the pending factor before changing abaf
        _materializeTotalSupply();

        // Compound the global accumulator (NO normalization — this overflows!)
        _abaf = _abaf * factor;

        // Apply factor to raw totalSupply
        _rawTotalSupply = _rawTotalSupply * factor;

        // Update totalSupply labaf to the new abaf
        _labafTotalSupply = _abaf;

        // Shift decimals to encode the fractional part
        decimals += extraDecimals;

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
        uint256 labaf = _labafTotalSupply == 0 ? 1 : _labafTotalSupply;
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
        return labaf == 0 ? 1 : labaf;
    }

    function _effectiveAllowanceLabaf(address _owner, address spender) internal view returns (uint256) {
        uint256 labafAllowance = _labafAllowance[_owner][spender];
        return labafAllowance == 0 ? 1 : labafAllowance;
    }
}
