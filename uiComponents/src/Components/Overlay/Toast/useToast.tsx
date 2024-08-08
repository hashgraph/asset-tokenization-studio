import React from "react";
import { useToast as useChakraToast } from "@chakra-ui/react";
import { Alert, type AlertStatus } from "@Components/Overlay/Alert";
import type { UseToastOptions } from "@chakra-ui/toast";
import type { BaseToastOptions, ToastId, UseToastHook } from "./Toast.types";
import { DEFAULT_DURATION, isAlertStatus } from "./toastHelpers";
import { Component, useToastDefaultOptions } from "./ToastUtilities";
import _merge from "lodash/merge";

export function useToast<T extends unknown = AlertStatus>(): UseToastHook<T> {
  const toast = useChakraToast();
  const show = ({
    status,
    duration: durationProp = DEFAULT_DURATION,
    position = "top-right",
    ...toastOptions
  }: BaseToastOptions<T>) => {
    const alertStatus = isAlertStatus(status) ? status : undefined;

    const { duration: defaultDuration, ...restDefaultProps } =
      (useToastDefaultOptions || {}) as UseToastOptions;

    const options = _merge({}, restDefaultProps, toastOptions);

    const duration = durationProp || defaultDuration;

    return toast({
      render(props) {
        const onClose = () => {
          props.onClose?.();
          toast.close?.(props.id!);
        };

        return Component ? (
          <Component
            {...toastOptions}
            {...props}
            duration={props.duration || duration}
            onClose={onClose}
            status={status}
            id={props.id}
          />
        ) : (
          <Alert
            status={alertStatus}
            variant={toastOptions?.variant}
            title={toastOptions.title}
            description={toastOptions.description}
            onClose={onClose}
          />
        );
      },
      ...options,
      duration,
      status: alertStatus,
      position,
    });
  };

  const close = (id: ToastId) => {
    toast.close(id);
  };

  const closeAll = () => {
    toast.closeAll();
  };

  return {
    close,
    closeAll,
    show,
  };
}

export { AlertStatus };
