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
  tokenBalance: "10050",
  decimals: "2",
};

const mockCouponsData = {
  couponId: 1,
  executionDate: new Date("2024-06-15T10:00:00Z"),
  startDate: new Date("2024-01-01T00:00:00Z"),
  endDate: new Date("2024-06-15T10:00:00Z"),
  fixingDate: new Date("2024-06-15T10:00:00Z"),
  recordDate: new Date("2024-01-01T00:00:00Z"),
  rate: "5.01",
  rateDecimals: 2,
  rateStatus: 1,
};

const mockCouponsAmountForData = {
  numerator: "150",
  denominator: "100",
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
      // Verify balance from couponsFor.value
      expect(screen.getByText("100.50")).toBeInTheDocument();

      // Verify amount calculated as numerator/denominator (150/100 = 1.500 $)
      expect(screen.getByText("1.500 $")).toBeInTheDocument();

      // Verify recordDateReached from couponsAmountFor
      expect(screen.getByText("Yes")).toBeInTheDocument();
    });
  });

  test("should display 0 for amount when numerator is 0", async () => {
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
        numerator: "0",
        denominator: "100",
        recordDateReached: true,
      },
      refetch: mockRefetchCouponsAmountFor,
    });

    render(<SeeCoupon />);

    await waitFor(() => {
      // Amount should be "0" when numerator is 0
      const zeroElements = screen.getAllByText("0");
      expect(zeroElements.length).toBeGreaterThanOrEqual(1);
    });
  });

  test("should display 0 for amount when denominator is 0", async () => {
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
        numerator: "100",
        denominator: "0",
        recordDateReached: false,
      },
      refetch: mockRefetchCouponsAmountFor,
    });

    render(<SeeCoupon />);

    await waitFor(() => {
      // Amount should be "0" when denominator is 0
      const zeroElements = screen.getAllByText("0");
      expect(zeroElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("No")).toBeInTheDocument();
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
      // Amount should be "0" when numerator/denominator are undefined
      const zeroElements = screen.getAllByText("0");
      expect(zeroElements.length).toBeGreaterThanOrEqual(1);

      expect(screen.getByText("No")).toBeInTheDocument();
    });
  });

  test("should display recordDateReached as No when it is false", async () => {
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
        numerator: "500",
        denominator: "100",
        recordDateReached: false,
      },
      refetch: mockRefetchCouponsAmountFor,
    });

    render(<SeeCoupon />);

    await waitFor(() => {
      // Verify amount calculated as 500/100 = 5.000
      expect(screen.getByText("5.000 $")).toBeInTheDocument();
      expect(screen.getByText("No")).toBeInTheDocument();
    });
  });

  test("should not display details when data is not loaded", () => {
    render(<SeeCoupon />);

    expect(screen.queryByText(/balance/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/amount/i)).not.toBeInTheDocument();
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

  test("should calculate amount with 3 decimal places", async () => {
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
        numerator: "1",
        denominator: "3",
        recordDateReached: true,
      },
      refetch: mockRefetchCouponsAmountFor,
    });

    render(<SeeCoupon />);

    await waitFor(() => {
      // 1/3 = 0.333... should be formatted to 0.333 $
      expect(screen.getByText("0.333 $")).toBeInTheDocument();
    });
  });
});
