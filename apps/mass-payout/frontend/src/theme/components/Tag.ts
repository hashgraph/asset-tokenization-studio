// SPDX-License-Identifier: Apache-2.0

export const Tag = {
  baseStyle: {
    label: {
      apply: "textStyles.BodyTextMediumSM",
      color: "neutral.1000",
      fontWeight: 500,
    },
    container: {
      color: `neutral.800`,
      bg: `neutral.50`,
      borderRadius: "19px",
      px: 3,
      py: 1,
      cursor: "inherit",
      pointerEvents: "none",
      height: "18px",
    },
  },
  variants: {
    active: {
      container: {
        bg: "status.active.50",
      },
    },
    success: {
      container: {
        bg: "status.success.900",
      },
    },
    paused: {
      container: {
        bg: "status.paused.100",
      },
    },
    info: {
      container: {
        bg: "status.info.500",
      },
    },
    error: {
      container: {
        bg: "status.error.500",
      },
    },
    failed: {
      container: {
        bg: "status.error.200",
      },
    },
    warning: {
      container: {
        bg: "status.warning.500",
      },
    },
    scheduled: {
      container: {
        bg: "status.info.200",
      },
    },
    inProgress: {
      container: {
        bg: "status.inProgress.50",
      },
    },
    cancelled: {
      container: {
        bg: "status.cancelled.50",
      },
    },
    retrying: {
      container: {
        bg: "status.paused.50",
      },
    },
  },
};
