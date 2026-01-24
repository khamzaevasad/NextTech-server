import { Readable } from 'stream';

/**
 * Magic bytes (file signatures) for common image formats.
 * These are the first few bytes of the file that identify the file type.
 */
const IMAGE_SIGNATURES = {
  // JPEG: starts with FF D8 FF
  jpeg: [0xff, 0xd8, 0xff],
  // PNG: starts with 89 50 4E 47 0D 0A 1A 0A
  png: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a],
} as const;

export interface FileValidationResult {
  isValid: boolean;
  detectedType: 'jpeg' | 'png' | null;
  detectedMimeType: string | null;
}

/**
 * Reads the first N bytes from a stream without consuming it.
 * Returns both the header bytes and a new readable stream that includes those bytes.
 */
async function readStreamHeader(
  stream: Readable,
  headerSize: number,
): Promise<{ header: Buffer; newStream: Readable }> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let bytesRead = 0;

    const onData = (chunk: Buffer) => {
      chunks.push(chunk);
      bytesRead += chunk.length;

      if (bytesRead >= headerSize) {
        stream.removeListener('data', onData);
        stream.pause();

        const header = Buffer.concat(chunks);

        // Create a new stream that starts with the already-read data
        const { PassThrough } = require('stream');
        const newStream = new PassThrough();

        // Push the already-read data first
        newStream.write(header);

        // Pipe the rest of the original stream
        stream.pipe(newStream);
        stream.resume();

        resolve({
          header: header.subarray(0, headerSize),
          newStream,
        });
      }
    };

    stream.on('data', onData);
    stream.on('error', reject);
    stream.on('end', () => {
      // Stream ended before we got enough bytes
      const header = Buffer.concat(chunks);
      const { PassThrough } = require('stream');
      const newStream = new PassThrough();
      newStream.end(header);

      resolve({
        header,
        newStream,
      });
    });
  });
}

/**
 * Checks if a buffer starts with the given signature bytes.
 */
function matchesSignature(buffer: Buffer, signature: readonly number[]): boolean {
  if (buffer.length < signature.length) {
    return false;
  }
  return signature.every((byte, index) => buffer[index] === byte);
}

/**
 * Detects the actual image type by reading magic bytes from the file content.
 * This is client-agnostic and immune to fake MIME types.
 */
function detectImageType(header: Buffer): FileValidationResult {
  // Check PNG first (longer signature = more specific)
  if (matchesSignature(header, IMAGE_SIGNATURES.png)) {
    return {
      isValid: true,
      detectedType: 'png',
      detectedMimeType: 'image/png',
    };
  }

  // Check JPEG
  if (matchesSignature(header, IMAGE_SIGNATURES.jpeg)) {
    return {
      isValid: true,
      detectedType: 'jpeg',
      detectedMimeType: 'image/jpeg',
    };
  }

  return {
    isValid: false,
    detectedType: null,
    detectedMimeType: null,
  };
}

/**
 * Validates an uploaded file by inspecting its actual content (magic bytes).
 * Returns the validation result and a new stream that can be used for further processing.
 *
 * This solves the problem of unreliable MIME types from clients like Postman
 * which may send `application/octet-stream` regardless of actual file type.
 *
 * @param createReadStream - Function that creates a readable stream (from graphql-upload)
 * @returns Validation result and a new usable stream
 */
export async function validateImageContent(
  createReadStream: () => Readable,
): Promise<{ validation: FileValidationResult; stream: Readable }> {
  // We need to read enough bytes to detect the file type
  // PNG signature is 8 bytes, JPEG is 3 bytes - we read 16 to be safe
  const HEADER_SIZE = 16;

  const originalStream = createReadStream();
  const { header, newStream } = await readStreamHeader(originalStream, HEADER_SIZE);
  const validation = detectImageType(header);

  return {
    validation,
    stream: newStream,
  };
}

/**
 * Maps detected type to appropriate file extension.
 */
export function getExtensionForType(detectedType: 'jpeg' | 'png'): string {
  const extensions: Record<'jpeg' | 'png', string> = {
    jpeg: '.jpg',
    png: '.png',
  };
  return extensions[detectedType];
}
