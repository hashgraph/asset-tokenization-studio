// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

// ─────────────────────────────────────────────────────────────────────────────
//  INIT-BIT ASSIGNMENT RULES
//
//  1. Bits are claimed ONCE, FOREVER. Never renumber, never reuse a bit number.
//  2. Bit order is INDEPENDENT of struct field order — storage layout may evolve
//     on fresh deployments; bit identities are frozen from first production use.
//  3. The INITIAL claim ordering for a domain should follow the current struct
//     field order at introduction time (pragmatic default for readability).
//     After that: APPEND ONLY.
//  4. Removed fields: keep the bit constant in place with a `// DEPRECATED`
//     comment. Never reuse the bit number — old tokens may still have it set.
//  5. Aggregate masks (_<DOMAIN>_INIT_BITS_*) are code — free to evolve.
// ─────────────────────────────────────────────────────────────────────────────

// Bits claimed on ERC20Storage.initBitmap.
// Order matches ERC20Storage field order at introduction time (decimals,
// securityType, name, symbol, isin — the init-tracked scalars).
uint256 constant _ERC20_INIT_BIT_DECIMALS = 1 << 0;
uint256 constant _ERC20_INIT_BIT_SECURITY_TYPE = 1 << 1;
uint256 constant _ERC20_INIT_BIT_NAME = 1 << 2;
uint256 constant _ERC20_INIT_BIT_SYMBOL = 1 << 3;
uint256 constant _ERC20_INIT_BIT_ISIN = 1 << 4;

// Aggregate mask owned by the Core facet today.
uint256 constant _ERC20_INIT_BITS_CORE = _ERC20_INIT_BIT_DECIMALS |
    _ERC20_INIT_BIT_SECURITY_TYPE |
    _ERC20_INIT_BIT_NAME |
    _ERC20_INIT_BIT_SYMBOL |
    _ERC20_INIT_BIT_ISIN;
