import type { InfoDividerThemeConfiguration } from "@Components/DataDisplay/InfoDivider";
import { infoDividerPartsList } from "@Components/DataDisplay/InfoDivider";

export const ConfigInfoDivider: InfoDividerThemeConfiguration = {
  parts: infoDividerPartsList,
  baseStyle: ({ type, hasStep, hasNumber }) => {
    const isMain = type === "main";
    const isSecondary = type === "secondary";
    const titleColor = isSecondary ? "primary.700 " : "neutral.900";

    return {
      container: {
        gridTemplateColumns: isMain ? "auto 1fr" : "1fr",
        alignItems: isMain ? "center" : "flex-start",
        gap: isMain ? 4 : 3,
        w: "full",
      },
      titleContainer: {
        gap: hasStep ? 5 : 2,
        ...(hasStep && { ml: 3 }),
      },
      number: {
        color: "primary.500",
        textStyle: "HeadingMediumMD",
      },
      title: {
        textStyle: "HeadingMediumMD",
        color: titleColor,
        ...(isMain && {
          maxW: "376px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }),
        ...(isSecondary && {
          noOfLines: 2,
        }),
      },
      step: {
        textStyle: "ElementsMediumMD",
        pos: "relative",
        color: "neutral",
        zIndex: 0,

        _before: {
          content: `""`,
          position: "absolute",
          bg: "primary.400",
          w: 8,
          h: 8,
          zIndex: -1,
          left: "50%",
          top: "50%",
          borderRadius: "full",
          transform: "translate(-50%, -50%)",
        },
      },
      divider: {
        borderColor: isMain ? "primary.400" : "neutral.400",
      },
    };
  },
};
