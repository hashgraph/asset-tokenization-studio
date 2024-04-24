import type { TagThemeConfiguration } from "@/Components/DataDisplay/Tag";
import { tagPartsList } from "@/Components/DataDisplay/Tag";
import { focusVisible } from "@/Theme/utils";
const neutralColor = "neutral";

const bgDisabled = `${neutralColor}.100`;
const bgEnabled = `${neutralColor}.300`;
const colorDisabled = `${neutralColor}.400`;
const colorEnabled = `${neutralColor}.800`;

export const ConfigTag: TagThemeConfiguration = {
  parts: tagPartsList,
  baseStyle: ({ disabled }) => ({
    label: {
      apply: "textStyles.ElementsMediumSM",
      color: disabled ? colorDisabled : colorEnabled,
    },
    container: {
      transition: "all 0.2s",
      display: "inline-flex",
      width: "max-content",
      alignItems: "center",
      justifyContent: "center",
      minW: "48px",
      padding: "4px 16px",
      bg: disabled ? bgDisabled : bgEnabled,
      svg: {
        color: disabled ? colorDisabled : colorEnabled,
      },
      _disabled: {
        color: colorDisabled,
        bg: bgDisabled,
      },
      borderRadius: "full",
      gap: "0.25rem",
      _hover: {
        bg: disabled ? bgDisabled : `${neutralColor}.400`,
        cursor: disabled ? "not-allowed" : "pointer",
      },
      _focusVisible: focusVisible,
    },
  }),
  sizes: {
    sm: {
      container: { height: 6 },
    },
    lg: {
      container: {
        height: "34px",
      },
    },
  },
  defaultProps: {
    size: "lg",
  },
};
