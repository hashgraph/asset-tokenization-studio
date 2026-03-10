// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { IBondRead } from "../../facets/layer_2/bond/IBondRead.sol";

contract MockBond is IBondRead {
    // --- Storage ---
    BondDetailsData private _bondDetails;
    mapping(uint256 => RegisteredCoupon) private _coupons;
    mapping(uint256 => mapping(address => CouponFor)) private _couponFor;
    mapping(uint256 => mapping(address => CouponAmountFor)) private _couponAmountFor;
    mapping(address => PrincipalFor) private _principalFor;
    uint256 private _couponCount;
    uint256[] private _couponsOrderedList;
    mapping(uint256 => address[]) private _couponHolders;

    // --- Errors ---
    error IndexOutOfBounds(uint256 index, uint256 length);

    // --- Setters (mock__ prefix to avoid naming collisions with IBondRead) ---
    // solhint-disable func-name-mixedcase
    function mock__setBondDetails(BondDetailsData calldata data) external {
        _bondDetails = data;
    }
    function mock__setCoupon(uint256 id, RegisteredCoupon calldata data) external {
        _coupons[id] = data;
    }
    function mock__setCouponFor(uint256 id, address account, CouponFor calldata data) external {
        _couponFor[id][account] = data;
    }
    function mock__setCouponAmountFor(uint256 id, address account, CouponAmountFor calldata data) external {
        _couponAmountFor[id][account] = data;
    }
    function mock__setPrincipalFor(address account, PrincipalFor calldata data) external {
        _principalFor[account] = data;
    }
    function mock__setCouponCount(uint256 count) external {
        _couponCount = count;
    }
    function mock__setCouponHolders(uint256 id, address[] calldata holders) external {
        delete _couponHolders[id];
        for (uint256 i; i < holders.length; i++) _couponHolders[id].push(holders[i]);
    }
    function mock__setCouponsOrderedList(uint256[] calldata list) external {
        delete _couponsOrderedList;
        for (uint256 i; i < list.length; i++) _couponsOrderedList.push(list[i]);
    }
    // solhint-enable func-name-mixedcase

    // --- IBondRead view functions ---
    function getBondDetails() external view override returns (BondDetailsData memory) {
        return _bondDetails;
    }
    function getCoupon(uint256 id) external view override returns (RegisteredCoupon memory) {
        return _coupons[id];
    }
    function getCouponFor(uint256 id, address account) external view override returns (CouponFor memory) {
        return _couponFor[id][account];
    }
    function getCouponAmountFor(uint256 id, address account) external view override returns (CouponAmountFor memory) {
        return _couponAmountFor[id][account];
    }
    function getPrincipalFor(address account) external view override returns (PrincipalFor memory) {
        return _principalFor[account];
    }
    function getCouponCount() external view override returns (uint256) {
        return _couponCount;
    }
    function getTotalCouponHolders(uint256 id) external view override returns (uint256) {
        return _couponHolders[id].length;
    }
    function getCouponsOrderedListTotal() external view override returns (uint256) {
        return _couponsOrderedList.length;
    }

    function getCouponHolders(
        uint256 id,
        uint256 pageIndex,
        uint256 pageLength
    ) external view override returns (address[] memory) {
        address[] storage holders = _couponHolders[id];
        uint256 start = pageIndex * pageLength;
        if (start >= holders.length) return new address[](0);
        uint256 end = start + pageLength;
        if (end > holders.length) end = holders.length;
        address[] memory page = new address[](end - start);
        for (uint256 i; i < page.length; i++) page[i] = holders[start + i];
        return page;
    }

    function getCouponFromOrderedListAt(uint256 pos) external view override returns (uint256) {
        if (pos >= _couponsOrderedList.length) revert IndexOutOfBounds(pos, _couponsOrderedList.length);
        return _couponsOrderedList[pos];
    }

    function getCouponsOrderedList(
        uint256 pageIndex,
        uint256 pageLength
    ) external view override returns (uint256[] memory) {
        uint256 start = pageIndex * pageLength;
        if (start >= _couponsOrderedList.length) return new uint256[](0);
        uint256 end = start + pageLength;
        if (end > _couponsOrderedList.length) end = _couponsOrderedList.length;
        uint256[] memory page = new uint256[](end - start);
        for (uint256 i; i < page.length; i++) page[i] = _couponsOrderedList[start + i];
        return page;
    }
}
