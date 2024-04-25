var TEST_FORGOT_OK = "test@test.com";
var TEST_LOGIN_OK = {
    email: "test@test.com",
    password: "test"
};
var RESPONSE_OK = { status: 200 };
var RESPONSE_KO = { status: 401 };
var AWAIT_MILLISECONDS = 1000;
export var submitForgotForm = function (data) {
    return new Promise(function (resolve, reject) {
        return setTimeout(function () {
            return data.emailManager === TEST_FORGOT_OK
                ? resolve(RESPONSE_OK)
                : reject(RESPONSE_KO);
        }, AWAIT_MILLISECONDS);
    });
};
export var submitLoginForm = function (data) {
    return new Promise(function (resolve, reject) {
        return setTimeout(function () {
            return data.email === TEST_LOGIN_OK.email &&
                data.password === TEST_LOGIN_OK.password
                ? resolve(RESPONSE_OK)
                : reject(RESPONSE_KO);
        }, AWAIT_MILLISECONDS);
    });
};
