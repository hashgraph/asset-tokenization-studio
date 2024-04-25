import { useState, useCallback, useRef } from "react";
// Hook
export var useHover = function () {
    var _a = useState(false), value = _a[0], setValue = _a[1];
    // Wrap in useCallback so we can use in dependencies below
    var handleMouseEnter = useCallback(function () { return setValue(true); }, []);
    var handleMouseLeave = useCallback(function () { return setValue(false); }, []);
    // Keep track of the last node passed to callbackRef
    // so we can remove its event listeners.
    var ref = useRef();
    // Use a callback ref instead of useEffect so that event listeners
    // get changed in the case that the returned ref gets added to
    // a different element later. With useEffect, changes to ref.current
    // wouldn't cause a rerender and thus the effect would run again.
    var callbackRef = useCallback(function (node) {
        if (ref.current) {
            ref.current.removeEventListener("mouseenter", handleMouseEnter);
            ref.current.removeEventListener("mouseleave", handleMouseLeave);
        }
        ref.current = node || undefined;
        if (ref.current) {
            ref.current.addEventListener("mouseenter", handleMouseEnter);
            ref.current.addEventListener("mouseleave", handleMouseLeave);
        }
    }, [handleMouseEnter, handleMouseLeave]);
    return [callbackRef, value, ref];
};
