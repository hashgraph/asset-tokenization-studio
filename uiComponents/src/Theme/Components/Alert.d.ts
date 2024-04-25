import type { AlertStatus, AlertThemeConfiguration } from "@Components/Overlay/Alert/Alert";
import type { colors } from "../colors";
export declare const iconNames: {
    [key in AlertStatus]: any;
};
export declare const colorSchemes: {
    [key in AlertStatus]: keyof typeof colors;
};
export declare const ConfigAlert: AlertThemeConfiguration;
