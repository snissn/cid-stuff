const fr32oh = 254 / 256; // fr32 needs 2 bits per 256, so we make room for that

/**
 * @name pieceSizeFromRaw
 * @description Determine the piece size for a given block of data. Does not
 * account for Fr32 padding. A simple rounding up to the next power-of-2 size.
 * @param {number} size - The size of the original resource.
 * @param {boolean} next - Bump to the next power-of-2 piece size if true.
 * @returns {number}
 */
export function pieceSizeFromRaw(size, next) {
  return 1 << (size.toString(2).length + (next ? 1 : 0));
}

/**
 * @name zeroPaddedSizeFromRaw
 * @description Determine the additional bytes of zero-padding to append to the
 * end of a resource to fit within a power-of-2 piece while leaving enough room
 * for Fr32 padding (2 bits per 254).
 * @param {number} size - The size of the original resource.
 * @returns {number}
 */
export function zeroPaddedSizeFromRaw(size) {
  const pieceSize = pieceSizeFromRaw(size);
  const bound = Math.ceil(fr32oh * pieceSize);
  return size <= bound ? bound : Math.ceil(fr32oh * pieceSizeFromRaw(size, true));
}

/**
 * @name zeroPadReader
 * @description Given a stream or async iterator (of `Uint8Array`s), return a new
 * async iterator that adds zero-padding to fit within a power-of-2 Fr32 padded piece.
 * @param {ReadableStream|AsyncIterator<Uint8Array>} instream - A stream or async iterator
 *   of the original source.
 * @param {number} size - The expected size, in bytes, of the original source.
 * @returns {AsyncIterator<Uint8Array>}
 */
export async function* zeroPadReader(instream, size) {
  const padSize = zeroPaddedSizeFromRaw(size);
  let count = 0;

  for await (const chunk of instream) {
    count += chunk.length;
    yield chunk;
  }

  // Create a zero-filled Uint8Array of 65536 bytes
  const zeros = new Uint8Array(65536);

  while (count < padSize) {
    const sz = Math.min(padSize - count, 65536);
    yield zeros.slice(0, sz);
    count += sz;
  }
}


