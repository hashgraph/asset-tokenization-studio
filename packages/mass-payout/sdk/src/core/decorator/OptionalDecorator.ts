// SPDX-License-Identifier: Apache-2.0

import Mapper from "../validation/Mapper";
import { IndexableObject } from "../Type";

const OPTIONAL_KEYS = Symbol("optionalKeys");

export function OptionalField(): (target: object, propertyKey: string) => void {
  return registerProperty;
}

function registerProperty(target: object, propertyKey: string): void {
  let properties: string[] = Reflect.getMetadata(OPTIONAL_KEYS, target);

  if (properties) {
    properties.push(propertyKey);
  } else {
    properties = [propertyKey];
    Reflect.defineMetadata(OPTIONAL_KEYS, properties, target);
  }
}

export function getOptionalFields(origin: IndexableObject): IndexableObject {
  const properties: string[] = Reflect.getMetadata(OPTIONAL_KEYS, origin) ?? [];
  const result: IndexableObject = {};
  properties.forEach((key) => (result[Mapper.renamePrivateProps(key)] = origin[key]));
  return result;
}
