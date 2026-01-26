// SPDX-License-Identifier: Apache-2.0

import { SignedCredential } from "@terminal3/vc_core";
import BigDecimal from "../shared/BigDecimal";
import { InvalidVcFormat } from "./error/InvalidVcFormat";
import { ErrorDecodingVc } from "./error/ErrorDecodingVc";
import { InvalidVcDates } from "./error/InvalidVcDates";
import { MissingVcHolder } from "./error/MissingVcHolder";
import { MissingVcIssuer } from "./error/MissingVcIssuer";

export class Terminal3Vc {
  public static vcFromBase64(base64: string): SignedCredential {
    try {
      const jsonString = Buffer.from(base64, "base64").toString("utf-8");
      const parsedData = JSON.parse(jsonString);

      if (!parsedData || typeof parsedData !== "object") {
        throw new InvalidVcFormat();
      }

      return parsedData as SignedCredential;
    } catch (error) {
      throw new ErrorDecodingVc(error);
    }
  }

  public static extractHolder(signedCredential: SignedCredential): string {
    const holder = signedCredential.credentialSubject.id.split(":").pop();
    if (!holder) throw new MissingVcHolder();
    return holder;
  }

  public static extractIssuer(signedCredential: SignedCredential): string {
    const issuer = signedCredential.issuer.split(":").pop();
    if (!issuer) throw new MissingVcIssuer();
    return issuer;
  }

  public static checkValidDates(signedCredential: SignedCredential): SignedCredential {
    this.setDefaultDates(signedCredential);
    this.validateDateOrder(signedCredential);
    return signedCredential;
  }

  private static setDefaultDates(signedCredential: SignedCredential): void {
    signedCredential.validFrom = signedCredential.validFrom
      ? Date.parse(signedCredential.validFrom).toString()
      : Date.now().toString();

    signedCredential.validUntil =
      signedCredential.validUntil && signedCredential.validUntil.trim() !== ""
        ? Date.parse(signedCredential.validUntil).toString()
        : (Date.now() + 100 * 365 * 24 * 60 * 60 * 1000).toString();
  }

  private static validateDateOrder(signedCredential: SignedCredential): void {
    if (!signedCredential.validFrom || !signedCredential.validUntil) throw new InvalidVcDates();
    if (
      BigDecimal.fromString(signedCredential.validFrom).isGreaterThan(
        BigDecimal.fromString(signedCredential.validUntil),
      )
    ) {
      throw new InvalidVcDates();
    }
  }
}
