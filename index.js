import fs from 'fs';
import { CID } from 'multiformats/cid';
import * as raw from 'multiformats/codecs/raw';
import { sha256 as nobleSHA256 } from '@noble/hashes/sha256';
import { sha512 as nobleSHA512 } from '@noble/hashes/sha512';
import { blake2b as nobleBlake2b } from '@noble/hashes/blake2b';
import { create } from 'multiformats/hashes/digest';

// Ensure a filename is provided
const fileName = process.argv[2];

if (!fileName) {
  console.error('Usage: node index.js <filename>');
  process.exit(1);
}

// Read the file
let data;
try {
  data = fs.readFileSync(fileName);
} catch (error) {
  console.error('Error reading file:', error.message);
  process.exit(1);
}

// Helper function to generate a multihash
function createMultihash(data, hashFunction, code) {
  const hash = hashFunction(data);
  return create(code, hash);
}

// Helper function to generate CIDs with different hashing algorithms
function createCID(data, hashFunction, hashName, code, version) {
  try {
    const multihash = createMultihash(data, hashFunction, code);
    const cid = CID.create(version, raw.code, multihash);
    return cid.toString();
  } catch (error) {
    console.error(`Error generating CID with ${hashName}:`, error.message);
    return null;
  }
}

// Generate and print CIDs
console.log(`Generating CIDs for file: ${fileName}`);

console.log('\n--- CID v1 ---');
const cidV1SHA256 = createCID(data, nobleSHA256, 'sha256', 0x12, 1);
if (cidV1SHA256) console.log('CIDv1 (SHA-256):', cidV1SHA256);

const cidV1SHA512 = createCID(data, nobleSHA512, 'sha512', 0x13, 1);
if (cidV1SHA512) console.log('CIDv1 (SHA-512):', cidV1SHA512);

const cidV1Blake2b = createCID(data, (d) => nobleBlake2b(d, 32), 'blake2b', 0xb220, 1);
if (cidV1Blake2b) console.log('CIDv1 (Blake2b):', cidV1Blake2b);

console.log('\n--- CID v0 ---');
try {
  // CIDv0 only supports SHA-256 and the DAG-PB codec
  const multihash = createMultihash(data, nobleSHA256, 0x12);
  const cidV0 = CID.create(0, raw.code, multihash);
  console.log('CIDv0 (SHA-256):', cidV0.toString());
} catch (error) {
  console.error('Error generating CIDv0:', error.message);
}

