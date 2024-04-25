import type { InputProps } from "@Components/Forms/Input";
import React from "react";
export declare const addonRightInput: Record<"TwoButtonIcon" | "OneButtonIcon" | "OneIcon" | "TwoIcon" | "OneIconOneButton", InputProps["addonRight"]>;
export declare const addonLeftInput: Record<"Example1" | "Example2", InputProps["addonLeft"]>;
export declare const inputSizes: string[];
export declare const inputArgTypes: {
    size: {
        options: string[];
        control: {
            type: string;
        };
        description: string;
    };
    addonRight: {
        options: string[];
        mapping: Record<"TwoButtonIcon" | "OneButtonIcon" | "OneIcon" | "TwoIcon" | "OneIconOneButton", React.ReactElement<any, string | React.JSXElementConstructor<any>> | undefined>;
        control: {
            type: string;
            labels: {
                OneButtonIcon: string;
                OneIcon: string;
                TwoIcon: string;
                TwoButtonIcon: string;
                OneIconOneButton: string;
            };
        };
        description: string;
    };
    addonLeft: {
        options: string[];
        mapping: Record<"Example1" | "Example2", React.ReactElement<any, string | React.JSXElementConstructor<any>> | undefined>;
        control: {
            type: string;
            labels: {
                Example1: string;
                Example2: string;
            };
        };
        description: string;
    };
    variant: {
        options: string[];
        control: {
            type: string;
        };
        description: string;
    };
    showRequired: {
        control: {
            type: string;
        };
        description: string;
    };
    isRequired: {
        control: {
            type: string;
        };
        description: string;
    };
    isDisabled: {
        control: {
            type: string;
        };
        description: string;
    };
    isInvalid: {
        control: {
            type: string;
        };
        description: string;
    };
    isSuccess: {
        control: {
            type: string;
        };
        description: string;
    };
    placeholder: {
        description: string;
    };
    label: {
        description: string;
    };
};
