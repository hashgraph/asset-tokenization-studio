// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface IERC1594 {
    error InvalidPartition();

    event Transfer(address indexed from, address indexed to, uint256 value);
    event TransferByPartition(
        bytes32 indexed partition,
        address indexed from,
        address indexed to,
        uint256 value,
        bytes data
    );

    event Issued(address indexed _operator, address indexed _to, uint256 _value, bytes _data);
    event Redeemed(address indexed _operator, address indexed _from, uint256 _value, bytes _data);
    event TransferWithData(address indexed sender, address indexed to, uint256 amount, bytes data);
    event TransferFromWithData(
        address indexed sender,
        address indexed from,
        address indexed to,
        uint256 amount,
        bytes data
    );

    function initialize_ERC1594() external;
    function transferWithData(address _to, uint256 _value, bytes calldata _data) external;
    function transferFromWithData(address _from, address _to, uint256 _value, bytes calldata _data) external;
    function issue(address _tokenHolder, uint256 _value, bytes calldata _data) external;
    function redeem(uint256 _value, bytes calldata _data) external;
    function redeemFrom(address _tokenHolder, uint256 _value, bytes calldata _data) external;
    function isIssuable() external view returns (bool);
    function canTransfer(address _to, uint256 _value, bytes calldata _data) external view returns (bool, bytes1, bytes32);
    function canTransferFrom(address _from, address _to, uint256 _value, bytes calldata _data) external view returns (bool, bytes1, bytes32);
}
