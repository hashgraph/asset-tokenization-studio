// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/* solhint-disable-next-line no-empty-blocks */
interface ICompliance {
    /**
     * @notice Notify the compliance module that a transfer has been made
     * @dev The compliance module will update its internal state accordingly
     */
    function transferred(address _from, address _to, uint256 _amount) external;

    /**
     * @notice Notify the compliance module that an issue has been made
     * @dev The compliance module will update its internal state accordingly
     */
    function created(address _to, uint256 _amount) external;

    /**
     * @notice Notify the compliance module that a redemption has been made
     * @dev The compliance module will update its internal state accordingly
     */
    function destroyed(address _from, uint256 _amount) external;

    /**
     * @notice Query the compliance module to check if a transfer can be made
     */
    function canTransfer(address _from, address _to, uint256 _amount) external view returns (bool);
}
