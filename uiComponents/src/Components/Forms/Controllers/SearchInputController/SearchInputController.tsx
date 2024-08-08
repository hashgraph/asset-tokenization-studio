import { useController, type FieldValues } from "react-hook-form";
import type { InputProps } from "../../Input";
import type { InputControllerProps } from "../InputController/InputController";
import { InputController } from "../InputController/InputController";
import React from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import { PhosphorIcon } from "@/Components/Foundations";
import { IconButton } from "@/Components/Interaction";

export interface SearchInputControllerProps<T extends FieldValues>
  extends Omit<InputProps, "id" | "defaultValue" | "onClear">,
    InputControllerProps<T> {
  minSearchLength?: number;
  onSearch: (value: string) => void;
}

export const SearchInputController = <T extends FieldValues>({
  variant,
  control,
  rules,
  id,
  defaultValue,
  minSearchLength = 3,
  onSearch,
  ...props
}: SearchInputControllerProps<T>) => {
  const {
    field: { onChange: onChangeDefault, value },
  } = useController<T>({
    name: id,
    control,
    rules,
    defaultValue,
  });

  const isDisabled = !value || value.length < minSearchLength;

  const handleSearch = () => {
    onSearch(value);
  };

  return (
    <InputController
      id={id}
      control={control}
      variant={variant}
      isClearable
      onChange={(e) => {
        onChangeDefault(e);
      }}
      onKeyDown={(ev) => {
        !isDisabled && ev.key === "Enter" && handleSearch();
      }}
      {...props}
      addonRight={
        <IconButton
          data-testid="search-icon-button"
          size="xs"
          aria-label="search"
          variant="tertiary"
          icon={<PhosphorIcon as={MagnifyingGlass} />}
          isDisabled={isDisabled}
          onClick={handleSearch}
        />
      }
    />
  );
};
