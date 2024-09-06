export default class Hex {
  static fromUint8Array(uint8ArrayKey: Uint8Array): string {
    return Array.from(uint8ArrayKey, (byte) =>
      ('0' + byte.toString(16)).slice(-2),
    ).join('');
  }

  static toUint8Array(hex: string): Uint8Array {
    return Uint8Array.from(Buffer.from(hex, 'hex'));
  }
}
