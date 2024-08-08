import type { PopUpThemeConfiguration } from "@Components/Overlay/PopUp";
import { popUpPartsList } from "@Components/Overlay/PopUp";

export const ConfigPopUp: PopUpThemeConfiguration = {
  parts: popUpPartsList,
  baseStyle: ({ isContentCentered, size }) => ({
    container: {
      shadow: "xs",
      borderRadius: "8px",
      paddingTop: 8,
      paddingX: 4,
      justifyContent: "center",
      ...(size !== "full" && {
        minH: "260px",
      }),
      ...(!isContentCentered && {
        minH: 72,
      }),
    },
    icon: {
      color: "primary.400",
      marginBottom: "12px",
    },
    title: {
      color: "neutral.900",
      fontWeight: "500",
      lineHeight: "24px",
      fontSize: "16px",
      margin: "2px 0",
    },
    closeButton: {
      minW: "16px",
      minH: "16px",
      position: "absolute",
      top: "8px",
      right: "8px",
    },
    description: {
      fontWeight: "400",
      lineHeight: "16px",
      color: "neutral.700",
      fontSize: "12px",
      margin: "2px 0",
    },
    contentContainer: {
      justifyContent: "center",
      alignItems: "center",
      height: "full",
      flexDirection: "column",
      fontSize: "5rem",
      width: "full",
      mt: 4,
      ...(!isContentCentered && {
        alignItems: "left",
      }),
    },
    body: {
      fontSize: "5rem",
      display: "flex",
      flexDirection: "column",
      padding: 0,
      justifyContent: "center",
      alignItems: "center",
      ...(!isContentCentered && {
        alignItems: "start",
        textAlign: "left",
      }),
    },
    footer: {
      justifyContent: "center",
      pt: 6,
      pb: 8,
      ...(!isContentCentered && {
        justifyContent: "flex-end",
        width: "full",
        px: 0,
      }),
    },
    inputContainer: {
      mt: 6,
    },
  }),
};
