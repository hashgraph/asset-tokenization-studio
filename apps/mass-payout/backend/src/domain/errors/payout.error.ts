import { InvalidDataError } from "./shared/invalid-data.error"

export class InvalidPayoutSubtypeError extends InvalidDataError {
  constructor(message: string) {
    super(message)
    this.name = InvalidPayoutSubtypeError.name
  }
}
