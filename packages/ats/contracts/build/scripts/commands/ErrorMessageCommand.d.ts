export default abstract class ErrorMessageCommand {
    readonly errorMessage?: string;
    constructor({ errorMessage }?: {
        errorMessage?: string;
    });
}
