import type { Control, FieldValues, UseControllerProps } from "react-hook-form";

export type BaseController<T extends FieldValues> = {
  control: Control<T>;
  id: UseControllerProps<T>["name"];
  defaultValue?: UseControllerProps<T>["defaultValue"];
  rules?: Record<string, unknown>;
};

export interface InputBaseControllerProps<T extends FieldValues>
  extends BaseController<T> {
  showErrors?: boolean;
  showIsSuccess?: boolean;
}
