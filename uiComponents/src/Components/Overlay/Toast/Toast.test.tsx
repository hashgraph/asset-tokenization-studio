import type { BaseToastOptions } from "./Toast.types";
import { useToast } from "./useToast";
import { DEFAULT_DURATION } from "./toastHelpers";

const toastMock = jest.fn();
jest.mock("@chakra-ui/react", () => ({
  ...jest.requireActual("@chakra-ui/react"),
  useToast: () => {
    return toastMock;
  },
}));

describe(`UseToast`, () => {
  const defaultProps: BaseToastOptions = {
    variant: "solid",
    title: "TitleTest",
    description: "descriptionTest",
    status: "success",
    duration: DEFAULT_DURATION,
    position: "top-right",
  };

  test("call library hook correctly", () => {
    const toast = useToast();
    toast.show({ ...defaultProps });
    expect(toastMock).toHaveBeenCalledWith(
      expect.objectContaining({ ...defaultProps })
    );
  });
});
