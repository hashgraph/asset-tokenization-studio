import {
  type AvatarThemeConfiguration,
  avatarPartsList,
} from "../../Components/Basic/Avatar/Avatar";

const baseStyle: AvatarThemeConfiguration["baseStyle"] = ({
  name,
  badgeColor,
}) => ({
  container: {
    bg: "neutral",
    fontWeight: "medium",
    svg: {
      color: "neutral.400",
    },
  },
  badge: {
    border: "none",
    transform: name ? "translate(0%, 0%)" : "translate(25%, 0%)",
    boxShadow: "0 0 0 0.15em var(--chakra-colors-neutral)",
    bg: badgeColor ? badgeColor : "green.500",
  },
});

const sizes: AvatarThemeConfiguration["sizes"] = {
  md: ({ name }) => ({
    container: {
      width: 8,
      height: 8,
    },
    badge: {
      boxSize: name ? 2 : 3.5,
    },
  }),
};

export const ConfigAvatar: AvatarThemeConfiguration = {
  parts: avatarPartsList,
  baseStyle,
  sizes,
  variants: {
    light: () => ({
      container: {
        color: "black",
      },
    }),
    dark: () => ({
      container: {
        color: "neutral",
      },
    }),
  },

  defaultProps: {
    size: "md",
    variant: "light",
  },
};
