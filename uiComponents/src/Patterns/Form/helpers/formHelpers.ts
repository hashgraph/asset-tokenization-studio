import { ToastUtilities } from "@Components/Overlay/Toast";
import { submitForgotForm } from "@/Patterns/Form/utils";

export const onSubmit = async (email: string) => {
  try {
    await submitForgotForm({ emailManager: email });
    ToastUtilities.show({
      title: "Success",
      status: "success",
      description: "Check your email for a link to reset your password.",
    });
  } catch (error) {
    ToastUtilities.error({
      title: "Error",
      description: "Something went wrong. Please try again.",
    });
  }
};
