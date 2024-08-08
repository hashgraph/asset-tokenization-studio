import type { FileInputConfigProps } from "@Components/Forms/FileInput";
import { fileInputPartsList } from "@Components/Forms/FileInput";

export const ConfigFileInput = {
  parts: fileInputPartsList,
  baseStyle: ({ isDragging, isDisabled, isInvalid }: FileInputConfigProps) => ({
    container: {
      h: "116px",
      bgColor: "neutral",
      borderRadius: 4,
      border: "1px",
      borderStyle: "dashed",
      borderColor: "neutral.500",
      flexDir: "column",
      position: "relative",
      py: 4,
      gap: 2,
      _hover: {
        cursor: "pointer",
        bgColor: "neutral.50",
      },
      _focus: {
        _before: {
          content: `""`,
          position: "absolute",
          width: "100%",
          height: "122px",
          borderRadius: 1,
          zIndex: -1,
          filter: "blur(3px)",
          bg: "primary.100",
        },
      },
      _focusVisible: {
        outline: "none",
      },
      _dragOver: {
        borderStyle: "solid",
      },
      ...(isDragging && {
        borderStyle: "solid",
        borderColor: "primary.500",
        bgColor: "primary.50",
      }),
      ...(isDisabled && {
        bgColor: "neutral.100",
        borderColor: "neutral.400",
        cursor: "not-allowed",
        _hover: {},
        _focus: {},
        _active: {},
      }),
      ...(isInvalid && {
        borderColor: "error.500",
      }),
    },
    icon: {
      color: "primary.500",
      ...(isDisabled && {
        opacity: 0.5,
      }),
    },
    label: {
      apply: "textStyles.BodyMediumSM",
      ...(isDisabled && {
        opacity: 0.5,
      }),
    },
    description: {
      apply: "textStyles.BodyRegularXS",
      ...(isDisabled && {
        opacity: 0.5,
      }),
      ...(isInvalid && {
        color: "error.500",
      }),
    },
    input: {
      display: "none",
    },
  }),
};
