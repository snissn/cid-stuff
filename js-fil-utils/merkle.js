import crypto from 'crypto';


// Simple sha256 utility function that takes two `Buffer`s and gets the hash of them when combined
async function sha256(b1, b2) {
  const combined = Buffer.concat([Buffer.from(b1), Buffer.from(b2)]);
  const hash = crypto.createHash('sha256').update(combined).digest();
  hash[31] = hash[31] & 0b00111111; // fr32 compatible, zero out last two bits
  return hash;
}


// Merkle tree function
async function* merkle(hashstream, level) {
  let last = null;
  for await (const h of hashstream) {
    const hash = Buffer.isBuffer(h) ? h : Buffer.from(h);
    if (last) {
      yield sha256(last, hash);
      last = null;
    } else {
      last = hash;
    }
  }
  if (last) yield last;
}


// Bottom layer, taking a raw byte stream and returning hashes
async function* hash(instream) {
  let leftover = null;
  for await (const chunk of instream) {
    for (let i = 0; i < chunk.length; i += 32) {
      if (((((leftover && leftover.length) || 0) + chunk.length) - i) < 32) {
        leftover = Buffer.from(chunk.slice(i));
        break;
      }

      if (!leftover) {
        yield Buffer.from(chunk.slice(i, i + 32));
      } else {
        i = -leftover.length;
        yield Buffer.concat([Buffer.from(leftover), Buffer.from(chunk.slice(0, i + 32))]);
        leftover = null;
      }
    }
  }
  if (leftover) {
    throw new Error(`Unexpected leftover chunk of ${leftover.length} bytes`);
  }
}


// Merkle root function
export async function merkleRoot(instream) {
  const fr32HashStream = hash(instream);
  let lastIter = fr32HashStream;
  let level = 0;

  while (true) {
    const merkleIter = merkle(lastIter, level++)[Symbol.asyncIterator]();
    const h1 = await merkleIter.next();
    if (h1.done) {
      throw new Error("Shouldn't be done already");
    }
    const h2 = await merkleIter.next();

    if (!h2.done) {
      lastIter = (async function* () {
        yield h1.value;
        yield h2.value;
        yield* merkleIter;
      })();
    } else {
      return h1.value;
    }
  }
}


