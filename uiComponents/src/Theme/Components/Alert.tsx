import React from "react";
import {
  Info,
  Warning,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import type {
  AlertStatus,
  AlertThemeConfiguration,
} from "@Components/Overlay/Alert/Alert";
import { alertPartsList } from "@Components/Overlay/Alert/Alert";
import { Spinner } from "@Components/Indicators/Spinner";
import { Weight } from "@/Components/Foundations/PhosphorIcon";
import type { colors } from "../colors";

export const iconNames: { [key in AlertStatus]: any } = {
  info: Info,
  success: CheckCircle,
  warning: Warning,
  error: WarningCircle,
  loading: <Spinner />,
};

export const colorSchemes: { [key in AlertStatus]: keyof typeof colors } = {
  info: "blue",
  success: "green",
  warning: "orange",
  error: "red",
  loading: "neutral",
};

export const ConfigAlert: AlertThemeConfiguration = {
  parts: alertPartsList,
  baseStyle: ({ status }: { status: AlertStatus }) => ({
    container: {
      borderRadius: "simple",
      paddingTop: 2,
      paddingBottom: 2,
      minWidth: "308px",
      minHeight: "32px",
      maxWidth: {
        base: "100%",
        md: "580px",
      },
      width: {
        base: "100%",
        md: "auto",
      },
    },
    contentContainer: {
      alignItems: "flex-start",
      pr: 6,
    },
    icon: {
      as: iconNames[status],
      weight: Weight.Fill,
      __css: {
        color: "neutral.800",
      },
      marginRight: "12px",
    },
    title: {
      apply: "textStyles.ElementsBoldSM",
      color: "neutral.800",
    },
    description: {
      apply: "textStyles.ElementsRegularSM",
      color: "neutral.800",
      flex: 1,
    },
    closeBtn: {
      alignSelf: "center",
      color: "neutral.800",
      _hover: {
        color: "neutral.800",
      },
      _active: {
        color: "neutral.800",
      },
    },
  }),
  variants: {
    subtle: ({ status }: { status: AlertStatus }) => {
      return {
        container: {
          bg: `${colorSchemes[status]}.50`,
        },
        icon: {
          as: iconNames[status],
        },
      };
    },
    solid: ({ status }: { status: AlertStatus }) => {
      return {
        container: {
          bg: `${colorSchemes[status]}.50`,
        },
        icon: {
          as: iconNames[status],
        },
      };
    },
    leftAccent: ({ status }: { status: AlertStatus }) => {
      return {
        container: {
          bg: `${colorSchemes[status]}.50`,
          borderLeftWidth: "4px",
          borderLeftColor: `${colorSchemes[status]}.500`,
        },
        icon: {
          color: `${colorSchemes[status]}.500`,
          as: iconNames[status],
        },
        title: {
          color: "neutral.700",
        },
        description: {
          color: "neutral.700",
        },
        closeBtn: {
          color: "neutral.700",
        },
      };
    },
    topAccent: ({ status }: { status: AlertStatus }) => {
      return {
        container: {
          bg: `${colorSchemes[status]}.50`,
          borderTopWidth: "4px",
          borderTopColor: `${colorSchemes[status]}.500`,
        },
        icon: {
          color: `${colorSchemes[status]}.500`,
          as: iconNames[status],
        },
        title: {
          color: "neutral.700",
        },
        description: {
          color: "neutral.700",
        },
        closeBtn: {
          color: "neutral.700",
        },
      };
    },
  },
  defaultProps: {},
};
