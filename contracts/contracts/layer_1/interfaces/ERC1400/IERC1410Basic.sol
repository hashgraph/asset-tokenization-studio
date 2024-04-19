// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IERC1410Basic {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1410_Basic(
        bool _multiPartition
    ) external returns (bool success_);

    function transferByPartition(
        bytes32 _partition,
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external returns (bytes32);

    function balanceOf(address _tokenHolder) external view returns (uint256);

    function balanceOfByPartition(
        bytes32 _partition,
        address _tokenHolder
    ) external view returns (uint256);

    function partitionsOf(
        address _tokenHolder
    ) external view returns (bytes32[] memory);

    function totalSupply() external view returns (uint256);

    function isMultiPartition() external view returns (bool);

    function totalSupplyByPartition(
        bytes32 _partition
    ) external view returns (uint256);
}
