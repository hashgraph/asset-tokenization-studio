// SPDX-License-Identifier: Apache-2.0

import { CustomError } from "@domain/errors/shared/custom.error"
import { faker } from "@faker-js/faker"

const truncated = (msg: string) => msg.substring(0, CustomError.MAX_MESSAGE_LENGTH) + "... (omitted)"

describe(CustomError.name, () => {
  it("uses the default message when none is provided", () => {
    const err = new CustomError()

    expect(err).toMatchObject({ message: "Internal error", cause: undefined })
    expect(err.name).toBe(CustomError.name)
  })

  it(`truncates messages longer than ${CustomError.MAX_MESSAGE_LENGTH} characters`, () => {
    const longMessage = "x".repeat(CustomError.MAX_MESSAGE_LENGTH + 100)

    const err = new CustomError(longMessage)

    expect(err.message).toBe(truncated(longMessage))
  })

  it("appends the original stack trace after the wrapper stack", () => {
    const original = new Error("root stack")

    const err = new CustomError("wrapper stack", original)

    expect(err.stack).toContain("Error: wrapper stack")
    expect(err.stack).toContain("Error: root stack")
  })

  it("returns the original root error, no matter the wrap depth", () => {
    const rootError = new Error("deepest")

    const wrappedTwice = new CustomError("level-1", new CustomError("level-2", rootError))

    expect(CustomError.getRootError(wrappedTwice)).toBe(rootError)
  })

  describe("toJson()", () => {
    it("includes the cause when the root error is a CustomError", () => {
      const message = faker.lorem.sentence()
      const cause = faker.lorem.sentence()

      const root = new CustomError("root error message", undefined, cause)
      const wrapped = new CustomError(message, root)

      expect(wrapped.toJson()).toEqual({
        message: message,
        cause: cause,
      })
    })

    it("sets cause to undefined when the root error is a plain Error", () => {
      const root = new Error("root")
      const wrappedMessage = faker.lorem.sentence()

      const wrapped = new CustomError(wrappedMessage, root)

      expect(wrapped.toJson()).toEqual({
        message: wrappedMessage,
        cause: undefined,
      })
    })
  })
})
