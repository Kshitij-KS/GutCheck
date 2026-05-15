// app/api/pdf/extract/route.ts
// Accepts: multipart/form-data with a 'file' field
// Supports: PDF (pdf-parse) + JPG/PNG/WEBP (base64 for Gemini vision)
// Returns: { text: string }
// Max file size: 20MB

import { NextRequest, NextResponse } from 'next/server';
import { API_INPUT_LIMITS, validateFileUpload } from '@/lib/security';
import { checkRateLimit } from '@/lib/rate-limit';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export async function POST(req: NextRequest): Promise<NextResponse> {
  const limited = await checkRateLimit(req, 'pdf', 'extract');
  if (limited) return limited;

  try {
    const contentType = req.headers.get('content-type') ?? '';
    if (!contentType.includes('multipart/form-data')) {
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File exceeds 20MB limit' }, { status: 400 });
    }

    if (file instanceof File) {
      const check = validateFileUpload(file, {
        maxSizeMB: 20,
        allowedTypes: [
          'application/pdf',
          'image/jpeg',
          'image/jpg',
          'image/png',
          'image/webp',
          'image/heic',
          'image/heif',
        ],
      });
      if (!check.isSafe) {
        return NextResponse.json({ error: check.reason ?? 'Invalid file' }, { status: 400 });
      }
    }

    const mimeType = file.type;
    const buffer = Buffer.from(await file.arrayBuffer());

    // PDF extraction via pdf-parse
    if (mimeType === 'application/pdf') {
      const pdfParse = (await import('pdf-parse')).default;
      const result = await pdfParse(buffer);
      const text = result.text?.trim();

      if (!text || text.length < 50) {
        return NextResponse.json({ error: 'Could not extract text from PDF' }, { status: 422 });
      }

      if (text.length > API_INPUT_LIMITS.extractText) {
        return NextResponse.json(
          { error: 'Extracted text exceeds safe size limit. Try a shorter report or split pages.' },
          { status: 413 }
        );
      }

      return NextResponse.json({ text, source: 'pdf' });
    }

    // Image extraction — return as base64 for Gemini vision
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
    if (allowedImageTypes.includes(mimeType)) {
      const base64 = buffer.toString('base64');
      return NextResponse.json({
        text: '',        // Empty text — client will use base64 for vision
        base64,
        mimeType,
        source: 'image',
      });
    }

    return NextResponse.json(
      { error: 'Unsupported file type. Upload PDF, JPG, PNG, or WEBP.' },
      { status: 415 }
    );
  } catch (err) {
    console.error('[pdf/extract] Error:', (err as Error).message);
    return NextResponse.json({ error: 'File processing failed' }, { status: 500 });
  }
}
