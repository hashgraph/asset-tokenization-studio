// SPDX-License-Identifier: MIT
pragma solidity 0.8.18;

interface IERC1594 {
    // solhint-disable-next-line func-name-mixedcase
    function initialize_ERC1594() external returns (bool success_);

    // Transfers
    function transferWithData(
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external;

    function transferFromWithData(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external;

    // Token Issuance
    function isIssuable() external view returns (bool);

    function issue(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data
    ) external;

    // Token Redemption
    function redeem(uint256 _value, bytes calldata _data) external;

    function redeemFrom(
        address _tokenHolder,
        uint256 _value,
        bytes calldata _data
    ) external;

    // Transfer Validity
    function canTransfer(
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external view returns (bool, bytes1, bytes32);

    function canTransferFrom(
        address _from,
        address _to,
        uint256 _value,
        bytes calldata _data
    ) external view returns (bool, bytes1, bytes32);
}
