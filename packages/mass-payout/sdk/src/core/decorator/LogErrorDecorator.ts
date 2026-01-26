// SPDX-License-Identifier: Apache-2.0

export const LogError = (target: unknown, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor => {
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args: unknown[]): Promise<unknown> {
    return await originalMethod.apply(this, args);
  };

  return descriptor;
};
