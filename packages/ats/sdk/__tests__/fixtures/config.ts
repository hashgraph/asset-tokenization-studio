// SPDX-License-Identifier: Apache-2.0

import { Faker, faker } from "@faker-js/faker";
import { defineFixtureFactory, Field } from "efate";

export interface FakerExtension {
  faker: (fake: (f: Faker, increment: number) => any) => void;
}

export const fakerExtension = {
  faker:
    (fieldName: string, [fake]: [(f: Faker, increment: number) => any]) =>
    (increment: number): Field<any> =>
      new Field<any>(fieldName, fake(faker, increment)),
};

export const createFixture = defineFixtureFactory<FakerExtension>(fakerExtension);
