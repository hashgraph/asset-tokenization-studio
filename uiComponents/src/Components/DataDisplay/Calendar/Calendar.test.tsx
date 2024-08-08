import React from "react";
import { fireEvent } from "@testing-library/react";
import { render } from "@/test-utils";
import type { CalendarProps } from "./index";
import { Calendar } from "./index";
import { defaultProps, freezeBeforeEach } from "./helpers/test-helpers";

describe(`< ${Calendar.name} />`, () => {
  const componentFactory = (props: CalendarProps = defaultProps) =>
    render(<Calendar {...props} />);

  freezeBeforeEach();

  test("Should match to snapshot", () => {
    const { container } = componentFactory();
    expect(container).toBeInTheDocument();
  });
  test("Should select date", () => {
    const pressedDay = new Date();

    const { getByText } = componentFactory();

    const day = pressedDay.getDate();
    const dayElement = getByText(day.toString());

    fireEvent.click(dayElement);

    expect(defaultProps.onSelect).toHaveBeenCalled();
  });
});
