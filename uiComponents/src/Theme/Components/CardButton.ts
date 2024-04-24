import type {
  CardButtonProps,
  CardButtonThemeConfiguration,
} from "@Components/Interaction/CardButton";
import { cardButtonPartsList } from "@Components/Interaction/CardButton";

export const ConfigCardButton: CardButtonThemeConfiguration = {
  parts: cardButtonPartsList,
  baseStyle: ({ isSelected }: CardButtonProps) => ({
    container: {
      w: "120px",
      h: "136px",
      bg: "neutral",
      borderWidth: 1,
      borderColor: isSelected ? "primary.500" : "neutral.300",
      alignItems: "center",
      position: "relative",
      p: 0,
      _hover: {
        bg: "neutral",
        boxShadow: "var(--chakra-colors-primary-100) 0px 1px 5px 1px",
      },
      _focus: {
        _before: {
          content: `""`,
          position: "absolute",
          width: "126px",
          height: "142px",
          borderRadius: "4px",
          zIndex: -1,
          filter: "blur(3px)",
          bg: "primary.100",
        },
      },
      _disabled: {
        bg: "neutral.50",
        cursor: "not-allowed",
        boxShadow: "none",
        _hover: {},
        _focus: {},
        _active: {},
        opacity: 0.5,
      },
    },
    content: {
      h: "full",
      flexDir: "column",
      alignItems: "center",
      py: 4,
      px: 2,
      gap: 4,
    },
    icon: {
      color: "primary.500 !important",
      bgColor: "primary.50",
      borderRadius: "full",
      p: 2,
    },
    text: {
      w: "104px",
      h: "40px",
      color: "neutral.800",
      apply: "textStyles.ElementsMediumSM",
      noOfLines: 2,
      whiteSpace: "normal",
    },
    check: {
      w: "24px",
      h: "24px",
      position: "absolute",
      top: -1,
      right: -1,
      bgColor: "primary.500",
      borderWidth: 1,
      borderColor: "primary.500",
      borderRadius: "full",
      alignItems: "center",
      justifyContent: "center",
    },
    tooltip: {
      p: 0,
      textAlign: "center",
    },
  }),
};
