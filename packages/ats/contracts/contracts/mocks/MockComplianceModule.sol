// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title MockComplianceModule
 * @dev Mock implementation of IModule interface for testing compliance module functionality
 */
contract MockComplianceModule {
    mapping(address => bool) private _boundCompliances;
    mapping(address => uint256) private _complianceConfig;

    event ComplianceBound(address indexed _compliance);
    event ComplianceUnbound(address indexed _compliance);
    event ConfigSet(address indexed _compliance, uint256 value);

    /**
     * @dev Binds the module to a compliance contract
     * @param _compliance address of the compliance contract
     */
    function bindCompliance(address _compliance) external {
        require(!_boundCompliances[_compliance], "already bound");
        _boundCompliances[_compliance] = true;
        emit ComplianceBound(_compliance);
    }

    /**
     * @dev Unbinds the module from a compliance contract
     * @param _compliance address of the compliance contract
     */
    function unbindCompliance(address _compliance) external {
        require(_boundCompliances[_compliance], "not bound");
        _boundCompliances[_compliance] = false;
        emit ComplianceUnbound(_compliance);
    }

    /**
     * @dev Configuration function to test compliance settings
     * @param _value configuration value to set
     */
    function setConfig(uint256 _value) external {
        _complianceConfig[msg.sender] = _value;
        emit ConfigSet(msg.sender, _value);
    }

    /**
     * @dev Returns whether a compliance is bound
     * @param _compliance address of the compliance contract
     */
    function isComplianceBound(address _compliance) external view returns (bool) {
        return _boundCompliances[_compliance];
    }

    /**
     * @dev Get configuration value
     * @param _compliance address of the compliance contract
     */
    function getConfig(address _compliance) external view returns (uint256) {
        return _complianceConfig[_compliance];
    }

    /**
     * @dev Mock implementation of moduleTransferAction
     */
    function moduleTransferAction(address, address, uint256) external pure {
        // solhint-disable-previous-line no-empty-blocks
    }

    /**
     * @dev Mock implementation of moduleMintAction
     */
    function moduleMintAction(address, uint256) external pure {
        // solhint-disable-previous-line no-empty-blocks
    }

    /**
     * @dev Mock implementation of moduleBurnAction
     */
    function moduleBurnAction(address, uint256) external pure {
        // solhint-disable-previous-line no-empty-blocks
    }

    /**
     * @dev Mock implementation of moduleCheck
     */
    function moduleCheck(address, address, uint256, address) external pure returns (bool) {
        return true;
    }

    /**
     * @dev checks whether compliance is suitable to bind to the module
     */
    function canComplianceBind(address) external pure returns (bool) {
        return true;
    }

    /**
     * @dev getter for module plug & play status
     */
    function isPlugAndPlay() external pure returns (bool) {
        return true;
    }

    /**
     * @dev getter for the name of the module
     */
    function name() external pure returns (string memory) {
        return "MockComplianceModule";
    }
}
