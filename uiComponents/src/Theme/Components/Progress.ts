import { progressPartsList } from "@/Components/Indicators/Progress";
import type { ProgressThemeConfiguration } from "@/Components/Indicators/Progress";

export const ConfigProgress: ProgressThemeConfiguration = {
  parts: progressPartsList,
  baseStyle: ({ isIndeterminate }) => ({
    filledTrack: {
      backgroundColor: "green.500",
      ...(isIndeterminate && {
        backgroundImage:
          "linear-gradient( to right, transparent 0%, var(--chakra-colors-green-500) 50%, transparent 100% )",
      }),
    },
    track: {
      backgroundColor: "neutral.100",
    },
  }),
  defaultProps: {
    size: "md",
  },
};
