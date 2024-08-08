import type { FileInputProps } from "@Components/Forms/FileInput";
import { FileInput } from "@Components/Forms/FileInput";
import type { Control, FieldValues, UseControllerProps } from "react-hook-form";
import { useController } from "react-hook-form";
import { FieldController } from "../FieldController/FieldController";
import React, { useState } from "react";
import { Flex } from "@chakra-ui/react";
import { FileCard } from "@Components/DataDisplay/FileCard";

export interface FileInputControllerProps<T extends FieldValues>
  extends FileInputProps {
  control: Control<T>;
  id: UseControllerProps<T>["name"];
  showErrors?: boolean;
}

export const FileInputController = <T extends FieldValues>({
  control,
  id,
  variant,
  showErrors,
  onChange,
  ...props
}: FileInputControllerProps<T>) => {
  const {
    fieldState,
    field: { onChange: onChangeDefault },
  } = useController<T>({
    name: id,
    control,
  });

  const [files, setFiles] = useState<File[]>([]);

  const handleOnChangeFile = (file: File) => {
    const updatedFiles = [...files, file];

    setFiles(updatedFiles);
    onChange && onChange(file);
    onChangeDefault(updatedFiles);
  };

  const handleRemoveFile = (index: number) => {
    const updatedFiles = files.filter((_, indexItem) => index !== indexItem);

    onChangeDefault(updatedFiles);
    setFiles(updatedFiles);
  };

  return (
    <Flex flexDir={"column"} gap={4}>
      <FieldController
        fieldState={fieldState}
        showErrors={showErrors}
        errorMessageVariant={variant}
      >
        <FileInput
          data-testid={id}
          isInvalid={!!fieldState.error}
          onChange={handleOnChangeFile}
          {...props}
        />
      </FieldController>
      {files.map((file, index) => {
        return (
          <FileCard
            key={index}
            file={file}
            onRemove={() => handleRemoveFile(index)}
          />
        );
      })}
    </Flex>
  );
};
