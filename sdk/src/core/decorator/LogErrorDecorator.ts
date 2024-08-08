import LogService from '../../app/service/LogService.js';

export const LogError = (
  target: unknown,
  propertyKey: string,
  descriptor: PropertyDescriptor,
): PropertyDescriptor => {
  const originalMethod = descriptor.value;
  descriptor.value = async function (...args: unknown[]): Promise<unknown> {
    try {
      const result = await originalMethod.apply(this, args);
      return result;
    } catch (error) {
      LogService.logError(error);
      throw error;
    }
  };

  return descriptor;
};
