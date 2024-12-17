/**
 * @name fr32PadReader
 * @description Adds Fr32 padding to a stream of Uint8Array chunks.
 */
export async function* fr32PadReader(instream) {
  let bytes = 0;
  let align = 0;
  let nc = [];
  let leftover = 0;

  for await (const chunk of instream) {
    for (let idx = 0; idx < chunk.length; idx++) {
      const byt = chunk[idx];
      let lo, hi;

      if (++bytes % 32 === 0) {
        align += 2;
        if (align === 8) {
          align = 0;
          nc.push(leftover);
          bytes++;
          leftover = 0;
        }
      }

      switch (align) {
        case 0:
          nc.push(byt);
          continue;
        case 2:
          hi = byt >> 6;
          lo = byt & 63;
          break;
        case 4:
          hi = byt >> 4;
          lo = byt & 15;
          break;
        case 6:
          hi = byt >> 2;
          lo = byt & 3;
          break;
      }

      if (bytes % 32 === 0) {
        nc.push((lo << (align - 2)) | leftover);
      } else {
        nc.push((lo << align) | leftover);
      }

      leftover = hi;
    }

    yield new Uint8Array(nc);
    nc = [];
  }

  if (align !== 0) {
    nc.push(leftover << align);
    yield new Uint8Array(nc);
  }
}


