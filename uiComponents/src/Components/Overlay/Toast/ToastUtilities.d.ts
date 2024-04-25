import type { UseToastOptions } from "@chakra-ui/toast";
import { type AlertStatus } from "@Components/Overlay/Alert";
import type { BaseToastOptions, ToastConfiguratorProps, ToastId, ToastComponentType, ToastUtilitiesMethodParams } from "./Toast.types";
export declare let Component: ToastComponentType<any> | undefined;
export declare let useToastDefaultOptions: UseToastOptions | undefined;
export declare const ToastConfigurator: <T extends unknown>(configuratorProps: ToastConfiguratorProps<T>) => null;
export declare const ToastUtilities: {
    show: <T extends unknown = AlertStatus>({ status, ...props }: BaseToastOptions<T>) => ToastId;
    warning: <T_1 extends string>(props: ToastUtilitiesMethodParams<T_1>) => ToastId;
    success: <T_2 extends string>(props: ToastUtilitiesMethodParams<T_2>) => ToastId;
    error: <T_3 extends string>(props: ToastUtilitiesMethodParams<T_3>) => ToastId;
    info: <T_4 extends string>(props: ToastUtilitiesMethodParams<T_4>) => ToastId;
    close(toastId: ToastId): void;
    closeAll(): void;
};
