import type { FileInputConfigProps } from "@Components/Forms/FileInput";
export declare const ConfigFileInput: {
    parts: ("container" | "input" | "label" | "icon" | "description")[];
    baseStyle: ({ isDragging, isDisabled, isInvalid }: FileInputConfigProps) => {
        container: {
            borderColor: string;
            bgColor: string;
            cursor?: string | undefined;
            _hover: {
                cursor: string;
                bgColor: string;
            } | {
                cursor?: undefined;
                bgColor?: undefined;
            };
            _focus: {
                _before: {
                    content: string;
                    position: string;
                    width: string;
                    height: string;
                    borderRadius: number;
                    zIndex: number;
                    filter: string;
                    bg: string;
                };
            } | {
                _before?: undefined;
            };
            _active?: {} | undefined;
            borderStyle: string;
            h: string;
            borderRadius: number;
            border: string;
            flexDir: string;
            position: string;
            py: number;
            gap: number;
            _focusVisible: {
                outline: string;
            };
            _dragOver: {
                borderStyle: string;
            };
        };
        icon: {
            opacity?: number | undefined;
            color: string;
        };
        label: {
            opacity?: number | undefined;
            apply: string;
        };
        description: {
            color?: string | undefined;
            opacity?: number | undefined;
            apply: string;
        };
        input: {
            display: string;
        };
    };
};
