import type { FieldValues } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { SelectControllerProps } from "./SelectController";
import { SelectController as Select } from "./SelectController";
import { select } from "react-select-event";
import { render } from "@/test-utils";
import React from "react";
import { waitFor } from "@testing-library/react";
const defaultProps = {
  id: "test",
  options: [
    { value: "value1", label: "label1" },
    { value: "value2", label: "label2" },
  ],
  label: "prueba",
  placeholder: "testPlaceholder",
  showErrors: true,
};

//@ts-ignore
let form;
const SelectController = (
  props: Omit<SelectControllerProps<FieldValues>, "control">
) => {
  form = useForm();

  return (
    <form data-testid="form">
      <Select control={form.control} {...props} />
    </form>
  );
};

describe(`<SelectController />`, () => {
  const factoryComponent = (
    props: Omit<SelectControllerProps<FieldValues>, "control"> = defaultProps
  ) => render(<SelectController {...props} />);

  test("render correctly", () => {
    const component = factoryComponent();

    expect(component).toMatchSnapshot();
  });

  test("validate changes in form", async () => {
    const component = factoryComponent();

    await waitFor(async () => {
      await select(component.container.querySelector("input#test")!, "label2");
    });
  });
});
