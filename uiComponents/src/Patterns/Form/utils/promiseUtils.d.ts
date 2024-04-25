export interface DataForgotForm {
    emailManager: string;
}
export declare const submitForgotForm: (data: DataForgotForm) => Promise<unknown>;
export interface DataLoginForm {
    email: string;
    password: string;
}
export declare const submitLoginForm: (data: DataLoginForm) => Promise<unknown>;
