// SPDX-License-Identifier: Apache-2.0
pragma solidity >=0.8.0 <0.9.0;

/**
 * @title Bytes4Builder
 * @author Asset Tokenization Studio Team
 * @notice Library of overloaded `build` helpers that allocate and populate a `bytes4[]
 *         memory` array of fixed length, intended for use by `IStaticFunctionSelectors`
 *         implementations when reporting selectors or interface ids to the resolver.
 * @dev Solidity does not allow `[a, b, c]` (a fixed-size `bytesN[N] memory` literal) to be
 *      implicitly returned as a dynamic `bytes4[] memory`; these `internal pure` overloads
 *      provide the missing one-liner construction without the descending `--selectorIndex`
 *      boilerplate that facets otherwise carry. The compiler inlines each call, so the only
 *      runtime cost is argument marshalling onto the stack.
 *
 *      Overloads are provided for 1 through 6 elements. Facets needing larger arrays should
 *      fall back to the manual descending-loop form rather than padding this library with
 *      ever-wider overloads — the readability win flattens once N grows past the cap.
 */
library Bytes4Builder {
    /**
     * @notice Returns a `bytes4[] memory` of length 1 containing `a`.
     * @param a Element at index 0.
     * @return r Newly allocated 1-element array.
     */
    function build(bytes4 a) internal pure returns (bytes4[] memory r) {
        r = new bytes4[](1);
        r[0] = a;
    }

    /**
     * @notice Returns a `bytes4[] memory` of length 2 containing `a, b` in order.
     * @param a Element at index 0.
     * @param b Element at index 1.
     * @return r Newly allocated 2-element array.
     */
    function build(bytes4 a, bytes4 b) internal pure returns (bytes4[] memory r) {
        r = new bytes4[](2);
        r[0] = a;
        r[1] = b;
    }

    /**
     * @notice Returns a `bytes4[] memory` of length 3 containing `a, b, c` in order.
     * @param a Element at index 0.
     * @param b Element at index 1.
     * @param c Element at index 2.
     * @return r Newly allocated 3-element array.
     */
    function build(bytes4 a, bytes4 b, bytes4 c) internal pure returns (bytes4[] memory r) {
        r = new bytes4[](3);
        r[0] = a;
        r[1] = b;
        r[2] = c;
    }

    /**
     * @notice Returns a `bytes4[] memory` of length 4 containing `a, b, c, d` in order.
     * @param a Element at index 0.
     * @param b Element at index 1.
     * @param c Element at index 2.
     * @param d Element at index 3.
     * @return r Newly allocated 4-element array.
     */
    function build(bytes4 a, bytes4 b, bytes4 c, bytes4 d) internal pure returns (bytes4[] memory r) {
        r = new bytes4[](4);
        r[0] = a;
        r[1] = b;
        r[2] = c;
        r[3] = d;
    }

    /**
     * @notice Returns a `bytes4[] memory` of length 5 containing `a, b, c, d, e` in order.
     * @param a Element at index 0.
     * @param b Element at index 1.
     * @param c Element at index 2.
     * @param d Element at index 3.
     * @param e Element at index 4.
     * @return r Newly allocated 5-element array.
     */
    function build(bytes4 a, bytes4 b, bytes4 c, bytes4 d, bytes4 e) internal pure returns (bytes4[] memory r) {
        r = new bytes4[](5);
        r[0] = a;
        r[1] = b;
        r[2] = c;
        r[3] = d;
        r[4] = e;
    }

    /**
     * @notice Returns a `bytes4[] memory` of length 6 containing `a, b, c, d, e, f` in order.
     * @param a Element at index 0.
     * @param b Element at index 1.
     * @param c Element at index 2.
     * @param d Element at index 3.
     * @param e Element at index 4.
     * @param f Element at index 5.
     * @return r Newly allocated 6-element array.
     */
    function build(
        bytes4 a,
        bytes4 b,
        bytes4 c,
        bytes4 d,
        bytes4 e,
        bytes4 f
    ) internal pure returns (bytes4[] memory r) {
        r = new bytes4[](6);
        r[0] = a;
        r[1] = b;
        r[2] = c;
        r[3] = d;
        r[4] = e;
        r[5] = f;
    }
}
