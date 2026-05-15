import { describe, expect, it } from 'vitest';
import { dataUrlToBase64Payload, validateMenuImageFile } from '@/lib/scan/menu-image';

function makeFile(name: string, type: string, size: number): File {
  return new File([new Uint8Array(size)], name, { type });
}

describe('validateMenuImageFile', () => {
  it('accepts supported menu image files up to 20MB', () => {
    const file = makeFile('menu.webp', 'image/webp', 20 * 1024 * 1024);

    expect(validateMenuImageFile(file)).toEqual({ ok: true });
  });

  it('rejects oversized menu image files', () => {
    const file = makeFile('menu.jpg', 'image/jpeg', 20 * 1024 * 1024 + 1);

    expect(validateMenuImageFile(file)).toEqual({
      ok: false,
      message: 'Menu photo is larger than 20MB. Please crop or compress it.',
    });
  });

  it('rejects unsupported menu image files', () => {
    const file = makeFile('menu.gif', 'image/gif', 1024);

    expect(validateMenuImageFile(file)).toEqual({
      ok: false,
      message: 'Please upload a JPG, PNG, WebP, HEIC, or HEIF menu photo.',
    });
  });
});

describe('dataUrlToBase64Payload', () => {
  it('extracts the base64 payload and MIME type from a data URL', () => {
    expect(dataUrlToBase64Payload('data:image/png;base64,abc123')).toEqual({
      base64: 'abc123',
      mimeType: 'image/png',
    });
  });

  it('rejects malformed data URLs', () => {
    expect(() => dataUrlToBase64Payload('abc123')).toThrow('Could not read menu photo.');
  });
});
