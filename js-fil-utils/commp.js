import { CID } from 'multiformats/cid';
import { base32 } from 'multiformats/bases/base32';
import { sha256 } from 'multiformats/hashes/sha2';
import { Digest, decode, create } from 'multiformats/hashes/digest';

import { zeroPadReader, zeroPaddedSizeFromRaw, pieceSizeFromRaw } from './zero-padded.js';
import { fr32PadReader } from './fr32.js';
import { merkleRoot } from './merkle.js';

/**
 * @description Given a File object, calculate the Filecoin CommP ("Piece Commitment").
 * @param {File} file - The file input from an HTML file input.
 * @returns {Object} - An object of the form `{ size, paddedSize, pieceSize, commp }`.
 */
export async function commp(file) {
  const size = file.size;
  const paddedSize = zeroPaddedSizeFromRaw(size);
  const pieceSize = pieceSizeFromRaw(size);

  console.log(`Original Size: ${size}`);
  console.log(`Padded Size: ${paddedSize}`);
  console.log(`Piece Size: ${pieceSize}`);

  const result = { size, paddedSize, pieceSize };

  try {
    const stream = file.stream();
    const fr32Stream = fr32PadReader(zeroPadReader(stream, size));

    console.log('Calculating Merkle Root...');
    result.commp = await merkleRoot(fr32Stream);
    console.log('Merkle Root Calculation Complete:', result.commp);

    return result;
  } catch (error) {
    console.error('Error during CommP calculation:', error);
    throw error;
  }
}
export function generateCommPCid(commpBuffer) {

  const code = 0x1012;        // Multicodec code for sha2-256-trunc254-padded
  const multihash = create(code, commpBuffer) ; //new Digest(code, size, digest, commpBuffer);

  // Multicodec for Filecoin CommP (fil-commitment-unsealed, 0xf101)
  const multicodec = 0xf101;

  // Create a CIDv1 with the multicodec and the multihash
  return CID.createV1(multicodec, multihash).toString(base32);
}
