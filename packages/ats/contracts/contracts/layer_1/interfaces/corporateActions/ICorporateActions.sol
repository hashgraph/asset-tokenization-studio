// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ICorporateActions {
    /**
     * @dev Emitted when a corporate action gets added
     *
     * @param operator The caller of the function that emitted the event
     * @param actionType The corporate action's action type (used for classification)
     * @param corporateActionId The corporate action's unique Id
     * @param corporateActionIndexByType The corporate action's index for its action type
     * @param data The corporate action's data (defining the corporate aciton itself)
     */
    event CorporateActionAdded(
        address indexed operator,
        bytes32 indexed actionType,
        bytes32 indexed corporateActionId,
        uint256 corporateActionIndexByType,
        bytes data
    );

    error DuplicatedCorporateAction(bytes32 actionType, bytes data);

    function addCorporateAction(
        bytes32 _actionType,
        bytes memory _data
    ) external returns (bool success_, bytes32 corporateActionId_, uint256 corporateActionIndexByType_);

    /**
     * @dev Returns a corporate action info
     *
     * @param _corporateActionId The corporate action unique Id
     * @return actionType_ the corproate action type
     * @return data_ the corproate action related data (body and anything else)
     */
    function getCorporateAction(
        bytes32 _corporateActionId
    ) external view returns (bytes32 actionType_, bytes memory data_);

    /**
     * @dev Returns the number of corporate actions the token currently has
     *
     * @return corporateActionCount_ The number of corporate actions
     */
    function getCorporateActionCount() external view returns (uint256 corporateActionCount_);

    /**
     * @dev Returns an array of corporte actions ids the token currently has
     *
     * @param _pageIndex members to skip : _pageIndex * _pageLength
     * @param _pageLength number of members to return
     * @return corporateActionIds_ The array containing the corproate actions ids
     */
    function getCorporateActionIds(
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory corporateActionIds_);

    /**
     * @dev Returns the number of corporate actions of a specific type the token currently has
     *
     * @param _actionType The corporate action type
     * @return corporateActionCount_ The number of corporate actions of that specific type
     */
    function getCorporateActionCountByType(bytes32 _actionType) external view returns (uint256 corporateActionCount_);

    /**
     * @dev Returns an array of corporte actions ids by type the token currently has
     *
     * @param _actionType The corporate action type
     * @param _pageIndex members to skip : _pageIndex * _pageLength
     * @param _pageLength number of members to return
     * @return corporateActionIds_ The array containing the corproate actions ids
     */
    function getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory corporateActionIds_);
}
