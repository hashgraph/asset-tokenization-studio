import React from "react";
import type { UseToastOptions } from "@chakra-ui/toast";
import { createStandaloneToast } from "@chakra-ui/toast";
import { useTheme } from "@chakra-ui/react";
import { Alert, type AlertStatus } from "@Components/Overlay/Alert";
import type {
  CreateToastFnReturn,
  BaseToastOptions,
  ToastConfiguratorProps,
  ToastId,
  ToastComponentType,
  ToastUtilitiesMethodParams,
} from "./Toast.types";
import { DEFAULT_DURATION, isAlertStatus } from "./toastHelpers";

let toastFunc: CreateToastFnReturn;

export let Component: ToastComponentType<any> | undefined = undefined;

export let useToastDefaultOptions: UseToastOptions | undefined = undefined;

export const ToastConfigurator = <T extends unknown>(
  configuratorProps: ToastConfiguratorProps<T>
) => {
  const theme = useTheme();
  const { component, defaultOptions, ...restProps } = configuratorProps;
  Component = component;
  useToastDefaultOptions = {
    ...defaultOptions,
    duration: defaultOptions?.duration || DEFAULT_DURATION,
  };
  const { toast } = createStandaloneToast({
    theme,
    defaultOptions: useToastDefaultOptions,
    ...restProps,
  });
  toastFunc = toast;

  return null;
};

export const ToastUtilities = {
  show: <T extends unknown = AlertStatus>({
    status,
    ...props
  }: BaseToastOptions<T>) =>
    toastFunc({
      ...props,
      render: ({ onClose, id }) =>
        Component ? (
          <Component {...props} status={status} onClose={onClose} id={id} />
        ) : (
          <Alert
            variant={props?.variant}
            title={props.title}
            description={props?.description}
            status={isAlertStatus(status) ? status : undefined}
            onClose={props?.onClose}
          />
        ),
    }),
  warning: <T extends string>(props: ToastUtilitiesMethodParams<T>) =>
    toastFunc({
      ...props,
      render: ({ onClose, id }) =>
        Component ? (
          <Component {...props} onClose={onClose} id={id} status="warning" />
        ) : (
          <Alert
            variant={props?.variant}
            title={props.title}
            description={props?.description}
            status="warning"
            onClose={props?.onClose}
          />
        ),
    }),
  success: <T extends string>(props: ToastUtilitiesMethodParams<T>) =>
    toastFunc({
      ...props,
      render: ({ onClose, id }) =>
        Component ? (
          <Component {...props} onClose={onClose} id={id} status="success" />
        ) : (
          <Alert
            variant={props?.variant}
            title={props.title}
            description={props?.description}
            status="success"
            onClose={props?.onClose}
          />
        ),
    }),
  error: <T extends string>(props: ToastUtilitiesMethodParams<T>) =>
    toastFunc({
      ...props,
      render: ({ onClose, id }) =>
        Component ? (
          <Component {...props} onClose={onClose} id={id} status="error" />
        ) : (
          <Alert
            variant={props?.variant}
            title={props.title}
            description={props?.description}
            status="error"
            onClose={props?.onClose}
          />
        ),
    }),
  info: <T extends string>(props: ToastUtilitiesMethodParams<T>) =>
    toastFunc({
      ...props,
      render: ({ onClose, id }) =>
        Component ? (
          <Component {...props} onClose={onClose} id={id} status="info" />
        ) : (
          <Alert
            variant={props?.variant}
            title={props.title}
            description={props?.description}
            status="info"
            onClose={props?.onClose}
          />
        ),
    }),
  close(toastId: ToastId) {
    toastFunc.close(toastId);
  },
  closeAll() {
    toastFunc.closeAll();
  },
};
