// SPDX-License-Identifier: Apache-2.0

export const Progress = {
  baseStyle: {
    track: {
      bg: "neutral.100",
      borderRadius: "full",
      height: 2,
    },
    filledTrack: {
      borderRadius: "full",
      transition: "all 0.3s ease",
    },
  },
  sizes: {
    lg: {
      track: {
        height: "8px",
      },
    },
  },
  variants: {
    inProgress: {
      filledTrack: {
        bg: "primary.700",
      },
    },
    success: {
      filledTrack: {
        bg: "status.success.700",
      },
    },
    error: {
      filledTrack: {
        bg: "status.error.700",
      },
    },
    scheduled: {
      filledTrack: {
        bg: "primary.400",
      },
    },
  },
  defaultProps: {
    size: "lg",
    colorScheme: "inProgress",
  },
};
