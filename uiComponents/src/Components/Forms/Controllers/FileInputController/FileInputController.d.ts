/// <reference types="react" />
import type { FileInputProps } from "@Components/Forms/FileInput";
import type { Control, FieldValues, UseControllerProps } from "react-hook-form";
export interface FileInputControllerProps<T extends FieldValues> extends FileInputProps {
    control: Control<T>;
    id: UseControllerProps<T>["name"];
    showErrors?: boolean;
}
export declare const FileInputController: <T extends FieldValues>({ control, id, variant, showErrors, onChange, ...props }: FileInputControllerProps<T>) => JSX.Element;
