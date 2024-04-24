import { clipboardButtonPartsList } from "@Components/Interaction/ClipboardButton";
import type { ClipboardButtonConfiguration } from "@Components/Interaction/ClipboardButton";

const focusStyle = {
  boxShadow: "none",
  bg: "transparent",
  _before: {
    borderWidth: 0,
  },
};

export const ClipboardButtonTheme: ClipboardButtonConfiguration = {
  parts: clipboardButtonPartsList,
  baseStyle: {
    iconButton: {
      ml: 2,
      p: 0,
      _hover: {
        bg: "transparent",
      },
      _focus: {
        ...focusStyle,
      },
      _focusVisible: {
        ...focusStyle,
      },
    },
  },
};
