// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

interface ICorporateActions {
    /**
     * @dev Returns a corporate action info
     *
     * @param _corporateActionId The corporate action unique Id
     * @return actionType_ the corporate action type
     * @return actionTypeIndex_ the corporate action type index
     * @return data_ the corporate action related data (body and anything else)
     * @return isDisabled_ the corporate action disabled status
     */
    function getCorporateAction(
        bytes32 _corporateActionId
    ) external view returns (bytes32 actionType_, uint256 actionTypeIndex_, bytes memory data_, bool isDisabled_);

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
     * @dev Returns an array of corporte actions the token currently has
     *
     * @param _pageIndex members to skip : _pageIndex * _pageLength
     * @param _pageLength number of members to return
     * @return actionTypes_ The array of corporate action types
     * @return actionTypeIndex_ The array of corporate action type index
     * @return datas_ The array of corporate action related data (body and anything else)
     * @return isDisabled_ The array of corporate action disabled status
     */
    function getCorporateActions(
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        returns (
            bytes32[] memory actionTypes_,
            uint256[] memory actionTypeIndex_,
            bytes[] memory datas_,
            bool[] memory isDisabled_
        );

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
     * @return corporateActionIds_ The array containing the corporate actions ids
     */
    function getCorporateActionIdsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    ) external view returns (bytes32[] memory corporateActionIds_);

    /**
     * @dev Returns an array of corporate actions by type the token currently has
     *
     * @param _actionType The corporate action type
     * @param _pageIndex members to skip : _pageIndex * _pageLength
     * @param _pageLength number of members to return
     * @return actionTypes_ The array of corporate action types
     * @return actionTypeIndex_ The array of corporate action type index
     * @return datas_ The array of corporate action related data (body and anything else)
     * @return isDisabled_ The array of corporate action disabled status
     */
    function getCorporateActionsByType(
        bytes32 _actionType,
        uint256 _pageIndex,
        uint256 _pageLength
    )
        external
        view
        returns (
            bytes32[] memory actionTypes_,
            uint256[] memory actionTypeIndex_,
            bytes[] memory datas_,
            bool[] memory isDisabled_
        );

    function actionContentHashExists(bytes32 _contentHash) external view returns (bool);
}
