import type { SelectProps } from "../../Select";
import { Select } from "../../Select";
import { omit as _omit } from "lodash";
import React, { useEffect, useState } from "react";
import type { Control, FieldValues, UseControllerProps } from "react-hook-form";
import { useController } from "react-hook-form";
import { FieldController } from "../FieldController/FieldController";
import _isEqual from "lodash/isEqual";
export interface SelectControllerProps<T extends FieldValues>
  extends Omit<SelectProps, "onChange" | "onBlur"> {
  control: Control<T>;
  id: UseControllerProps<T>["name"];
  rules?: Record<string, unknown>;
  showErrors?: boolean;
  onChange?: (value: SelectOption | SelectOption["value"]) => void;
  setsFullOption?: boolean;
}

export interface SelectOption<T = string, Y = string> {
  value: T;
  label: Y;
}

export const SelectController = <T extends FieldValues>(
  props: SelectControllerProps<T>
) => {
  const {
    control,
    id,
    options,
    rules,
    showErrors = true,
    variant,
    onChange,
    setsFullOption = false,
  } = props;
  const {
    fieldState,
    field: { onChange: onChangeDefault, value },
  } = useController({ name: id, control, rules });
  const selectProps = _omit(props, ["control", "rules", "showErrors"]);
  const [selectedValue, setSelectedValue] = useState<SelectOption>();
  // @ts-ignore
  const isRequired = !!rules?.["required"] || !!rules?.validate?.["required"];

  useEffect(() => {
    const newValue = (options as SelectOption[])?.find(
      (option: SelectOption) => {
        if (value) {
          const valueToCompare = setsFullOption ? value.value : value;
          return _isEqual(option.value, valueToCompare);
        }
        return false;
      }
    );

    setSelectedValue(newValue);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options]);

  return (
    <FieldController
      fieldState={fieldState}
      errorMessageVariant={variant}
      showErrors={showErrors}
    >
      <Select
        {...selectProps}
        data-testid={id}
        inputId={id}
        name={id}
        isRequired={isRequired}
        // @ts-ignore
        onChange={(val: SelectOption) => {
          onChange?.(setsFullOption ? val : val.value);
          onChangeDefault(setsFullOption ? val : val.value);
        }}
        value={selectedValue || ""}
      />
    </FieldController>
  );
};
