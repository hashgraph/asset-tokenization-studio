import React from "react";
import type { IconButtonProps } from "@/Components/Interaction/IconButton";
import { IconButton } from "@/Components/Interaction/IconButton";
import { X } from "@phosphor-icons/react";
import { PhosphorIcon } from "@/Components/Foundations";

export interface CloseButtonProps extends Omit<IconButtonProps, "aria-label"> {}

export const CloseButton = ({ ...props }: CloseButtonProps) => {
  return (
    <IconButton
      aria-label="close-button"
      icon={<PhosphorIcon as={X} />}
      variant={"tertiary"}
      {...props}
    />
  );
};
