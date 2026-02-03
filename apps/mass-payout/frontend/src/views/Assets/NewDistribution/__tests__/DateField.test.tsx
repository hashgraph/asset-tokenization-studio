// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useForm } from "react-hook-form";
import { DateField } from "../components/DateField";
import { validateFutureDate } from "../NewDistribution.utils";
import { render } from "@/test-utils";

// Mock the validateFutureDate function
jest.mock("../NewDistribution.utils", () => ({
  validateFutureDate: jest.fn(),
}));

// Mock CalendarInputController
jest.mock("io-bricks-ui", () => ({
  CalendarInputController: jest.fn(({ label, placeholder, rules, name, id }) => {
    const [value, setValue] = React.useState("");
    const [error, setError] = React.useState("");
    const [touched, setTouched] = React.useState(false);

    const validateField = (val: string) => {
      if (!val && rules?.required) {
        return typeof rules.required === "string" ? rules.required : "This field is required";
      }
      if (val && rules?.validate) {
        const result = rules.validate(val);
        if (result && typeof result === "string") {
          return result;
        }
      }
      return "";
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      if (touched) {
        const validationError = validateField(newValue);
        setError(validationError);
      }
    };

    const handleBlur = () => {
      setTouched(true);
      const validationError = validateField(value);
      setError(validationError);
    };

    return (
      <div>
        <label htmlFor={id || name}>{label}</label>
        <input
          id={id || name}
          placeholder={placeholder}
          data-testid={`date-field-${name}`}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
        />
        {error && touched && <div role="alert">{error}</div>}
      </div>
    );
  }),
}));

interface TestFormData {
  testDate: Date | string;
}

const TestWrapper = ({
  isRequired = false,
  requiredMessage = "This field is required",
  futureDateMessage = "Date must be in the future",
}) => {
  const { control } = useForm<TestFormData>({
    mode: "onChange",
    defaultValues: {
      testDate: "",
    },
  });

  return (
    <DateField
      name="testDate"
      control={control}
      label="Test Date"
      placeholder="Select a date"
      isRequired={isRequired}
      requiredMessage={requiredMessage}
      futureDateMessage={futureDateMessage}
    />
  );
};

describe("DateField", () => {
  const mockValidateFutureDate = validateFutureDate as jest.MockedFunction<typeof validateFutureDate>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    test("should render correctly", () => {
      const component = render(<TestWrapper />);
      expect(component.asFragment()).toMatchSnapshot();
    });
    test("should render with correct label and placeholder", () => {
      render(<TestWrapper />);

      expect(screen.getByLabelText("Test Date")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Select a date")).toBeInTheDocument();
    });

    test("should render with custom props", () => {
      const CustomTestWrapper = () => {
        const { control } = useForm<TestFormData>({
          defaultValues: { testDate: "" },
        });

        return <DateField name="testDate" control={control} label="Custom Label" placeholder="Custom placeholder" />;
      };

      render(<CustomTestWrapper />);

      expect(screen.getByLabelText("Custom Label")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Custom placeholder")).toBeInTheDocument();
    });
  });

  describe("Validation", () => {
    test("should apply required validation when isRequired is true", async () => {
      const user = userEvent.setup();
      render(<TestWrapper isRequired={true} requiredMessage="Date is required" />);

      const input = screen.getByTestId("date-field-testDate");

      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Date is required");
      });
    });

    test("should not apply required validation when isRequired is false", async () => {
      const user = userEvent.setup();
      render(<TestWrapper isRequired={false} />);

      const input = screen.getByTestId("date-field-testDate");

      await user.click(input);
      await user.tab();

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    test("should apply future date validation when futureDateMessage is provided", async () => {
      mockValidateFutureDate.mockReturnValue("Date must be in the future");

      const user = userEvent.setup();
      render(<TestWrapper futureDateMessage="Date must be in the future" />);

      const input = screen.getByTestId("date-field-testDate");

      await user.type(input, "2020-01-01");
      await user.tab();

      await waitFor(() => {
        expect(mockValidateFutureDate).toHaveBeenCalledWith("2020-01-01", "Date must be in the future");
      });
    });

    test("should pass validation when future date is valid", async () => {
      mockValidateFutureDate.mockReturnValue(true);

      const user = userEvent.setup();
      render(<TestWrapper futureDateMessage="Date must be in the future" />);

      const input = screen.getByTestId("date-field-testDate");

      await user.type(input, "2030-01-01");
      await user.tab();

      await waitFor(() => {
        expect(mockValidateFutureDate).toHaveBeenCalledWith("2030-01-01", "Date must be in the future");
      });

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    test("should combine required and future date validations", async () => {
      const user = userEvent.setup();
      render(
        <TestWrapper
          isRequired={true}
          requiredMessage="Date is required"
          futureDateMessage="Date must be in the future"
        />,
      );

      const input = screen.getByTestId("date-field-testDate");

      await user.click(input);
      await user.tab();

      await waitFor(() => {
        expect(screen.getByRole("alert")).toHaveTextContent("Date is required");
      });
    });
  });
});
