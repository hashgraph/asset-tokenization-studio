const TEST_FORGOT_OK = "test@test.com";
const TEST_LOGIN_OK: DataLoginForm = {
  email: "test@test.com",
  password: "test",
};

const RESPONSE_OK = { status: 200 };
const RESPONSE_KO = { status: 401 };
const AWAIT_MILLISECONDS = 1000;

export interface DataForgotForm {
  emailManager: string;
}

export const submitForgotForm = (data: DataForgotForm) =>
  new Promise((resolve, reject) =>
    setTimeout(
      () =>
        data.emailManager === TEST_FORGOT_OK
          ? resolve(RESPONSE_OK)
          : reject(RESPONSE_KO),
      AWAIT_MILLISECONDS
    )
  );

export interface DataLoginForm {
  email: string;
  password: string;
}

export const submitLoginForm = (data: DataLoginForm) =>
  new Promise((resolve, reject) =>
    setTimeout(
      () =>
        data.email === TEST_LOGIN_OK.email &&
        data.password === TEST_LOGIN_OK.password
          ? resolve(RESPONSE_OK)
          : reject(RESPONSE_KO),
      AWAIT_MILLISECONDS
    )
  );
