import type {
  UseToastOptions,
  ToastId,
  createToastFn,
  ToastOptions,
  ToastProviderProps,
  CreateStandAloneToastParam,
} from "@chakra-ui/toast";
import type { AlertStatus } from "@Components/Overlay/Alert";
export { AlertStatus };

export { ToastId } from "@chakra-ui/react";

export type ToastStatus<T extends unknown> = T | AlertStatus;

export interface BaseToastOptions<T = AlertStatus>
  extends Omit<UseToastOptions, "status"> {
  title?: string;
  status: ToastStatus<T>;
  description?: string;
  onClose?(): void;
}

export type CreateToastFnReturn = ReturnType<typeof createToastFn>;

export interface UseToastHook<T> {
  close(id: ToastId): void;
  closeAll(): void;
  show(toastOptions: BaseToastOptions<T>): ToastId;
}

export interface BaseToastComponentProps
  extends Partial<ToastOptions>,
    Pick<ToastProviderProps, "motionVariants" | "toastSpacing">,
    Pick<UseToastOptions, "orientation" | "id" | "position"> {}

export interface ToastComponentProps<T = unknown>
  extends Omit<BaseToastComponentProps, "status"> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  status?: AlertStatus | T;
  onClose?(): void;
}

export type ToastComponentPropsPick<T extends keyof ToastComponentProps> = Pick<
  ToastComponentProps,
  T
>;

export type ToastComponentType<T> = React.FC<ToastComponentProps<T>>;

export interface ToastConfiguratorProps<T extends unknown = unknown>
  extends Omit<CreateStandAloneToastParam, "component"> {
  component?: ToastComponentType<T>;
}

export type ToastUtilitiesMethodParams<T> = Omit<BaseToastOptions<T>, "status">;
