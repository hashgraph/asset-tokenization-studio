import { useState, useCallback, useRef } from "react";

// Hook
export const useHover = <T extends HTMLElement>(): [
  (node?: T | null) => void,
  boolean,
  React.MutableRefObject<T | undefined>
] => {
  const [value, setValue] = useState(false);

  // Wrap in useCallback so we can use in dependencies below
  const handleMouseEnter = useCallback(() => setValue(true), []);
  const handleMouseLeave = useCallback(() => setValue(false), []);

  // Keep track of the last node passed to callbackRef
  // so we can remove its event listeners.
  const ref = useRef<T>();

  // Use a callback ref instead of useEffect so that event listeners
  // get changed in the case that the returned ref gets added to
  // a different element later. With useEffect, changes to ref.current
  // wouldn't cause a rerender and thus the effect would run again.
  const callbackRef = useCallback<(node?: null | T) => void>(
    (node) => {
      if (ref.current) {
        ref.current.removeEventListener("mouseenter", handleMouseEnter);
        ref.current.removeEventListener("mouseleave", handleMouseLeave);
      }

      ref.current = node || undefined;

      if (ref.current) {
        ref.current.addEventListener("mouseenter", handleMouseEnter);
        ref.current.addEventListener("mouseleave", handleMouseLeave);
      }
    },
    [handleMouseEnter, handleMouseLeave]
  );

  return [callbackRef, value, ref];
};
