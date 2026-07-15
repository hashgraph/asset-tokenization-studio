// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

import { Bytes4Builder } from "../../infrastructure/proxy/Bytes4Builder.sol";

contract Bytes4BuilderMock {
    function build1(bytes4 a) external pure returns (bytes4[] memory) {
        return Bytes4Builder.build(a);
    }

    function build2(bytes4 a, bytes4 b) external pure returns (bytes4[] memory) {
        return Bytes4Builder.build(a, b);
    }

    function build3(bytes4 a, bytes4 b, bytes4 c) external pure returns (bytes4[] memory) {
        return Bytes4Builder.build(a, b, c);
    }

    function build4(bytes4 a, bytes4 b, bytes4 c, bytes4 d) external pure returns (bytes4[] memory) {
        return Bytes4Builder.build(a, b, c, d);
    }

    function build5(bytes4 a, bytes4 b, bytes4 c, bytes4 d, bytes4 e) external pure returns (bytes4[] memory) {
        return Bytes4Builder.build(a, b, c, d, e);
    }

    function build6(
        bytes4 a,
        bytes4 b,
        bytes4 c,
        bytes4 d,
        bytes4 e,
        bytes4 f
    ) external pure returns (bytes4[] memory) {
        return Bytes4Builder.build(a, b, c, d, e, f);
    }

    function build7(
        bytes4 a,
        bytes4 b,
        bytes4 c,
        bytes4 d,
        bytes4 e,
        bytes4 f,
        bytes4 g
    ) external pure returns (bytes4[] memory) {
        return Bytes4Builder.build(a, b, c, d, e, f, g);
    }

    function build8(
        bytes4 a,
        bytes4 b,
        bytes4 c,
        bytes4 d,
        bytes4 e,
        bytes4 f,
        bytes4 g,
        bytes4 h
    ) external pure returns (bytes4[] memory) {
        return Bytes4Builder.build(a, b, c, d, e, f, g, h);
    }

    function build9(
        bytes4 a,
        bytes4 b,
        bytes4 c,
        bytes4 d,
        bytes4 e,
        bytes4 f,
        bytes4 g,
        bytes4 h,
        bytes4 i
    ) external pure returns (bytes4[] memory) {
        return Bytes4Builder.build(a, b, c, d, e, f, g, h, i);
    }

    function build10(
        bytes4 a,
        bytes4 b,
        bytes4 c,
        bytes4 d,
        bytes4 e,
        bytes4 f,
        bytes4 g,
        bytes4 h,
        bytes4 i,
        bytes4 j
    ) external pure returns (bytes4[] memory) {
        return Bytes4Builder.build(a, b, c, d, e, f, g, h, i, j);
    }

    function build11(
        bytes4 a,
        bytes4 b,
        bytes4 c,
        bytes4 d,
        bytes4 e,
        bytes4 f,
        bytes4 g,
        bytes4 h,
        bytes4 i,
        bytes4 j,
        bytes4 k
    ) external pure returns (bytes4[] memory) {
        return Bytes4Builder.build(a, b, c, d, e, f, g, h, i, j, k);
    }

    function build12(
        bytes4 a,
        bytes4 b,
        bytes4 c,
        bytes4 d,
        bytes4 e,
        bytes4 f,
        bytes4 g,
        bytes4 h,
        bytes4 i,
        bytes4 j,
        bytes4 k,
        bytes4 m
    ) external pure returns (bytes4[] memory) {
        return Bytes4Builder.build(a, b, c, d, e, f, g, h, i, j, k, m);
    }
}
