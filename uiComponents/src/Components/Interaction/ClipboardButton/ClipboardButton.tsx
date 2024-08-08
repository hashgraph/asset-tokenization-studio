import React from "react";
import { useMultiStyleConfig as useChakraMultiStyleConfig } from "@chakra-ui/system";
import type { BaseMultiStyleConfiguration } from "@Theme/Components/BaseMultiStyleConfiguration";
import { CopySimple } from "@phosphor-icons/react";
import type { IconButtonProps } from "@Components/Interaction/IconButton";
import { IconButton } from "@Components/Interaction/IconButton";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { useClipboard } from "@chakra-ui/react";

export const clipboardButtonPartsList: Array<
  "iconButton" | "icon" | "tooltip"
> = ["iconButton", "icon", "tooltip"];

type Parts = typeof clipboardButtonPartsList;

export interface ClipboardButtonConfiguration
  extends BaseMultiStyleConfiguration<Parts> {}

export interface ClipboardButtonProps
  extends Omit<IconButtonProps, "as" | "onClick" | "aria-label"> {
  value: string;
  variant?: string;
  size?: string;
}

export const ClipboardButton = ({
  value,
  variant,
  size = "xxs",
  ...props
}: ClipboardButtonProps) => {
  const styles = useChakraMultiStyleConfig("ClipboardButton", { variant });

  const { onCopy } = useClipboard(value);

  return (
    <IconButton
      aria-label={`Copy to clipboard-${value}`}
      icon={<PhosphorIcon sx={styles.icon} size={size} as={CopySimple} />}
      onClick={(e) => {
        e.stopPropagation();
        onCopy();
      }}
      variant="tertiary"
      sx={styles.iconButton}
      {...props}
    />
  );
};
