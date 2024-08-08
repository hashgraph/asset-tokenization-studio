import type { InputProps as ChakraInputProps } from "@chakra-ui/react";
import {
  useMultiStyleConfig,
  forwardRef,
  Input as ChakraInput,
  Center as ChakraCenter,
} from "@chakra-ui/react";
import type { ChangeEvent, DragEvent } from "react";
import React, { useRef, useState } from "react";

import type {
  SystemStyleObject as ChakraSystemStyleObject,
  ComponentWithAs,
} from "@chakra-ui/system";
import { useFormControlContext as useChakraFormControlContext } from "@chakra-ui/form-control";
import _merge from "lodash/merge";
import { PhosphorIcon } from "@/Components/Foundations/PhosphorIcon";
import { CloudArrowDown } from "@phosphor-icons/react";
import { Text } from "@/Components/Foundations/Text";
import type {
  BaseMultiStyleConfiguration,
  PartsStyleInterpolation,
} from "@/Theme/Components/BaseMultiStyleConfiguration";

export const fileInputPartsList: Array<
  "container" | "icon" | "label" | "description" | "input"
> = ["container", "icon", "label", "description", "input"];

type Parts = typeof fileInputPartsList;

export type FileInputConfigProps = {
  isDragging?: boolean;
  isInvalid?: boolean;
  isDisabled?: boolean;
};

export interface FileInputThemeConfiguration
  extends BaseMultiStyleConfiguration<Parts> {
  baseStyle:
    | (({
        isInvalid,
        isDisabled,
        isDragging,
      }: FileInputConfigProps) => Partial<FileInputThemeStyle>)
    | PartsStyleInterpolation<Parts>;
}

export type FileInputThemeStyle = Record<
  Parts[number],
  ChakraSystemStyleObject
>;

export interface FileInputProps extends Omit<ChakraInputProps, "onChange"> {
  label?: string;
  description?: string;
  isInvalid?: boolean;
  isDisabled?: boolean;
  acceptedFileTypes?: object;
  onChange?: (file: File) => void;
}

export const FileInput: ComponentWithAs<"input", FileInputProps> = forwardRef<
  FileInputProps,
  "input"
>(
  (
    {
      label,
      description,
      isInvalid,
      isDisabled,
      acceptedFileTypes,
      onChange,
      sx,
      ...props
    }: FileInputProps,
    ref
  ) => {
    const [isDragging, setIsDragging] = useState<boolean>(false);

    const fileRef = useRef<HTMLDivElement | null>(null);
    const inputFileRef = useRef<HTMLInputElement | null>(null);

    const formControl = useChakraFormControlContext() || {};
    const invalid = isInvalid ?? formControl.isInvalid;

    const themeStyles = useMultiStyleConfig("FileInput", {
      variant: props.variant,
      isDragging,
      isDisabled,
      isInvalid: invalid,
    }) as FileInputThemeStyle;

    const styles = React.useMemo(
      () => _merge(themeStyles, sx),
      [themeStyles, sx]
    );

    const handleUploadFile = () => {
      if (isDisabled) return;
      inputFileRef.current?.click();
    };

    const handleChangeFile = (ev: ChangeEvent<HTMLInputElement>) => {
      if (ev && ev.target && ev.target.files) {
        const file = ev?.target?.files[0];

        onChange && onChange(file);
        fileRef.current?.blur();
      }
    };

    const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = () => {
      setIsDragging(false);
    };

    const handleDrop = (event: DragEvent<HTMLDivElement>) => {
      if (isDisabled) return;

      event.preventDefault();
      const file = event.dataTransfer.files[0];

      setIsDragging(false);
      onChange && onChange(file);
    };

    return (
      <ChakraCenter
        data-testid="input-file"
        ref={ref || fileRef}
        onClick={handleUploadFile}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        tabIndex={1}
        sx={styles.container}
        {...props}
      >
        <PhosphorIcon as={CloudArrowDown} size="sm" sx={styles.icon} />
        <ChakraInput
          type="file"
          ref={inputFileRef}
          isInvalid={invalid}
          onChange={(ev) => handleChangeFile(ev)}
          display={"none"}
          accept={Object.values(acceptedFileTypes || {}).join(",")}
        />
        <Text sx={styles.label}>
          {label || "Click to browse or drag here your files."}
        </Text>
        <Text sx={styles.description}>
          {description || "Maximum file size 50MB"}
        </Text>
      </ChakraCenter>
    );
  }
);
