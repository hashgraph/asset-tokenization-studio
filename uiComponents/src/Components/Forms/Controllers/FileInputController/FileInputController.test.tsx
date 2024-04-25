import { act, fireEvent } from "@testing-library/react";
import type { FieldValues } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { FileInputControllerProps } from "./FileInputController";
import { FileInputController } from "./FileInputController";
import React from "react";
import { render } from "@/test-utils";

type DefaultProps = Omit<FileInputControllerProps<FieldValues>, "control">;

describe(`FileInputController />`, () => {
  const defaultProps: DefaultProps = {
    id: "file",
  };

  const RenderWithForm = (props: DefaultProps) => {
    const localForm = useForm({
      mode: "onChange",
      criteriaMode: "all",
    });
    const { control } = localForm;

    return <FileInputController control={control} {...props} />;
  };

  const factoryComponent = (props: DefaultProps = defaultProps) => {
    return render(<RenderWithForm {...props} />);
  };

  test("Component renders correctly", () => {
    const component = factoryComponent();
    const { id } = defaultProps;
    expect(component.getByTestId(id)).toBeInTheDocument();
    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should add a file to the state", () => {
    const component = factoryComponent();
    const fileInput = component.getByTestId(defaultProps.id);

    act(() => {
      const file = new File(["file content"], "file.png", {
        type: "image/png",
      });
      Object.defineProperty(fileInput, "files", {
        value: [file],
      });
      fireEvent.change(fileInput);
    });

    // @ts-ignore
    expect(fileInput.files.length).toBe(1);
  });
});
