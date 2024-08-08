import { keyframes } from "@emotion/react";
import { Weight } from "@hashgraph/asset-tokenization-uicomponents/Foundations";
import type {
  AlertStatus,
  AlertThemeConfiguration,
} from "@hashgraph/asset-tokenization-uicomponents/Overlay";
import { alertPartsList } from "@hashgraph/asset-tokenization-uicomponents/Overlay";

const loading = keyframes`
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  `;

const loadingAnimation = `${loading} 1s linear infinite`;

const colorSchemes: { [key in AlertStatus]: string } = {
  info: "status.info.100",
  success: "status.success.100",
  warning: "status.warning.100",
  error: "status.error.100",
  loading: "neutral.50",
};

export const Alert: AlertThemeConfiguration = {
  parts: alertPartsList,
  // @ts-ignore
  baseStyle: ({ status }: { status: AlertStatus }) => ({
    container: {
      top: 22,
      right: 4,
    },
    icon: {
      weight: Weight.Fill,
      __css: {
        color: "neutral.650",
        animation: status === "loading" ? loadingAnimation : undefined,
      },
      mr: 3,
    },
    title: {
      color: "neutral.650",
    },
    description: {
      color: "neutral.650",
    },
    closeBtn: {
      color: "neutral.650",
    },
  }),
  variants: {
    //@ts-ignore should improve icon typing in io-bricks
    subtle: ({ status }: { status: AlertStatus }) => {
      return {
        container: {
          bg: colorSchemes[status],
        },
      };
    },
  },
  defaultProps: {
    variant: "subtle",
  },
};
