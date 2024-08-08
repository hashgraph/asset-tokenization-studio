import { act, fireEvent } from "@testing-library/react";
import type { FieldValues } from "react-hook-form";
import { useForm } from "react-hook-form";
import type { SearchInputControllerProps } from "./SearchInputController";
import { SearchInputController } from "./SearchInputController";
import React from "react";
import { render } from "@/test-utils";

type DefaultProps = Omit<SearchInputControllerProps<FieldValues>, "control">;

describe(`<SearchInputController />`, () => {
  const defaultProps: DefaultProps = {
    id: "search",
    placeholder: "placeholder",
    label: "Search",
    onSearch: () => console.log("searching"),
  };

  const RenderWithForm = (props: DefaultProps) => {
    const localForm = useForm({
      mode: "onChange",
      criteriaMode: "all",
    });
    const { control } = localForm;

    return <SearchInputController control={control} {...props} />;
  };

  const factoryComponent = (props: DefaultProps = defaultProps) => {
    return render(<RenderWithForm {...props} />);
  };

  test("Component renders correctly", () => {
    const component = factoryComponent();

    const passwordField = component.getByTestId("search");

    const { placeholder } = defaultProps;
    expect(passwordField).toHaveProperty("placeholder", placeholder);

    expect(component.asFragment()).toMatchSnapshot("RenderWithPlaceholder");
  });

  test("should allow to search when min characters are reached", async () => {
    const component = factoryComponent();
    const searchButton = component.getByTestId("search-icon-button");
    const inputField = component.getByTestId("search");

    expect(searchButton).toBeDisabled();

    act(() => {
      fireEvent.change(inputField, { target: { value: "test" } });
    });

    expect(searchButton).toBeEnabled();
  });
});
