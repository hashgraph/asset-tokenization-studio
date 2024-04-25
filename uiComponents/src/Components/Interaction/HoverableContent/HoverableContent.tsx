import { useHover } from "@/Hooks";
import type { FlexProps } from "@chakra-ui/react";
import { Flex } from "@chakra-ui/react";
import type { ReactNode } from "react";
import React from "react";

export interface HoverableContentProps extends FlexProps {
  hiddenContent: ReactNode;
}

export const HoverableContent = ({
  children,
  hiddenContent,
  ...props
}: HoverableContentProps) => {
  const [containerRef, isHovered, refHover] = useHover();

  const handleEvent = (eventName: string) => {
    if (refHover.current) {
      refHover.current.dispatchEvent(new Event(eventName));
    }
  };

  return (
    <Flex
      ref={containerRef}
      data-testid="hoverable-content"
      tabIndex={0}
      onFocus={() => handleEvent("mouseenter")}
      onBlur={() => handleEvent("mouseleave")}
      _focusVisible={{ outline: "var(--chakra-colors-primary-100) auto 1px" }}
      {...props}
    >
      {children}
      {isHovered && hiddenContent}
    </Flex>
  );
};
