const MAX_MENU_IMAGE_BYTES = 20 * 1024 * 1024;

const ACCEPTED_MENU_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);

export type MenuImageValidationResult =
  | { ok: true }
  | { ok: false; message: string };

export interface MenuImagePayload {
  base64: string;
  mimeType: string;
}

export function validateMenuImageFile(file: File): MenuImageValidationResult {
  if (file.size > MAX_MENU_IMAGE_BYTES) {
    return {
      ok: false,
      message: 'Menu photo is larger than 20MB. Please crop or compress it.',
    };
  }

  if (!ACCEPTED_MENU_IMAGE_TYPES.has(file.type)) {
    return {
      ok: false,
      message: 'Please upload a JPG, PNG, WebP, HEIC, or HEIF menu photo.',
    };
  }

  return { ok: true };
}

export function dataUrlToBase64Payload(dataUrl: string): MenuImagePayload {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match?.[1] || !match[2]) {
    throw new Error('Could not read menu photo.');
  }

  return {
    mimeType: match[1],
    base64: match[2],
  };
}
