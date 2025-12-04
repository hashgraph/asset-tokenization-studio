// SPDX-License-Identifier: Apache-2.0

import { SeeCoupon } from "../SeeCoupon";
import { render } from "../../../../../test-utils";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { useGetCoupons, useGetCouponsFor, useGetCouponsAmountFor } from "../../../../../hooks/queries/useCoupons";

jest.mock("../../../../../hooks/queries/useCoupons");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "0.0.12345" }),
}));

const mockUseGetCouponsFor = useGetCouponsFor as jest.Mock;
const mockUseGetCoupons = useGetCoupons as jest.Mock;
const mockUseGetCouponsAmountFor = useGetCouponsAmountFor as jest.Mock;

const mockRefetchCouponsFor = jest.fn();
const mockRefetchCoupons = jest.fn();
const mockRefetchCouponsAmountFor = jest.fn();

const defaultHookResponse = {
  data: undefined,
  refetch: jest.fn(),
  isLoading: false,
  isError: false,
};

const mockCouponsForData = {
  value: "100.50",
};

const mockCouponsData = {
  executionDate: new Date("2024-06-15T10:00:00Z"),
  period: 30,
};

const mockCouponsAmountForData = {
  numerator: "150",
  denominator: "1000",
  recordDateReached: true,
};

const getFormInputsByName = () => {
  const couponInput = document.querySelector('input[name="couponId"]') as HTMLInputElement;
  const accountInput = document.querySelector('input[name="targetId"]') as HTMLInputElement;
  return { couponInput, accountInput };
};

describe(`${SeeCoupon.name}`, () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockUseGetCouponsFor.mockReturnValue({
      ...defaultHookResponse,
      refetch: mockRefetchCouponsFor,
    });

    mockUseGetCoupons.mockReturnValue({
      ...defaultHookResponse,
      refetch: mockRefetchCoupons,
    });

    mockUseGetCouponsAmountFor.mockReturnValue({
      ...defaultHookResponse,
      refetch: mockRefetchCouponsAmountFor,
    });
  });

  test("should render correctly", () => {
    const component = render(<SeeCoupon />);
    expect(component.asFragment()).toMatchSnapshot();
  });

  test("should render form inputs", () => {
    render(<SeeCoupon />);

    const { couponInput, accountInput } = getFormInputsByName();
    expect(couponInput).toBeInTheDocument();
    expect(accountInput).toBeInTheDocument();
  });

  test("should disable submit button when form is invalid", () => {
    render(<SeeCoupon />);

    const submitButton = screen.getByRole("button");
    expect(submitButton).toBeDisabled();
  });

  test("should enable submit button when form is valid", async () => {
    render(<SeeCoupon />);

    const { couponInput, accountInput } = getFormInputsByName();

    fireEvent.change(couponInput, { target: { value: "1" } });
    fireEvent.change(accountInput, { target: { value: "0.0.12345" } });

    await waitFor(() => {
      const submitButton = screen.getByRole("button");
      expect(submitButton).not.toBeDisabled();
    });
  });

  test("should call refetch functions on form submit", async () => {
    render(<SeeCoupon />);

    const { couponInput, accountInput } = getFormInputsByName();

    fireEvent.change(couponInput, { target: { value: "1" } });
    fireEvent.change(accountInput, { target: { value: "0.0.12345" } });

    await waitFor(() => {
      const submitButton = screen.getByRole("button");
      expect(submitButton).not.toBeDisabled();
    });

    const submitButton = screen.getByRole("button");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRefetchCouponsFor).toHaveBeenCalled();
      expect(mockRefetchCoupons).toHaveBeenCalled();
      expect(mockRefetchCouponsAmountFor).toHaveBeenCalled();
    });
  });

  test("should display coupon details when all data is loaded", async () => {
    mockUseGetCouponsFor.mockReturnValue({
      ...defaultHookResponse,
      data: mockCouponsForData,
      refetch: mockRefetchCouponsFor,
    });

    mockUseGetCoupons.mockReturnValue({
      ...defaultHookResponse,
      data: mockCouponsData,
      refetch: mockRefetchCoupons,
    });

    mockUseGetCouponsAmountFor.mockReturnValue({
      ...defaultHookResponse,
      data: mockCouponsAmountForData,
      refetch: mockRefetchCouponsAmountFor,
    });

    render(<SeeCoupon />);

    await waitFor(() => {
      // Verify amount from couponsFor
      expect(screen.getByText("100.50")).toBeInTheDocument();

      // Verify numerator from couponsAmountFor
      expect(screen.getByText("150")).toBeInTheDocument();

      // Verify denominator from couponsAmountFor
      expect(screen.getByText("1000")).toBeInTheDocument();

      // Verify recordDateReached from couponsAmountFor
      expect(screen.getByText("true")).toBeInTheDocument();
    });
  });

  test("should display default values when couponsAmountFor fields are undefined", async () => {
    mockUseGetCouponsFor.mockReturnValue({
      ...defaultHookResponse,
      data: mockCouponsForData,
      refetch: mockRefetchCouponsFor,
    });

    mockUseGetCoupons.mockReturnValue({
      ...defaultHookResponse,
      data: mockCouponsData,
      refetch: mockRefetchCoupons,
    });

    mockUseGetCouponsAmountFor.mockReturnValue({
      ...defaultHookResponse,
      data: {
        numerator: undefined,
        denominator: undefined,
        recordDateReached: undefined,
      },
      refetch: mockRefetchCouponsAmountFor,
    });

    render(<SeeCoupon />);

    await waitFor(() => {
      // Verify default values are displayed
      const zeroElements = screen.getAllByText("0");
      expect(zeroElements.length).toBeGreaterThanOrEqual(2);

      expect(screen.getByText("false")).toBeInTheDocument();
    });
  });

  test("should display recordDateReached as false when it is false", async () => {
    mockUseGetCouponsFor.mockReturnValue({
      ...defaultHookResponse,
      data: mockCouponsForData,
      refetch: mockRefetchCouponsFor,
    });

    mockUseGetCoupons.mockReturnValue({
      ...defaultHookResponse,
      data: mockCouponsData,
      refetch: mockRefetchCoupons,
    });

    mockUseGetCouponsAmountFor.mockReturnValue({
      ...defaultHookResponse,
      data: {
        numerator: "50",
        denominator: "500",
        recordDateReached: false,
      },
      refetch: mockRefetchCouponsAmountFor,
    });

    render(<SeeCoupon />);

    await waitFor(() => {
      expect(screen.getByText("50")).toBeInTheDocument();
      expect(screen.getByText("500")).toBeInTheDocument();
      expect(screen.getByText("false")).toBeInTheDocument();
    });
  });

  test("should not display details when data is not loaded", () => {
    render(<SeeCoupon />);

    expect(screen.queryByText(/numerator/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/denominator/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/recordDateReached/i)).not.toBeInTheDocument();
  });

  test("should validate couponId with min value of 0", async () => {
    render(<SeeCoupon />);

    const { couponInput, accountInput } = getFormInputsByName();

    fireEvent.change(couponInput, { target: { value: "-1" } });
    fireEvent.change(accountInput, { target: { value: "0.0.12345" } });

    await waitFor(() => {
      const submitButton = screen.getByRole("button");
      expect(submitButton).toBeDisabled();
    });
  });

  test("should validate targetId as valid Hedera ID", async () => {
    render(<SeeCoupon />);

    const { couponInput, accountInput } = getFormInputsByName();

    fireEvent.change(couponInput, { target: { value: "1" } });
    fireEvent.change(accountInput, { target: { value: "invalid-id" } });

    await waitFor(() => {
      const submitButton = screen.getByRole("button");
      expect(submitButton).toBeDisabled();
    });
  });
});
