// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

// =============================================================================
// SHARED INTERFACES - Same for both OLD and NEW architectures
// =============================================================================

// Note: Events are defined in the implementations (Internals/Libraries)
// to avoid duplication errors when facets inherit from both interfaces
// and implementation contracts.

interface IPauseFacet {
    function pause() external;
    function unpause() external;
    function paused() external view returns (bool);
}

interface IAccessControlFacet {
    function hasRole(bytes32 role, address account) external view returns (bool);
    function grantRole(bytes32 role, address account) external;
    function revokeRole(bytes32 role, address account) external;
}

interface ITokenFacet {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function decimals() external view returns (uint8);
    function totalSupply() external view returns (uint256);
    function balanceOf(address account) external view returns (uint256);
    function transfer(address to, uint256 amount) external returns (bool);
    function allowance(address owner, address spender) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

interface IMintableFacet {
    function mint(address to, uint256 amount) external;
    function burn(address from, uint256 amount) external;
}

interface IInitializableFacet {
    function initialize(string memory name_, string memory symbol_, uint8 decimals_, address admin) external;
}
