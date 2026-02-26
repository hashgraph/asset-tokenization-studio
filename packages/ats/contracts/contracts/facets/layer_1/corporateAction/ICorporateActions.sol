// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ICorporateActions {
    /**
     * @dev Returns a corporate action info
     *
     * @param _corporateActionId The corporate action unique Id
     * @return actionType_ the corproate action type
     * @return actionTypeIndex_ the corproate action type index
     * @return data_ the corproate action related data (body and anything else)
     */
    function getCorporateAction(
        bytes32 _corporateActionId
    ) external view returns (bytes32 actionType_, uint256 actionTypeIndex_, bytes memory data_);

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

    function actionContentHashExists(bytes32 _contentHash) external view returns (bool);
}
