export const Tag = {
  baseStyle: {
    label: {
      apply: "textStyles.ElementsMediumSM",
    },
    container: {
      color: `neutral.800`,
      bg: `neutral.50`,
      borderRadius: "19px",
    },
  },
  variants: {
    paused: {
      container: {
        bg: "status.error.100",
      },
    },
  },
};
